import { NextResponse } from "next/server"

export async function GET() {
  const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

  return NextResponse.json({
    hasJwtSecret: !!process.env.JWT_SECRET,
    isUsingDefault: JWT_SECRET === "your-secret-key",
    secretPreview: JWT_SECRET ? `${JWT_SECRET.substring(0, 5)}...` : "none",
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
}
