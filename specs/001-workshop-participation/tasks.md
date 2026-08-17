# Tasks: Rastreamento de Participação em Workshops

**Input**: Design documents from `specs/001-workshop-participation/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/openapi.yaml`, `ui.md`

**Tests**: TDD is mandatory. Every test task runs and fails for the expected reason before its paired
implementation task begins.

**Environment examples**: A task MUST NOT create or reference an ignored environment/local
configuration file unless the same task creates or updates its tracked `.example` counterpart with
the destination filename, every supported key, required/optional guidance and secret-free placeholders.

**Organization**: All frontend story phases complete against contract-aligned MSW handlers before the
backend setup phase. Backend phases then implement the same stories and the final integration changes
only transport configuration.

## Phase 1: Frontend Setup

**Purpose**: Establish the contract-driven Next.js application and test infrastructure.

- [X] T001 Scaffold Next.js 16 App Router and package scripts in `frontend/package.json` and `frontend/src/app/`
- [X] T002 [P] Configure TypeScript, ESLint, Vitest, Testing Library and axe in `frontend/tsconfig.json`, `frontend/eslint.config.mjs` and `frontend/vitest.config.ts`
- [X] T003 [P] Configure Playwright browser projects in `frontend/playwright.config.ts` and `frontend/tests/e2e/`
- [X] T004 Generate TypeScript schemas from OpenAPI into `frontend/src/lib/api/schema.d.ts` and add its script to `frontend/package.json`
- [X] T005 Implement fetch client, Problem Details mapping and abort support in `frontend/src/lib/api/client.ts`
- [X] T006 Add deterministic fixtures and MSW browser/test bootstrap in `frontend/src/mocks/` and `frontend/src/test/setup.ts`
- [X] T007 Map design tokens, Poppins/Inter fonts and reduced-motion rules in `frontend/src/app/globals.css` and `frontend/src/app/layout.tsx`
- [X] T008 Implement accessible shared UI primitives in `frontend/src/components/ui/`
- [X] T009 Implement responsive header, navigation and application providers in `frontend/src/components/layout/` and `frontend/src/app/providers.tsx`

**Checkpoint**: Lint, typecheck and a smoke component test pass with mock mode enabled.

---

## Phase 2: Frontend User Story 1 - Consultar colaboradores (Priority: P1) 🎯 MVP

**Goal**: Public collaborator search and offset pagination with complete UI states.

**Independent Test**: Search fixtures by name, navigate offsets, and observe loading, empty, success and error.

- [X] T010 [P] [US1] Write failing collaborator hook tests in `frontend/src/features/colaboradores/use-colaboradores.test.tsx`
- [X] T011 [P] [US1] Write failing collaborator page accessibility tests in `frontend/src/app/colaboradores/page.test.tsx`
- [X] T012 [US1] Implement collaborator MSW query handler in `frontend/src/mocks/handlers/colaboradores.ts`
- [X] T013 [US1] Implement collaborator query hook in `frontend/src/features/colaboradores/use-colaboradores.ts`
- [X] T014 [US1] Implement responsive collaborator list page in `frontend/src/app/colaboradores/page.tsx`

**Checkpoint**: US1 passes independently and is navigable from the header.

---

## Phase 3: Frontend User Story 2 - Explorar workshops (Priority: P2)

**Goal**: Public workshop list and detail with active participants.

**Independent Test**: Search and paginate workshops, open one detail, and validate participant visibility.

- [X] T015 [P] [US2] Write failing workshop list and detail hook tests in `frontend/src/features/workshops/use-workshops.test.tsx`
- [X] T016 [P] [US2] Write failing workshop page accessibility tests in `frontend/src/app/workshops/page.test.tsx` and `frontend/src/app/workshops/[id]/page.test.tsx`
- [X] T017 [US2] Implement workshop MSW query/detail handlers in `frontend/src/mocks/handlers/workshops.ts`
- [X] T018 [US2] Implement workshop list/detail hooks in `frontend/src/features/workshops/`
- [X] T019 [US2] Implement workshop list page in `frontend/src/app/workshops/page.tsx`
- [X] T020 [US2] Implement workshop detail and active participant cards in `frontend/src/app/workshops/[id]/page.tsx`

