using Microsoft.EntityFrameworkCore;
using WorkshopTracker.Application.Workshops;
using WorkshopTracker.Domain.Colaboradores;
using WorkshopTracker.Domain.Workshops;

namespace WorkshopTracker.Infrastructure.Persistence;

public sealed class EfWorkshopCommandRepository(WorkshopTrackerDbContext database) : IWorkshopCommandRepository
{
    public Task AddAsync(Workshop workshop, CancellationToken cancellationToken = default) =>
        database.Workshops.AddAsync(workshop, cancellationToken).AsTask();

    public Task<Workshop?> FindByIdAsync(int id, CancellationToken cancellationToken = default) =>
        database.Workshops.Include(item => item.Participacoes).ThenInclude(item => item.Colaborador)
            .SingleOrDefaultAsync(item => item.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Colaborador>> FindCollaboratorsAsync(IReadOnlyCollection<int> ids, CancellationToken cancellationToken = default) =>
        await database.Colaboradores.Where(item => ids.Contains(item.Id)).ToListAsync(cancellationToken);

    public async Task<bool> HasActiveWorkshopInQuarterAsync(DateTimeOffset scheduledAt, int? excludingWorkshopId, CancellationToken cancellationToken = default)
    {
        var timezone = TimeZoneInfo.FindSystemTimeZoneById("America/Recife");
        var local = TimeZoneInfo.ConvertTime(scheduledAt, timezone);
        var startMonth = ((local.Month - 1) / 3 * 3) + 1;
        var start = new DateTimeOffset(local.Year, startMonth, 1, 0, 0, 0, local.Offset).ToUniversalTime();
        var end = start.AddMonths(3);
        return await database.Workshops.AnyAsync(item => item.ArchivedAt == null
            && (!excludingWorkshopId.HasValue || item.Id != excludingWorkshopId.Value)
            && item.DataRealizacao >= start && item.DataRealizacao < end, cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) => database.SaveChangesAsync(cancellationToken);

    public Task AddArchiveEventAsync(WorkshopArchiveEvent archiveEvent, CancellationToken cancellationToken = default) =>
        database.WorkshopArchiveEvents.AddAsync(archiveEvent, cancellationToken).AsTask();

    public Task<WorkshopArchiveEvent?> FindLatestOpenArchiveEventAsync(int workshopId, CancellationToken cancellationToken = default) =>
        database.WorkshopArchiveEvents
            .Where(item => item.WorkshopId == workshopId && item.RestoredAt == null)
            .OrderByDescending(item => item.Id)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task AddReplacementAsync(Workshop workshop, WorkshopArchiveEvent predecessorEvent, CancellationToken cancellationToken = default)
    {
        await using var transaction = await database.Database.BeginTransactionAsync(cancellationToken);
        database.Workshops.Add(workshop);
        await database.SaveChangesAsync(cancellationToken);
        predecessorEvent.AssignReplacement(workshop.Id);
        await database.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
    }

    public async Task MarkLatestArchiveEventRestoredAsync(int workshopId, string administratorId, DateTimeOffset restoredAt, CancellationToken cancellationToken = default)
    {
        var archiveEvent = await database.WorkshopArchiveEvents
            .Where(item => item.WorkshopId == workshopId && item.RestoredAt == null)
            .OrderByDescending(item => item.Id)
            .FirstOrDefaultAsync(cancellationToken);
        archiveEvent?.MarkRestored(administratorId, restoredAt);
    }
}
