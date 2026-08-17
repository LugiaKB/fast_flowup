using WorkshopTracker.Application.Common;
using WorkshopTracker.Domain.Workshops;

namespace WorkshopTracker.Application.Workshops;

public sealed class ManageWorkshopsUseCase(IWorkshopCommandRepository repository, IClock clock)
{
    public async Task<WorkshopResult> CreateAsync(string nome, DateTimeOffset dataRealizacao, string descricao, IReadOnlyCollection<int>? collaboratorIds, CancellationToken cancellationToken = default)
    {
        if (await repository.HasActiveWorkshopInQuarterAsync(dataRealizacao, null, cancellationToken)) return WorkshopResult.Conflict();
        var participantIds = collaboratorIds ?? [];
        if (participantIds.Distinct().Count() != participantIds.Count) return WorkshopResult.InvalidParticipants();
        var participants = await repository.FindActiveCollaboratorsAsync(participantIds, cancellationToken);
        if (participants.Count != participantIds.Count) return WorkshopResult.InvalidParticipants();
        var workshop = Workshop.Create(nome, dataRealizacao, descricao, clock.UtcNow);
        workshop.ReplaceParticipants(participants, clock.UtcNow);
        await repository.AddAsync(workshop, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        return WorkshopResult.Success(workshop);
    }

    public async Task<WorkshopResult> UpdateAsync(int id, string nome, DateTimeOffset dataRealizacao, string descricao, CancellationToken cancellationToken = default)
    {
        var workshop = await repository.FindByIdAsync(id, cancellationToken);
        if (workshop is null) return WorkshopResult.NotFound();
        if (await repository.HasActiveWorkshopInQuarterAsync(dataRealizacao, id, cancellationToken)) return WorkshopResult.Conflict();
        workshop.Update(nome, dataRealizacao, descricao, clock.UtcNow);
        await repository.SaveChangesAsync(cancellationToken);
        return WorkshopResult.Success(workshop);
    }

    public async Task<WorkshopResult> ReplaceParticipantsAsync(int id, IReadOnlyCollection<int> collaboratorIds, CancellationToken cancellationToken = default)
    {
        var workshop = await repository.FindByIdAsync(id, cancellationToken);
        if (workshop is null) return WorkshopResult.NotFound();
        if (collaboratorIds.Distinct().Count() != collaboratorIds.Count) return WorkshopResult.InvalidParticipants();
        var participants = await repository.FindActiveCollaboratorsAsync(collaboratorIds, cancellationToken);
        if (participants.Count != collaboratorIds.Count) return WorkshopResult.InvalidParticipants();
        workshop.ReplaceParticipants(participants, clock.UtcNow);
        await repository.SaveChangesAsync(cancellationToken);
        return WorkshopResult.Success(workshop);
    }

    public async Task<WorkshopResult> AddParticipantAsync(int id, int collaboratorId, CancellationToken cancellationToken = default)
    {
        var workshop = await repository.FindByIdAsync(id, cancellationToken);
        if (workshop is null) return WorkshopResult.NotFound();
        var collaborators = await repository.FindActiveCollaboratorsAsync([collaboratorId], cancellationToken);
        if (collaborators.Count != 1) return WorkshopResult.InvalidParticipants();
        workshop.AddParticipant(collaborators[0], clock.UtcNow);
        await repository.SaveChangesAsync(cancellationToken);
        return WorkshopResult.Success(workshop);
    }

    public async Task<bool> RemoveParticipantAsync(int id, int collaboratorId, CancellationToken cancellationToken = default)
    {
        var workshop = await repository.FindByIdAsync(id, cancellationToken);
        if (workshop is null) return false;
        workshop.RemoveParticipant(collaboratorId, clock.UtcNow);
        await repository.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public sealed record WorkshopResult(Workshop? Workshop, string? Error)
{
    public static WorkshopResult Success(Workshop workshop) => new(workshop, null);
    public static WorkshopResult NotFound() => new(null, "not_found");
    public static WorkshopResult Conflict() => new(null, "quarter_conflict");
    public static WorkshopResult InvalidParticipants() => new(null, "invalid_participants");
}
