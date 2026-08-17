namespace WorkshopTracker.Application.Colaboradores;

public sealed class GetColaboradorUseCase(IColaboradorReadRepository repository)
{
    public Task<ColaboradorResponse?> ExecuteAsync(int id, bool includeArchived, CancellationToken cancellationToken = default) =>
        repository.GetAsync(id, includeArchived, cancellationToken);
}
