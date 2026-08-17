using WorkshopTracker.Application.Colaboradores;
using WorkshopTracker.Domain.Workshops;

namespace WorkshopTracker.Application.Workshops;

public sealed record WorkshopDetailResponse(
    int Id,
    string Nome,
    DateTimeOffset DataRealizacao,
    string Descricao,
    string Status,
    DateTimeOffset? ArchivedAt,
    int ParticipantCount,
    IReadOnlyList<ColaboradorResponse> Participantes)
{
    public DateTimeOffset DataTermino => DataRealizacao.AddHours(1);
    public IReadOnlyList<object> ArchiveEvents => [];

    public static WorkshopDetailResponse FromDomain(Workshop workshop)
    {
        var participants = workshop.Participacoes
            .Select(item => item.Colaborador)
            .Where(collaborator => collaborator.ArchivedAt is null)
            .OrderBy(collaborator => collaborator.Nome)
            .Select(ColaboradorResponse.FromDomain)
            .ToArray();
        var summary = WorkshopSummaryResponse.FromDomain(workshop);

        return new WorkshopDetailResponse(
            summary.Id,
            summary.Nome,
            summary.DataRealizacao,
            summary.Descricao,
            summary.Status,
            summary.ArchivedAt,
            participants.Length,
            participants);
    }
}
