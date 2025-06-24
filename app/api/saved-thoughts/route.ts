import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const savedThoughts = await sql`
      SELECT t.id, t.content, t.subtasks, t.is_saved, t.created_at, st.saved_at
      FROM thoughts t
      JOIN saved_thoughts st ON t.id = st.thought_id
      WHERE st.user_id = ${user.id}
      ORDER BY st.saved_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalCount = await sql`
      SELECT COUNT(*) as count
      FROM saved_thoughts 
      WHERE user_id = ${user.id}
    `;

    return NextResponse.json({
      success: true,
      thoughts: savedThoughts,
      pagination: {
        page,
        limit,
        total: parseInt(totalCount[0].count),
        pages: Math.ceil(parseInt(totalCount[0].count) / limit),
      },
    });
  } catch (error) {
    console.error('Get saved thoughts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 