# Implementation Plan: Rastreamento de Participação em Workshops

**Feature**: `001-workshop-participation` | **Date**: 2026-08-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-workshop-participation/spec.md`

## Summary

Entregar uma aplicação web responsiva para consulta pública e administração autenticada de
colaboradores, workshops e participações. O frontend é implementado primeiro contra mocks derivados
do contrato OpenAPI; a API ASP.NET Core vem depois, com Clean Architecture, SQLite padrão, MySQL por
configuração, autenticação administrativa e documentação Swagger. A integração final substitui apenas
o transporte mockado, preservando tipos e comportamentos.

## Technical Context

**Language/Version**: TypeScript 5.x com Node.js 24 LTS; C# 14 com .NET 10 LTS

**Primary Dependencies**: Next.js 16, React 19, Tailwind CSS 4, Radix UI, Lucide, MSW, ASP.NET Core 10,
EF Core 10, ASP.NET Core Identity e MySql.EntityFrameworkCore 10

**Storage**: SQLite para desenvolvimento padrão; MySQL 8.4 LTS selecionável; migrations por provedor

**Testing**: Vitest, Testing Library, jest-dom, axe, MSW e Playwright; xUnit, WebApplicationFactory e
Testcontainers para integração MySQL

**Target Platform**: Navegadores modernos responsivos; containers Linux para frontend, API e MySQL

**Project Type**: Aplicação web com frontend e API separados no mesmo repositório

**Performance Goals**: 95% das consultas locais percebidas em até 2 segundos; paginação limitada a 100
itens; nenhuma consulta de listagem carrega coleções relacionadas sem necessidade

**Constraints**: Frontend antes do backend; TDD; consultas públicas e mutações autenticadas; WCAG AA;
sem segredos ou bancos locais versionados; equivalência SQLite/MySQL; fuso `America/Recife`

**Scale/Scope**: Até milhares de colaboradores e workshops, um administrador provisionado, seis jornadas
obrigatórias e gráficos opcionais fora da entrega principal

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Pre-design | Post-design evidence |
|---|---|---|
| Specification and traceability | PASS | FR/SC, BDD tags, OpenAPI and tasks share stable identifiers |
| Contract-first, frontend-first | PASS | OpenAPI precedes source code; MSW uses the same contract types |
| Test-driven development | PASS | Tasks require failing tests before each behavior implementation |
| Secure defaults | PASS | Public reads only, bearer mutations, rotated hashed refresh sessions |
| Accessible consistent UX | PASS | `ui.md` and tests reference `docs/design_system.md` and WCAG AA |
| Architecture constraints | PASS | Required folders, providers, Dockerfiles and Compose are planned |

No constitution exception is required.

## Project Structure

### Documentation

```text
specs/001-workshop-participation/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── ui.md
├── behaviors/
├── contracts/
│   └── openapi.yaml
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code

```text
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── colaboradores/
│   │   ├── workshops/[id]/
│   │   ├── login/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/
│   │   └── layout/
│   ├── features/
│   │   ├── auth/
│   │   ├── colaboradores/
│   │   ├── workshops/
│   │   └── participantes/
│   ├── lib/api/
│   ├── mocks/
│   └── test/
├── tests/e2e/
├── Dockerfile
└── package.json

backend/
├── WorkshopTracker.slnx
├── src/
│   ├── WorkshopTracker.Domain/
│   ├── WorkshopTracker.Application/
│   ├── WorkshopTracker.Infrastructure/
│   └── WorkshopTracker.Api/
├── tests/
│   ├── WorkshopTracker.Domain.Tests/
│   ├── WorkshopTracker.Application.Tests/
│   └── WorkshopTracker.Api.IntegrationTests/
└── Dockerfile

docker-compose.yml
.env.example
README.md
```

**Structure Decision**: Clean Architecture completa no backend, conforme decisão explícita, e organização
frontend por feature com componentes visuais compartilhados. O contrato OpenAPI é a fronteira comum;
Domain não conhece persistência ou HTTP, e features React não importam handlers MSW diretamente.

## Delivery Strategy

1. Consolidar documentação, contrato e tarefas.
2. Criar frontend e tipos a partir do OpenAPI; implementar todas as jornadas com MSW e TDD.
3. Criar backend e provar domínio, persistência, consultas, autenticação e mutações com TDD.
4. Trocar o adaptador de transporte mockado pela API, mantendo MSW apenas nos testes.
5. Validar containers, ambos os bancos, acessibilidade, segurança e quickstart.

## Complexity Tracking

| Decision | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Quatro projetos de produção no backend | Clean Architecture completa foi escolhida e torna dependências testáveis | API única não expressaria a separação solicitada |
| Dois provedores relacionais | SQLite local e MySQL configurável são requisitos | Um único provedor não atenderia a portabilidade exigida |
| Access token e refresh session próprios | Sessão curta, renovável e revogável foi definida | Token longo ou armazenamento web persistente ampliaria o risco |
