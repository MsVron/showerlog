import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth-utils';
import { z } from 'zod';

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = signinSchema.parse(body);

    const user = await sql`
      SELECT id, email, name, password_hash, email_verified
      FROM users 
      WHERE email = ${email}
    `;

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const userData = user[0];
    const isValidPassword = await verifyPassword(password, userData.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (!userData.email_verified) {
      return NextResponse.json(
        { error: 'Please verify your email before signing in' },
        { status: 403 }
      );
    }

    const token = generateToken(userData.id);

    const response = NextResponse.json({
      success: true,
      message: 'Signed in successfully',
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 