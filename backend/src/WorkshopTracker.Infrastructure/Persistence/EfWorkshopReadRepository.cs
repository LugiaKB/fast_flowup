using Microsoft.EntityFrameworkCore;
using WorkshopTracker.Application.Workshops;

namespace WorkshopTracker.Infrastructure.Persistence;

public sealed class EfWorkshopReadRepository(WorkshopTrackerDbContext database) : IWorkshopReadRepository
{
    public async Task<PagedWorkshops> ListActiveAsync(
        ListWorkshopsQuery query,
        CancellationToken cancellationToken)
    {
        var filtered = database.Workshops
            .AsNoTracking()
            .Where(workshop => workshop.ArchivedAt == null)
            .Where(workshop => EF.Functions.Like(workshop.Nome, $"%{query.Query}%"));
        var totalItems = await filtered.CountAsync(cancellationToken);
        var items = await filtered
            .OrderByDescending(workshop => workshop.DataRealizacao)
            .ThenByDescending(workshop => workshop.Id)
            .Skip(query.Offset)
            .Take(query.Limit)
            .Select(workshop => new WorkshopSummaryResponse(
                workshop.Id,
                workshop.Nome,
                workshop.DataRealizacao,
                workshop.Descricao,
                "active",
                null,
                workshop.Participacoes.Count(participation => participation.Colaborador.ArchivedAt == null)))
            .ToListAsync(cancellationToken);

        return new PagedWorkshops(items, totalItems, query.Offset, query.Limit);
    }

    public async Task<WorkshopDetailResponse?> GetActiveAsync(int id, CancellationToken cancellationToken)
    {
        var workshop = await database.Workshops
            .AsNoTracking()
            .Include(item => item.Participacoes)
            .ThenInclude(item => item.Colaborador)
            .SingleOrDefaultAsync(item => item.Id == id && item.ArchivedAt == null, cancellationToken);

        return workshop is null ? null : WorkshopDetailResponse.FromDomain(workshop);
    }
}
