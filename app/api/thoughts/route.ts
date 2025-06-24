import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth-utils';
import { z } from 'zod';

const subtaskSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  estimated_time: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  completed: z.boolean().optional().default(false)
});

const createThoughtSchema = z.object({
  content: z.string().min(1),
  subtasks: z.array(subtaskSchema).optional().default([]),
  ai_data: z.object({
    main_goal: z.string(),
    category: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    subtasks: z.array(subtaskSchema)
  }).optional(),
  is_saved: z.boolean().optional().default(false)
});

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { content, subtasks, ai_data, is_saved } = createThoughtSchema.parse(body);

    const result = await sql`
      INSERT INTO thoughts (user_id, content, subtasks, is_saved, ai_data)
      VALUES (
        ${user.id}, 
        ${content}, 
        ${JSON.stringify(subtasks)},
        ${is_saved},
        ${ai_data ? JSON.stringify(ai_data) : null}
      )
      RETURNING id, content, subtasks, is_saved, ai_data, created_at
    `;

    return NextResponse.json({
      success: true,
      thought: result[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create thought error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const thoughts = await sql`
      SELECT id, content, subtasks, is_saved, ai_data, created_at
      FROM thoughts 
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalCount = await sql`
      SELECT COUNT(*) as count
      FROM thoughts 
      WHERE user_id = ${user.id}
    `;

    return NextResponse.json({
      success: true,
      thoughts,
      pagination: {
        page,
        limit,
        total: parseInt(totalCount[0].count),
        pages: Math.ceil(parseInt(totalCount[0].count) / limit),
      },
    });
  } catch (error) {
    console.error('Get thoughts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 