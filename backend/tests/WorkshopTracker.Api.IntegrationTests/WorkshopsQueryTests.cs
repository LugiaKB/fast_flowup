using System.Net;
using WorkshopTracker.Domain.Colaboradores;
using WorkshopTracker.Domain.Workshops;

namespace WorkshopTracker.Api.IntegrationTests;

public sealed class WorkshopsQueryTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public WorkshopsQueryTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Public_list_orders_active_workshops_by_date_descending_and_detail_hides_archived_participants()
    {
        var now = DateTimeOffset.UtcNow;
        var active = Colaborador.Create("Ana ativa", now);
        var archived = Colaborador.Create("Bruno arquivado", now);
        var recent = Workshop.Create(
            "Workshop recente",
            new DateTimeOffset(2026, 4, 2, 16, 0, 0, TimeSpan.FromHours(-3)),
            "Descrição recente",
            now);
        var older = Workshop.Create(
            "Workshop anterior",
            new DateTimeOffset(2026, 1, 8, 16, 0, 0, TimeSpan.FromHours(-3)),
            "Descrição anterior",
            now);
        recent.AddParticipant(active, now);
        recent.AddParticipant(archived, now);
        archived.Archive(now);

        await _factory.ResetDatabaseAsync([active, archived], [recent, older]);
        using var client = _factory.CreateClient();

        var list = await client.GetStringAsync("/api/workshops?offset=0&limit=20");
        var detail = await client.GetStringAsync($"/api/workshops/{recent.Id}");

        Assert.Contains("Workshop recente", list);
        Assert.True(list.IndexOf("Workshop recente", StringComparison.Ordinal) < list.IndexOf("Workshop anterior", StringComparison.Ordinal));
        Assert.Contains("Ana ativa", detail);
        Assert.DoesNotContain("Bruno arquivado", detail);
    }

    [Fact]
    public async Task Missing_workshop_returns_not_found_problem()
    {
        await _factory.ResetDatabaseAsync([]);
        using var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/workshops/999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }
}
