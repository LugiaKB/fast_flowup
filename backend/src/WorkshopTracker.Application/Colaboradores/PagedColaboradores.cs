namespace WorkshopTracker.Application.Colaboradores;

public sealed record PagedColaboradores(
    IReadOnlyList<ColaboradorResponse> Items,
    int TotalItems,
    int Offset,
    int Limit);
