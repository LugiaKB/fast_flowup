using WorkshopTracker.Domain.Colaboradores;
using WorkshopTracker.Domain.Workshops;

namespace WorkshopTracker.Application.Workshops;

public interface IWorkshopCommandRepository
{
    Task AddAsync(Workshop workshop, CancellationToken cancellationToken = default);
    Task<Workshop?> FindByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Colaborador>> FindActiveCollaboratorsAsync(IReadOnlyCollection<int> ids, CancellationToken cancellationToken = default);
    Task<bool> HasActiveWorkshopInQuarterAsync(DateTimeOffset scheduledAt, int? excludingWorkshopId, CancellationToken cancellationToken = default);
    Task AddArchiveEventAsync(WorkshopArchiveEvent archiveEvent, CancellationToken cancellationToken = default);
    Task MarkLatestArchiveEventRestoredAsync(int workshopId, DateTimeOffset restoredAt, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
