using WorkshopTracker.Domain.Colaboradores;

namespace WorkshopTracker.Domain.Workshops;

public sealed class Workshop
{
    private readonly List<Participacao> _participacoes = [];

    private Workshop()
    {
        Nome = null!;
        Descricao = null!;
    }

    private Workshop(string nome, DateTimeOffset dataRealizacao, string descricao, DateTimeOffset now)
    {
        Nome = nome;
        DataRealizacao = dataRealizacao;
        Descricao = descricao;
        CreatedAt = now;
        UpdatedAt = now;
    }

    public int Id { get; private set; }
    public string Nome { get; private set; }
    public DateTimeOffset DataRealizacao { get; private set; }
    public DateTimeOffset DataTermino => DataRealizacao.AddHours(1);
    public string Descricao { get; private set; }
    public DateTimeOffset? ArchivedAt { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }
    public IReadOnlyCollection<Participacao> Participacoes => _participacoes;

    public static Workshop Create(string nome, DateTimeOffset dataRealizacao, string descricao, DateTimeOffset now)
    {
        ValidateSchedule(dataRealizacao);
        return new Workshop(
            Normalize(nome, 200, "nome"),
            dataRealizacao,
            Normalize(descricao, 4000, "descrição"),
            now.ToUniversalTime());
    }

    public void AddParticipant(Colaborador colaborador, DateTimeOffset now)
    {
        if (ArchivedAt is not null || colaborador.ArchivedAt is not null)
        {
            throw new DomainValidationException("Somente registros ativos podem receber participações.");
        }

        if (_participacoes.Any(item => item.ColaboradorId == colaborador.Id || ReferenceEquals(item.Colaborador, colaborador)))
        {
            return;
        }

        _participacoes.Add(new Participacao(colaborador, now));
        UpdatedAt = now.ToUniversalTime();
    }

    public void RemoveParticipant(int colaboradorId, DateTimeOffset now)
    {
        var attendance = _participacoes.SingleOrDefault(item => item.ColaboradorId == colaboradorId);
        if (attendance is null) return;
        _participacoes.Remove(attendance);
        UpdatedAt = now.ToUniversalTime();
    }

    public void ReplaceParticipants(IEnumerable<Colaborador> colaboradores, DateTimeOffset now)
    {
        if (ArchivedAt is not null || colaboradores.Any(item => item.ArchivedAt is not null))
        {
            throw new DomainValidationException("Somente registros ativos podem receber participações.");
        }

        _participacoes.Clear();
        foreach (var collaborator in colaboradores.DistinctBy(item => item.Id))
        {
            _participacoes.Add(new Participacao(collaborator, now));
        }

        UpdatedAt = now.ToUniversalTime();
    }

    public void Update(string nome, DateTimeOffset dataRealizacao, string descricao, DateTimeOffset now)
    {
        ValidateSchedule(dataRealizacao);
        Nome = Normalize(nome, 200, "nome");
        DataRealizacao = dataRealizacao;
        Descricao = Normalize(descricao, 4000, "descrição");
        UpdatedAt = now.ToUniversalTime();
    }

    public void Archive(DateTimeOffset now)
    {
        ArchivedAt ??= now.ToUniversalTime();
        UpdatedAt = now.ToUniversalTime();
    }

    public void Restore(DateTimeOffset now)
    {
        ArchivedAt = null;
        UpdatedAt = now.ToUniversalTime();
    }

    private static void ValidateSchedule(DateTimeOffset scheduledAt)
    {
        var timezone = TimeZoneInfo.FindSystemTimeZoneById("America/Recife");
        var localTime = TimeZoneInfo.ConvertTime(scheduledAt, timezone);
        if (localTime.DayOfWeek != DayOfWeek.Thursday || localTime.Hour != 16 || localTime.Minute != 0 || localTime.Second != 0)
        {
            throw new DomainValidationException("O workshop deve ocorrer numa quinta-feira às 16h em America/Recife.");
        }
    }

    private static string Normalize(string value, int maximumLength, string field)
    {
        var normalized = value?.Trim() ?? string.Empty;
        if (normalized.Length < 1 || normalized.Length > maximumLength)
        {
            throw new DomainValidationException($"O {field} é obrigatório e deve ter no máximo {maximumLength} caracteres.");
        }

        return normalized;
    }
}
