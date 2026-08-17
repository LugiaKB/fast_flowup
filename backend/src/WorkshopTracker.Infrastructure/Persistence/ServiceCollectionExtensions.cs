using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WorkshopTracker.Application.Common;
using WorkshopTracker.Application.Colaboradores;
using WorkshopTracker.Application.Workshops;
using WorkshopTracker.Infrastructure.Authentication;
using Microsoft.AspNetCore.Identity;

namespace WorkshopTracker.Infrastructure.Persistence;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPersistence(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var provider = configuration["Database:Provider"] ?? "Sqlite";
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("A conexão padrão do banco de dados é obrigatória.");

        services.AddSingleton<IClock, SystemClock>();
        services.AddScoped<IColaboradorReadRepository, EfColaboradorReadRepository>();
        services.AddScoped<IColaboradorCommandRepository, EfColaboradorCommandRepository>();
        services.AddScoped<IWorkshopReadRepository, EfWorkshopReadRepository>();
        services.AddScoped<IWorkshopCommandRepository, EfWorkshopCommandRepository>();
        services.AddDbContext<WorkshopTrackerDbContext>(options =>
        {
            if (string.Equals(provider, "Sqlite", StringComparison.OrdinalIgnoreCase))
            {
                options.UseSqlite(connectionString);
                return;
            }

            if (string.Equals(provider, "MySql", StringComparison.OrdinalIgnoreCase))
            {
                options.UseMySQL(connectionString);
                return;
            }

            throw new InvalidOperationException("Database:Provider deve ser Sqlite ou MySql.");
        });
        services.AddIdentityCore<Administrator>(options =>
        {
            options.Password.RequiredLength = 1;
            options.Password.RequireDigit = false;
            options.Password.RequireUppercase = false;
            options.Password.RequireLowercase = false;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequiredUniqueChars = 1;
        })
        .AddEntityFrameworkStores<WorkshopTrackerDbContext>();
        services.AddScoped<JwtTokenService>();
        services.AddSingleton<RefreshTokenService>();

        return services;
    }
}
