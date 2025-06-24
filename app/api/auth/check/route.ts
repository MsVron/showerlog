import { NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    let user = null;
    
    if (token) {
      user = await getUserFromToken(token);
    }

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
