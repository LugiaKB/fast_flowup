# Quickstart and Validation Guide

This guide defines the expected end-state commands and observable checks. See [OpenAPI](contracts/openapi.yaml),
[data model](data-model.md), [BDD](behaviors/) and [screens](ui.md) for normative details.

## Prerequisites

- Node.js 24 LTS and npm 11+
- .NET SDK 10, or Docker when the SDK is not installed locally
- Docker Engine with Compose v2 for MySQL and full-stack validation

## Configuration

1. Copy `.env.example` to `.env`.
2. Replace every placeholder secret locally. Never commit `.env`.
3. Define the administrator username and password with `ADMIN_USERNAME` and `ADMIN_PASSWORD`.
4. Use a password of at least 12 characters and a JWT signing key of at least 32 random bytes.

SQLite is the default. MySQL requires `DATABASE_PROVIDER=MySql` and the Compose MySQL profile.

## Frontend validation with mocks

```bash
cd frontend
npm ci
NEXT_PUBLIC_API_MODE=mock npm run dev
```

Expected:

- `/colaboradores` supports search, offset pagination and all four UI states.
- `/workshops` links to details with active participants.
- Login enables side-panel management without changing routes.
- Mock handlers conform to `contracts/openapi.yaml`.

Automated checks:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:a11y
```

## Backend validation with SQLite

```bash
cd backend
dotnet restore
dotnet test
dotnet run --project src/WorkshopTracker.Api
```

When the host SDK is unavailable, run the equivalent commands with the repository-mounted official
`.NET 10 SDK` container documented in the root README.

Expected:

- API starts on the configured URL and creates the SQLite schema.
- Swagger exposes the versioned endpoints.
- Public GET requests work without a token.
- Mutation without bearer access returns 401.
- Startup creates exactly one configured administrator and remains idempotent.

## Full stack with default SQLite

```bash
docker compose up --build
```

Expected services:

- Frontend: `http://localhost:3000`
- API: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger`
- SQLite data in the ignored local Docker volume

## Full stack with MySQL

```bash
DATABASE_PROVIDER=MySql docker compose --profile mysql up --build
```

Expected: the API waits for MySQL health, applies MySQL migrations, and passes the same browser journeys.

## End-to-end acceptance

```bash
cd frontend
npm run test:e2e
```

Validate at minimum:

1. Public collaborator search and pagination.
2. Workshop list and detail with participant visibility.
3. Valid and invalid login, reload refresh and logout.
4. Collaborator create/edit/archive/restore.
5. Workshop schedule validation, archive/replacement and restore conflict.
6. Attendance replacement plus individual add/remove.
7. Keyboard-only navigation and automated accessibility scan.

## Security checks

- Confirm no token or password is logged or included in error responses.
- Confirm refresh cookie is HttpOnly and production configuration sets Secure.
- Confirm CORS rejects an origin other than `FRONTEND_ORIGIN`.
- Confirm refresh reuse revokes the token family.
- Change `ADMIN_USERNAME` or `ADMIN_PASSWORD`, restart, and confirm old sessions and credentials fail.

## Provider parity

Run API integration tests once with SQLite and once with the MySQL Testcontainer. Both runs must prove
search, pagination, archive filters, quarter conflicts, replacement links, participation idempotency,
authentication and Problem Details shapes.
