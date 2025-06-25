import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth-utils"

export async function DELETE(request: NextRequest) {
  try {
    console.log("🗑️ Delete Account: Starting account deletion process")

    const token = request.cookies.get("token")?.value
    if (!token) {
      console.log("❌ Delete Account: No auth token provided")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      console.log("❌ Delete Account: Invalid or expired token")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("🔍 Delete Account: Deleting account for user:", user.id)

    await sql`DELETE FROM saved_thoughts WHERE user_id = ${user.id}`
    console.log("✅ Delete Account: Deleted saved thoughts")

    await sql`DELETE FROM thoughts WHERE user_id = ${user.id}`
    console.log("✅ Delete Account: Deleted thoughts")

    await sql`DELETE FROM users WHERE id = ${user.id}`
    console.log("✅ Delete Account: Deleted user account")

    console.log("🎉 Delete Account: Account deletion completed successfully")

    const response = NextResponse.json({ message: "Account deleted successfully" })
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    })

    return response
  } catch (error) {
    console.error("❌ Delete Account: Error deleting account:", error)
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    )
  }
} 