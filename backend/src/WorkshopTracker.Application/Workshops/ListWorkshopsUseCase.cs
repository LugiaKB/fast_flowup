namespace WorkshopTracker.Application.Workshops;

public sealed class ListWorkshopsUseCase(IWorkshopReadRepository repository)
{
    public Task<PagedWorkshops> ExecuteAsync(ListWorkshopsQuery query, CancellationToken cancellationToken = default) =>
        repository.ListActiveAsync(query, cancellationToken);
}
