using WorkshopTracker.Domain.Colaboradores;

namespace WorkshopTracker.Application.Colaboradores;

public sealed record ColaboradorResponse(
    int Id,
    string Nome,
    string Status,
    DateTimeOffset? ArchivedAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt)
{
    public static ColaboradorResponse FromDomain(Colaborador collaborator) => new(
        collaborator.Id,
        collaborator.Nome,
        collaborator.ArchivedAt is null ? "active" : "archived",
        collaborator.ArchivedAt,
        collaborator.CreatedAt,
        collaborator.UpdatedAt);
}
