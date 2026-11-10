import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin/dashboard and any subroutes
  if (pathname.startsWith('/admin/dashboard')) {
    const sessionCookie = request.cookies.get('rudhiram_admin_session');

    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already logged in, redirect /admin/login to /admin/dashboard
  if (pathname === '/admin/login') {
    const sessionCookie = request.cookies.get('rudhiram_admin_session');
    if (sessionCookie && sessionCookie.value) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*', '/admin/login'],
};
