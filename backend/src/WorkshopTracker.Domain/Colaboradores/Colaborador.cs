namespace WorkshopTracker.Domain.Colaboradores;

public sealed class Colaborador
{
    private Colaborador()
    {
        Nome = null!;
    }

    private Colaborador(string nome, DateTimeOffset now)
    {
        Nome = nome;
        CreatedAt = now;
        UpdatedAt = now;
    }

    public int Id { get; private set; }
    public string Nome { get; private set; }
    public DateTimeOffset? ArchivedAt { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    public static Colaborador Create(string nome, DateTimeOffset now)
    {
        var normalizedName = NormalizeName(nome);
        return new Colaborador(normalizedName, now.ToUniversalTime());
    }

    public void UpdateName(string nome, DateTimeOffset now)
    {
        Nome = NormalizeName(nome);
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

    private static string NormalizeName(string nome)
    {
        var normalizedName = nome?.Trim() ?? string.Empty;
        if (normalizedName.Length is < 1 or > 160)
        {
            throw new DomainValidationException("O nome do colaborador deve ter entre 1 e 160 caracteres.");
        }

        return normalizedName;
    }
}
