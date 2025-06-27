import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-utils"
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Define route categories
  const protectedRoutes = ["/dashboard", "/saved", "/settings"]
  const publicRoutes = ["/signin", "/signup", "/verify-email", "/reset-password", "/forgot-password"]

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
  const isRootRoute = pathname === "/"

  // Get token from cookies
  const token = request.cookies.get("token")?.value

  // Handle protected routes
  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/signin", request.url))
    }

    const decoded = await verifyToken(token)

    if (!decoded) {
      const response = NextResponse.redirect(new URL("/signin", request.url))
      response.cookies.delete("token")
      return response
    }

    // Check if user still exists in database
    try {
      const user = await sql`
        SELECT id FROM users WHERE id = ${decoded.userId}
      `
      
      if (user.length === 0) {
        const response = NextResponse.redirect(new URL("/", request.url))
        response.cookies.delete("token")
        return response
      }
    } catch (error) {
      const response = NextResponse.redirect(new URL("/", request.url))
      response.cookies.delete("token")
      return response
    }

    // Add user ID to request headers for server components
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("user-id", decoded.userId)

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    // Add security headers
    response.headers.set("X-DNS-Prefetch-Control", "off")
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    )
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), interest-cohort=()"
    )

    return response
  }

  // Handle public routes and root route when user is already authenticated
  if ((isPublicRoute || isRootRoute) && token) {
    const decoded = await verifyToken(token)
    if (decoded) {
      // Check if user still exists for public route redirects too
      try {
        const user = await sql`
          SELECT id FROM users WHERE id = ${decoded.userId}
        `
        
        if (user.length === 0) {
          const response = NextResponse.next()
          response.cookies.delete("token")
          return response
        }
        
        return NextResponse.redirect(new URL("/dashboard", request.url))
      } catch (error) {
        const response = NextResponse.next()
        response.cookies.delete("token")
        return response
      }
    } else {
      const response = NextResponse.next()
      response.cookies.delete("token")
      return response
    }
  }

  const response = NextResponse.next()

  // Add security headers to all responses
  response.headers.set("X-DNS-Prefetch-Control", "off")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  )
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  )

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public/).*)"],
}
