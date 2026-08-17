using WorkshopTracker.Domain;
using WorkshopTracker.Domain.Workshops;

namespace WorkshopTracker.Domain.Tests;

public sealed class WorkshopTests
{
    private static readonly DateTimeOffset ValidSchedule = new(2026, 1, 8, 16, 0, 0, TimeSpan.FromHours(-3));

    [Fact]
    public void Create_accepts_a_thursday_at_16_in_recife_and_derives_the_end_time()
    {
        var workshop = Workshop.Create("Arquitetura limpa", ValidSchedule, "Discussão técnica", DateTimeOffset.UtcNow);

        Assert.Equal("Arquitetura limpa", workshop.Nome);
        Assert.Equal(ValidSchedule, workshop.DataRealizacao);
        Assert.Equal(ValidSchedule.AddHours(1), workshop.DataTermino);
        Assert.Null(workshop.ArchivedAt);
    }

    [Fact]
    public void Create_rejects_a_schedule_outside_thursday_at_16_in_recife()
    {
        var invalidSchedule = new DateTimeOffset(2026, 1, 7, 16, 0, 0, TimeSpan.FromHours(-3));

        var action = () => Workshop.Create("Arquitetura limpa", invalidSchedule, "Discussão técnica", DateTimeOffset.UtcNow);

        Assert.Throws<DomainValidationException>(action);
    }
}
