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

  console.log("=== MIDDLEWARE DEBUG ===")
  console.log("Pathname:", pathname)
  console.log("Token exists:", !!token)
  console.log("Token preview:", token ? `${token.substring(0, 20)}...` : "none")
  console.log("Is protected route:", isProtectedRoute)
  console.log("Is public route:", isPublicRoute)
  console.log("Is root route:", isRootRoute)

  // Handle protected routes
  if (isProtectedRoute) {
    if (!token) {
      console.log("❌ No token found, redirecting to signin")
      return NextResponse.redirect(new URL("/signin", request.url))
    }

    console.log("🔍 Verifying token...")
    const decoded = await verifyToken(token)

    if (!decoded) {
      console.log("❌ Token verification failed, clearing cookie and redirecting to signin")
      const response = NextResponse.redirect(new URL("/signin", request.url))
      response.cookies.delete("token")
      return response
    }

    console.log("✅ Token verification successful for user:", decoded.userId)

    // Check if user still exists in database
    try {
      const user = await sql`
        SELECT id FROM users WHERE id = ${decoded.userId}
      `
      
      if (user.length === 0) {
        console.log("❌ User not found in database, clearing token and redirecting to home (guest mode)")
        const response = NextResponse.redirect(new URL("/", request.url))
        response.cookies.delete("token")
        return response
      }
      
      console.log("✅ User exists in database")
    } catch (error) {
      console.error("❌ Database error checking user:", error)
      const response = NextResponse.redirect(new URL("/", request.url))
      response.cookies.delete("token")
      return response
    }

    // Add user ID to request headers for server components
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("user-id", decoded.userId)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Handle public routes and root route when user is already authenticated
  if ((isPublicRoute || isRootRoute) && token) {
    console.log("🔍 Checking token on public/root route...")
    const decoded = await verifyToken(token)
    if (decoded) {
      // Check if user still exists for public route redirects too
      try {
        const user = await sql`
          SELECT id FROM users WHERE id = ${decoded.userId}
        `
        
        if (user.length === 0) {
          console.log("❌ User not found on public route, clearing token and staying on current page")
          const response = NextResponse.next()
          response.cookies.delete("token")
          return response
        }
        
        console.log("✅ Authenticated user accessing public/root route, redirecting to dashboard")
        return NextResponse.redirect(new URL("/dashboard", request.url))
      } catch (error) {
        console.error("❌ Database error on public route:", error)
        const response = NextResponse.next()
        response.cookies.delete("token")
        return response
      }
    } else {
      console.log("❌ Invalid token on public/root route, clearing it")
      const response = NextResponse.next()
      response.cookies.delete("token")
      return response
    }
  }

  console.log("➡️ Allowing request to continue")
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public/).*)"],
}
