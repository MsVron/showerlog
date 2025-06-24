import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    const user = await sql`
      SELECT id, email, email_verified
      FROM users 
      WHERE email_verification_token = ${token}
    `;

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    if (user[0].email_verified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    await sql`
      UPDATE users 
      SET email_verified = true, 
          email_verification_token = null,
          updated_at = NOW()
      WHERE id = ${user[0].id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now sign in.',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Verification token is required' },
      { status: 400 }
    );
  }

  try {
    const user = await sql`
      SELECT id, email, email_verified
      FROM users 
      WHERE email_verification_token = ${token}
    `;

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    if (user[0].email_verified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    await sql`
      UPDATE users 
      SET email_verified = true, 
          email_verification_token = null,
          updated_at = NOW()
      WHERE id = ${user[0].id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now sign in.',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 