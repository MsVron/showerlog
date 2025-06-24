import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { hashPassword } from '@/lib/auth-utils';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    const user = await sql`
      SELECT id, email, password_reset_expires
      FROM users 
      WHERE password_reset_token = ${token}
    `;

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const userData = user[0];
    const now = new Date();
    const expiresAt = new Date(userData.password_reset_expires);

    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    await sql`
      UPDATE users 
      SET password_hash = ${passwordHash},
          password_reset_token = null,
          password_reset_expires = null,
          updated_at = NOW()
      WHERE id = ${userData.id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! You can now sign in with your new password.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 