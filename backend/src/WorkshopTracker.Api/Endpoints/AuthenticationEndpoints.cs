using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WorkshopTracker.Application.Common;
using WorkshopTracker.Domain.Authentication;
using WorkshopTracker.Infrastructure.Authentication;
using WorkshopTracker.Infrastructure.Persistence;

namespace WorkshopTracker.Api.Endpoints;

public static class AuthenticationEndpoints
{
    private const string RefreshCookieName = "workshop_refresh";

    public static IEndpointRouteBuilder MapAuthenticationEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost("/api/auth/login", LoginAsync)
            .WithName("login")
            .WithTags("Authentication")
            .Produces<AuthResponse>()
            .Produces(StatusCodes.Status401Unauthorized);

        endpoints.MapPost("/api/auth/refresh", RefreshAsync)
            .WithName("refreshSession")
            .WithTags("Authentication")
            .Produces<AuthResponse>()
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        endpoints.MapPost("/api/auth/logout", LogoutAsync)
            .WithName("logout")
            .WithTags("Authentication")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status403Forbidden);

        return endpoints;
    }

    private static async Task<IResult> LoginAsync(
        LoginRequest request,
        UserManager<Administrator> users,
        WorkshopTrackerDbContext database,
        JwtTokenService jwtTokens,
        RefreshTokenService refreshTokens,
        IClock clock,
        HttpResponse response,
        IWebHostEnvironment environment,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["username"] = ["Nome de usuário é obrigatório."],
                ["password"] = ["Senha é obrigatória."],
            });
        }

        var administrator = await users.FindByNameAsync(request.Username.Trim());
        if (administrator is null || !await users.CheckPasswordAsync(administrator, request.Password))
        {
            return Unauthorized();
        }

        var now = clock.UtcNow;
        var rawRefreshToken = refreshTokens.CreateToken();
        database.RefreshSessions.Add(RefreshSession.Create(administrator.Id, refreshTokens.Hash(rawRefreshToken), now, now.AddDays(7)));
        await database.SaveChangesAsync(cancellationToken);
        SetRefreshCookie(response, rawRefreshToken, environment);
        return Results.Ok(CreateResponse(jwtTokens.Issue(administrator, now), administrator));
    }

    private static async Task<IResult> RefreshAsync(
        HttpRequest request,
        HttpResponse response,
        IConfiguration configuration,
        WorkshopTrackerDbContext database,
        UserManager<Administrator> users,
        JwtTokenService jwtTokens,
        RefreshTokenService refreshTokens,
        IClock clock,
        IWebHostEnvironment environment,
        CancellationToken cancellationToken)
    {
        if (!HasTrustedOrigin(request, configuration)) return Forbidden();
        if (!request.Cookies.TryGetValue(RefreshCookieName, out var rawRefreshToken)) return Unauthorized();

        var session = await database.RefreshSessions.SingleOrDefaultAsync(
            item => item.TokenHash == refreshTokens.Hash(rawRefreshToken), cancellationToken);
        var now = clock.UtcNow;
        if (session is null || session.Status != RefreshSessionStatus.Active)
        {
            if (session is not null) await RevokeFamilyAsync(database, session.FamilyId, now, "refresh_reuse", cancellationToken);
            return Unauthorized();
        }

        var administrator = await users.FindByIdAsync(session.AdministratorId);
        if (administrator is null)
        {
            await RevokeFamilyAsync(database, session.FamilyId, now, "administrator_missing", cancellationToken);
            return Unauthorized();
        }

        var nextRawRefreshToken = refreshTokens.CreateToken();
        database.RefreshSessions.Add(session.Rotate(refreshTokens.Hash(nextRawRefreshToken), now, now.AddDays(7)));
        await database.SaveChangesAsync(cancellationToken);
        SetRefreshCookie(response, nextRawRefreshToken, environment);
        return Results.Ok(CreateResponse(jwtTokens.Issue(administrator, now), administrator));
    }

    private static async Task<IResult> LogoutAsync(
        HttpRequest request,
        HttpResponse response,
        IConfiguration configuration,
        WorkshopTrackerDbContext database,
        RefreshTokenService refreshTokens,
        IClock clock,
        IWebHostEnvironment environment,
        CancellationToken cancellationToken)
    {
        if (!HasTrustedOrigin(request, configuration)) return Forbidden();
        if (request.Cookies.TryGetValue(RefreshCookieName, out var rawRefreshToken))
        {
            var session = await database.RefreshSessions.SingleOrDefaultAsync(
                item => item.TokenHash == refreshTokens.Hash(rawRefreshToken), cancellationToken);
            if (session is not null) await RevokeFamilyAsync(database, session.FamilyId, clock.UtcNow, "logout", cancellationToken);
        }

        DeleteRefreshCookie(response, environment);
        return Results.NoContent();
    }

    private static bool HasTrustedOrigin(HttpRequest request, IConfiguration configuration) =>
        string.Equals(request.Headers.Origin, configuration["FrontendOrigin"], StringComparison.Ordinal);

    private static async Task RevokeFamilyAsync(
        WorkshopTrackerDbContext database,
        Guid familyId,
        DateTimeOffset now,
        string reason,
        CancellationToken cancellationToken)
    {
        var sessions = await database.RefreshSessions.Where(item => item.FamilyId == familyId).ToListAsync(cancellationToken);
        foreach (var session in sessions) session.Revoke(now, reason);
        await database.SaveChangesAsync(cancellationToken);
    }

    private static AuthResponse CreateResponse(IssuedAccessToken token, Administrator administrator) =>
        new(token.Value, token.ExpiresAt, new AdminSummary(administrator.Id, administrator.UserName!));

    private static IResult Unauthorized() => Results.Problem(
        statusCode: StatusCodes.Status401Unauthorized,
        title: "Credenciais administrativas inválidas",
        extensions: new Dictionary<string, object?> { ["code"] = "unauthorized" });

    private static IResult Forbidden() => Results.Problem(
        statusCode: StatusCodes.Status403Forbidden,
        title: "Origem não permitida",
        extensions: new Dictionary<string, object?> { ["code"] = "forbidden_origin" });

    private static void SetRefreshCookie(HttpResponse response, string value, IWebHostEnvironment environment) =>
        response.Cookies.Append(RefreshCookieName, value, CookieOptions(environment, DateTimeOffset.UtcNow.AddDays(7)));

    private static void DeleteRefreshCookie(HttpResponse response, IWebHostEnvironment environment) =>
        response.Cookies.Delete(RefreshCookieName, CookieOptions(environment, DateTimeOffset.UnixEpoch));

    private static CookieOptions CookieOptions(IWebHostEnvironment environment, DateTimeOffset expiresAt) => new()
    {
        HttpOnly = true,
        Secure = environment.IsProduction(),
        SameSite = environment.IsProduction() ? SameSiteMode.None : SameSiteMode.Lax,
        Path = "/api/auth",
        Expires = expiresAt,
        IsEssential = true,
    };

    public sealed record LoginRequest(string Username, string Password);
    public sealed record AuthResponse(string AccessToken, DateTimeOffset AccessTokenExpiresAt, AdminSummary Admin);
    public sealed record AdminSummary(string Id, string Username);
}
