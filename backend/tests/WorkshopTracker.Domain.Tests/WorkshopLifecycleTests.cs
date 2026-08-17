using WorkshopTracker.Domain;
using WorkshopTracker.Domain.Colaboradores;
using WorkshopTracker.Domain.Workshops;

namespace WorkshopTracker.Domain.Tests;

public sealed class WorkshopLifecycleTests
{
    private static readonly DateTimeOffset ScheduledAt = new(2026, 8, 20, 16, 0, 0, TimeSpan.FromHours(-3));
    private static readonly DateTimeOffset Now = new(2026, 8, 17, 12, 0, 0, TimeSpan.Zero);

    [Fact]
    public void Archive_and_restore_preserve_the_workshop_and_update_its_state()
    {
        var workshop = Workshop.Create("Comunicação", ScheduledAt, "Prática", Now);

        workshop.Archive(Now.AddHours(1));
        Assert.NotNull(workshop.ArchivedAt);

        workshop.Restore(Now.AddHours(2));
        Assert.Null(workshop.ArchivedAt);
    }

    [Fact]
    public void Archived_workshop_rejects_attendance_changes()
    {
        var workshop = Workshop.Create("Comunicação", ScheduledAt, "Prática", Now);
        workshop.Archive(Now);

        var action = () => workshop.AddParticipant(Colaborador.Create("Ana", Now), Now);

        Assert.Throws<DomainValidationException>(action);
    }

    [Fact]
    public void Replacement_event_accepts_one_distinct_replacement_and_records_restoration_actor()
    {
        var archiveEvent = WorkshopArchiveEvent.Create(10, WorkshopArchiveReason.Replacement, "admin-1", Now);

        archiveEvent.AssignReplacement(11);
        archiveEvent.MarkRestored("admin-2", Now.AddDays(1));

        Assert.Equal(11, archiveEvent.ReplacementWorkshopId);
        Assert.Equal("admin-2", archiveEvent.RestoredByAdminId);
        Assert.Throws<DomainValidationException>(() => archiveEvent.AssignReplacement(12));
    }

    [Fact]
    public void Manual_event_rejects_a_replacement_link()
    {
        var archiveEvent = WorkshopArchiveEvent.Create(10, WorkshopArchiveReason.Manual, "admin-1", Now);

        Assert.Throws<DomainValidationException>(() => archiveEvent.AssignReplacement(11));
    }
}
