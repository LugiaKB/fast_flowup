namespace WorkshopTracker.Application.Colaboradores;

public interface IColaboradorReadRepository
{
    Task<PagedColaboradores> ListActiveAsync(ListColaboradoresQuery query, CancellationToken cancellationToken);
}
