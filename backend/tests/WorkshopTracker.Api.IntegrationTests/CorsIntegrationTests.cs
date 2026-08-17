using System.Net;

namespace WorkshopTracker.Api.IntegrationTests;

public sealed class CorsIntegrationTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public CorsIntegrationTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Theory]
    [InlineData("https://fast-flowup.vercel.app")]
    [InlineData("http://localhost:3000")]
    public async Task Preflight_options_request_from_allowed_origin_returns_cors_headers(string origin)
    {
        using var client = _factory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Options, "/api/workshops");
        request.Headers.Add("Origin", origin);
        request.Headers.Add("Access-Control-Request-Method", "GET");
        request.Headers.Add("Access-Control-Request-Headers", "authorization,content-type");

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.True(response.Headers.Contains("Access-Control-Allow-Origin"));
        Assert.Equal(origin, response.Headers.GetValues("Access-Control-Allow-Origin").FirstOrDefault());
        Assert.Equal("true", response.Headers.GetValues("Access-Control-Allow-Credentials").FirstOrDefault());
    }

    [Fact]
    public async Task Get_request_from_vercel_origin_returns_allow_origin_header()
    {
        await _factory.ResetDatabaseAsync([]);
        using var client = _factory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/workshops");
        request.Headers.Add("Origin", "https://fast-flowup.vercel.app");

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(response.Headers.Contains("Access-Control-Allow-Origin"));
        Assert.Equal("https://fast-flowup.vercel.app", response.Headers.GetValues("Access-Control-Allow-Origin").FirstOrDefault());
        Assert.Equal("true", response.Headers.GetValues("Access-Control-Allow-Credentials").FirstOrDefault());
    }

    [Fact]
    public async Task Request_from_disallowed_origin_does_not_return_allow_origin_header()
    {
        await _factory.ResetDatabaseAsync([]);
        using var client = _factory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/workshops");
        request.Headers.Add("Origin", "https://unauthorized-evil-site.com");

        var response = await client.SendAsync(request);

        Assert.False(response.Headers.Contains("Access-Control-Allow-Origin"));
    }
}
