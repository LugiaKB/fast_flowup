using WorkshopTracker.Application.Workshops;

namespace WorkshopTracker.Application.Tests;

public sealed class WorkshopQueryTests
{
    [Fact]
    public async Task List_returns_the_repository_page_ordered_by_most_recent_date()
    {
        var expected = new PagedWorkshops(
        [
            new WorkshopSummaryResponse(2, "Mais recente", new DateTimeOffset(2026, 4, 2, 16, 0, 0, TimeSpan.FromHours(-3)), "Descrição", "active", null, 2),
        ],
        1,
        0,
        20);
        var useCase = new ListWorkshopsUseCase(new StubWorkshopReadRepository(expected));

        var result = await useCase.ExecuteAsync(new ListWorkshopsQuery("", 0, 20));

        Assert.Same(expected, result);
        Assert.Equal("Mais recente", Assert.Single(result.Items).Nome);
    }

    private sealed class StubWorkshopReadRepository(PagedWorkshops result) : IWorkshopReadRepository
    {
        public Task<PagedWorkshops> ListActiveAsync(ListWorkshopsQuery query, CancellationToken cancellationToken) =>
            Task.FromResult(result);

        public Task<WorkshopDetailResponse?> GetAsync(int id, bool includeArchived, bool includeArchiveHistory, CancellationToken cancellationToken) =>
            Task.FromResult<WorkshopDetailResponse?>(null);
    }
}
