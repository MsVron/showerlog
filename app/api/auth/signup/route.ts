import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { hashPassword, generateVerificationToken } from '@/lib/auth-utils';
import { sendVerificationEmail } from '@/lib/email';
import { z } from 'zod';

export const runtime = 'nodejs';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = signupSchema.parse(body);

    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = generateVerificationToken();

    const result = await sql`
      INSERT INTO users (email, password_hash, name, email_verification_token)
      VALUES (${email}, ${passwordHash}, ${name}, ${verificationToken})
      RETURNING id, email, name
    `;

    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json({
      success: true,
      message: 'Account created! Please check your email to verify your account.',
      user: result[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 