using WorkshopTracker.Application.Colaboradores;
using WorkshopTracker.Application.Common;
using WorkshopTracker.Domain.Colaboradores;

namespace WorkshopTracker.Application.Tests;

public sealed class ColaboradorCommandTests
{
    [Fact]
    public async Task Create_normalizes_the_name_and_persists_the_collaborator()
    {
        var repository = new FakeRepository();
        var useCase = new ManageColaboradoresUseCase(repository, new FixedClock());

        var collaborator = await useCase.CreateAsync("  Ana Silva  ");

        Assert.Equal("Ana Silva", collaborator.Nome);
        Assert.Same(collaborator, Assert.Single(repository.Items));
    }

    private sealed class FixedClock : IClock
    {
        public DateTimeOffset UtcNow => new(2026, 8, 17, 12, 0, 0, TimeSpan.Zero);
    }

    private sealed class FakeRepository : IColaboradorCommandRepository
    {
        public List<Colaborador> Items { get; } = [];
        public Task AddAsync(Colaborador collaborator, CancellationToken cancellationToken = default)
        {
            Items.Add(collaborator);
            return Task.CompletedTask;
        }

        public Task<Colaborador?> FindByIdAsync(int id, CancellationToken cancellationToken = default) =>
            Task.FromResult(Items.SingleOrDefault(item => item.Id == id));

        public Task SaveChangesAsync(CancellationToken cancellationToken = default) => Task.CompletedTask;
    }
}
