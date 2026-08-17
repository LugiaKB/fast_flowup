using WorkshopTracker.Application.Common;
using WorkshopTracker.Application.Workshops;
using WorkshopTracker.Domain.Colaboradores;
using WorkshopTracker.Domain.Workshops;

namespace WorkshopTracker.Application.Tests;

public sealed class AttendanceCommandTests
{
    private static readonly DateTimeOffset Now = new(2026, 8, 17, 12, 0, 0, TimeSpan.Zero);

    [Fact]
    public async Task Replacement_rejects_duplicates_before_changing_current_attendance()
    {
        var active = Colaborador.Create("Ativa", Now);
        var workshop = Workshop.Create("Workshop", new DateTimeOffset(2026, 8, 20, 16, 0, 0, TimeSpan.FromHours(-3)), "Teste", Now);
        workshop.AddParticipant(active, Now);
        var useCase = new ManageWorkshopsUseCase(new FakeRepository(workshop, new Dictionary<int, Colaborador> { [1] = active }), new FixedClock());

        var result = await useCase.ReplaceParticipantsAsync(1, [1, 1]);

        Assert.Equal("duplicate_participants", result.Error);
        Assert.Single(workshop.Participacoes);
    }

    [Fact]
    public async Task Replacement_rejects_archived_collaborator_without_changing_current_attendance()
    {
        var active = Colaborador.Create("Ativa", Now);
        var archived = Colaborador.Create("Arquivada", Now);
        archived.Archive(Now);
        var workshop = Workshop.Create("Workshop", new DateTimeOffset(2026, 8, 20, 16, 0, 0, TimeSpan.FromHours(-3)), "Teste", Now);
        workshop.AddParticipant(active, Now);
        var useCase = new ManageWorkshopsUseCase(new FakeRepository(workshop, new Dictionary<int, Colaborador> { [2] = archived }), new FixedClock());

        var result = await useCase.ReplaceParticipantsAsync(1, [2]);

        Assert.Equal("inactive_collaborator", result.Error);
        Assert.Same(active, Assert.Single(workshop.Participacoes).Colaborador);
    }

    private sealed class FixedClock : IClock { public DateTimeOffset UtcNow => Now; }

    private sealed class FakeRepository(Workshop workshop, IReadOnlyDictionary<int, Colaborador> collaborators) : IWorkshopCommandRepository
    {
        public Task<Workshop?> FindByIdAsync(int id, CancellationToken cancellationToken = default) => Task.FromResult<Workshop?>(workshop);
        public Task<IReadOnlyList<Colaborador>> FindCollaboratorsAsync(IReadOnlyCollection<int> ids, CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<Colaborador>>(ids.Distinct().Where(collaborators.ContainsKey).Select(id => collaborators[id]).ToArray());
        public Task AddAsync(Workshop value, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task<bool> HasActiveWorkshopInQuarterAsync(DateTimeOffset scheduledAt, int? excludingWorkshopId, CancellationToken cancellationToken = default) => Task.FromResult(false);
        public Task AddArchiveEventAsync(WorkshopArchiveEvent archiveEvent, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task<WorkshopArchiveEvent?> FindLatestOpenArchiveEventAsync(int workshopId, CancellationToken cancellationToken = default) => Task.FromResult<WorkshopArchiveEvent?>(null);
        public Task AddReplacementAsync(Workshop value, WorkshopArchiveEvent predecessorEvent, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task MarkLatestArchiveEventRestoredAsync(int workshopId, string administratorId, DateTimeOffset restoredAt, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task SaveChangesAsync(CancellationToken cancellationToken = default) => Task.CompletedTask;
    }
}
