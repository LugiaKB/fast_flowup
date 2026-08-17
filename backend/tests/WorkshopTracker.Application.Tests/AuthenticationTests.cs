using WorkshopTracker.Domain.Authentication;

namespace WorkshopTracker.Application.Tests;

public sealed class AuthenticationTests
{
    [Fact]
    public void Rotating_a_refresh_session_preserves_the_family_and_invalidates_the_presented_token()
    {
        var now = DateTimeOffset.UtcNow;
        var session = RefreshSession.Create("admin-id", "hash-one", now, now.AddDays(7));

        var successor = session.Rotate("hash-two", now.AddMinutes(1), now.AddDays(7));

        Assert.Equal(session.FamilyId, successor.FamilyId);
        Assert.Equal(RefreshSessionStatus.Rotated, session.Status);
        Assert.Equal(successor.Id, session.ReplacedBySessionId);
        Assert.Equal(RefreshSessionStatus.Active, successor.Status);
    }
}
