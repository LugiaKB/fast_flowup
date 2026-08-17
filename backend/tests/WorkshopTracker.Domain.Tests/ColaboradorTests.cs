using WorkshopTracker.Domain.Colaboradores;
using WorkshopTracker.Domain;

namespace WorkshopTracker.Domain.Tests;

public sealed class ColaboradorTests
{
    [Fact]
    public void Create_trims_the_name_and_sets_active_audit_state()
    {
        var createdAt = new DateTimeOffset(2026, 8, 17, 12, 0, 0, TimeSpan.Zero);

        var collaborator = Colaborador.Create("  Ana Souza  ", createdAt);

        Assert.Equal("Ana Souza", collaborator.Nome);
        Assert.Null(collaborator.ArchivedAt);
        Assert.Equal(createdAt, collaborator.CreatedAt);
        Assert.Equal(createdAt, collaborator.UpdatedAt);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_rejects_an_empty_name(string name)
    {
        var action = () => Colaborador.Create(name, DateTimeOffset.UtcNow);

        Assert.Throws<DomainValidationException>(action);
    }
}
