# Fast FlowUp — Desafio Técnico FullStack

Aplicação fullstack para gerenciamento de workshops, colaboradores e participação em eventos internos,
desenvolvida a partir da especificação técnica da FlowUp.

O projeto adota uma abordagem orientada por especificação, comportamento e testes (SDD/BDD/TDD) e
separa frontend e backend em pastas independentes, com integração via API REST e suporte a execução
local e containerizada.

---

## Visão Geral

A aplicação permite:

- Listar, buscar e paginar workshops e colaboradores (acesso público)
- Visualizar detalhes de um workshop com seus participantes ativos
- Criar, editar, arquivar e restaurar colaboradores (requer autenticação)
- Criar, editar, arquivar e restaurar workshops (requer autenticação)
- Definir participantes durante a criação de um workshop
- Adicionar e remover participantes individualmente ou por substituição em bloco
- Alternar entre tema claro e escuro com persistência da preferência
- Realizar login com o usuário administrador pré-configurado por variáveis de ambiente

---

## Stack

**Frontend**
- Next.js 16 (App Router), React 19, TypeScript 5
- Tailwind CSS 4, Radix UI, Lucide
- Vitest, Testing Library, jest-axe, MSW (mocks de desenvolvimento e testes)
- Playwright (testes end-to-end)

**Backend**
- ASP.NET Core 10 (Minimal API), C# 14, .NET 10 LTS
- Entity Framework Core 10, Clean Architecture (Domain / Application / Infrastructure / Api)
- ASP.NET Core Identity, JWT Bearer + Refresh Token rotativo (HttpOnly cookie)
- SQLite (padrão local), MySQL 8.4 (profile Docker configurável)
- Swagger/OpenAPI; xUnit, WebApplicationFactory, Testcontainers

**Infraestrutura**
- Docker + Docker Compose v2
- Imagens multi-stage (build separado do runtime)
- Configuração por variáveis de ambiente; sem segredos no repositório

---

## Pré-requisitos

| Ferramenta | Versão mínima | Observação |
|---|---|---|
| Node.js | 24 LTS | Use `nvm use 24` |
| npm | 11 | Incluso com Node.js 24 |
| .NET SDK | 10 LTS | Necessário para executar o backend localmente sem Docker |
| Docker Engine | 24+ | Necessário para Compose, MySQL e build de containers |
| Docker Compose | v2 (plugin) | `docker compose` (sem hífen) |

---

## Configuração

### Raiz (Docker Compose)

```bash
cp .env.example .env
```

Edite `.env` e substitua **todos** os placeholders:

| Variável | Obrigatoriedade | Descrição |
|---|---|---|
| `ADMIN_USERNAME` | Obrigatória | Nome de usuário do administrador inicial (1–100 caracteres) |
| `ADMIN_PASSWORD` | Obrigatória | Senha forte (≥ 12 caracteres, maiúscula, dígito e símbolo) |
| `JWT_SIGNING_KEY` | Obrigatória | Chave de assinatura JWT com pelo menos 32 bytes aleatórios |
| `NEXT_PUBLIC_API_URL` | Opcional | URL da API acessível pelo browser (padrão: `http://localhost:8080`) |
| `FRONTEND_ORIGIN` | Opcional | Origem permitida no CORS (padrão: `http://localhost:3000`) |
| `DATABASE_PROVIDER` | Opcional | `Sqlite` (padrão) ou `MySql` |
| `DATABASE_CONNECTION_STRING` | Opcional | String de conexão (ver exemplos abaixo) |
| `MYSQL_PASSWORD` | Profile mysql | Senha do usuário do banco MySQL |
| `MYSQL_ROOT_PASSWORD` | Profile mysql | Senha root do MySQL |

> **Nunca comite `.env`.** O arquivo `.gitignore` já o exclui.

### Frontend (desenvolvimento local)

```bash
cd frontend
cp .env.example .env.local
```

| Variável | Valores | Descrição |
|---|---|---|
| `NEXT_PUBLIC_API_MODE` | `mock` / `api` | `mock` usa MSW sem backend; `api` conecta à API real |
| `NEXT_PUBLIC_API_URL` | URL | Obrigatória quando `NEXT_PUBLIC_API_MODE=api` |

## Execução Instantânea (Recomendado)

Para subir a aplicação completa (Frontend + Backend + Banco) em um único comando:

