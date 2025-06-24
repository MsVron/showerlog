import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { hashPassword, generateToken, verifyToken, generateVerificationToken } from '@/lib/auth-utils';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

export async function GET() {
  const results = {
    database: false,
    jwt: false,
    email: false,
    errors: [] as string[],
  };

  try {
    const dbResult = await sql`SELECT NOW() as current_time`;
    results.database = true;
    console.log('Database test passed:', dbResult[0]);
  } catch (error) {
    results.errors.push(`Database error: ${error}`);
  }

  try {
    const testUserId = 'test-user-id';
    const token = generateToken(testUserId);
    const decoded = verifyToken(token);
    
    if (decoded && decoded.userId === testUserId) {
      results.jwt = true;
      console.log('JWT test passed');
    } else {
      results.errors.push('JWT verification failed');
    }
  } catch (error) {
    results.errors.push(`JWT error: ${error}`);
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();
    results.email = true;
    console.log('Email test passed');
  } catch (error) {
    results.errors.push(`Email error: ${error}`);
  }

  return NextResponse.json({
    success: results.database && results.jwt && results.email,
    results,
    message: results.database && results.jwt && results.email 
      ? 'All systems working!' 
      : 'Some systems have issues',
  });
} 