import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { generateVerificationToken } from '@/lib/auth-utils';
import { sendPasswordResetEmail } from '@/lib/email';
import { z } from 'zod';

export const runtime = 'nodejs';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    const user = await sql`
      SELECT id, email
      FROM users 
      WHERE email = ${email} AND email_verified = true
    `;

    if (user.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.',
      });
    }

    const resetToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await sql`
      UPDATE users 
      SET password_reset_token = ${resetToken},
          password_reset_expires = ${expiresAt.toISOString()},
          updated_at = NOW()
      WHERE id = ${user[0].id}
    `;

    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 