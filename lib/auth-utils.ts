import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { headers } from 'next/headers';
import { sql } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export function generateVerificationToken(): string {
  return uuidv4();
}

export async function getCurrentUser() {
  try {
    const headersList = headers();
    const userId = headersList.get('user-id');
    
    if (!userId) {
      return null;
    }
    
    const user = await sql`
      SELECT id, email, name, email_verified, created_at
      FROM users 
      WHERE id = ${userId}
    `;
    
    return user.length > 0 ? user[0] : null;
  } catch {
    return null;
  }
} 