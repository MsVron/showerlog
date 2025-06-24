import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth-utils';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; subtaskId: string } }
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
    const subtaskId = parseInt(params.subtaskId);
    const { completed } = await request.json();

    // Get the current thought with subtasks
    const thoughtResult = await sql`
      SELECT subtasks FROM thoughts 
      WHERE id = ${thoughtId} AND user_id = ${user.id}
    `;

    if (thoughtResult.length === 0) {
      return NextResponse.json(
        { error: 'Thought not found or unauthorized' },
        { status: 404 }
      );
    }

    const currentSubtasks = thoughtResult[0].subtasks || [];
    
    // Update the specific subtask
    const updatedSubtasks = currentSubtasks.map((subtask: any) => 
      subtask.id === subtaskId 
        ? { ...subtask, completed }
        : subtask
    );

    // Save back to database
    await sql`
      UPDATE thoughts 
      SET subtasks = ${JSON.stringify(updatedSubtasks)}
      WHERE id = ${thoughtId} AND user_id = ${user.id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Subtask updated successfully'
    });

  } catch (error) {
    console.error('Update subtask error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 