```bash
./start.sh
```

O script:
- Valida o Docker e Docker Compose
- Cria o `.env` automaticamente com credenciais e chaves JWT se não existir
- Constrói e inicializa os containers em segundo plano
- Aguarda a saúde da API e do frontend
- Exibe o painel com as URLs de acesso e credenciais administrativas

Opções do script:

```bash
./start.sh --logs      # Inicia e acompanha os logs em tempo real
./start.sh --mysql     # Inicia utilizando o profile MySQL 8.4
./start.sh --stop      # Para todos os containers e libera as portas
```

---

## Execução Local

### Frontend com dados mockados (sem backend)

```bash
cd frontend
npm ci
# .env.local já define NEXT_PUBLIC_API_MODE=mock
npm run dev
```

Acesse: http://localhost:3000

### Backend com SQLite

```bash
cd backend
dotnet restore
dotnet run --project src/WorkshopTracker.Api
```

A API inicia em http://localhost:8080. O Swagger está disponível em http://localhost:8080/swagger.

Na primeira inicialização, o EF Core cria o schema SQLite e o `AdminSeeder` sincroniza o usuário
administrador definido pelas variáveis `ADMIN_USERNAME` e `ADMIN_PASSWORD`.

Variáveis de ambiente para execução local do backend:

```bash
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=SenhaForte@123
export JWT_SIGNING_KEY=chave-de-pelo-menos-32-bytes-aleatoria
export FrontendOrigin=http://localhost:3000
```

### Frontend integrado ao backend

```bash
cd frontend
# .env.local ou variáveis de ambiente:
NEXT_PUBLIC_API_MODE=api
NEXT_PUBLIC_API_URL=http://localhost:8080
npm run dev
```

---

## Execução com Docker Compose

### SQLite (configuração padrão)

```bash
# Preencha .env a partir de .env.example antes de continuar.
docker compose up --build
```

Serviços:

| Serviço | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:8080 |
| Swagger | http://localhost:8080/swagger |
| Health check | http://localhost:8080/health |

O backend aguarda o health check próprio antes de aceitar tráfego.
O frontend depende do `service_healthy` do backend (declarado no Compose).

### MySQL (profile)

```bash
# Certifique-se de que MYSQL_PASSWORD, MYSQL_ROOT_PASSWORD e DATABASE_PROVIDER=MySql
# estão definidos em .env.
DATABASE_PROVIDER=MySql docker compose --profile mysql up --build
```

O MySQL fica disponível na porta 3306 (apenas na rede Docker). O backend aguarda o health check
do MySQL antes de iniciar.

---

## Banco de Dados

### SQLite (padrão)

```env
DATABASE_PROVIDER=Sqlite
DATABASE_CONNECTION_STRING=Data Source=/data/workshop-tracker.db
```

O volume `sqlite-data` persiste o arquivo entre reinicializações do container.

### MySQL

```env
DATABASE_PROVIDER=MySql
DATABASE_CONNECTION_STRING=Server=mysql;Database=workshop_tracker;User=workshop_tracker;Password=<MYSQL_PASSWORD>
```

Migrations são geradas separadamente por provedor em
`backend/src/WorkshopTracker.Infrastructure/Persistence/Migrations/`.

---

## Testes

### Frontend — unitários e acessibilidade

```bash
cd frontend
npm run lint          # ESLint, 0 warnings tolerados
npm run typecheck     # TypeScript sem erros
npm test              # Vitest — 84 testes (componentes, hooks, acessibilidade)
npm run test:a11y     # Apenas testes de acessibilidade
```

### Frontend — E2E com mocks (MSW, sem backend)

```bash
cd frontend
npm run test:e2e
```

Cobre as 7 jornadas principais de US1–US6 via MSW no modo `NEXT_PUBLIC_API_MODE=mock`.

### Frontend — E2E com API real

Requer o docker compose rodando:

```bash
docker compose up --build -d
curl http://localhost:8080/health   # confirme que o backend está saudável
```

```bash
cd frontend
E2E_ADMIN_USERNAME=<user> E2E_ADMIN_PASSWORD=<pass> npm run test:e2e:api
```

Variáveis de ambiente para os testes de API real:

