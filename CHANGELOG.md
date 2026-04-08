# Changelog - Auditoria e Correções Sistema Ninho

## Backend
- **Auditado**: Todos os routers e models.
- **Correções**:
  - `attendances.py`: Implementado `PATCH /attendances/{id}/status` e `POST /attendances/{id}/evolution`.
  - `security.py`: Verificado JWT e fallback de criptografia.
  - `alembic`: Sincronizado esquema do banco de dados (SQLite) com models.py. Criada migration `schema_sync_v2`.
- **Banco de Dados**:
  - Ajustado para SQLite em ambiente de desenvolvimento.
  - Tabelas sincronizadas via Alembic.

## Frontend
- **Auditado**: Estrutura de arquivos e configurações.
- **Correções**:
  - `package.json`: Atualizado script `lint` para usar `eslint .`.
  - `eslint.config.mjs`: Mantido como fonte única de configuração. Removido `.eslintrc.json`.
  - `WalletDetails.js`: Corrigido erro de sintaxe (await em função não async) e declaração duplicada.
  - `chat/actionCreator.js`: Reescrevido arquivo corrompido.
  - `chat/reducers.js`: Corrigido uso incorreto de `initialState` (resetando estado).
  - `rootReducers.js`: Removido reducer `FileManager` inexistente.
  - `api/auth/login/route.js`: Adicionado bloco `catch` faltante.
  - `app/admin/main/chat/[[...slug]]/page.js`: Corrigida estrutura do componente.
  - `src/container/ninho/reports/BiCharts.js`: Adicionadas importações faltantes.
  - **Legado**:
    - Movido `src/container/fileManager` para `frontend/_archive/`.
    - Movido `src/container/ninho/Playground.js` para `frontend/_archive/`.
    - Movido `src/redux/fileManager` para `frontend/_archive/`.
  - **Build**:
    - Removido `tsconfig.json` (projeto é JS puro) para corrigir erro de build.
    - Downgrade para `next@14` e `eslint-config-next@14` para compatibilidade.

## Validação
- Backend sobe sem erros (`uvicorn`).
- Frontend builda sem erros (`npm run build`).
- Linting passa sem erros (`npm run lint`).
