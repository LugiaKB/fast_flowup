# Fast FlowUp - Desafio Técnico FullStack

Aplicação fullstack para gerenciamento de workshops, colaboradores e participação em eventos internos.

O projeto foi desenvolvido a partir da especificação do desafio da FlowUp, usando uma abordagem orientada por especificação, comportamento e testes. A solução separa frontend e backend em pastas independentes, com integração via API REST e suporte a execução local e containerizada.

## Visão Geral

A aplicação permite:

- Listar workshops cadastrados
- Criar, editar e visualizar workshops
- Listar colaboradores cadastrados
- Gerenciar participantes de um workshop
- Adicionar e remover colaboradores em workshops existentes
- Definir participantes durante a criação de um workshop
- Visualizar detalhes de um workshop e seus participantes
- Usar a aplicação em modo claro ou escuro
- Permitir leitura pública dos dados
- Restringir operações de escrita a usuários autenticados
- Realizar login com usuário administrador inicial

## Stack Utilizada

Frontend:

- Next.js
- React
- TypeScript
- CSS Modules / estilos componentizados
- Testes automatizados para componentes e fluxos principais
- Modo mockado para desenvolvimento sem backend

Backend:

- ASP.NET Core Web API
- C#
- Entity Framework Core
- SQLite para execução local
- Preparação para integração com MySQL
- Swagger/OpenAPI para documentação da API
- Autenticação para operações administrativas

Infraestrutura:

- Docker
- Docker Compose
- Configuração por variáveis de ambiente
- Separação entre execução local, mockada e containerizada

## Estrutura do Projeto

```text
.
├── backend/
│   ├── src/
│   ├── tests/
│   ├── Dockerfile
│   └── ...
├── frontend/
│   ├── src/
│   ├── tests/
│   ├── Dockerfile
│   ├── .env.example
│   └── ...
├── specs/
│   └── 001-workshop-participation/
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Requisitos

Para executar o projeto localmente, é necessário ter instalado:

- Node.js
- npm
- .NET SDK
- Docker e Docker Compose, caso queira usar containers

## Executando o Frontend com Dados Mockados

O frontend pode ser executado sem o backend, usando os dados mockados da própria aplicação.

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Acesse:

```text
http://localhost:3000
```

No arquivo `.env.local`, mantenha o modo mockado ativo:

```env
NEXT_PUBLIC_API_MODE=mock
```

## Executando Frontend Integrado com Backend

Para usar o frontend consumindo a API real, configure:

```env
NEXT_PUBLIC_API_MODE=api
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Depois execute o frontend:

```bash
cd frontend
npm install
npm run dev
```

## Executando o Backend Localmente

Na pasta do backend, configure as variáveis de ambiente conforme o arquivo de exemplo do projeto e execute a API:

```bash
cd backend
dotnet restore
dotnet run
```

A API deve ficar disponível em:

```text
http://localhost:8080
```

A documentação Swagger/OpenAPI pode ser acessada em:

```text
http://localhost:8080/swagger
```

## Banco de Dados

Por padrão, o projeto usa SQLite para facilitar a execução local.

Também há preparação para uso com MySQL, permitindo trocar a configuração da conexão por variáveis de ambiente.

Exemplo de configuração local com SQLite:

```env
DATABASE_PROVIDER=sqlite
DATABASE_CONNECTION_STRING=Data Source=flowup.db
```

Exemplo de configuração com MySQL:

```env
DATABASE_PROVIDER=mysql
DATABASE_CONNECTION_STRING=Server=localhost;Database=flowup;User=root;Password=senha;
```

## Executando com Docker Compose

Para subir a aplicação com containers:

```bash
docker compose up --build
```

Após a inicialização, acesse:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:8080
Swagger:  http://localhost:8080/swagger
```

Caso queira executar com MySQL, ajuste as variáveis de ambiente indicadas no `docker-compose.yml` ou no arquivo `.env` usado pelo compose.

## Autenticação

Usuários não autenticados podem consultar os dados da aplicação.

Operações administrativas, como criação, edição e exclusão, exigem autenticação.

O sistema possui um usuário administrador inicial, configurado por variáveis de ambiente. Consulte os arquivos `.env.example` do backend para definir usuário e senha antes da execução.

Exemplo:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=defina-uma-senha
```

## Testes

Frontend:

```bash
cd frontend
npm test
```

Backend:

```bash
cd backend
dotnet test
```

Os testes foram usados para apoiar o desenvolvimento orientado por comportamento e validação das principais regras da aplicação.

## Processo de Desenvolvimento

O projeto foi organizado com apoio de SDD, BDD e TDD:

- SDD para estruturar especificação, plano técnico e tarefas
- BDD para descrever os comportamentos esperados da aplicação
- TDD para guiar a implementação dos fluxos principais
- Separação clara entre frontend, backend, contratos e infraestrutura
- Commits organizados por etapas implementáveis e verificáveis

Os artefatos de especificação ficam em:

```text
specs/001-workshop-participation/
```

## Principais Regras de Acesso

- Visitantes podem visualizar workshops e colaboradores
- Visitantes não podem criar, editar ou remover dados
- Administradores autenticados podem gerenciar workshops
- Administradores autenticados podem gerenciar colaboradores
- Administradores autenticados podem vincular e remover participantes de workshops

## Observações

Este projeto foi desenvolvido como parte de um desafio técnico fullstack. O uso de ferramentas de IA foi feito de forma assistida, mantendo as decisões técnicas, validações e organização do projeto alinhadas à especificação fornecida.