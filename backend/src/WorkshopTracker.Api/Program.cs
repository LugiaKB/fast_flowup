using WorkshopTracker.Infrastructure.Persistence;
using WorkshopTracker.Api.Endpoints;
using WorkshopTracker.Application;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

var signingKey = builder.Configuration["JWT_SIGNING_KEY"]
    ?? (builder.Environment.IsEnvironment("Testing") ? "test-signing-key-that-is-at-least-32-bytes" : throw new InvalidOperationException("JWT_SIGNING_KEY é obrigatória."));
if (Encoding.UTF8.GetByteCount(signingKey) < 32)
{
    throw new InvalidOperationException("JWT_SIGNING_KEY deve ter ao menos 32 bytes.");
}
builder.Configuration["JWT_SIGNING_KEY"] = signingKey;

builder.Services.AddProblemDetails();
builder.Services.AddValidation();
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)));
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();
builder.Services.AddApplication();
builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
            ClockSkew = TimeSpan.Zero,
        };
        options.Events = new JwtBearerEvents
        {
        OnChallenge = async context =>
        {
            context.HandleResponse();
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/problem+json";
            await context.Response.WriteAsJsonAsync(
                new
                {
                    type = "about:blank",
                    title = "Autenticação administrativa necessária",
                    status = StatusCodes.Status401Unauthorized,
                    code = "unauthorized",
                },
                options: null,
                contentType: "application/problem+json");
        },
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => policy
        .SetIsOriginAllowed(origin => IsOriginAllowed(origin, builder.Configuration))
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());

    options.AddPolicy("frontend", policy => policy
        .SetIsOriginAllowed(origin => IsOriginAllowed(origin, builder.Configuration))
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseRouting();
app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapOpenApi();
app.UseSwagger();
app.UseSwaggerUI();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapAuthenticationEndpoints();
app.MapGet("/api/auth/me", (ClaimsPrincipal user) => Results.Ok(new
    {
        id = user.FindFirstValue(ClaimTypes.NameIdentifier),
        username = user.Identity?.Name,
    }))
    .WithName("getCurrentAdmin")
    .WithTags("Authentication")
    .RequireAuthorization();
app.MapColaboradoresEndpoints();
app.MapWorkshopsEndpoints();

if (!app.Environment.IsEnvironment("Testing"))
{
    using var scope = app.Services.CreateScope();
    var database = scope.ServiceProvider.GetRequiredService<WorkshopTrackerDbContext>();
    await database.Database.MigrateAsync();
    await WorkshopTracker.Infrastructure.Authentication.AdminSeeder.SynchronizeAsync(scope.ServiceProvider, app.Configuration);
    await WorkshopTracker.Infrastructure.Persistence.DataSeeder.SeedAsync(database);
}

app.Run();

static bool IsOriginAllowed(string origin, IConfiguration configuration)
{
    if (string.IsNullOrWhiteSpace(origin)) return false;

    var normalizedOrigin = origin.Trim().TrimEnd('/');

    var rawOrigins = configuration["CORS_ALLOWED_ORIGINS"]
        ?? configuration["Cors:AllowedOrigins"]
        ?? configuration["FrontendOrigin"]
        ?? configuration["FRONTEND_ORIGIN"]
        ?? configuration["ALLOWED_ORIGINS"]
        ?? "http://localhost:3000";

    var allowedOrigins = rawOrigins
        .Split([',', ';'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
        .Select(o => o.TrimEnd('/'));

    return allowedOrigins.Any(allowed =>
        string.Equals(allowed, "*", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(allowed, normalizedOrigin, StringComparison.OrdinalIgnoreCase));
}

public partial class Program;
