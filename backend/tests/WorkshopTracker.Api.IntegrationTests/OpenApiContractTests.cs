using System.Text.Json;
using System.Text.RegularExpressions;

namespace WorkshopTracker.Api.IntegrationTests;

public sealed partial class OpenApiContractTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    public OpenApiContractTests(TestWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task Runtime_openapi_exposes_every_versioned_operation_with_the_same_operation_id()
    {
        using var client = _factory.CreateClient();
        using var runtime = JsonDocument.Parse(await client.GetStringAsync("/openapi/v1.json"));
        var runtimePaths = runtime.RootElement.GetProperty("paths");

        foreach (var expected in ReadVersionedOperations())
        {
            Assert.True(runtimePaths.TryGetProperty(expected.Path, out var path), $"Runtime OpenAPI does not contain {expected.Path}.");
            Assert.True(path.TryGetProperty(expected.Method, out var operation), $"Runtime OpenAPI does not contain {expected.Method.ToUpperInvariant()} {expected.Path}.");
            Assert.Equal(expected.OperationId, operation.GetProperty("operationId").GetString());
        }
    }

    private static IReadOnlyList<ExpectedOperation> ReadVersionedOperations()
    {
        var root = new DirectoryInfo(AppContext.BaseDirectory);
        while (root is not null && !Directory.Exists(Path.Combine(root.FullName, "specs"))) root = root.Parent;
        Assert.NotNull(root);
        var lines = File.ReadAllLines(Path.Combine(root.FullName, "specs", "001-workshop-participation", "contracts", "openapi.yaml"));
        var operations = new List<ExpectedOperation>();
        string? currentPath = null;
        string? currentMethod = null;
        foreach (var line in lines)
        {
            var pathMatch = PathLine().Match(line);
            if (pathMatch.Success)
            {
                currentPath = pathMatch.Groups[1].Value;
                currentMethod = null;
                continue;
            }

            var methodMatch = MethodLine().Match(line);
            if (currentPath is not null && methodMatch.Success)
            {
                currentMethod = methodMatch.Groups[1].Value;
                continue;
            }

            var operationMatch = OperationLine().Match(line);
            if (currentPath is not null && currentMethod is not null && operationMatch.Success)
            {
                operations.Add(new ExpectedOperation(currentPath, currentMethod, operationMatch.Groups[1].Value));
                currentMethod = null;
            }
        }
        return operations;
    }

    [GeneratedRegex("^  (/api/[^:]+):$")]
    private static partial Regex PathLine();
    [GeneratedRegex("^    (get|post|put|delete):$")]
    private static partial Regex MethodLine();
    [GeneratedRegex("^      operationId: (\\S+)$")]
    private static partial Regex OperationLine();
    private sealed record ExpectedOperation(string Path, string Method, string OperationId);
}
