namespace WorkshopTracker.Application.Workshops;

public sealed class GetWorkshopUseCase(IWorkshopReadRepository repository)
{
    public Task<WorkshopDetailResponse?> ExecuteAsync(int id, CancellationToken cancellationToken = default) =>
        repository.GetActiveAsync(id, cancellationToken);
}
