namespace WorkshopTracker.Domain.Authentication;

public enum RefreshSessionStatus
{
    Active,
    Rotated,
    Revoked,
    Expired,
}

public sealed class RefreshSession
{
    private RefreshSession()
    {
        AdministratorId = null!;
        TokenHash = null!;
    }

    private RefreshSession(
        string administratorId,
        string tokenHash,
        Guid familyId,
        DateTimeOffset createdAt,
        DateTimeOffset expiresAt)
    {
        Id = Guid.NewGuid();
        AdministratorId = administratorId;
        TokenHash = tokenHash;
        FamilyId = familyId;
        CreatedAt = createdAt.ToUniversalTime();
        ExpiresAt = expiresAt.ToUniversalTime();
    }

    public Guid Id { get; private set; }
    public string AdministratorId { get; private set; }
    public string TokenHash { get; private set; }
    public Guid FamilyId { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset ExpiresAt { get; private set; }
    public DateTimeOffset? RevokedAt { get; private set; }
    public string? RevocationReason { get; private set; }
    public Guid? ReplacedBySessionId { get; private set; }
    public RefreshSessionStatus Status => RevokedAt is not null
        ? ReplacedBySessionId is not null ? RefreshSessionStatus.Rotated : RefreshSessionStatus.Revoked
        : ExpiresAt <= DateTimeOffset.UtcNow ? RefreshSessionStatus.Expired
        : RefreshSessionStatus.Active;

    public static RefreshSession Create(string administratorId, string tokenHash, DateTimeOffset now, DateTimeOffset expiresAt) =>
        new(ValidateRequired(administratorId, nameof(administratorId)), ValidateRequired(tokenHash, nameof(tokenHash)), Guid.NewGuid(), now, ValidateExpiry(now, expiresAt));

    public RefreshSession Rotate(string successorTokenHash, DateTimeOffset now, DateTimeOffset successorExpiresAt)
    {
        EnsureActive(now);
        var successor = new RefreshSession(AdministratorId, ValidateRequired(successorTokenHash, nameof(successorTokenHash)), FamilyId, now, ValidateExpiry(now, successorExpiresAt));
        RevokedAt = now.ToUniversalTime();
        RevocationReason = "rotated";
        ReplacedBySessionId = successor.Id;
        return successor;
    }

    public void Revoke(DateTimeOffset now, string reason)
    {
        RevokedAt ??= now.ToUniversalTime();
        RevocationReason ??= ValidateRequired(reason, nameof(reason));
    }

    private void EnsureActive(DateTimeOffset now)
    {
        if (RevokedAt is not null || ExpiresAt <= now)
        {
            throw new DomainValidationException("A sessão de renovação não está ativa.");
        }
    }

    private static DateTimeOffset ValidateExpiry(DateTimeOffset createdAt, DateTimeOffset expiresAt)
    {
        var normalized = expiresAt.ToUniversalTime();
        if (normalized <= createdAt.ToUniversalTime() || normalized > createdAt.ToUniversalTime().AddDays(7))
        {
            throw new DomainValidationException("A expiração da renovação deve ocorrer em até sete dias.");
        }

        return normalized;
    }

    private static string ValidateRequired(string value, string field)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new DomainValidationException($"{field} é obrigatório.");
        }

        return value;
    }
}