**Checkpoint**: US2 passes independently with absent, empty and archived-participant scenarios.

---

## Phase 4: Frontend User Story 3 - Autenticar administrador (Priority: P3)

**Goal**: In-memory access session, refresh-on-load and login/logout controls.

**Independent Test**: Login, reload refresh, failed refresh, logout and hidden visitor controls.

- [X] T021 [P] [US3] Write failing auth client and provider tests in `frontend/src/features/auth/auth-provider.test.tsx`
- [X] T022 [P] [US3] Write failing login page accessibility tests in `frontend/src/app/login/page.test.tsx`
- [X] T023 [US3] Implement auth MSW handlers and refresh-cookie simulation in `frontend/src/mocks/handlers/auth.ts`
- [X] T024 [US3] Implement single-retry bearer/refresh flow in `frontend/src/features/auth/auth-client.ts`
- [X] T025 [US3] Implement auth provider with access token held only in memory in `frontend/src/features/auth/auth-provider.tsx`
- [X] T026 [US3] Implement login page and authenticated header state in `frontend/src/app/login/page.tsx` and `frontend/src/components/layout/header.tsx`

**Checkpoint**: US3 proves session restoration without browser token persistence.

---

## Phase 5: Frontend User Story 4 - Administrar colaboradores (Priority: P4)

**Goal**: Create, edit, archive, filter and restore collaborators in accessible side panels.

**Independent Test**: Complete the full collaborator lifecycle while visitor controls stay absent.

- [X] T027 [P] [US4] Write failing collaborator mutation and panel tests in `frontend/src/features/colaboradores/colaborador-management.test.tsx`
- [X] T028 [US4] Extend collaborator MSW handlers for authenticated lifecycle in `frontend/src/mocks/handlers/colaboradores.ts`
- [X] T029 [US4] Implement collaborator mutation hooks in `frontend/src/features/colaboradores/use-colaborador-mutations.ts`
- [X] T030 [US4] Implement collaborator sheet, archive dialog and status filter in `frontend/src/features/colaboradores/colaborador-management.tsx`

**Checkpoint**: US4 lifecycle passes with focus return, validation and status revalidation.

---

## Phase 6: Frontend User Story 5 - Administrar workshops (Priority: P5)

**Goal**: Manage workshop schedule, archive reasons, replacement link and restore conflicts.

**Independent Test**: Create a valid workshop, reject invalid schedules, archive, replace and test restore conflict.

- [X] T031 [P] [US5] Write failing local schedule validation tests in `frontend/src/features/workshops/workshop-validation.test.ts`
- [X] T032 [P] [US5] Write failing workshop management tests in `frontend/src/features/workshops/workshop-management.test.tsx`
- [X] T033 [US5] Extend workshop MSW handlers for lifecycle and conflicts in `frontend/src/mocks/handlers/workshops.ts`
- [X] T034 [US5] Implement America/Recife schedule validation in `frontend/src/features/workshops/workshop-validation.ts`
- [X] T035 [US5] Implement workshop mutation hooks in `frontend/src/features/workshops/use-workshop-mutations.ts`
- [X] T036 [US5] Implement workshop sheet, archive dialog and replacement flow in `frontend/src/features/workshops/workshop-management.tsx`

**Checkpoint**: US5 passes schedule, quarter, archive history and restore-conflict scenarios.

---

## Phase 7: Frontend User Story 6 - Registrar participações (Priority: P6)

**Goal**: Replace attendance and add/remove individual active collaborators.

**Independent Test**: Execute bulk replacement and idempotent individual operations from workshop detail.

- [X] T037 [P] [US6] Write failing attendance management tests in `frontend/src/features/participantes/attendance-management.test.tsx`
- [X] T038 [US6] Extend workshop MSW handlers with attendance operations in `frontend/src/mocks/handlers/workshops.ts`
- [X] T039 [US6] Implement attendance hooks in `frontend/src/features/participantes/use-attendance-mutations.ts`
- [X] T040 [US6] Implement accessible participant selection sheet in `frontend/src/features/participantes/attendance-management.tsx`

**Checkpoint**: Every required frontend journey works with contract-aligned mocks.

---

## Phase 8: Frontend Quality Gate

