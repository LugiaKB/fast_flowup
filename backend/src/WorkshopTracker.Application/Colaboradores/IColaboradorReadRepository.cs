namespace WorkshopTracker.Application.Colaboradores;

public interface IColaboradorReadRepository
{
    Task<PagedColaboradores> ListActiveAsync(ListColaboradoresQuery query, CancellationToken cancellationToken);
    Task<ColaboradorResponse?> GetAsync(int id, bool includeArchived, CancellationToken cancellationToken);
}
