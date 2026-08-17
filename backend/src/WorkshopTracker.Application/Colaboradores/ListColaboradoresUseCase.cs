namespace WorkshopTracker.Application.Colaboradores;

public sealed class ListColaboradoresUseCase(IColaboradorReadRepository repository)
{
    public Task<PagedColaboradores> ExecuteAsync(
        ListColaboradoresQuery query,
        CancellationToken cancellationToken = default) =>
        repository.ListActiveAsync(query, cancellationToken);
}
