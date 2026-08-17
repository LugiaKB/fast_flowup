using Microsoft.EntityFrameworkCore;
using WorkshopTracker.Application.Colaboradores;
using WorkshopTracker.Domain.Colaboradores;

namespace WorkshopTracker.Infrastructure.Persistence;

public sealed class EfColaboradorCommandRepository(WorkshopTrackerDbContext database) : IColaboradorCommandRepository
{
    public Task AddAsync(Colaborador collaborator, CancellationToken cancellationToken = default) =>
        database.Colaboradores.AddAsync(collaborator, cancellationToken).AsTask();

    public Task<Colaborador?> FindByIdAsync(int id, CancellationToken cancellationToken = default) =>
        database.Colaboradores.SingleOrDefaultAsync(item => item.Id == id, cancellationToken);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        database.SaveChangesAsync(cancellationToken);
}
