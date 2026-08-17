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
            .Where(workshop => query.Status == "all"
                || (query.Status == "active" && workshop.ArchivedAt == null)
                || (query.Status == "archived" && workshop.ArchivedAt != null))
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
                workshop.ArchivedAt == null ? "active" : "archived",
                workshop.ArchivedAt,
                workshop.Participacoes.Count(participation => participation.Colaborador.ArchivedAt == null)))
            .ToListAsync(cancellationToken);

        return new PagedWorkshops(items, totalItems, query.Offset, query.Limit);
    }

    public async Task<WorkshopDetailResponse?> GetAsync(int id, bool includeArchived, bool includeArchiveHistory, CancellationToken cancellationToken)
    {
        var workshop = await database.Workshops
            .AsNoTracking()
            .Include(item => item.Participacoes)
            .ThenInclude(item => item.Colaborador)
            .SingleOrDefaultAsync(item => item.Id == id && (includeArchived || item.ArchivedAt == null), cancellationToken);

        if (workshop is null) return null;
        var archiveEvents = includeArchiveHistory
            ? await database.WorkshopArchiveEvents.AsNoTracking()
                .Where(item => item.WorkshopId == id)
                .OrderBy(item => item.Id)
                .Select(item => new WorkshopArchiveEventResponse(
                    item.Id,
                    item.Reason == WorkshopTracker.Domain.Workshops.WorkshopArchiveReason.Manual ? "manual" : "replacement",
                    item.ArchivedAt,
                    item.ArchivedByAdminId,
                    item.RestoredAt,
                    item.ReplacementWorkshopId))
                .ToListAsync(cancellationToken)
            : [];
        return WorkshopDetailResponse.FromDomain(workshop, archiveEvents);
    }
}
