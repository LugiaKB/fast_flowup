using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.AspNetCore.Identity;
using WorkshopTracker.Domain.Colaboradores;
using WorkshopTracker.Domain.Workshops;
using WorkshopTracker.Infrastructure.Authentication;
using WorkshopTracker.Infrastructure.Persistence;

namespace WorkshopTracker.Api.IntegrationTests;

public sealed class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _databasePath = Path.Combine(Path.GetTempPath(), $"workshop-tracker-tests-{Guid.NewGuid():N}.db");

    public string DatabasePath => _databasePath;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_, configuration) => configuration.AddInMemoryCollection(
        [
            new KeyValuePair<string, string?>("Database:Provider", "Sqlite"),
            new KeyValuePair<string, string?>("ConnectionStrings:DefaultConnection", $"Data Source={_databasePath}"),
            new KeyValuePair<string, string?>("FrontendOrigin", "http://localhost:3000"),
        ]));
        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<DbContextOptions<WorkshopTrackerDbContext>>();
            services.AddDbContext<WorkshopTrackerDbContext>(options => options.UseSqlite($"Data Source={_databasePath}"));
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);

        if (disposing)
        {
            DeleteIfPresent(_databasePath);
            DeleteIfPresent($"{_databasePath}-shm");
            DeleteIfPresent($"{_databasePath}-wal");
        }
    }

    public async Task ResetDatabaseAsync(IReadOnlyCollection<Colaborador> colaboradores)
    {
        await ResetDatabaseAsync(colaboradores, []);
    }

    public async Task ResetDatabaseAsync(
        IReadOnlyCollection<Colaborador> colaboradores,
        IReadOnlyCollection<Workshop> workshops)
    {
        await using var scope = Services.CreateAsyncScope();
        var database = scope.ServiceProvider.GetRequiredService<WorkshopTrackerDbContext>();
        await database.Database.EnsureDeletedAsync();
        await database.Database.EnsureCreatedAsync();
        await database.Colaboradores.AddRangeAsync(colaboradores);
        await database.Workshops.AddRangeAsync(workshops);
        await database.SaveChangesAsync();
    }

    public async Task CreateAdministratorAsync(
        string username = "administrator",
        string password = "StrongPassword123")
    {
        await using var scope = Services.CreateAsyncScope();
        var users = scope.ServiceProvider.GetRequiredService<UserManager<Administrator>>();
        var administrator = new Administrator { UserName = username };
        var result = await users.CreateAsync(administrator, password);
        Assert.True(result.Succeeded, string.Join(", ", result.Errors.Select(error => error.Description)));
    }

    private static void DeleteIfPresent(string path)
    {
        if (File.Exists(path))
        {
            File.Delete(path);
        }
    }
}
