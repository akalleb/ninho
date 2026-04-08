import json
import os
import subprocess
import sys
from datetime import datetime, timezone


def write_message(message):
    sys.stdout.write(json.dumps(message, ensure_ascii=False) + "\n")
    sys.stdout.flush()


def make_result(request_id, result):
    return {"jsonrpc": "2.0", "id": request_id, "result": result}


def make_error(request_id, code, message):
    return {"jsonrpc": "2.0", "id": request_id, "error": {"code": code, "message": message}}


def tools_list():
    return [
        {
            "name": "health",
            "description": "Retorna status básico do MCP",
            "inputSchema": {"type": "object", "properties": {}},
        },
        {
            "name": "search_codebase",
            "description": "Busca textual no código com ripgrep",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "pattern": {"type": "string"},
                    "path": {"type": "string"},
                    "limit": {"type": "integer"},
                },
                "required": ["pattern"],
            },
        },
        {
            "name": "rag_plan",
            "description": "Retorna plano base para evoluir para RAG",
            "inputSchema": {"type": "object", "properties": {}},
        },
    ]


def run_health():
    return {
        "content": [
            {
                "type": "text",
                "text": f"ok | utc={datetime.now(timezone.utc).isoformat()}",
            }
        ]
    }


def run_search_codebase(arguments):
    pattern = arguments.get("pattern", "").strip()
    if not pattern:
        return {
            "content": [
                {
                    "type": "text",
                    "text": "pattern é obrigatório",
                }
            ]
        }
    workspace = os.getenv("MCP_WORKSPACE", "/media/kalleb/1TB1/python/ninho")
    path = arguments.get("path", workspace)
    limit = int(arguments.get("limit", 50))
    cmd = ["rg", "--line-number", "--smart-case", pattern, path]
    try:
        output = subprocess.check_output(cmd, stderr=subprocess.STDOUT, text=True)
        lines = output.splitlines()[: max(1, limit)]
        text = "\n".join(lines) if lines else "sem resultados"
        return {"content": [{"type": "text", "text": text}]}
    except subprocess.CalledProcessError as exc:
        if exc.returncode == 1:
            return {"content": [{"type": "text", "text": "sem resultados"}]}
        return {"content": [{"type": "text", "text": exc.output[-4000:]}]}


def run_rag_plan():
    text = (
        "Plano RAG:\n"
        "1) Ingestão: arquivos e banco -> chunks\n"
        "2) Embeddings: pgvector/chroma\n"
        "3) Retrieval: top-k + filtros por módulo\n"
        "4) Tool MCP: rag.search(query, module, k)\n"
        "5) Eval: precisão, latência e cobertura"
    )
    return {"content": [{"type": "text", "text": text}]}


def run_tool(name, arguments):
    if name == "health":
        return run_health()
    if name == "search_codebase":
        return run_search_codebase(arguments or {})
    if name == "rag_plan":
        return run_rag_plan()
    return {"content": [{"type": "text", "text": f"ferramenta desconhecida: {name}"}]}


def handle(request):
    method = request.get("method")
    request_id = request.get("id")

    if method == "initialize":
        return make_result(
            request_id,
            {
                "protocolVersion": "2024-11-05",
                "serverInfo": {"name": "ninho-mcp", "version": "0.1.0"},
                "capabilities": {"tools": {}},
            },
        )

    if method == "notifications/initialized":
        return None

    if method == "tools/list":
        return make_result(request_id, {"tools": tools_list()})

    if method == "tools/call":
        params = request.get("params", {})
        name = params.get("name")
        arguments = params.get("arguments", {})
        return make_result(request_id, run_tool(name, arguments))

    return make_error(request_id, -32601, f"method not found: {method}")


def main():
    for raw in sys.stdin:
        raw = raw.strip()
        if not raw:
            continue
        try:
            request = json.loads(raw)
        except json.JSONDecodeError:
            continue
        response = handle(request)
        if response is not None:
            write_message(response)


if __name__ == "__main__":
    main()
