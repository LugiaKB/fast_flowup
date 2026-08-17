using WorkshopTracker.Application.Common;

namespace WorkshopTracker.Infrastructure;

public sealed class SystemClock : IClock
{
    public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
}
