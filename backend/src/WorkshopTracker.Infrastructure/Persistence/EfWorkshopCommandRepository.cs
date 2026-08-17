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

    public async Task<IReadOnlyList<Colaborador>> FindActiveCollaboratorsAsync(IReadOnlyCollection<int> ids, CancellationToken cancellationToken = default) =>
        await database.Colaboradores.Where(item => ids.Contains(item.Id) && item.ArchivedAt == null).ToListAsync(cancellationToken);

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

    public async Task MarkLatestArchiveEventRestoredAsync(int workshopId, DateTimeOffset restoredAt, CancellationToken cancellationToken = default)
    {
        var archiveEvent = await database.WorkshopArchiveEvents
            .Where(item => item.WorkshopId == workshopId && item.RestoredAt == null)
            .OrderByDescending(item => item.ArchivedAt)
            .FirstOrDefaultAsync(cancellationToken);
        archiveEvent?.MarkRestored(restoredAt);
    }
}
