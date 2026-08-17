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

    [Fact]
    public async Task Creation_rejects_duplicates_and_archived_collaborators_without_persisting_a_workshop()
    {
        var now = DateTimeOffset.UtcNow;
        var archived = Colaborador.Create("Arquivada", now);
        archived.Archive(now);
        await _factory.ResetDatabaseAsync([archived]);
        await _factory.CreateAdministratorAsync();
        using var client = await AdminClientAsync();
        var scheduledAt = new DateTimeOffset(2026, 8, 20, 16, 0, 0, TimeSpan.FromHours(-3));

        var duplicate = await client.PostAsJsonAsync("/api/workshops", new { nome = "Duplicado", dataRealizacao = scheduledAt, descricao = "Teste", colaboradorIds = new[] { archived.Id, archived.Id } });
        var inactive = await client.PostAsJsonAsync("/api/workshops", new { nome = "Inativo", dataRealizacao = scheduledAt, descricao = "Teste", colaboradorIds = new[] { archived.Id } });
        var list = await client.GetStringAsync("/api/workshops");

        Assert.Equal(HttpStatusCode.BadRequest, duplicate.StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, inactive.StatusCode);
        Assert.DoesNotContain("Duplicado", list);
        Assert.DoesNotContain("Inativo", list);
    }

    [Fact]
    public async Task Workshop_mutations_require_authentication()
    {
        await _factory.ResetDatabaseAsync([]);
        using var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/workshops", new
        {
            nome = "Protegido",
            dataRealizacao = new DateTimeOffset(2026, 8, 20, 16, 0, 0, TimeSpan.FromHours(-3)),
            descricao = "Teste",
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Replacement_links_archive_history_and_blocks_predecessor_restoration()
    {
        await _factory.ResetDatabaseAsync([]);
        await _factory.CreateAdministratorAsync();
        using var client = await AdminClientAsync();
        var scheduledAt = new DateTimeOffset(2026, 8, 20, 16, 0, 0, TimeSpan.FromHours(-3));
        var created = await client.PostAsJsonAsync("/api/workshops", new { nome = "Original", dataRealizacao = scheduledAt, descricao = "Teste" });
        using var createdBody = JsonDocument.Parse(await created.Content.ReadAsStringAsync());
        var predecessorId = createdBody.RootElement.GetProperty("id").GetInt32();

        var archiveRequest = new HttpRequestMessage(HttpMethod.Delete, $"/api/workshops/{predecessorId}")
        {
            Content = JsonContent.Create(new { reason = "replacement" }),
        };
        var archived = await client.SendAsync(archiveRequest);
        var replacement = await client.PostAsJsonAsync("/api/workshops", new { nome = "Substituto", dataRealizacao = scheduledAt, descricao = "Teste", substituiWorkshopId = predecessorId });
        var predecessor = await client.GetAsync($"/api/workshops/{predecessorId}");
        var restore = await client.PostAsync($"/api/workshops/{predecessorId}/restaurar", null);

        Assert.Equal(HttpStatusCode.NoContent, archived.StatusCode);
        Assert.Equal(HttpStatusCode.Created, replacement.StatusCode);
        Assert.Equal(HttpStatusCode.OK, predecessor.StatusCode);
        using var detail = JsonDocument.Parse(await predecessor.Content.ReadAsStringAsync());
        Assert.Equal("replacement", detail.RootElement.GetProperty("archiveEvents")[0].GetProperty("reason").GetString());
        Assert.True(detail.RootElement.GetProperty("archiveEvents")[0].GetProperty("replacementWorkshopId").GetInt32() > 0);
        Assert.Equal(HttpStatusCode.Conflict, restore.StatusCode);
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
