#!/usr/bin/env bash
# ==============================================================================
# Fast FlowUp — Inicialização Instantânea da Aplicação Completa
# ==============================================================================
# Executa tanto o frontend quanto o backend juntos via Docker Compose com
# validação automática de ambiente, provisionamento de .env e healthcheck.
#
# Uso:
#   ./start.sh            # Inicia instantaneamente com as imagens existentes
#   ./start.sh --build    # Reconstrói as imagens antes de iniciar
#   ./start.sh --logs     # Inicia e acompanha os logs em tempo real
#   ./start.sh --mysql    # Inicia usando o profile MySQL em vez de SQLite
#   ./start.sh --stop     # Para todos os serviços e libera as portas
# ==============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Cores para saída no terminal
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BOLD}${CYAN}"
echo "╔═════════════════════════════════════════════════════════════════╗"
echo "║                     FAST FLOWUP — STARTUP                       ║"
echo "╚═════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# 1. Tratar flags de parada
if [[ "${1:-}" == "--stop" || "${1:-}" == "--down" ]]; then
  echo -e "${YELLOW}🛑 Parando todos os serviços...${NC}"
  docker compose --profile mysql down
  echo -e "${GREEN}✓ Serviços finalizados com sucesso.${NC}"
  exit 0
fi

# 2. Verificar dependências necessárias
if ! command -v docker &>/dev/null; then
  echo -e "${RED}❌ Erro: Docker não foi encontrado. Instale o Docker Engine para continuar.${NC}" >&2
  exit 1
fi

if ! docker compose version &>/dev/null; then
  echo -e "${RED}❌ Erro: Docker Compose v2 não foi encontrado.${NC}" >&2
  exit 1
fi

# 3. Garantir existência e configuração do arquivo .env
if [[ ! -f "$ROOT_DIR/.env" ]]; then
  echo -e "${YELLOW}ℹ️  Arquivo .env não encontrado. Criando automaticamente a partir de .env.example...${NC}"
  cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
  
  # Gerar chave JWT segura e credenciais padrão funcionais
  JWT_KEY="$(openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | xxd -p -c 32)"
  sed -i "s/replace-with-admin-username/admin/g" "$ROOT_DIR/.env"
  sed -i "s/replace-with-a-strong-password/Admin@12345678/g" "$ROOT_DIR/.env"
  sed -i "s/replace-with-at-least-32-random-bytes/$JWT_KEY/g" "$ROOT_DIR/.env"
  sed -i "s/replace-with-a-strong-mysql-password/FlowUpMysql@123/g" "$ROOT_DIR/.env"
  sed -i "s/replace-with-a-strong-mysql-root-password/FlowUpRoot@123/g" "$ROOT_DIR/.env"
  echo -e "${GREEN}✓ Arquivo .env gerado com credenciais válidas e JWT signing key aleatória.${NC}"
fi

# Carregar credenciais para exibição ao usuário
ADMIN_USERNAME="$(grep -E '^ADMIN_USERNAME=' "$ROOT_DIR/.env" | cut -d '=' -f2- | tr -d '"'\'' ' || echo "admin")"
ADMIN_PASSWORD="$(grep -E '^ADMIN_PASSWORD=' "$ROOT_DIR/.env" | cut -d '=' -f2- | tr -d '"'\'' ' || echo "admin")"
DATABASE_PROVIDER="$(grep -E '^DATABASE_PROVIDER=' "$ROOT_DIR/.env" | cut -d '=' -f2- | tr -d '"'\'' ' || echo "Sqlite")"

# 4. Tratar argumentos e determinar flags do compose
COMPOSE_ARGS=()
SHOULD_BUILD=false
FOLLOW_LOGS=false

for arg in "$@"; do
  case "$arg" in
    --build|--rebuild)
      SHOULD_BUILD=true
      ;;
    --mysql)
      export DATABASE_PROVIDER=MySql
      ;;
    --logs|--follow)
      FOLLOW_LOGS=true
      ;;
  esac
done

if [[ "${DATABASE_PROVIDER:-}" == "MySql" ]]; then
  echo -e "${BLUE}📦 Modo: MySQL 8.4 Profile${NC}"
  COMPOSE_ARGS+=(--profile mysql)
else
  echo -e "${BLUE}📦 Modo: SQLite Padrão (Volume persistente)${NC}"
fi

# 5. Inicialização dos Containers (reutiliza imagens existentes por padrão)
UP_FLAGS=(-d)
if [[ "$SHOULD_BUILD" == "true" ]]; then
  echo -e "${BLUE}🔨 Reconstruindo imagens e subindo containers...${NC}"
  UP_FLAGS=(--build -d)
else
  echo -e "${BLUE}🚀 Subindo containers existentes (Frontend + Backend)...${NC}"
fi

docker compose "${COMPOSE_ARGS[@]}" up "${UP_FLAGS[@]}"

# 6. Aguardar saúde do Backend e Frontend
echo -e "${YELLOW}⏳ Aguardando serviços responderem...${NC}"

BACKEND_READY=0
for i in {1..30}; do
  if curl -s -f http://localhost:8080/health >/dev/null 2>&1; then
    BACKEND_READY=1
    break
  fi
  sleep 1
done

if [[ "$BACKEND_READY" -ne 1 ]]; then
  echo -e "${RED}⚠️  O backend demorou mais que o esperado para iniciar. Verifique os logs com: docker compose logs backend${NC}"
fi

FRONTEND_READY=0
for i in {1..20}; do
  if curl -s -I http://localhost:3000 >/dev/null 2>&1; then
    FRONTEND_READY=1
    break
  fi
  sleep 1
done

echo ""
echo -e "${BOLD}${GREEN}=================================================================${NC}"
echo -e "${BOLD}${GREEN}           🎉 APLICAÇÃO FAST FLOWUP PRONTA PARA USO!             ${NC}"
echo -e "${BOLD}${GREEN}=================================================================${NC}"
echo ""
echo -e "  ${BOLD}🌐 Frontend (Aplicação Web):${NC}  ${CYAN}http://localhost:3000${NC}"
echo -e "  ${BOLD}⚙️  Backend API:${NC}              ${CYAN}http://localhost:8080${NC}"
echo -e "  ${BOLD}📄 Documentação Swagger UI:${NC}   ${CYAN}http://localhost:8080/swagger${NC}"
echo -e "  ${BOLD}🩺 Health Check API:${NC}          ${CYAN}http://localhost:8080/health${NC}"
echo ""
echo -e "  ${BOLD}👤 Usuário Administrador:${NC}    ${YELLOW}${ADMIN_USERNAME:-admin}${NC}"
echo -e "  ${BOLD}🔑 Senha do Administrador:${NC}   ${YELLOW}${ADMIN_PASSWORD:-Admin@12345678}${NC}"
echo ""
echo -e "-----------------------------------------------------------------"
echo -e "  ${BOLD}Comandos úteis:${NC}"
echo -e "    • Ver logs em tempo real:   ${CYAN}docker compose logs -f${NC}"
echo -e "    • Parar a aplicação:        ${CYAN}./start.sh --stop${NC}"
echo -e "    • Rodar testes E2E reais:   ${CYAN}cd frontend && npm run test:e2e:api${NC}"
echo -e "${BOLD}${GREEN}=================================================================${NC}"
echo ""

if [[ "$FOLLOW_LOGS" == "true" ]]; then
  echo -e "${BLUE}Acompanhando logs em tempo real (Pressione Ctrl+C para sair da visualização):${NC}"
  docker compose "${COMPOSE_ARGS[@]}" logs -f
fi
