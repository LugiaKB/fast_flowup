namespace WorkshopTracker.Application.Workshops;

public sealed record PagedWorkshops(
    IReadOnlyList<WorkshopSummaryResponse> Items,
    int TotalItems,
    int Offset,
    int Limit);
