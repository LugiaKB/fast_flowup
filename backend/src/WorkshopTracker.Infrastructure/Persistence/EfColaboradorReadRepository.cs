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
            .Where(collaborator => query.Status == "all"
                || (query.Status == "active" && collaborator.ArchivedAt == null)
                || (query.Status == "archived" && collaborator.ArchivedAt != null))
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
                collaborator.ArchivedAt == null ? "active" : "archived",
                collaborator.ArchivedAt,
                collaborator.CreatedAt,
                collaborator.UpdatedAt))
            .ToListAsync(cancellationToken);

        return new PagedColaboradores(items, totalItems, query.Offset, query.Limit);
    }

    public async Task<ColaboradorResponse?> GetAsync(int id, bool includeArchived, CancellationToken cancellationToken)
    {
        var collaborator = await database.Colaboradores.AsNoTracking()
            .SingleOrDefaultAsync(item => item.Id == id && (includeArchived || item.ArchivedAt == null), cancellationToken);
        return collaborator is null ? null : ColaboradorResponse.FromDomain(collaborator);
    }

    private static string EscapeLike(string value) => value
        .Replace("\\", "\\\\", StringComparison.Ordinal)
        .Replace("%", "\\%", StringComparison.Ordinal)
        .Replace("_", "\\_", StringComparison.Ordinal);
}