- [X] T041 Add keyboard, responsive and reduced-motion coverage in `frontend/src/test/accessibility.test.tsx`
- [X] T042 Add mocked browser journeys for US1-US6 in `frontend/tests/e2e/mock-journeys.spec.ts`
- [X] T043 Run and fix frontend lint, typecheck, unit, accessibility and mocked Playwright suites via `frontend/package.json`

**Checkpoint**: Frontend is complete before any backend source project is created.

---

## Phase 8A: Frontend Theme, Motion and Attendance Refinement

**Purpose**: Add theme support and refine existing visual and attendance behavior before backend work.

- [X] T100 Reconcile theme, motion and attendance behavior in `spec.md`, `ui.md`, BDD, design system and backend task descriptions without duplicating OpenAPI operations
- [X] T101 [P] Write failing card hover and reduced-motion tests in `frontend/src/components/ui/display.test.tsx`
- [X] T102 Implement subtle no-layout-shift card elevation, border and transform transitions in `frontend/src/components/ui/card.tsx`
- [X] T103 [P] Write failing sheet entry/exit motion tests while preserving keyboard behavior in `frontend/src/components/ui/sheet.test.tsx`
- [X] T104 Implement transform-based Radix sheet state animations with reduced-motion fallback in `frontend/src/components/ui/sheet.tsx`
- [X] T105 [P] Write failing theme bootstrap, system preference, persistence and toggle tests in `frontend/src/features/theme/`
- [X] T106 Implement semantic light/dark tokens, pre-paint bootstrap, theme provider and header toggle in `frontend/src/app/`, `frontend/src/features/theme/` and shared components
- [X] T107 Add light/dark axe coverage for navigation, cards, forms, feedback, dialogs and sheets in `frontend/src/test/accessibility.test.tsx`
- [X] T108 [P] Extend failing attendance tests for collaborator search, loading/error, duplicate prevention, removal confirmation and immediate updates in `frontend/src/features/participantes/attendance-management.test.tsx`
- [X] T109 Refine the existing attendance sheet and hooks without new endpoints in `frontend/src/features/participantes/`
- [X] T110 Extend mocked Playwright journeys with theme persistence and searchable immediate attendance updates in `frontend/tests/e2e/mock-journeys.spec.ts`
- [X] T111 Run and fix lint, typecheck, unit, accessibility, build and mocked Playwright suites via `frontend/package.json`

**Checkpoint**: Refined frontend passes both themes and attendance behavior before T044 begins.

---

## Phase 8B: Complete Workshop Attendance Management

**Purpose**: Support active participant selection during workshop creation and keep existing attendance
management, detail counts and contract-aligned mocks consistent before backend work.

- [X] T112 Update SDD, BDD, UI, data model and `CreateWorkshopRequest` for atomic initial attendance
- [X] T113 [P] Write failing workshop-creation attendance tests for search, persistent selection, duplicates, archived collaborators and authorization in `frontend/src/features/workshops/workshop-management.test.tsx`
- [X] T114 Extract a reusable active-collaborator selection list with loading, empty and error states in `frontend/src/features/participantes/participant-selection.tsx`
- [X] T115 Extend creation form, mutation types and MSW workshop creation to persist unique active participants atomically in `frontend/src/features/workshops/` and `frontend/src/mocks/`
- [X] T116 Extend detail tests and rendering to announce immediately updated participant counts in `frontend/src/app/workshops/[id]/`
- [X] T117 Extend mocked Playwright coverage for creating a workshop with searched participants in `frontend/tests/e2e/mock-journeys.spec.ts`
- [X] T118 Run and fix lint, typecheck, unit, accessibility, build and mocked Playwright suites

**Checkpoint**: Workshop creation and existing attendance management share selection behavior and match
the versioned contract before T044 begins.

---

## Phase 8C: Edit Workshop Attendance in the Side Panel

**Purpose**: Reuse the contract-aligned participant selection in the workshop edit panel without creating a
second attendance rule set or changing the API contract.

- [X] T119 Update SDD, BDD and UI behavior for loading and editing attendance in the workshop side panel,
  including staged-save partial-failure recovery
