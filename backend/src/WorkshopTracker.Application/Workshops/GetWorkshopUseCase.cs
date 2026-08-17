namespace WorkshopTracker.Application.Workshops;

public sealed class GetWorkshopUseCase(IWorkshopReadRepository repository)
{
    public Task<WorkshopDetailResponse?> ExecuteAsync(int id, bool isAdministrator, CancellationToken cancellationToken = default) =>
        repository.GetAsync(id, isAdministrator, isAdministrator, cancellationToken);
}
