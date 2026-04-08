# Roadmap de Engenharia

## Objetivo

Evoluir o sistema para um padrão mais sustentável, escalável e previsível.

## Diretrizes

- Fronteiras claras por módulo
- Regras de domínio no backend
- Componentes pequenos e focados
- Tratamento de erro padronizado
- Observabilidade mínima por fluxo crítico

## Plano de execução

### Fase 1

- Centralizar normalização de erros no frontend
- Remover warnings mais críticos por tela ativa
- Padronizar callback e redirecionamentos seguros

### Fase 2

- Quebrar componentes grandes em hooks e subcomponentes
- Definir contratos de API estáveis por módulo
- Criar testes de smoke automatizados por rota crítica

### Fase 3

- Introduzir métricas de latência e taxa de erro
- Adicionar pipeline de verificação de regressão
- Evoluir MCP com ferramentas de RAG

## Critérios de pronto

- Build e lint sem erros
- Smoke das rotas críticas em CI
- Padrão único de erro em UI
- Rotas de autenticação estáveis sem glitches
