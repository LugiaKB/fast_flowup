using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using WorkshopTracker.Domain.Colaboradores;
using WorkshopTracker.Domain.Workshops;

namespace WorkshopTracker.Api.IntegrationTests;

public sealed class AttendanceTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    public AttendanceTests(TestWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task Bulk_replacement_is_atomic_and_rejects_duplicates_or_inactive_collaborators()
    {
        var now = DateTimeOffset.UtcNow;
        var active = Colaborador.Create("Ativa", now);
        var archived = Colaborador.Create("Arquivada", now);
        archived.Archive(now);
        var workshop = Workshop.Create("Workshop", new DateTimeOffset(2026, 8, 20, 16, 0, 0, TimeSpan.FromHours(-3)), "Teste", now);
        workshop.AddParticipant(active, now);
        await _factory.ResetDatabaseAsync([active, archived], [workshop]);
        await _factory.CreateAdministratorAsync();
        using var client = await AdminClientAsync();

        var duplicate = await client.PutAsJsonAsync($"/api/workshops/{workshop.Id}/participantes", new { colaboradorIds = new[] { active.Id, active.Id } });
        var inactive = await client.PutAsJsonAsync($"/api/workshops/{workshop.Id}/participantes", new { colaboradorIds = new[] { archived.Id } });
        var detail = await client.GetStringAsync($"/api/workshops/{workshop.Id}");

        Assert.Equal(HttpStatusCode.BadRequest, duplicate.StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, inactive.StatusCode);
        Assert.Contains("Ativa", detail);
        Assert.DoesNotContain("Arquivada", detail);
    }

    [Fact]
    public async Task Individual_add_and_remove_are_idempotent_and_require_existing_records()
    {
        var now = DateTimeOffset.UtcNow;
        var active = Colaborador.Create("Ativa", now);
        var workshop = Workshop.Create("Workshop", new DateTimeOffset(2026, 8, 20, 16, 0, 0, TimeSpan.FromHours(-3)), "Teste", now);
        await _factory.ResetDatabaseAsync([active], [workshop]);
        await _factory.CreateAdministratorAsync();
        using var client = await AdminClientAsync();

        var addFirst = await client.PutAsync($"/api/workshops/{workshop.Id}/participantes/{active.Id}", null);
        var addAgain = await client.PutAsync($"/api/workshops/{workshop.Id}/participantes/{active.Id}", null);
        var removeFirst = await client.DeleteAsync($"/api/workshops/{workshop.Id}/participantes/{active.Id}");
        var removeAgain = await client.DeleteAsync($"/api/workshops/{workshop.Id}/participantes/{active.Id}");
        var missing = await client.PutAsync($"/api/workshops/{workshop.Id}/participantes/999", null);

        Assert.Equal(HttpStatusCode.NoContent, addFirst.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, addAgain.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, removeFirst.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, removeAgain.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, missing.StatusCode);
    }

    private async Task<HttpClient> AdminClientAsync()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/login", new { username = "administrator", password = "StrongPassword123" });
        using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", body.RootElement.GetProperty("accessToken").GetString());
        return client;
    }
}
