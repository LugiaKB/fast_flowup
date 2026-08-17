namespace WorkshopTracker.Application.Workshops;

public interface IWorkshopReadRepository
{
    Task<PagedWorkshops> ListActiveAsync(ListWorkshopsQuery query, CancellationToken cancellationToken);
    Task<WorkshopDetailResponse?> GetActiveAsync(int id, CancellationToken cancellationToken);
}
