import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  const results = {
    users_table: false,
    thoughts_table: false,
    saved_thoughts_table: false,
    errors: [] as string[],
  };

  try {
    const usersCheck = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
    
    if (usersCheck.length > 0) {
      results.users_table = true;
      console.log('Users table structure:', usersCheck);
    } else {
      results.errors.push('Users table not found');
    }
  } catch (error) {
    results.errors.push(`Users table error: ${error}`);
  }

  try {
    const thoughtsCheck = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'thoughts'
      ORDER BY ordinal_position
    `;
    
    if (thoughtsCheck.length > 0) {
      results.thoughts_table = true;
      console.log('Thoughts table structure:', thoughtsCheck);
    } else {
      results.errors.push('Thoughts table not found');
    }
  } catch (error) {
    results.errors.push(`Thoughts table error: ${error}`);
  }

  try {
    const savedThoughtsCheck = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'saved_thoughts'
      ORDER BY ordinal_position
    `;
    
    if (savedThoughtsCheck.length > 0) {
      results.saved_thoughts_table = true;
      console.log('Saved thoughts table structure:', savedThoughtsCheck);
    } else {
      results.errors.push('Saved thoughts table not found');
    }
  } catch (error) {
    results.errors.push(`Saved thoughts table error: ${error}`);
  }

  return NextResponse.json({
    success: results.users_table && results.thoughts_table && results.saved_thoughts_table,
    results,
    message: results.users_table && results.thoughts_table && results.saved_thoughts_table
      ? 'All database tables exist!'
      : 'Some database tables are missing',
  });
} 