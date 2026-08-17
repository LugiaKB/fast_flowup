namespace WorkshopTracker.Domain.Workshops;

public enum WorkshopArchiveReason { Cancelled, Rescheduled, Other }

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

    public static WorkshopArchiveEvent Create(int workshopId, WorkshopArchiveReason reason, string administratorId, int? replacementWorkshopId, DateTimeOffset now) => new()
    {
        WorkshopId = workshopId,
        Reason = reason,
        ArchivedByAdminId = administratorId,
        ReplacementWorkshopId = replacementWorkshopId,
        ArchivedAt = now.ToUniversalTime(),
    };

    public void MarkRestored(DateTimeOffset now) => RestoredAt = now.ToUniversalTime();
}
