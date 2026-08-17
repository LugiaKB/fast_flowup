using WorkshopTracker.Application.Common;
using WorkshopTracker.Domain.Workshops;

namespace WorkshopTracker.Application.Workshops;

public sealed class ManageWorkshopsUseCase(IWorkshopCommandRepository repository, IClock clock)
{
    public async Task<WorkshopResult> CreateAsync(string nome, DateTimeOffset dataRealizacao, string descricao, IReadOnlyCollection<int>? collaboratorIds, int? replacesWorkshopId, CancellationToken cancellationToken = default)
    {
        var workshop = Workshop.Create(nome, dataRealizacao, descricao, clock.UtcNow);
        if (await repository.HasActiveWorkshopInQuarterAsync(dataRealizacao, null, cancellationToken)) return WorkshopResult.Conflict();
        var participantIds = collaboratorIds ?? [];
        if (participantIds.Any(id => id < 1) || participantIds.Distinct().Count() != participantIds.Count) return WorkshopResult.DuplicateParticipants();
        var participants = await repository.FindCollaboratorsAsync(participantIds, cancellationToken);
        if (participants.Count != participantIds.Count) return WorkshopResult.CollaboratorNotFound();
        if (participants.Any(item => item.ArchivedAt is not null)) return WorkshopResult.InactiveCollaborator();
        workshop.ReplaceParticipants(participants, clock.UtcNow);

        if (replacesWorkshopId is not null)
        {
            var predecessor = await repository.FindByIdAsync(replacesWorkshopId.Value, cancellationToken);
            var archiveEvent = predecessor is null ? null : await repository.FindLatestOpenArchiveEventAsync(predecessor.Id, cancellationToken);
            if (predecessor?.ArchivedAt is null || !predecessor.OccursInSameLocalQuarter(dataRealizacao)
                || archiveEvent?.Reason != WorkshopArchiveReason.Replacement || archiveEvent.ReplacementWorkshopId is not null)
                return WorkshopResult.InvalidReplacement();
            await repository.AddReplacementAsync(workshop, archiveEvent, cancellationToken);
            return WorkshopResult.Success(workshop);
        }

        await repository.AddAsync(workshop, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        return WorkshopResult.Success(workshop);
    }

    public async Task<WorkshopResult> UpdateAsync(int id, string nome, DateTimeOffset dataRealizacao, string descricao, CancellationToken cancellationToken = default)
    {
        var workshop = await repository.FindByIdAsync(id, cancellationToken);
        if (workshop is null) return WorkshopResult.NotFound();
        if (workshop.ArchivedAt is not null) return WorkshopResult.WorkshopArchived();
        if (await repository.HasActiveWorkshopInQuarterAsync(dataRealizacao, id, cancellationToken)) return WorkshopResult.Conflict();
        workshop.Update(nome, dataRealizacao, descricao, clock.UtcNow);
        await repository.SaveChangesAsync(cancellationToken);
        return WorkshopResult.Success(workshop);
    }

    public async Task<WorkshopResult> ReplaceParticipantsAsync(int id, IReadOnlyCollection<int> collaboratorIds, CancellationToken cancellationToken = default)
    {
        var workshop = await repository.FindByIdAsync(id, cancellationToken);
        if (workshop is null) return WorkshopResult.NotFound();
        if (workshop.ArchivedAt is not null) return WorkshopResult.WorkshopArchived();
        if (collaboratorIds.Any(value => value < 1) || collaboratorIds.Distinct().Count() != collaboratorIds.Count) return WorkshopResult.DuplicateParticipants();
        var participants = await repository.FindCollaboratorsAsync(collaboratorIds, cancellationToken);
        if (participants.Count != collaboratorIds.Count) return WorkshopResult.CollaboratorNotFound();
        if (participants.Any(item => item.ArchivedAt is not null)) return WorkshopResult.InactiveCollaborator();
        workshop.ReplaceParticipants(participants, clock.UtcNow);
        await repository.SaveChangesAsync(cancellationToken);
        return WorkshopResult.Success(workshop);
    }

    public async Task<WorkshopResult> AddParticipantAsync(int id, int collaboratorId, CancellationToken cancellationToken = default)
    {
        var workshop = await repository.FindByIdAsync(id, cancellationToken);
        if (workshop is null) return WorkshopResult.NotFound();
        if (workshop.ArchivedAt is not null) return WorkshopResult.WorkshopArchived();
        var collaborators = await repository.FindCollaboratorsAsync([collaboratorId], cancellationToken);
        if (collaborators.Count != 1) return WorkshopResult.CollaboratorNotFound();
        if (collaborators[0].ArchivedAt is not null) return WorkshopResult.InactiveCollaborator();
        workshop.AddParticipant(collaborators[0], clock.UtcNow);
        await repository.SaveChangesAsync(cancellationToken);
        return WorkshopResult.Success(workshop);
    }

    public async Task<WorkshopResult> RemoveParticipantAsync(int id, int collaboratorId, CancellationToken cancellationToken = default)
    {
        var workshop = await repository.FindByIdAsync(id, cancellationToken);
        if (workshop is null) return WorkshopResult.NotFound();
        if (workshop.ArchivedAt is not null) return WorkshopResult.WorkshopArchived();
        if ((await repository.FindCollaboratorsAsync([collaboratorId], cancellationToken)).Count != 1) return WorkshopResult.CollaboratorNotFound();
        workshop.RemoveParticipant(collaboratorId, clock.UtcNow);
        await repository.SaveChangesAsync(cancellationToken);
        return WorkshopResult.Success(workshop);
    }

    public async Task<bool> ArchiveAsync(int id, WorkshopArchiveReason reason, string administratorId, CancellationToken cancellationToken = default)
    {
        var workshop = await repository.FindByIdAsync(id, cancellationToken);
        if (workshop is null) return false;
        if (workshop.ArchivedAt is not null) return true;
        workshop.Archive(clock.UtcNow);
        await repository.AddArchiveEventAsync(WorkshopArchiveEvent.Create(id, reason, administratorId, clock.UtcNow), cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<WorkshopResult> RestoreAsync(int id, string administratorId, CancellationToken cancellationToken = default)
    {
        var workshop = await repository.FindByIdAsync(id, cancellationToken);
        if (workshop is null) return WorkshopResult.NotFound();
        if (workshop.ArchivedAt is null) return WorkshopResult.Success(workshop);
        if (await repository.HasActiveWorkshopInQuarterAsync(workshop.DataRealizacao, id, cancellationToken)) return WorkshopResult.Conflict();
        workshop.Restore(clock.UtcNow);
        await repository.MarkLatestArchiveEventRestoredAsync(id, administratorId, clock.UtcNow, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        return WorkshopResult.Success(workshop);
    }
}

public sealed record WorkshopResult(Workshop? Workshop, string? Error)
{
    public static WorkshopResult Success(Workshop workshop) => new(workshop, null);
    public static WorkshopResult NotFound() => new(null, "not_found");
    public static WorkshopResult Conflict() => new(null, "quarter_conflict");
    public static WorkshopResult DuplicateParticipants() => new(null, "duplicate_participants");
    public static WorkshopResult CollaboratorNotFound() => new(null, "collaborator_not_found");
    public static WorkshopResult InactiveCollaborator() => new(null, "inactive_collaborator");
    public static WorkshopResult WorkshopArchived() => new(null, "workshop_archived");
    public static WorkshopResult InvalidReplacement() => new(null, "invalid_replacement");
}
