using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using WorkshopTracker.Domain.Colaboradores;

namespace WorkshopTracker.Api.IntegrationTests;

public sealed class WorkshopsCommandTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    public WorkshopsCommandTests(TestWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task Administrator_can_create_a_workshop_with_active_participants_and_manage_them()
    {
        var now = DateTimeOffset.UtcNow;
        var ana = Colaborador.Create("Ana", now);
        var bruno = Colaborador.Create("Bruno", now);
        await _factory.ResetDatabaseAsync([ana, bruno]);
        await _factory.CreateAdministratorAsync();
        using var client = await AdminClientAsync();
        var scheduledAt = new DateTimeOffset(2026, 8, 20, 16, 0, 0, TimeSpan.FromHours(-3));

        var create = await client.PostAsJsonAsync("/api/workshops", new { nome = "Comunicação", dataRealizacao = scheduledAt, descricao = "Prática", colaboradorIds = new[] { ana.Id } });
        using var created = JsonDocument.Parse(await create.Content.ReadAsStringAsync());
        var workshopId = created.RootElement.GetProperty("id").GetInt32();
        var add = await client.PutAsync($"/api/workshops/{workshopId}/participantes/{bruno.Id}", null);
        var replace = await client.PutAsJsonAsync($"/api/workshops/{workshopId}/participantes", new { colaboradorIds = new[] { bruno.Id } });

        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, add.StatusCode);
        Assert.Equal(HttpStatusCode.OK, replace.StatusCode);
        using var replaced = JsonDocument.Parse(await replace.Content.ReadAsStringAsync());
        Assert.Equal(1, replaced.RootElement.GetProperty("participantCount").GetInt32());
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
