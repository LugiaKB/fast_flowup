using System.Net;
using System.Net.Http.Json;
using System.Net.Http.Headers;
using System.Text.Json;
using WorkshopTracker.Domain.Colaboradores;

namespace WorkshopTracker.Api.IntegrationTests;

public sealed class ColaboradoresQueryTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public ColaboradoresQueryTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Public_list_exposes_only_active_collaborators_in_name_order_with_pagination()
    {
        var archived = Colaborador.Create("Bruna arquivada", DateTimeOffset.UtcNow);
        archived.Archive(DateTimeOffset.UtcNow);
        await _factory.ResetDatabaseAsync(
        [
            Colaborador.Create("Zuleica", DateTimeOffset.UtcNow),
            Colaborador.Create("Ana", DateTimeOffset.UtcNow),
            Colaborador.Create("Bruno", DateTimeOffset.UtcNow),
            archived,
        ]);
        using var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/colaboradores?query=RU&offset=0&limit=1");
        var page = await response.Content.ReadFromJsonAsync<PagedColaboradoresResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(page);
        Assert.Equal(1, page.TotalItems);
        Assert.Equal(0, page.Offset);
        Assert.Equal(1, page.Limit);
        Assert.Equal("Bruno", Assert.Single(page.Items).Nome);
        Assert.Equal("active", page.Items[0].Status);
    }

    [Fact]
    public async Task Invalid_pagination_returns_a_validation_problem()
    {
        using var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/colaboradores?offset=-1&limit=101");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Archived_filter_requires_authentication_and_returns_archived_collaborators_to_the_administrator()
    {
        var archived = Colaborador.Create("Ana arquivada", DateTimeOffset.UtcNow);
        archived.Archive(DateTimeOffset.UtcNow);
        await _factory.ResetDatabaseAsync([archived]);
        using var visitor = _factory.CreateClient();

        var unauthorized = await visitor.GetAsync("/api/colaboradores?status=archived");

        await _factory.CreateAdministratorAsync();
        using var admin = await AdminClientAsync();
        var authorized = await admin.GetAsync("/api/colaboradores?status=archived");
        var body = await authorized.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.Unauthorized, unauthorized.StatusCode);
        Assert.Equal(HttpStatusCode.OK, authorized.StatusCode);
        Assert.Contains("Ana arquivada", body);
        Assert.Contains("archived", body);
    }

    private async Task<HttpClient> AdminClientAsync()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/login", new { username = "administrator", password = "StrongPassword123" });
        using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", body.RootElement.GetProperty("accessToken").GetString());
        return client;
    }

    private sealed record PagedColaboradoresResponse(
        IReadOnlyList<ColaboradorResponse> Items,
        int TotalItems,
        int Offset,
        int Limit);

    private sealed record ColaboradorResponse(int Id, string Nome, string Status);
}
