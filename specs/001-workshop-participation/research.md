# Research: Rastreamento de Participação em Workshops

## Frontend runtime and state

**Decision**: Next.js 16 App Router on Node 24 LTS, React 19, TypeScript, Tailwind CSS 4, Radix
primitives and Lucide icons. Data access uses typed `fetch` adapters and feature-specific hooks rather
than a server-state library.

**Rationale**: Matches the approved stack, keeps request behavior explicit for the technical exercise,
and lets MSW intercept exactly the same HTTP interface later served by the API.

**Alternatives considered**: TanStack Query was rejected by preference; SWR was not selected; custom
unstyled accessibility behavior was rejected in favor of Radix primitives.

## Contract and mock strategy

**Decision**: Keep `contracts/openapi.yaml` as the canonical wire contract, generate TypeScript schema
types during frontend setup, and build MSW handlers from those types. Runtime mock activation is
controlled by `NEXT_PUBLIC_API_MODE=mock`; production accepts only `api`.

**Rationale**: The frontend can be completed before the backend without inventing a second data shape.
Contract generation catches drift at typecheck time, while handlers remain reusable in tests after
runtime integration.

**Alternatives considered**: Handwritten duplicate types risk drift; a generated runtime client would
hide the fetch/refresh behavior the exercise should demonstrate.

## Authentication and session lifecycle

**Decision**: Issue a 15-minute signed JWT access token returned in the response body and held only in
memory. Issue a seven-day cryptographically random refresh token in an HttpOnly cookie, store only its
SHA-256 hash, rotate it on every refresh, and revoke its token family on detected reuse. Logout revokes
the current family. Password synchronization revokes all administrator refresh sessions.

**Rationale**: A page reload can restore access without exposing the long-lived credential to
JavaScript. Short access lifetime bounds the effect of an in-memory token leak.

**Alternatives considered**: LocalStorage was rejected because XSS could steal both tokens; cookie-only
authentication was rejected by explicit product choice; non-rotating refresh tokens weaken replay
detection.

## Cross-origin browser access

**Decision**: Browser calls the API origin directly. API CORS allows exactly `FRONTEND_ORIGIN`, required
methods and headers, and credentials. Refresh/logout validate `Origin`; production cookies are Secure,
HttpOnly, scoped to auth endpoints, and use configurable SameSite with Lax as the same-site default.

**Rationale**: Honors the chosen direct topology while preventing wildcard credential sharing.

**Alternatives considered**: Next proxy and BFF were rejected by preference. Permissive CORS is unsafe.

## Backend architecture

**Decision**: Use .NET 10/C# 14 with Domain, Application, Infrastructure and Api projects. Application
defines use cases and ports; Infrastructure implements EF Core, Identity, JWT and time services; Api
owns HTTP, OpenAPI, CORS and ProblemDetails.

**Rationale**: Matches the requested Clean Architecture and makes domain rules independently testable.

**Alternatives considered**: Single-project feature folders and a reduced three-project layout were
explicitly rejected.

## Persistence providers

**Decision**: EF Core 10 with Microsoft SQLite provider and Oracle `MySql.EntityFrameworkCore` 10 for
MySQL 8.4 LTS. Select via `Database__Provider=Sqlite|MySql`; keep provider-specific migration assemblies
or directories and validate both in CI/integration tests.

**Rationale**: These versions align with .NET 10 and avoid relying on a MySQL provider whose stable
release targets an older EF Core major.

**Alternatives considered**: Pomelo is popular but its stable release did not match EF Core 10 at the
planning date; SQL Server is outside scope.

## Time and quarterly rule

**Decision**: Accept ISO 8601 timestamps with offsets, normalize to UTC for storage, and convert through
IANA `America/Recife` when validating Thursday at 16:00 and calendar quarter. Duration is always one
hour. Enforce one active workshop per local calendar quarter transactionally.

**Rationale**: The business rule depends on local civil time; UTC-only weekday/quarter calculations can
produce incorrect results around offsets.

**Alternatives considered**: Storing a date without offset loses the instant; configuring arbitrary
time zones was rejected in favor of the fixed business zone.

## Soft deletion and replacement history

**Decision**: `ArchivedAt` controls current visibility. Collaborator associations remain in storage but
query projections omit archived collaborators. Workshop archive events are append-only per archive
cycle and record `Manual` or `Replacement`, responsible administrator, restoration and optional
replacement workshop. Creation can link one prior archived workshop in the same quarter.

**Rationale**: Preserves audit history and supports restoration without destructive cascades.

**Alternatives considered**: Hard deletion loses history; a single mutable archive row loses repeated
archive/restore cycles; automatic replacement contradicts the two-step flow.

## Pagination and error contract

**Decision**: Use `query`, zero-based `offset` and `limit` (default 20, maximum 100), returning `items`,
`totalItems`, `offset` and `limit`. Errors use RFC Problem Details with stable `code` and field `errors`
extensions. Domain conflicts return 409.

**Rationale**: Offset pagination supports totals and simple UI controls at the expected scale. Stable
problem codes keep frontend messages independent from server prose.

**Alternatives considered**: Cursor pagination is unnecessary at this scale; page numbers and
offset/limit were both viable, with offset/limit explicitly selected.

## Testing and containers

**Decision**: Vitest/Testing Library/axe/MSW for frontend, Playwright for browser journeys, xUnit for
domain/application, WebApplicationFactory for API/SQLite, and Testcontainers for MySQL parity. Use
multi-stage Dockerfiles and a root Compose configuration with SQLite default plus MySQL profile.

**Rationale**: Each constitution gate receives an automated proof at the lowest useful test layer, and
containers provide the missing host .NET SDK as well as reproducible final validation.

**Alternatives considered**: Mocking EF Core would not prove queries or provider parity; browser-only
tests would be slow and poor at isolating failures.
