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

Threshold: **p95 ≤ 2 000 ms** for listing endpoints, **p95 ≤ 500 ms** for health.

```bash
docker compose up --build -d
cd frontend && npm run test:e2e:api
```

Measured results on live Docker stack:

| Endpoint | Samples | p95 Measured | Threshold | Status |
|---|---|---|---|---|
| GET /api/colaboradores | 10 | **34 ms** | ≤ 2 000 ms | ✅ PASS |
| GET /api/workshops | 10 | **13 ms** | ≤ 2 000 ms | ✅ PASS |
| GET /api/colaboradores?query=a | 10 | **9 ms** | ≤ 2 000 ms | ✅ PASS |
| GET /health | 10 | **4 ms** | ≤ 500 ms | ✅ PASS |

---

## 7. Backend Tests (T047–T083, T087, T088)

Backend tests run via Docker SDK container (`mcr.microsoft.com/dotnet/sdk:10.0`):

```bash
docker run --rm -v "$(pwd):/workspace" -w /workspace/backend mcr.microsoft.com/dotnet/sdk:10.0 dotnet test WorkshopTracker.slnx
```

Test coverage and results:
- **Domain unit tests** (`WorkshopTracker.Domain.Tests`): 9 passed, 0 failed
- **Application unit tests** (`WorkshopTracker.Application.Tests`): 9 passed, 0 failed
- **Integration tests & OpenAPI contract** (`WorkshopTracker.Api.IntegrationTests`): 23 passed, 0 failed
- **Total**: 41 passed, 0 failed

---

## 8. Secret Scanning (T094)

Tool: gitleaks configured via `.gitleaks.toml`.

```bash
bash scripts/security/scan-secrets.sh
```

- Working tree scan: ✅ CLEAN (no leaks found)
- Git history scan: ✅ CLEAN (no leaks found)

---

## 9. Docker Smoke Tests (T096)

### SQLite (default)

```bash
cp .env.example .env
docker compose up --build -d
curl http://localhost:8080/health   # → {"status":"ok"} (HTTP 200)
curl -I http://localhost:3000       # → HTTP 307 redirect to /workshops
```

- Backend healthy on port 8080 with SQLite persistence in named volume `sqlite-data`
- Frontend serving Next.js production bundle on port 3000
- Authentication, query, mutation and pagination verified end-to-end via 18 Playwright tests (`npm run test:e2e:api`)

---

## 10. Quickstart.md Re-run (T099)

Quickstart validated against `specs/001-workshop-participation/quickstart.md`:

| Step | Command | Result |
|---|---|---|
| Frontend mock mode | `NEXT_PUBLIC_API_MODE=mock npm run dev` | ✅ serves at :3000 |
| Frontend lint | `npm run lint` | ✅ 0 warnings |
| Frontend typecheck | `npm run typecheck` | ✅ no errors |
| Frontend unit tests | `npm run test` | ✅ 84/84 pass |
| Frontend a11y tests | `npm run test:a11y` | ✅ no violations (axe-core) |
| Backend tests | via SDK container `dotnet test` | ✅ 41/41 pass |
| Docker Compose SQLite | `docker compose up --build` | ✅ healthy + live |
| E2E mock journeys | `npm run test:e2e` | ✅ 14/14 pass |
| E2E real-API journeys | `npm run test:e2e:api` | ✅ 18/18 pass |
| Secret scan | `bash scripts/security/scan-secrets.sh` | ✅ clean |

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
