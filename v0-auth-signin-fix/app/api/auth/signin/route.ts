import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { verifyPassword, generateToken } from "@/lib/auth-utils"
import { z } from "zod"

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = signinSchema.parse(body)

    console.log("=== SIGNIN API CALLED ===", { email })

    const user = await sql`
      SELECT id, email, name, password_hash, email_verified
      FROM users 
      WHERE email = ${email}
    `

    if (user.length === 0) {
      console.log("User not found:", email)
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }

    const userData = user[0]
    const isValidPassword = await verifyPassword(password, userData.password_hash)

    if (!isValidPassword) {
      console.log("Invalid password for user:", email)
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }

    if (!userData.email_verified) {
      console.log("Email not verified for user:", email)
      return NextResponse.json({ success: false, error: "Please verify your email before signing in" }, { status: 403 })
    }

    // Generate token
    const token = generateToken(userData.id)
    console.log("Generated token for user:", userData.id)

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Signed in successfully",
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
      },
    })

    // Set cookie with proper configuration
    const isProduction = process.env.NODE_ENV === "production"

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    console.log("Cookie set successfully for user:", userData.id)

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Invalid input", details: error.errors }, { status: 400 })
    }

    console.error("Signin error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
