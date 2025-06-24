import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"

export async function GET() {
  try {
    const user = await getCurrentUser()

    return NextResponse.json({
      authenticated: !!user,
      user: user
        ? {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        : null,
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({
      authenticated: false,
      user: null,
    })
  }
}
