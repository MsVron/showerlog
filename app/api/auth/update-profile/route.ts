import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth-utils'
import { sql } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 })
    }

    const { name } = await request.json()

    if (typeof name !== 'string') {
      return NextResponse.json({ error: 'Name must be a string' }, { status: 400 })
    }

    const trimmedName = name.trim()
    if (trimmedName.length > 255) {
      return NextResponse.json({ error: 'Name is too long' }, { status: 400 })
    }

    await sql`
      UPDATE users 
      SET name = ${trimmedName || null}, updated_at = NOW()
      WHERE id = ${user.id}
    `

    const updatedUser = await sql`
      SELECT id, email, name, email_verified, created_at
      FROM users 
      WHERE id = ${user.id}
    `

    return NextResponse.json({
      id: updatedUser[0].id,
      email: updatedUser[0].email,
      name: updatedUser[0].name,
      emailVerified: updatedUser[0].email_verified
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 