- [X] T120 [P] Write failing edit-panel tests for initial attendance loading, search, add/remove, duplicate
  prevention, successful staged save and partial failure in `frontend/src/features/workshops/workshop-management.test.tsx`
- [X] T121 Reuse and extend the shared participant-selection component to identify current members while
  preserving selections across searches in `frontend/src/features/participantes/participant-selection.tsx`
- [X] T122 Implement edit-panel attendance loading and staged metadata/bulk-attendance saving with final
  revalidation in `frontend/src/features/workshops/workshop-management.tsx`
- [X] T123 Extend mocked browser coverage for editing workshop attendance through the side panel in
  `frontend/tests/e2e/mock-journeys.spec.ts`
- [X] T124 Run and fix frontend lint, typecheck, unit, accessibility, build and mocked Playwright suites

**Checkpoint**: Creation, detail management and workshop editing share attendance selection behavior, use the
existing OpenAPI operations and leave a revalidated interface after a partial failure before T044 begins.

---

## Phase 9: Backend Setup and Foundations

**Purpose**: Establish Clean Architecture, testing, common errors and provider configuration.

- [X] T044 Create solution and Domain/Application/Infrastructure/Api projects in `backend/WorkshopTracker.slnx` and `backend/src/`
- [X] T045 [P] Create Domain, Application and API integration test projects in `backend/tests/`
- [X] T046 Configure project references and central package versions in `backend/Directory.Packages.props`
- [X] T047 Write failing architecture dependency tests in `backend/tests/WorkshopTracker.Application.Tests/ArchitectureTests.cs`
- [X] T048 Implement dependency rules, clock abstraction and result errors in `backend/src/WorkshopTracker.Application/Common/`
- [X] T049 Implement Problem Details, request validation, CORS and Swagger base in `backend/src/WorkshopTracker.Api/`
- [X] T050 Configure EF Core provider selection and base DbContext in `backend/src/WorkshopTracker.Infrastructure/Persistence/`
- [X] T051 Configure WebApplicationFactory and SQLite test database in `backend/tests/WorkshopTracker.Api.IntegrationTests/`

**Checkpoint**: Empty API boots, architecture tests pass and Swagger is available.

---

## Phase 10: Backend User Story 1 - Consultar colaboradores

- [X] T052 [P] [US1] Write failing collaborator domain/application tests in `backend/tests/WorkshopTracker.Domain.Tests/ColaboradorTests.cs` and `backend/tests/WorkshopTracker.Application.Tests/ColaboradorQueryTests.cs`
- [X] T053 [P] [US1] Write failing collaborator HTTP contract tests in `backend/tests/WorkshopTracker.Api.IntegrationTests/ColaboradoresQueryTests.cs`
- [X] T054 [US1] Implement Colaborador domain model and query use case in `backend/src/WorkshopTracker.Domain/Colaboradores/` and `backend/src/WorkshopTracker.Application/Colaboradores/`
- [X] T055 [US1] Map Colaborador and create SQLite migration in `backend/src/WorkshopTracker.Infrastructure/Persistence/`
- [X] T056 [US1] Implement public collaborator endpoints in `backend/src/WorkshopTracker.Api/Endpoints/ColaboradoresEndpoints.cs`

---

## Phase 11: Backend User Story 2 - Explorar workshops

- [X] T057 [P] [US2] Write failing workshop query/domain tests in `backend/tests/WorkshopTracker.Domain.Tests/WorkshopTests.cs` and `backend/tests/WorkshopTracker.Application.Tests/WorkshopQueryTests.cs`
- [X] T058 [P] [US2] Write failing workshop HTTP contract tests in `backend/tests/WorkshopTracker.Api.IntegrationTests/WorkshopsQueryTests.cs`
- [X] T059 [US2] Implement Workshop and Participacao query models in `backend/src/WorkshopTracker.Domain/Workshops/`
- [X] T060 [US2] Implement workshop query use cases and active projections in `backend/src/WorkshopTracker.Application/Workshops/`
- [X] T061 [US2] Map workshops/attendance and create provider migrations in `backend/src/WorkshopTracker.Infrastructure/Persistence/`
- [X] T062 [US2] Implement public workshop endpoints in `backend/src/WorkshopTracker.Api/Endpoints/WorkshopsEndpoints.cs`

