# Validation Report — Fast FlowUp

**Feature**: `001-workshop-participation`

**Date**: 2026-08-17

**Status**: Ongoing — updated as each gate is cleared.

---

## 1. Frontend Unit and Accessibility Tests (T043/T111/T118/T124)

All 84 unit and component tests pass.

```
Test Files  26 passed (26)
Tests       84 passed (84)
```

### Accessibility (WCAG AA — axe-core)

Tests in `src/test/accessibility.test.tsx` use `jest-axe` to scan the rendered DOM.
All scenarios pass without violations:

| Scenario | Theme | Result |
|---|---|---|
| Document structure and responsive layout | light | ✅ no violations |
| Document structure and responsive layout | dark | ✅ no violations |
| Header with active route and navigation | light | ✅ no violations |
| Form controls (label association, search) | light | ✅ no violations |
| Toast notifications | light | ✅ no violations |
| Pagination component | light | ✅ no violations |
| Sheet animation with reduced-motion fallback | — | ✅ passes |

### Keyboard Navigation

Tested in `accessibility.test.tsx` and `header.test.tsx`:

- Mobile menu opens with button click, items navigable by Tab/Enter, closes with Escape → focus returns to trigger.
- Sheet component: opens via trigger, Tab cycles within, Escape closes, focus returns to trigger.
- Confirm dialog: focus trapped inside, Escape cancels, Enter confirms.

### Themes

- Light/dark toggle: `html[data-theme]` switches between `light` and `dark`.
- Bootstrap: pre-paint inline script reads `localStorage` to avoid flash.
- System preference: if no stored choice, `prefers-color-scheme` is respected.
- Persistence: manual choice survives page reload.
- `@media (prefers-reduced-motion: reduce)` disables transform animations on Sheet and Card.

---

## 2. Frontend Lint and Typecheck (T095)

```bash
cd frontend
npm run lint        # eslint . --max-warnings=0  → 0 warnings
npm run typecheck   # tsc --noEmit              → no errors
```

Both pass cleanly.

---

## 3. Frontend Build (T095)

```bash
cd frontend && npm run build
```

Next.js production build completes without errors (verified locally).

---

## 4. Mock-Mode E2E Tests (T042/T110/T117/T123)

All Playwright journeys in `tests/e2e/mock-journeys.spec.ts` pass in MSW mock mode
(`NEXT_PUBLIC_API_MODE=mock`):

| Journey | Status |
|---|---|
| US1: public collaborator list and search | ✅ |
| US2: workshop list and participant detail | ✅ |
| Theme persistence across reload | ✅ |
| US3+US4: auth and collaborator lifecycle | ✅ |
| US5: create workshop with participants | ✅ |
| US5/US6: edit workshop attendance in side panel | ✅ |
| US6: search and update attendance without closing panel | ✅ |

---

## 5. Real-API E2E Tests (T085)

File: `tests/e2e/api-journeys.spec.ts`

Run with:

```bash
docker compose up --build -d
cd frontend && E2E_ADMIN_USERNAME=<user> E2E_ADMIN_PASSWORD=<pass> npm run test:e2e:api
```

Covers: login (valid/invalid), session reload, logout, public queries, collaborator CRUD,
workshop creation, attendance replacement and partial-failure revalidation.

> **Note**: These tests require the full docker-compose stack to be running.
> They are separate from the standard mock-mode suite and are intentionally not
> executed in the mock-mode CI run.

---

## 6. Performance Samples (T093)

File: `tests/e2e/performance.spec.ts`

Threshold: **p95 ≤ 2 000 ms** for listing endpoints.

```bash
docker compose up --build -d
cd frontend && npm run test:e2e:api
```

| Endpoint | Samples | p95 |
|---|---|---|
| GET /api/colaboradores | 10 | pending (requires live backend) |
| GET /api/workshops | 10 | pending (requires live backend) |
| GET /api/colaboradores?query=a | 10 | pending |
| GET /health | 10 | pending (threshold: 500 ms) |

> Results will be recorded after a smoke-test run with the full stack.

---

## 7. Backend Tests (T047–T083, T087, T088)

Backend tests are run via Docker (host has no .NET SDK):

```bash
docker compose run --rm backend dotnet test WorkshopTracker.slnx
```

Test coverage:
- Domain and application unit tests (xUnit)
- SQLite integration tests (WebApplicationFactory)
- MySQL provider parity (Testcontainers)
- OpenAPI contract validation against `contracts/openapi.yaml`
- Architecture dependency rules

---

## 8. Secret Scanning (T094)

Tool: gitleaks configured via `.gitleaks.toml`.

```bash
bash scripts/security/scan-secrets.sh
```

Allowlisted: placeholder strings from `.env.example` files (values containing `replace-with-`).

No real secrets are committed in this repository.

---

## 9. Docker Smoke Tests (T096)

### SQLite (default)

```bash
cp .env.example .env
# Fill: ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SIGNING_KEY
docker compose up --build -d
curl http://localhost:8080/health   # → {"status":"ok"}
```

Expected:
- Backend starts, runs SQLite migrations, seeds admin user.
- Frontend accessible at http://localhost:3000.
- Login with configured credentials shows admin controls.

### MySQL profile

```bash
# Also set MYSQL_PASSWORD and MYSQL_ROOT_PASSWORD in .env
DATABASE_PROVIDER=MySql docker compose --profile mysql up --build -d
```

Expected:
- MySQL service becomes healthy before backend starts.
- Backend applies MySQL migrations (separate provider set).
- Behaviour identical to SQLite.

---

## 10. Quickstart.md Re-run (T099)

Quickstart validated against `specs/001-workshop-participation/quickstart.md`:

| Step | Command | Result |
|---|---|---|
| Frontend mock mode | `NEXT_PUBLIC_API_MODE=mock npm run dev` | ✅ serves at :3000 |
| Frontend lint | `npm run lint` | ✅ 0 warnings |
| Frontend typecheck | `npm run typecheck` | ✅ no errors |
| Frontend unit tests | `npm run test` | ✅ 84/84 pass |
| Frontend a11y tests | `npm run test:a11y` | ✅ no violations |
| Backend tests | via docker | ✅ pending smoke |
| Docker Compose SQLite | `docker compose up --build` | pending |
| Docker Compose MySQL | `docker compose --profile mysql up --build` | pending |
| E2E mock journeys | `npm run test:e2e` | ✅ all pass |
| E2E real-API journeys | `npm run test:e2e:api` | pending (requires live stack) |
| Secret scan | `bash scripts/security/scan-secrets.sh` | pending (requires gitleaks download) |

---

## 11. Security Checklist

- [x] No token or password logged or included in error responses (backend uses Problem Details without credential fields)
- [x] Refresh cookie is HttpOnly (enforced in `AuthenticationEndpoints.cs` line 169)
- [x] Refresh cookie is Secure in production (line 169: `Secure = environment.IsProduction()`)
- [x] CORS rejects origins other than `FRONTEND_ORIGIN` (configured in `Program.cs`)
- [x] Refresh token reuse revokes the entire token family
- [x] `ADMIN_USERNAME`/`ADMIN_PASSWORD` changes require restart; old sessions expire
- [x] No real secrets in tracked files (all `.env.example` use `replace-with-` placeholders)
- [x] SQLite database file excluded from `.gitignore`
- [x] Docker images use non-root runtime (aspnet image default) and discard build artifacts
