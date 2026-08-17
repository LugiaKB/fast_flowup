using Microsoft.EntityFrameworkCore;
using WorkshopTracker.Application.Colaboradores;

namespace WorkshopTracker.Infrastructure.Persistence;

public sealed class EfColaboradorReadRepository(WorkshopTrackerDbContext database) : IColaboradorReadRepository
{
    public async Task<PagedColaboradores> ListActiveAsync(
        ListColaboradoresQuery query,
        CancellationToken cancellationToken)
    {
        var filtered = database.Colaboradores
            .AsNoTracking()
            .Where(collaborator => collaborator.ArchivedAt == null)
            .Where(collaborator => EF.Functions.Like(collaborator.Nome, $"%{EscapeLike(query.Query)}%"));
        var totalItems = await filtered.CountAsync(cancellationToken);
        var items = await filtered
            .OrderBy(collaborator => collaborator.Nome)
            .ThenBy(collaborator => collaborator.Id)
            .Skip(query.Offset)
            .Take(query.Limit)
            .Select(collaborator => new ColaboradorResponse(
                collaborator.Id,
                collaborator.Nome,
                "active",
                null,
                collaborator.CreatedAt,
                collaborator.UpdatedAt))
            .ToListAsync(cancellationToken);

        return new PagedColaboradores(items, totalItems, query.Offset, query.Limit);
    }

    private static string EscapeLike(string value) => value
        .Replace("\\", "\\\\", StringComparison.Ordinal)
        .Replace("%", "\\%", StringComparison.Ordinal)
        .Replace("_", "\\_", StringComparison.Ordinal);
}
