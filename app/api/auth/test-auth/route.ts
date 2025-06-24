import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ authenticated: false, error: "No token" }, { status: 401 })
    }

    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ authenticated: false, error: "Invalid token" }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.email_verified,
      },
    })
  } catch (error) {
    console.error("Auth test error:", error)
    return NextResponse.json({ authenticated: false, error: "Internal server error" }, { status: 500 })
  }
}
