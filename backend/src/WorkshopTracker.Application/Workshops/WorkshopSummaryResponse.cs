using WorkshopTracker.Domain.Workshops;

namespace WorkshopTracker.Application.Workshops;

public sealed record WorkshopSummaryResponse(
    int Id,
    string Nome,
    DateTimeOffset DataRealizacao,
    string Descricao,
    string Status,
    DateTimeOffset? ArchivedAt,
    int ParticipantCount)
{
    public DateTimeOffset DataTermino => DataRealizacao.AddHours(1);

    public static WorkshopSummaryResponse FromDomain(Workshop workshop) => new(
        workshop.Id,
        workshop.Nome,
        workshop.DataRealizacao,
        workshop.Descricao,
        workshop.ArchivedAt is null ? "active" : "archived",
        workshop.ArchivedAt,
        workshop.Participacoes.Count(item => item.Colaborador.ArchivedAt is null));
}