| Variável | Padrão | Descrição |
|---|---|---|
| `PLAYWRIGHT_API_URL` | `http://localhost:8080` | URL do backend |
| `PLAYWRIGHT_BASE_URL` | `http://localhost:3000` | URL do frontend |
| `E2E_ADMIN_USERNAME` | `admin` | Usuário administrador |
| `E2E_ADMIN_PASSWORD` | `Admin@123!` | Senha do administrador |

### Frontend — build de produção

```bash
cd frontend && npm run build
```

### Backend

```bash
cd backend
dotnet test WorkshopTracker.slnx
```

Ou via Docker (quando o SDK não está instalado localmente):

```bash
docker compose run --rm backend dotnet test WorkshopTracker.slnx
```

Cobre: domain, application, SQLite integration, MySQL parity (Testcontainers), OpenAPI contract.

---

## Segurança

### Varredura de segredos

```bash
bash scripts/security/scan-secrets.sh
```

O script instala o `gitleaks` automaticamente se não estiver disponível e escaneia
tanto o worktree quanto o histórico Git completo. Placeholders dos arquivos `.example`
são explicitamente permitidos via `.gitleaks.toml`.

### Boas práticas adotadas

- Nenhum segredo nos arquivos versionados; todos os `.env.example` usam placeholders `replace-with-`
- O refresh token é armazenado em cookie `HttpOnly`; Secure e SameSite=None em produção
- O access token permanece apenas em memória (sem `localStorage` ou `sessionStorage`)
- CORS configurado para aceitar apenas a origem definida em `FRONTEND_ORIGIN`
- Reutilização de refresh token revoga toda a família de sessões
- Senhas são armazenadas com hash pelo ASP.NET Core Identity
- A chave JWT deve ter no mínimo 32 bytes

---

## Estrutura do Projeto

```text
.
├── backend/
│   ├── src/
│   │   ├── WorkshopTracker.Domain/
│   │   ├── WorkshopTracker.Application/
│   │   ├── WorkshopTracker.Infrastructure/
│   │   └── WorkshopTracker.Api/
│   ├── tests/
│   │   ├── WorkshopTracker.Domain.Tests/
│   │   ├── WorkshopTracker.Application.Tests/
│   │   └── WorkshopTracker.Api.IntegrationTests/
│   ├── Dockerfile
│   └── WorkshopTracker.slnx
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # UI primitives e layout
│   │   ├── features/        # auth, colaboradores, workshops, participantes, theme
│   │   ├── lib/api/         # fetch client, OpenAPI types, config
│   │   ├── mocks/           # MSW handlers e fixtures
│   │   └── test/            # setup e testes de acessibilidade
│   ├── tests/e2e/           # Playwright
│   │   ├── mock-journeys.spec.ts
│   │   ├── api-journeys.spec.ts
│   │   └── performance.spec.ts
│   ├── Dockerfile
│   ├── playwright.config.ts       # suite mock
│   ├── playwright.api.config.ts   # suite real-API
│   └── package.json
├── specs/
│   └── 001-workshop-participation/
│       ├── spec.md
│       ├── plan.md
│       ├── tasks.md
│       ├── quickstart.md
│       ├── contracts/openapi.yaml
│       └── behaviors/
├── docs/
│   └── validation.md
├── scripts/
│   └── security/scan-secrets.sh
├── docker-compose.yml
├── .env.example
├── .gitleaks.toml
└── README.md
```

---

## Autenticação

Visitantes podem consultar workshops e colaboradores sem autenticação.

Operações administrativas (criar, editar, arquivar, restaurar) exigem um bearer token obtido
via `POST /api/auth/login` com as credenciais configuradas pelas variáveis `ADMIN_USERNAME` e
`ADMIN_PASSWORD`.

A sessão é renovada automaticamente por até 7 dias via refresh token rotativo em cookie HttpOnly.
O logout revoga o token e toda a família de sessões relacionada.

---

## Processo de Desenvolvimento

O projeto foi organizado com SDD, BDD e TDD:

- **SDD**: especificação, plano técnico e tarefas em `specs/001-workshop-participation/`
- **BDD**: comportamentos esperados em `specs/001-workshop-participation/behaviors/`
- **TDD**: testes escritos antes da implementação em cada fase
- **Frontend-first**: todas as jornadas MSW passam antes de qualquer código backend
- **Contrato OpenAPI**: fronteira comum entre frontend e backend em `contracts/openapi.yaml`
