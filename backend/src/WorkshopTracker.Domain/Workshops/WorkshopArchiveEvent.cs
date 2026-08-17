namespace WorkshopTracker.Domain.Workshops;

public enum WorkshopArchiveReason { Manual, Replacement }

public sealed class WorkshopArchiveEvent
{
    private WorkshopArchiveEvent() { ArchivedByAdminId = null!; }
    public int Id { get; private set; }
    public int WorkshopId { get; private set; }
    public WorkshopArchiveReason Reason { get; private set; }
    public DateTimeOffset ArchivedAt { get; private set; }
    public string ArchivedByAdminId { get; private set; }
    public int? ReplacementWorkshopId { get; private set; }
    public DateTimeOffset? RestoredAt { get; private set; }
    public string? RestoredByAdminId { get; private set; }

    public static WorkshopArchiveEvent Create(
        int workshopId,
        WorkshopArchiveReason reason,
        string administratorId,
        DateTimeOffset now)
    {
        if (workshopId < 1) throw new DomainValidationException("O workshop arquivado é obrigatório.");
        if (string.IsNullOrWhiteSpace(administratorId)) throw new DomainValidationException("O administrador do arquivamento é obrigatório.");
        return new WorkshopArchiveEvent
        {
            WorkshopId = workshopId,
            Reason = reason,
            ArchivedByAdminId = administratorId,
            ArchivedAt = now.ToUniversalTime(),
        };
    }

    public void AssignReplacement(int replacementWorkshopId)
    {
        if (Reason != WorkshopArchiveReason.Replacement)
            throw new DomainValidationException("Somente arquivamentos por substituição podem receber um workshop substituto.");
        if (replacementWorkshopId < 1 || replacementWorkshopId == WorkshopId)
            throw new DomainValidationException("O workshop substituto deve ser válido e distinto do arquivado.");
        if (ReplacementWorkshopId is not null)
            throw new DomainValidationException("O arquivamento já possui um workshop substituto.");
        ReplacementWorkshopId = replacementWorkshopId;
    }

    public void MarkRestored(string administratorId, DateTimeOffset now)
    {
        if (string.IsNullOrWhiteSpace(administratorId)) throw new DomainValidationException("O administrador da restauração é obrigatório.");
        RestoredAt ??= now.ToUniversalTime();
        RestoredByAdminId ??= administratorId;
    }
}
