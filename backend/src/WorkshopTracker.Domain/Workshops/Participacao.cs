using WorkshopTracker.Domain.Colaboradores;

namespace WorkshopTracker.Domain.Workshops;

public sealed class Participacao
{
    private Participacao()
    {
        Colaborador = null!;
    }

    internal Participacao(Colaborador colaborador, DateTimeOffset createdAt)
    {
        Colaborador = colaborador;
        ColaboradorId = colaborador.Id;
        CreatedAt = createdAt.ToUniversalTime();
    }

    public int WorkshopId { get; private set; }
    public int ColaboradorId { get; private set; }
    public Colaborador Colaborador { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
}