---

## Phase 12: Backend User Story 3 - Autenticar administrador

- [X] T063 [P] [US3] Write failing token rotation, reuse and seed tests in `backend/tests/WorkshopTracker.Application.Tests/AuthenticationTests.cs`
- [X] T064 [P] [US3] Write failing auth HTTP/CORS tests in `backend/tests/WorkshopTracker.Api.IntegrationTests/AuthenticationTests.cs`
- [X] T065 [US3] Implement RefreshSession model and auth ports in `backend/src/WorkshopTracker.Domain/Authentication/` and `backend/src/WorkshopTracker.Application/Authentication/`
- [X] T066 [US3] Implement Identity, JWT, hashed refresh rotation and session revocation in `backend/src/WorkshopTracker.Infrastructure/Authentication/`
- [X] T067 [US3] Implement validated idempotent administrator synchronization in `backend/src/WorkshopTracker.Infrastructure/Authentication/AdminSeeder.cs`
- [X] T068 [US3] Map identity/refresh storage and create provider migrations in `backend/src/WorkshopTracker.Infrastructure/Persistence/`
- [X] T069 [US3] Implement login, refresh, logout and me endpoints in `backend/src/WorkshopTracker.Api/Endpoints/AuthenticationEndpoints.cs`

---

## Phase 13: Backend User Story 4 - Administrar colaboradores

- [X] T070 [P] [US4] Write failing collaborator command tests in `backend/tests/WorkshopTracker.Application.Tests/ColaboradorCommandTests.cs`
- [X] T071 [P] [US4] Write failing authorized collaborator HTTP tests in `backend/tests/WorkshopTracker.Api.IntegrationTests/ColaboradoresCommandTests.cs`
- [X] T072 [US4] Implement create/update/archive/restore use cases in `backend/src/WorkshopTracker.Application/Colaboradores/`
- [X] T073 [US4] Add authenticated collaborator mutations to `backend/src/WorkshopTracker.Api/Endpoints/ColaboradoresEndpoints.cs`

---

## Phase 14: Backend User Story 5 - Administrar workshops

- [ ] T074 [P] [US5] Write failing quarter, archive and replacement domain tests in `backend/tests/WorkshopTracker.Domain.Tests/WorkshopLifecycleTests.cs`
- [ ] T075 [P] [US5] Write failing workshop command HTTP tests including atomic creation with unique active participant IDs, archived IDs and unauthorized callers in `backend/tests/WorkshopTracker.Api.IntegrationTests/WorkshopsCommandTests.cs`
- [ ] T076 [US5] Implement Recife schedule and lifecycle rules in `backend/src/WorkshopTracker.Domain/Workshops/Workshop.cs`
- [ ] T077 [US5] Implement WorkshopArchiveEvent and transactional create/update use cases, including initial active attendance validation, in `backend/src/WorkshopTracker.Application/Workshops/Commands/`
- [ ] T078 [US5] Map archive history and create provider migrations in `backend/src/WorkshopTracker.Infrastructure/Persistence/`
- [ ] T079 [US5] Add authenticated workshop mutations accepting contract-defined initial participant IDs to `backend/src/WorkshopTracker.Api/Endpoints/WorkshopsEndpoints.cs`

---

## Phase 15: Backend User Story 6 - Registrar participações

- [ ] T080 [P] [US6] Write failing attendance use-case tests for atomic replacement, active-record validation and duplicate prevention in `backend/tests/WorkshopTracker.Application.Tests/AttendanceCommandTests.cs`
- [ ] T081 [P] [US6] Write failing HTTP tests for bulk replacement and idempotent individual add/remove using the existing OpenAPI paths in `backend/tests/WorkshopTracker.Api.IntegrationTests/AttendanceTests.cs`
- [ ] T082 [US6] Implement atomic bulk and idempotent individual attendance commands that preserve state on failure in `backend/src/WorkshopTracker.Application/Workshops/Attendance/`
- [ ] T083 [US6] Add the existing authenticated attendance contract paths to `backend/src/WorkshopTracker.Api/Endpoints/WorkshopsEndpoints.cs` without introducing search-specific attendance endpoints

