import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-utils"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Define route categories
  const protectedRoutes = ["/dashboard", "/saved"]
  const publicRoutes = ["/signin", "/signup", "/verify-email", "/reset-password", "/forgot-password"]

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Get token from cookies
  const token = request.cookies.get("token")?.value

  console.log("=== MIDDLEWARE DEBUG ===")
  console.log("Pathname:", pathname)
  console.log("Token exists:", !!token)
  console.log("Token preview:", token ? `${token.substring(0, 20)}...` : "none")
  console.log("Is protected route:", isProtectedRoute)
  console.log("Is public route:", isPublicRoute)

  // Handle protected routes
  if (isProtectedRoute) {
    if (!token) {
      console.log("❌ No token found, redirecting to signin")
      return NextResponse.redirect(new URL("/signin", request.url))
    }

    console.log("🔍 Verifying token...")
    const decoded = verifyToken(token)

    if (!decoded) {
      console.log("❌ Token verification failed, clearing cookie and redirecting to signin")
      const response = NextResponse.redirect(new URL("/signin", request.url))
      response.cookies.delete("token")
      return response
    }

    console.log("✅ Token verification successful for user:", decoded.userId)

    // Add user ID to request headers for server components
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("user-id", decoded.userId)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Handle public routes when user is already authenticated
  if (isPublicRoute && token) {
    console.log("🔍 Checking token on public route...")
    const decoded = verifyToken(token)
    if (decoded) {
      console.log("✅ Authenticated user accessing public route, redirecting to dashboard")
      return NextResponse.redirect(new URL("/dashboard", request.url))
    } else {
      console.log("❌ Invalid token on public route, clearing it")
      const response = NextResponse.next()
      response.cookies.delete("token")
      return response
    }
  }

  console.log("➡️ Allowing request to continue")
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
