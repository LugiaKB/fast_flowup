namespace WorkshopTracker.Application.Workshops;

public interface IWorkshopReadRepository
{
    Task<PagedWorkshops> ListActiveAsync(ListWorkshopsQuery query, CancellationToken cancellationToken);
    Task<WorkshopDetailResponse?> GetAsync(int id, bool includeArchived, bool includeArchiveHistory, CancellationToken cancellationToken);
}
