import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value

  const debugInfo = {
    cookieExists: !!token,
    tokenValue: token ? `${token.substring(0, 10)}...` : null,
    tokenValid: false,
    decodedToken: null,
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get("user-agent"),
    origin: request.headers.get("origin"),
  }

  if (token) {
    const decoded = verifyToken(token)
    debugInfo.tokenValid = !!decoded
    debugInfo.decodedToken = decoded
  }

  return NextResponse.json(debugInfo)
}