**Checkpoint**: Backend contract, domain and SQLite integration suites pass for US1-US6.

---

## Phase 16: Real API Integration

- [ ] T084 Switch runtime API selection and environment validation in `frontend/src/lib/api/config.ts` and create `frontend/.env.example` with copy instructions, all supported keys and safe placeholders
- [ ] T085 Add real API auth and mutation integration tests in `frontend/tests/e2e/api-journeys.spec.ts`
- [ ] T086 Remove mock-mode production reachability while retaining test handlers in `frontend/src/mocks/browser.ts` and `frontend/src/app/providers.tsx`
- [ ] T087 Add MySQL Testcontainer parity suite in `backend/tests/WorkshopTracker.Api.IntegrationTests/MySqlParityTests.cs`
- [ ] T088 Validate runtime Swagger against `specs/001-workshop-participation/contracts/openapi.yaml` in `backend/tests/WorkshopTracker.Api.IntegrationTests/OpenApiContractTests.cs`

---

## Phase 17: Containers and Operations

- [ ] T089 Create frontend multi-stage image and ignore rules in `frontend/Dockerfile` and `.dockerignore`
- [ ] T090 [P] Create backend multi-stage image in `backend/Dockerfile`
- [ ] T091 Create SQLite-default and MySQL-profile services in `docker-compose.yml`
- [ ] T092 Add secret-free root configuration template in `.env.example` and verify every ignored environment/local configuration file has a documented tracked example

---

## Phase 18: Final Quality and Documentation

- [ ] T093 Add real-API Playwright timing samples and p95 <= 2 seconds assertion in `frontend/tests/e2e/performance.spec.ts`
- [ ] T094 Add redacted history/worktree secret scanning with example-placeholder allowlist in `.gitleaks.toml` and `scripts/security/scan-secrets.sh`
- [ ] T095 Run and fix all frontend/backend tests, builds, performance and secret checks using `frontend/package.json` and `backend/WorkshopTracker.slnx`
- [ ] T096 Run and fix Docker Compose smoke tests for SQLite and MySQL using `docker-compose.yml`
- [ ] T097 Run and document WCAG AA, keyboard and Lighthouse validation in `docs/validation.md`
- [ ] T098 Document local, Docker, provider, performance and security workflows in `README.md`
- [ ] T099 Re-run every scenario in `specs/001-workshop-participation/quickstart.md` and record final status in `docs/validation.md`

## Dependencies & Execution Order

- T001–T009 establish frontend foundations.
- Frontend story phases run sequentially T010–T040; each test precedes implementation.
- T041–T043 and refinement tasks T100–T124 are a hard gate: no backend task begins before they pass.
- T044–T051 establish backend foundations.
- Backend stories run sequentially T052–T083 so each migration builds on prior schema.
- T084–T088 require both complete applications.
- Containers T089–T092 require integrated builds; final quality T093–T099 requires all mandatory tasks.
- Optional charts are intentionally absent from mandatory tasks and may be specified after T099.

## Parallel Opportunities

- Configuration tasks marked `[P]` touch independent files.
- Within each story, unit/component tests and HTTP/page tests marked `[P]` may be authored together
  before implementation.
- Frontend and backend are intentionally not parallelized because the approved workflow is frontend-first.
- T101/T103/T105/T108 may be authored independently, but each implementation follows its failing test.
- Frontend and backend Dockerfiles T089/T090 can be prepared in parallel after integration.

## Independent Test Criteria

| Story | Proof |
|---|---|
| US1 | Search/paginate active collaborators with all UI and API states |
| US2 | List workshops and open detail containing only visible participants |
| US3 | Login, refresh, reuse rejection, reload and logout with hidden visitor actions |
| US4 | Create/edit/archive/filter/restore collaborator without deleting attendance |
| US5 | Enforce Recife schedule/quarter and preserve archive/replacement history |
| US6 | Replace attendance and perform idempotent individual add/remove |

## Implementation Strategy

The frontend mock-backed US1 is the first demonstrable MVP. Continue through US6 and the frontend
quality gate before scaffolding the backend. Implement backend stories against the already-proven wire
contract, then change only the transport mode. Each logical group is reviewed and committed separately;
no commit occurs without explicit user authorization.
