namespace WorkshopTracker.Application.Workshops;

public sealed record ListWorkshopsQuery(string Query, int Offset, int Limit, string Status = "active");
