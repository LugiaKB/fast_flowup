using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WorkshopTracker.Infrastructure.Persistence;

namespace WorkshopTracker.Api.IntegrationTests;

public sealed class ApiStartupTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public ApiStartupTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Health_endpoint_openapi_document_and_swagger_ui_are_available()
    {
        using var client = _factory.CreateClient();

        var health = await client.GetAsync("/health");
        var openApi = await client.GetAsync("/openapi/v1.json");
        var swagger = await client.GetAsync("/swagger");

        Assert.Equal(System.Net.HttpStatusCode.OK, health.StatusCode);
        Assert.Equal(System.Net.HttpStatusCode.OK, openApi.StatusCode);
        Assert.Contains("application/json", openApi.Content.Headers.ContentType?.MediaType);
        Assert.Equal(System.Net.HttpStatusCode.OK, swagger.StatusCode);
        Assert.Contains("text/html", swagger.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Cors_allows_only_the_configured_frontend_origin()
    {
        using var client = _factory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Options, "/health");
        request.Headers.Add("Origin", "http://localhost:3000");
        request.Headers.Add("Access-Control-Request-Method", "GET");

        using var response = await client.SendAsync(request);

        Assert.Equal(System.Net.HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal("http://localhost:3000", response.Headers.GetValues("Access-Control-Allow-Origin").Single());
    }

    [Fact]
    public void Test_factory_uses_its_unique_temporary_sqlite_database()
    {
        using var scope = _factory.Services.CreateScope();
        var database = scope.ServiceProvider.GetRequiredService<WorkshopTrackerDbContext>();

        Assert.Equal(_factory.DatabasePath, database.Database.GetDbConnection().DataSource);
    }
}
