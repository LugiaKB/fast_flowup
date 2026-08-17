# Data Model: Rastreamento de Participação em Workshops

## Colaborador

Represents a person who may attend workshops.

| Field | Type | Rules |
|---|---|---|
| `Id` | integer | Primary key, generated, immutable |
| `Nome` | string | Required, trimmed, 1–160 characters |
| `ArchivedAt` | instant? | Null while active; UTC when archived |
| `CreatedAt` | instant | Required, UTC |
| `UpdatedAt` | instant | Required, UTC |

Relationships: many-to-many with Workshop through Participacao. Archiving does not delete relationships.

State transitions: `Active -> Archived -> Active`; repeated cycles are permitted.

## Workshop

Represents a quarterly workshop.

| Field | Type | Rules |
|---|---|---|
| `Id` | integer | Primary key, generated, immutable |
| `Nome` | string | Required, trimmed, 1–200 characters |
| `DataRealizacao` | timestamp with offset | Required; Thursday 16:00 in `America/Recife` |
| `Descricao` | string | Required, trimmed, 1–4000 characters |
| `ArchivedAt` | instant? | Null while active; UTC when archived |
| `CreatedAt` | instant | Required, UTC |
| `UpdatedAt` | instant | Required, UTC |

Derived values: end time is start plus one hour; local calendar quarter is derived from
`DataRealizacao` after conversion to `America/Recife`.

Relationships: many-to-many with Colaborador; one-to-many archive events; optional inverse reference
from an archive event that this workshop replaced.

Invariants:

- At most one active Workshop exists for each `(localYear, localQuarter)`.
- Create/update validates weekday and local time before persistence.
- Moving an active workshop into an occupied quarter is rejected atomically.

State transitions: `Active -> Archived -> Active`. Restore is rejected while the quarter is occupied.

## Participacao

Represents attendance and has no independent lifecycle.

| Field | Type | Rules |
|---|---|---|
| `WorkshopId` | integer | Foreign key, part of composite key |
| `ColaboradorId` | integer | Foreign key, part of composite key |
| `CreatedAt` | instant | Required, UTC |

The composite key prevents duplicates. New associations require both records to be active. Archiving
either side preserves the row; public projections omit rows whose collaborator or workshop is archived.

## WorkshopArchiveEvent

Append-only record for each archive cycle.

| Field | Type | Rules |
|---|---|---|
| `Id` | integer | Primary key, generated |
| `WorkshopId` | integer | Required foreign key |
| `Reason` | enum | `Manual` or `Replacement` |
| `ArchivedAt` | instant | Required, UTC |
| `ArchivedByAdminId` | string | Required foreign key to administrator |
| `RestoredAt` | instant? | Set when this archive cycle is restored |
| `RestoredByAdminId` | string? | Required when `RestoredAt` is set |
| `ReplacementWorkshopId` | integer? | Active workshop in the same local quarter |

Invariants:

- Only the newest event without `RestoredAt` represents the current archive cycle.
- `ReplacementWorkshopId` is allowed only for `Replacement` reason.
- Replacement must differ from the archived workshop, be active, share its local quarter and not
  already replace another event.
- Historical events are never deleted by restoration.

## Administrator

Identity account provisioned from environment configuration.

| Field | Type | Rules |
|---|---|---|
| `Id` | string | Identity primary key |
| `Email` | string | Required, normalized and unique |
| `PasswordHash` | string | Managed by identity subsystem; never exposed |
| `SecurityStamp` | string | Changes when configured password is synchronized |

Provisioning is idempotent: create if absent, ensure the Admin role, verify the configured password,
and reset it plus revoke sessions when it differs. Missing or policy-invalid credentials stop startup
outside automated tests.

## RefreshSession

Represents one rotating refresh-token family.

| Field | Type | Rules |
|---|---|---|
| `Id` | UUID | Primary key |
| `AdministratorId` | string | Required foreign key |
| `TokenHash` | fixed string | Required, unique SHA-256 digest |
| `FamilyId` | UUID | Groups rotated tokens for reuse revocation |
| `CreatedAt` | instant | Required, UTC |
| `ExpiresAt` | instant | Required, no more than seven days after creation |
| `RevokedAt` | instant? | Set by rotation, logout, reuse or password synchronization |
| `RevocationReason` | string? | Stable internal reason, no secret material |
| `ReplacedBySessionId` | UUID? | Points to the successor created by rotation |

State transitions: `Active -> Rotated`, `Active -> Revoked`, `Active -> Expired`. Reuse of a rotated
token revokes every active session in the same family.

## Query projections

`PagedResult<T>` contains `Items`, `TotalItems`, `Offset`, and `Limit`. Public projections always filter
archived roots and archived participants. Authenticated administrative projections may request
`active`, `archived`, or `all` status and expose `ArchivedAt` plus archive history where relevant.

## Provider mapping

- Store instants as UTC and serialize date-time values using ISO 8601 offsets.
- Use provider-safe strings for enums with explicit conversions.
- Use separate provider migrations where DDL differs.
- Enforce cross-provider domain invariants in transactions and application services, not provider-only
  filtered indexes.
- Configure foreign keys to restrict destructive deletes; application behavior uses archival instead.
