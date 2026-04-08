# Ninho MCP

Servidor MCP em modo `stdio` para acelerar evolução de funcionalidades e facilitar futuras integrações RAG.

## Ferramentas disponíveis

- `health`: status do servidor
- `search_codebase`: busca textual no repositório com ripgrep
- `rag_plan`: plano base de evolução para RAG

## Execução local

```bash
cd /media/kalleb/1TB1/python/ninho
MCP_WORKSPACE=/media/kalleb/1TB1/python/ninho python backend/mcp/stdio_server.py
```

## Exemplo de configuração MCP (cliente)

```json
{
  "mcpServers": {
    "ninho": {
      "command": "python",
      "args": ["backend/mcp/stdio_server.py"],
      "cwd": "/media/kalleb/1TB1/python/ninho",
      "env": {
        "MCP_WORKSPACE": "/media/kalleb/1TB1/python/ninho"
      }
    }
  }
}
```

## Próximos passos para RAG

1. Indexador de documentos e código com job incremental
2. Banco vetorial (pgvector/chroma)
3. Tool `rag.search` com filtros por módulo e score
4. Tool `rag.upsert` para atualização incremental
5. Métricas de precisão e latência
