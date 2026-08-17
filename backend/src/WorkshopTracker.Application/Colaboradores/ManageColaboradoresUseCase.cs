using WorkshopTracker.Application.Common;
using WorkshopTracker.Domain.Colaboradores;

namespace WorkshopTracker.Application.Colaboradores;

public sealed class ManageColaboradoresUseCase(IColaboradorCommandRepository repository, IClock clock)
{
    public async Task<Colaborador> CreateAsync(string nome, CancellationToken cancellationToken = default)
    {
        var collaborator = Colaborador.Create(nome, clock.UtcNow);
        await repository.AddAsync(collaborator, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        return collaborator;
    }

    public async Task<Colaborador?> UpdateAsync(int id, string nome, CancellationToken cancellationToken = default)
    {
        var collaborator = await repository.FindByIdAsync(id, cancellationToken);
        if (collaborator is null) return null;
        collaborator.UpdateName(nome, clock.UtcNow);
        await repository.SaveChangesAsync(cancellationToken);
        return collaborator;
    }

    public async Task<bool> ArchiveAsync(int id, CancellationToken cancellationToken = default)
    {
        var collaborator = await repository.FindByIdAsync(id, cancellationToken);
        if (collaborator is null) return false;
        collaborator.Archive(clock.UtcNow);
        await repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<Colaborador?> RestoreAsync(int id, CancellationToken cancellationToken = default)
    {
        var collaborator = await repository.FindByIdAsync(id, cancellationToken);
        if (collaborator is null) return null;
        collaborator.Restore(clock.UtcNow);
        await repository.SaveChangesAsync(cancellationToken);
        return collaborator;
    }
}
