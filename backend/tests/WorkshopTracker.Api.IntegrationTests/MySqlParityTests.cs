using Microsoft.EntityFrameworkCore;
using Testcontainers.MySql;
using WorkshopTracker.Application.Colaboradores;
using WorkshopTracker.Application.Workshops;
using WorkshopTracker.Domain.Colaboradores;
using WorkshopTracker.Domain.Workshops;
using WorkshopTracker.Infrastructure.Persistence;

namespace WorkshopTracker.Api.IntegrationTests;

public sealed class MySqlParityTests : IAsyncLifetime
{
    private MySqlContainer? _container;

    public async Task InitializeAsync()
    {
        if (!string.Equals(Environment.GetEnvironmentVariable("RUN_MYSQL_TESTS"), "true", StringComparison.OrdinalIgnoreCase)) return;
        _container = new MySqlBuilder("mysql:8.4")
            .WithDatabase("workshop_tracker_tests")
            .WithUsername("workshop_tracker")
            .WithPassword("test-only-password")
            .Build();
        await _container.StartAsync();
    }

    public async Task DisposeAsync()
    {
        if (_container is not null) await _container.DisposeAsync();
    }

    [Fact]
    public async Task MySql_matches_sqlite_query_and_attendance_behavior()
    {
        if (_container is null) return;
        var options = new DbContextOptionsBuilder<WorkshopTrackerDbContext>()
            .UseMySQL(_container.GetConnectionString())
            .Options;
        await using var database = new WorkshopTrackerDbContext(options);
        await database.Database.EnsureCreatedAsync();
        var now = DateTimeOffset.UtcNow;
        var collaborator = Colaborador.Create("Ana", now);
        var workshop = Workshop.Create("Paridade", new DateTimeOffset(2026, 8, 20, 16, 0, 0, TimeSpan.FromHours(-3)), "Teste MySQL", now);
        workshop.AddParticipant(collaborator, now);
        database.AddRange(collaborator, workshop);
        await database.SaveChangesAsync();

        var collaborators = await new EfColaboradorReadRepository(database)
            .ListActiveAsync(new ListColaboradoresQuery("Ana", 0, 20), CancellationToken.None);
        var workshops = await new EfWorkshopReadRepository(database)
            .ListActiveAsync(new ListWorkshopsQuery("Paridade", 0, 20), CancellationToken.None);

        Assert.Equal("Ana", Assert.Single(collaborators.Items).Nome);
        Assert.Equal(1, Assert.Single(workshops.Items).ParticipantCount);
    }
}
