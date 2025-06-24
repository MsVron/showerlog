import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const thoughtId = params.id;

    const thought = await sql`
      SELECT id, user_id, content, subtasks, is_saved
      FROM thoughts 
      WHERE id = ${thoughtId} AND user_id = ${user.id}
    `;

    if (thought.length === 0) {
      return NextResponse.json(
        { error: 'Thought not found' },
        { status: 404 }
      );
    }

    const isCurrentlySaved = thought[0].is_saved;

    if (!isCurrentlySaved) {
      await sql`
        INSERT INTO saved_thoughts (user_id, thought_id)
        VALUES (${user.id}, ${thoughtId})
        ON CONFLICT (user_id, thought_id) DO NOTHING
      `;

      await sql`
        UPDATE thoughts 
        SET is_saved = true
        WHERE id = ${thoughtId}
      `;
    } else {
      await sql`
        DELETE FROM saved_thoughts 
        WHERE user_id = ${user.id} AND thought_id = ${thoughtId}
      `;

      await sql`
        UPDATE thoughts 
        SET is_saved = false
        WHERE id = ${thoughtId}
      `;
    }

    return NextResponse.json({
      success: true,
      is_saved: !isCurrentlySaved,
      message: !isCurrentlySaved ? 'Thought saved!' : 'Thought unsaved!',
    });
  } catch (error) {
    console.error('Save thought error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 