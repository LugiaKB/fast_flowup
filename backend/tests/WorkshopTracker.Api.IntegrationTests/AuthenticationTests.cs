using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace WorkshopTracker.Api.IntegrationTests;

public sealed class AuthenticationTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public AuthenticationTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Current_administrator_requires_a_valid_bearer_token()
    {
        using var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Login_issues_an_access_token_and_refresh_cookie_for_the_configured_administrator()
    {
        await _factory.ResetDatabaseAsync([]);
        await _factory.CreateAdministratorAsync();
        using var client = _factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            username = "administrator",
            password = "StrongPassword123",
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains(response.Headers.GetValues("Set-Cookie"), value => value.StartsWith("workshop_refresh=", StringComparison.Ordinal));
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.False(string.IsNullOrWhiteSpace(document.RootElement.GetProperty("accessToken").GetString()));
        Assert.Equal("administrator", document.RootElement.GetProperty("admin").GetProperty("username").GetString());
    }

    [Fact]
    public async Task Refresh_rotates_the_cookie_and_logout_revokes_the_session()
    {
        await _factory.ResetDatabaseAsync([]);
        await _factory.CreateAdministratorAsync();
        using var client = _factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });
        client.DefaultRequestHeaders.Add("Origin", "http://localhost:3000");
        await client.PostAsJsonAsync("/api/auth/login", new { username = "administrator", password = "StrongPassword123" });

        var refresh = await client.PostAsync("/api/auth/refresh", null);
        var logout = await client.PostAsync("/api/auth/logout", null);
        var retryRefresh = await client.PostAsync("/api/auth/refresh", null);

        Assert.Equal(HttpStatusCode.OK, refresh.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, logout.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, retryRefresh.StatusCode);
    }

    [Fact]
    public async Task Login_rejects_invalid_credentials()
    {
        await _factory.ResetDatabaseAsync([]);
        await _factory.CreateAdministratorAsync();
        using var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            username = "administrator",
            password = "wrong-password",
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }
}
