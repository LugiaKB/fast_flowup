using WorkshopTracker.Infrastructure.Persistence;
using WorkshopTracker.Api.Endpoints;
using WorkshopTracker.Application;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
var frontendOrigin = builder.Configuration["FrontendOrigin"]
    ?? throw new InvalidOperationException("FrontendOrigin é obrigatório.");
var signingKey = builder.Configuration["JWT_SIGNING_KEY"]
    ?? (builder.Environment.IsEnvironment("Testing") ? "test-signing-key-that-is-at-least-32-bytes" : throw new InvalidOperationException("JWT_SIGNING_KEY é obrigatória."));
if (Encoding.UTF8.GetByteCount(signingKey) < 32)
{
    throw new InvalidOperationException("JWT_SIGNING_KEY deve ter ao menos 32 bytes.");
}
builder.Configuration["JWT_SIGNING_KEY"] = signingKey;

builder.Services.AddProblemDetails();
builder.Services.AddValidation();
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
builder.Services.AddCors(options => options.AddPolicy("frontend", policy => policy
    .WithOrigins(frontendOrigin)
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials()));

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();
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
}

app.Run();

public partial class Program;
