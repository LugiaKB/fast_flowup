using WorkshopTracker.Application.Colaboradores;
using WorkshopTracker.Domain.Colaboradores;

namespace WorkshopTracker.Application.Tests;

public sealed class ColaboradorQueryTests
{
    [Fact]
    public async Task List_active_returns_alphabetically_ordered_page_from_the_repository()
    {
        var repository = new StubColaboradorReadRepository(
        [
            Colaborador.Create("Zuleica", DateTimeOffset.UtcNow),
            Colaborador.Create("Ana", DateTimeOffset.UtcNow),
            Colaborador.Create("Bruno", DateTimeOffset.UtcNow),
        ]);
        var useCase = new ListColaboradoresUseCase(repository);

        var result = await useCase.ExecuteAsync(new ListColaboradoresQuery("", 1, 1));

        Assert.Equal(3, result.TotalItems);
        Assert.Equal(1, result.Offset);
        Assert.Equal(1, result.Limit);
        Assert.Equal("Bruno", Assert.Single(result.Items).Nome);
    }

    private sealed class StubColaboradorReadRepository : IColaboradorReadRepository
    {
        private readonly IReadOnlyList<Colaborador> _items;

        public StubColaboradorReadRepository(IReadOnlyList<Colaborador> items)
        {
            _items = items;
        }

        public Task<PagedColaboradores> ListActiveAsync(ListColaboradoresQuery query, CancellationToken cancellationToken)
        {
            var matches = _items
                .Where(item => item.ArchivedAt is null)
                .Where(item => item.Nome.Contains(query.Query, StringComparison.OrdinalIgnoreCase))
                .OrderBy(item => item.Nome, StringComparer.Ordinal)
                .ToArray();
            var page = matches.Skip(query.Offset).Take(query.Limit)
                .Select(ColaboradorResponse.FromDomain)
                .ToArray();

            return Task.FromResult(new PagedColaboradores(page, matches.Length, query.Offset, query.Limit));
        }

        public Task<ColaboradorResponse?> GetAsync(int id, bool includeArchived, CancellationToken cancellationToken) =>
            Task.FromResult(_items.FirstOrDefault(item => item.Id == id && (includeArchived || item.ArchivedAt is null)) is { } item
                ? ColaboradorResponse.FromDomain(item)
                : null);
    }
}
