using WorkshopTracker.Domain.Colaboradores;

namespace WorkshopTracker.Application.Colaboradores;

public interface IColaboradorCommandRepository
{
    Task AddAsync(Colaborador collaborator, CancellationToken cancellationToken = default);
    Task<Colaborador?> FindByIdAsync(int id, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
