import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { verifyPassword, hashPassword, getUserFromToken } from '@/lib/auth-utils'
import { z } from 'zod'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
})

export async function POST(request: NextRequest) {
  console.log("=== CHANGE PASSWORD API CALLED ===")
  try {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log("📧 Request received for user:", user.email)
    
    const { currentPassword, newPassword } = changePasswordSchema.parse(body)

    // Get user's current password hash
    const userRecord = await sql`
      SELECT password_hash
      FROM users 
      WHERE id = ${user.id}
    `

    if (userRecord.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, userRecord[0].password_hash)
    
    if (!isCurrentPasswordValid) {
      console.log("❌ Current password verification failed")
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword)

    // Update password in database
    await sql`
      UPDATE users 
      SET password_hash = ${newPasswordHash},
          updated_at = NOW()
      WHERE id = ${user.id}
    `

    console.log("✅ Password changed successfully for user:", user.email)

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 