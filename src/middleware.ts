import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/forgot-password', '/reset-password'];

const PROTECTED_PATHS_PREFIXES = [
  '/dashboard',
  '/customers',
  '/bookings',
  '/payments',
  '/vendors',
  '/staff',
  '/calendar',
  '/settings',
  '/notifications',
  '/enquiries',
  '/invoices',
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('hod_token')?.value;
  const userJson = request.cookies.get('hod_user')?.value;
  const { pathname } = request.nextUrl;

  let userRole: string | null = null;
  if (userJson) {
    try {
      const parsed = JSON.parse(userJson);
      userRole = parsed.role || null;
    } catch {
      // Corrupted user data
    }
  }

  // 1. Redirect authenticated users away from login/auth pages
  const isAuthPage = ['/login', '/forgot-password', '/reset-password'].includes(pathname);
  if (isAuthPage && token) {
    const targetUrl = userRole === 'super_admin' ? '/admin/dashboard' : '/dashboard';
    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

  // 2. Gate Admin Only Routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (userRole !== 'super_admin') {
      // Regular user tries to access admin path: redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 3. Gate Standard Protected Routes
  const isProtectedPath = PROTECTED_PATHS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  );

  if (isProtectedPath) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (userRole === 'super_admin') {
      // Super admin trying to access regular dashboard: redirect to admin console
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Catch all routes except static assets, favicon, next directories, and API endpoints
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
