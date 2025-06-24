import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST() {
  try {
    await sql`
      UPDATE users 
      SET email_verified = true 
      WHERE email = 'test@example.com'
    `;

    const user = await sql`
      SELECT id, email, name, email_verified 
      FROM users 
      WHERE email = 'test@example.com'
    `;

    return NextResponse.json({
      success: true,
      message: 'Test user email verified',
      user: user[0]
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 