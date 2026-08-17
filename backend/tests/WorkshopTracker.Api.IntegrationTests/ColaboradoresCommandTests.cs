using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace WorkshopTracker.Api.IntegrationTests;

public sealed class ColaboradoresCommandTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public ColaboradoresCommandTests(TestWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task Administrator_can_create_update_archive_and_restore_a_collaborator()
    {
        await _factory.ResetDatabaseAsync([]);
        await _factory.CreateAdministratorAsync();
        using var client = await CreateAdministratorClientAsync();

        var create = await client.PostAsJsonAsync("/api/colaboradores", new { nome = "Ana Silva" });
        using var created = JsonDocument.Parse(await create.Content.ReadAsStringAsync());
        var id = created.RootElement.GetProperty("id").GetInt32();
        var update = await client.PutAsJsonAsync($"/api/colaboradores/{id}", new { nome = "Ana Souza" });
        var archive = await client.DeleteAsync($"/api/colaboradores/{id}");
        var restore = await client.PostAsync($"/api/colaboradores/{id}/restaurar", null);

        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, archive.StatusCode);
        Assert.Equal(HttpStatusCode.OK, restore.StatusCode);
        using var restored = JsonDocument.Parse(await restore.Content.ReadAsStringAsync());
        Assert.Equal("active", restored.RootElement.GetProperty("status").GetString());
        Assert.Equal("Ana Souza", restored.RootElement.GetProperty("nome").GetString());
    }

    [Fact]
    public async Task Collaborator_mutations_require_an_administrator()
    {
        await _factory.ResetDatabaseAsync([]);
        using var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/colaboradores", new { nome = "Ana Silva" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    private async Task<HttpClient> CreateAdministratorClientAsync()
    {
        var client = _factory.CreateClient();
        var login = await client.PostAsJsonAsync("/api/auth/login", new
        {
            username = "administrator",
            password = "StrongPassword123",
        });
        using var document = JsonDocument.Parse(await login.Content.ReadAsStringAsync());
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            document.RootElement.GetProperty("accessToken").GetString());
        return client;
    }
}
