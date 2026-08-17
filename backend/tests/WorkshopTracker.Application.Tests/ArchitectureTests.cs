using WorkshopTracker.Application.Common;

namespace WorkshopTracker.Application.Tests;

public sealed class ArchitectureTests
{
    [Fact]
    public void Application_layer_references_only_the_domain_layer()
    {
        var references = typeof(ApplicationAssemblyMarker).Assembly
            .GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .ToArray();

        Assert.DoesNotContain("WorkshopTracker.Infrastructure", references);
        Assert.DoesNotContain("WorkshopTracker.Api", references);
        Assert.Contains("WorkshopTracker.Domain", references);
    }

    [Fact]
    public void Failure_result_exposes_its_stable_error_code()
    {
        var result = Result.Failure(Error.Validation("invalid_input", "O valor informado é inválido."));

        Assert.False(result.IsSuccess);
        Assert.Equal("invalid_input", result.Error.Code);
    }

    [Fact]
    public void Clock_abstraction_exposes_an_utc_instant()
    {
        IClock clock = new FixedClock(new DateTimeOffset(2026, 8, 17, 12, 0, 0, TimeSpan.Zero));

        Assert.Equal(TimeSpan.Zero, clock.UtcNow.Offset);
    }

    private sealed class FixedClock(DateTimeOffset utcNow) : IClock
    {
        public DateTimeOffset UtcNow => utcNow;
    }
}
