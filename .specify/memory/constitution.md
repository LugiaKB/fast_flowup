<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Adopted principles:
  - I. Specification, Behavior, and Traceability First
  - II. Contract-First, Frontend-First Delivery
  - III. Test-Driven Development
  - IV. Secure Defaults and Secret Hygiene
  - V. Accessible, Consistent User Experience
- Added sections:
  - Architecture and Operational Constraints
  - Development Workflow and Quality Gates
- Removed sections: none (template placeholders replaced)
- Deferred items: none
-->

# Workshop Participation Tracker Constitution

## Core Principles

### I. Specification, Behavior, and Traceability First

Every feature MUST begin with a reviewed specification that states user value, acceptance scenarios,
edge cases, and measurable success criteria. Architecture, data models, contracts, and implementation
tasks MUST trace back to a requirement or user story. Material behavior changes MUST update the
specification and affected contracts before application code changes.

Critical user journeys MUST be described before implementation as BDD scenarios using observable
Given/When/Then behavior. Each scenario MUST identify its originating user story or requirement and
MUST define outcomes visible to a user or external client rather than internal implementation steps.
BDD scenarios are acceptance contracts: automated tests MAY implement them at different layers, but
the expected behavior and terminology MUST remain consistent across frontend, API, and documentation.

### II. Contract-First, Frontend-First Delivery

External interfaces MUST be defined in versioned contracts before implementation. For this product,
the practical implementation MUST start with the frontend using controlled mocks that conform to the
OpenAPI contract. Backend implementation follows only after frontend behavior is testable. Replacing
mocks with the real API MUST not change user-visible semantics or TypeScript contract types.

### III. Test-Driven Development

Application behavior MUST be developed using Red-Green-Refactor: write a focused failing test, add the
minimum implementation to pass, and refactor while keeping the suite green. Frontend components and
hooks require unit or integration tests; domain rules require unit tests; persistence, authentication,
API contracts, and browser journeys require integration or end-to-end tests. A task is not complete
while its relevant automated tests fail. BDD defines the externally observable acceptance behavior;
TDD drives the implementation that satisfies that behavior.

### IV. Secure Defaults and Secret Hygiene

Public access MUST be read-only. Every mutation MUST require explicit administrator authorization.
Secrets, credentials, private keys, local databases, and environment-specific values MUST NOT be
committed. Initial administrator provisioning MUST be idempotent, validate required environment
variables, avoid logging secrets, and revoke active refresh sessions when the configured password is
synchronized. Access tokens MUST be short-lived; refresh tokens MUST be rotated, revocable, stored as
hashes, and transported only in appropriately secured cookies.

### V. Accessible, Consistent User Experience

The versioned `docs/design_system.md` document is the visual source of truth. User interfaces MUST meet
WCAG AA contrast, keyboard navigation, visible focus, semantic HTML, and appropriate ARIA requirements.
Every data view MUST provide clear loading, empty, success, and error states. Responsive behavior MUST
be verified at the documented breakpoints, and motion MUST respect `prefers-reduced-motion`. Color MUST
never be the only means of conveying status.

## Architecture and Operational Constraints

- Source code MUST remain separated into `frontend/` and `backend/`; specifications and documentation
  belong in `specs/` and `docs/`.
- The frontend MUST use Next.js, React, TypeScript, Tailwind CSS, accessible Radix primitives, Poppins
  headings, and Inter body text.
- The backend MUST use ASP.NET Core with explicit Domain, Application, Infrastructure, and API layers.
  Dependencies MUST point inward; Domain MUST NOT depend on persistence or web frameworks.
- SQLite MUST be the zero-infrastructure local default. MySQL MUST be selectable by configuration and
  expose equivalent observable behavior.
- API behavior MUST be documented in a versioned OpenAPI contract and runtime Swagger document.
- Frontend and backend MUST each have a dedicated Dockerfile. Root `docker-compose.yml` MUST run the
  complete stack and support the optional MySQL configuration.
- Local development artifacts, generated builds, test output, databases, and secrets MUST be excluded
  by the root `.gitignore`; reproducibility artifacts and example configuration MUST remain tracked.

## Development Workflow and Quality Gates

1. Specify and clarify user behavior before architecture work.
2. Define traceable Given/When/Then BDD scenarios, screen states, data model, and integration contracts.
3. Generate dependency-ordered tasks and run cross-artifact analysis.
4. Implement and validate the frontend against contract-aligned mocks.
5. Implement and validate the backend with TDD.
6. Replace runtime mocks and prove end-to-end contract compatibility.
7. Validate SQLite, MySQL, Docker, security, accessibility, and documentation.

Each phase MUST leave the repository buildable or documentation-only and internally consistent. Tests,
type checks, linting, OpenAPI validation, and container smoke tests are release gates when applicable.
Any skipped gate MUST be documented with its reason and a concrete follow-up task.

## Governance

This constitution supersedes informal project practices. Amendments require a documented rationale,
an explicit semantic version change, and a review of impacted specifications, plans, tasks, contracts,
and implementation. MAJOR versions remove or redefine governing principles, MINOR versions add or
materially expand them, and PATCH versions clarify wording without changing obligations. Every feature
analysis and final review MUST verify compliance; exceptions require written justification in the
feature plan and MUST NOT weaken security, test-first delivery, or accessibility requirements.

**Version**: 1.0.0 | **Ratified**: 2026-08-16 | **Last Amended**: 2026-08-16
