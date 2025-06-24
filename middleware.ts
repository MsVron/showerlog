import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-utils';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const protectedRoutes = ['/dashboard', '/saved'];
  const publicRoutes = ['/signin', '/signup', '/verify-email', '/reset-password', '/forgot-password'];
  
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  const token = request.cookies.get('token')?.value;
  
  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      const response = NextResponse.redirect(new URL('/signin', request.url));
      response.cookies.delete('token');
      return response;
    }
    
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('user-id', decoded.userId);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  if (isPublicRoute && token) {
    const decoded = verifyToken(token);
    if (decoded) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 