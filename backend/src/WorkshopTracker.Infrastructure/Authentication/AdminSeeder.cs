using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using WorkshopTracker.Infrastructure.Persistence;

namespace WorkshopTracker.Infrastructure.Authentication;

public static class AdminSeeder
{
    public static async Task SynchronizeAsync(IServiceProvider services, IConfiguration configuration, CancellationToken cancellationToken = default)
    {
        var username = Required(configuration, "ADMIN_USERNAME");
        var password = Required(configuration, "ADMIN_PASSWORD");
        var users = services.GetRequiredService<UserManager<Administrator>>();
        var administrator = await users.FindByNameAsync(username);

        if (administrator is null)
        {
            administrator = new Administrator { UserName = username };
            var creation = await users.CreateAsync(administrator, password);
            EnsureSuccess(creation, "Não foi possível provisionar o administrador.");
            return;
        }

        if (await users.CheckPasswordAsync(administrator, password))
        {
            return;
        }

        var resetToken = await users.GeneratePasswordResetTokenAsync(administrator);
        var reset = await users.ResetPasswordAsync(administrator, resetToken, password);
        EnsureSuccess(reset, "Não foi possível sincronizar a senha administrativa.");
        var database = services.GetRequiredService<WorkshopTrackerDbContext>();
        var activeSessions = await database.RefreshSessions
            .Where(session => session.AdministratorId == administrator.Id && session.RevokedAt == null)
            .ToListAsync(cancellationToken);
        foreach (var session in activeSessions)
        {
            session.Revoke(DateTimeOffset.UtcNow, "password_synchronized");
        }

        await database.SaveChangesAsync(cancellationToken);
    }

    private static string Required(IConfiguration configuration, string key) =>
        configuration[key] is { Length: > 0 } value
            ? value
            : throw new InvalidOperationException($"A variável de ambiente {key} é obrigatória.");

    private static void EnsureSuccess(IdentityResult result, string message)
    {
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(message);
        }
    }
}
