using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace WorkshopTracker.Infrastructure.Authentication;

public sealed class JwtTokenService(IConfiguration configuration)
{
    public IssuedAccessToken Issue(Administrator administrator, DateTimeOffset now)
    {
        var signingKey = configuration["JWT_SIGNING_KEY"];
        if (string.IsNullOrWhiteSpace(signingKey) || Encoding.UTF8.GetByteCount(signingKey) < 32)
        {
            throw new InvalidOperationException("JWT_SIGNING_KEY deve ter ao menos 32 bytes.");
        }

        var expiresAt = now.AddMinutes(15);
        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, administrator.Id),
                new Claim(ClaimTypes.Name, administrator.UserName ?? string.Empty),
            ]),
            Expires = expiresAt.UtcDateTime,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
                SecurityAlgorithms.HmacSha256),
        };
        var handler = new JwtSecurityTokenHandler();
        return new IssuedAccessToken(handler.WriteToken(handler.CreateToken(descriptor)), expiresAt);
    }
}

public sealed record IssuedAccessToken(string Value, DateTimeOffset ExpiresAt);
