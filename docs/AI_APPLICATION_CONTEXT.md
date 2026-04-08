# Contexto da Aplicação Ninho (para IA)

## 1) Objetivo do sistema

O Ninho é um sistema de gestão operacional e financeira com foco em:

- crianças, famílias e profissionais
- atendimentos e fila operacional
- carteira financeira, entradas/saídas e relatórios
- projetos e tarefas
- notificações e dashboards administrativos

Há dois perfis principais de navegação:

- **Admin**: `/admin/...`
- **Cuidados/Saúde**: `/cuidados/...` e `/saude`

## 2) Stack e estrutura

### Frontend

- Next.js 14 (App Router)
- React + Ant Design
- Redux para estado global
- Axios para integração de API
- Proxy interno do Next para backend

Diretório principal:

- `frontend/app` (rotas)
- `frontend/src` (containers, componentes, hooks, redux)

### Backend

- FastAPI
- SQLAlchemy
- Alembic
- Uvicorn

Diretório principal:

- `backend/app/main.py`
- `backend/app/modules/*` (auth, finances, projects, professionals, families, children)
- `backend/app/routers/*` (attendances, reports, notifications etc.)

## 3) Rotas e arquitetura de navegação

Rotas críticas de frontend:

- `/auth/[[...slug]]`
- `/admin/projects`
- `/admin/wallets/[id]`
- `/admin/reports`
- `/admin/resource-sources`

Rota catch-all admin:

- `frontend/app/admin/[[...slug]]/page.js`

Layout admin:

- `frontend/src/layout/withAdminLayoutNext.js`
- `frontend/src/layout/withAdminLayout.js`

## 4) Integração Frontend ↔ Backend

### Padrão atual

- No navegador, o frontend usa **mesma origem** via `/api/proxy/...`
- No servidor (SSR), usa URL interna direta configurada por env

Arquivos-chave:

- `frontend/src/config/api/axios.js`
- `frontend/app/api/proxy/[...path]/route.js`

### Motivo

Esse padrão evita erros de acesso direto ao backend em porta separada no browser e melhora estabilidade do ambiente local/preview.

## 5) Autenticação e middleware

Middleware de rota:

- `frontend/middleware.js`

Regras atuais:

- redireciona para `/auth` quando não há `access_token`
- preserva `callbackUrl`
- não intercepta assets/dev endpoints (`/_next`, `/@vite`, arquivos estáticos)

Patch de autenticação:

- `frontend/src/utils/nextAuthPatch.js`

## 6) Módulo financeiro (núcleo sensível)

### Backend (finances)

Arquivos:

- `backend/app/modules/finances/models.py`
- `backend/app/modules/finances/router.py`
- `backend/app/modules/finances/services.py`
- `backend/app/modules/finances/schemas.py`

Status de despesas (`ExpenseStatus`) aceitos:

- `pendente`
- `agendado`
- `pago`
- `estornado`

### Frontend (wallet details)

Arquivo principal:

- `frontend/src/container/ninho/wallets/details/WalletDetails.js`

Hooks já extraídos:

- `useWalletDashboard.js` (carregamento de dashboard/transações)
- `useWalletPayroll.js` (folha de pagamento)
- `useWalletFinancialActions.js` (ações de saída/transferência/update)
- `useWalletStatementData.js` (extrato e dados de gráfico)

## 7) Funcionalidades recentes importantes

- Exportação PDF de pendentes da equipe fixa na carteira (`Folha de pagamento`)
- Padronização de erros de API para UI (evita crash ao renderizar objeto)
  - `frontend/src/utils/errors/normalizeApiError.js`
- Preservação da aba ativa em `/admin/wallets/[id]` (não volta para Extrato após ação)
- Correção de DatePicker/dayjs com plugin `localeData`
  - `frontend/src/config/dayjs.js`
  - carregado em `frontend/app/providers.js`

## 8) Convenções e decisões técnicas

- Evitar acesso direto do browser à API em porta separada; preferir `/api/proxy`
- Tratar `error.response.data.detail` sempre via normalizador para string
- Para telas grandes, extrair regra de negócio para hooks (SRP)
- Em dev, erros de chunk (`Cannot find module './xxxx.js'`) normalmente resolvem com limpeza de `.next` + restart

## 9) Execução local (padrão atual)

Backend:

```bash
cd /media/kalleb/1TB1/python/ninho
PYTHONPATH=backend .venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8021
```

Frontend:

```bash
cd /media/kalleb/1TB1/python/ninho/frontend
npm install
npm run dev -- -p 3000
```

URLs:

- Frontend: `http://localhost:3000`
- Backend docs: `http://127.0.0.1:8021/docs`

## 10) Comandos de validação

Frontend:

```bash
npm run lint
npm run build
npm run smoke:routes
```

Smoke test script:

- `frontend/scripts/smoke-routes.sh`

## 11) MCP interno e evolução para RAG

Servidor MCP local:

- `backend/mcp/stdio_server.py`
- docs: `backend/mcp/README.md`

Tools atuais:

- `health`
- `search_codebase`
- `rag_plan`

Roadmap:

- `docs/engineering-roadmap.md`

## 12) Troubleshooting rápido

### Erro: `Cannot find module './8024.js'` (ou similar)

1. parar processo Next
2. remover `frontend/.next`
3. subir `npm run dev -- -p 3000`

### Erro dayjs/DatePicker: `localeData is not a function`

- garantir import de `frontend/src/config/dayjs.js` em `frontend/app/providers.js`

### `ERR_ABORTED` em `/@vite/client` em app Next

- em Next puro, `/@vite/client` pode retornar 404
- importante é middleware não redirecionar assets para `/auth`

## 13) Arquivos de referência rápida

- Backend app bootstrap: `backend/app/main.py`
- Proxy API: `frontend/app/api/proxy/[...path]/route.js`
- Axios base: `frontend/src/config/api/axios.js`
- Middleware auth/rotas: `frontend/middleware.js`
- Carteira (UI): `frontend/src/container/ninho/wallets/details/WalletDetails.js`
- Hooks de carteira:
  - `.../hooks/useWalletDashboard.js`
  - `.../hooks/useWalletPayroll.js`
  - `.../hooks/useWalletFinancialActions.js`
  - `.../hooks/useWalletStatementData.js`
- Normalizador de erro: `frontend/src/utils/errors/normalizeApiError.js`

---

Este documento serve como base de contexto para IA atuar com segurança e velocidade no projeto.
