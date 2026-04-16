import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname, search } = req.nextUrl;
  
  // Verificar ambos os cookies: access_token (AuthCallback) e logedIn (login normal)
  const token = req.cookies.get('access_token')?.value;
  const loggedInCookie = req.cookies.get('logedIn')?.value;
  const isAuthenticated = token || loggedInCookie;

  const isStaticOrDevAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/@vite') ||
    pathname === '/favicon.ico' ||
    /\.[a-zA-Z0-9]+$/.test(pathname);

  if (isStaticOrDevAsset) {
    return NextResponse.next();
  }

  if (!isAuthenticated && !pathname.startsWith('/auth')) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth';
    url.searchParams.set('callbackUrl', pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|@vite|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js|css|map)$).*)',
  ],
};
