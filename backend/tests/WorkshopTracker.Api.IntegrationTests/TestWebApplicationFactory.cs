using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WorkshopTracker.Domain.Colaboradores;
using WorkshopTracker.Infrastructure.Persistence;

namespace WorkshopTracker.Api.IntegrationTests;

public sealed class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _databasePath = Path.Combine(Path.GetTempPath(), $"workshop-tracker-tests-{Guid.NewGuid():N}.db");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_, configuration) => configuration.AddInMemoryCollection(
        [
            new KeyValuePair<string, string?>("Database:Provider", "Sqlite"),
            new KeyValuePair<string, string?>("ConnectionStrings:DefaultConnection", $"Data Source={_databasePath}"),
            new KeyValuePair<string, string?>("FrontendOrigin", "http://localhost:3000"),
        ]));
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
        await using var scope = Services.CreateAsyncScope();
        var database = scope.ServiceProvider.GetRequiredService<WorkshopTrackerDbContext>();
        await database.Database.EnsureDeletedAsync();
        await database.Database.EnsureCreatedAsync();
        await database.Colaboradores.AddRangeAsync(colaboradores);
        await database.SaveChangesAsync();
    }

    private static void DeleteIfPresent(string path)
    {
        if (File.Exists(path))
        {
            File.Delete(path);
        }
    }
}
