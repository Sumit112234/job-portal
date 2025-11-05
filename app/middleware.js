
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Protect admin routes
    if (path.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Protect employer routes
    if (path.startsWith('/employer') && token?.role !== 'employer') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Redirect authenticated users away from auth pages
    if ((path === '/login' || path === '/register') && token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Public routes
        if (path === '/' || path === '/jobs' || path === '/companies' || path.startsWith('/jobs/')) {
          return true;
        }

        // Auth routes
        if (path === '/login' || path === '/register') {
          return true;
        }

        // Protected routes require token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/employer/:path*',
    '/profile/:path*',
    '/applications/:path*',
    '/messages/:path*',
    '/login',
    '/register',
  ],
};
