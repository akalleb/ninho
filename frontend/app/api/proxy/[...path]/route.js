import { NextResponse } from 'next/server';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8021';

function buildTargetUrl(pathSegments, search) {
  const path = Array.isArray(pathSegments) ? pathSegments.join('/') : '';
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBase}/${path}${search || ''}`;
}

function filterRequestHeaders(headers) {
  const out = new Headers();
  headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (k === 'host' || k === 'content-length' || k === 'connection') {
      return;
    }
    out.set(key, value);
  });
  return out;
}

function filterResponseHeaders(headers) {
  const out = new Headers();
  headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (k === 'content-encoding' || k === 'transfer-encoding' || k === 'connection') {
      return;
    }
    out.set(key, value);
  });
  return out;
}

async function proxy(req, { params }) {
  const method = req.method;
  const url = new URL(req.url);
  const target = buildTargetUrl(params?.path, url.search);
  const headers = filterRequestHeaders(req.headers);
  
  let body;
  if (method !== 'GET' && method !== 'HEAD') {
    try {
      const contentType = req.headers.get('content-type') || '';
      const isBinaryPayload =
        contentType.includes('multipart/form-data') ||
        contentType.includes('application/octet-stream');

      // Keep binary bodies as bytes; use text for JSON/form payloads to avoid
      // undici redirect issues with detached ArrayBuffer on 307 follow.
      body = isBinaryPayload ? await req.arrayBuffer() : await req.text();
    } catch (e) {
      body = undefined;
    }
  }

  try {
    console.log(`[Proxy] ${method} ${target}`);
    const response = await fetch(target, {
      method,
      headers,
      body,
      redirect: 'follow',
      cache: 'no-store',
    });

    // 304 responses must not include a body, same as 204/205.
    const isNoContent = response.status === 204 || response.status === 205 || response.status === 304;
    const data = isNoContent ? null : await response.arrayBuffer();

    return new NextResponse(data, {
      status: response.status,
      headers: filterResponseHeaders(response.headers),
    });
  } catch (error) {
    console.error(`[Proxy Error] [${method}] ${target}:`, error);
    return NextResponse.json(
      { 
        detail: 'Falha ao conectar com a API interna', 
        error: String(error?.message || error),
        target: target 
      },
      { status: 502 },
    );
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE, proxy as OPTIONS };
