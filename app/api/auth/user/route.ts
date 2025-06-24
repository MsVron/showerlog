import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-utils"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 API: Getting current user...")

    // Get token from cookies
    const token = request.cookies.get("token")?.value

    if (!token) {
      console.log("❌ API: No token found")
      return NextResponse.json({ error: "No token found" }, { status: 401 })
    }

    // Verify token and extract user ID
    const decoded = await verifyToken(token)

    if (!decoded) {
      console.log("❌ API: Invalid token")
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    console.log("✅ API: Token verified for user:", decoded.userId)

    // Query database directly with user ID from token
    const user = await sql`
      SELECT id, email, name, email_verified, created_at
      FROM users 
      WHERE id = ${decoded.userId}
    `

    if (user.length === 0) {
      console.log("❌ API: User not found in database")
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    const userData = user[0]
    const responseData = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      emailVerified: userData.email_verified,
    }

    console.log("✅ API: Returning user data:", responseData)
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("❌ API: Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
