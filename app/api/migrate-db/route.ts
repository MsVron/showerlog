import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST() {
  try {
    console.log('Starting database migration...');
    
    // Check if ai_data column exists
    const columnExists = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'thoughts' AND column_name = 'ai_data'
    `;

    if (columnExists.length === 0) {
      console.log('Adding ai_data column to thoughts table...');
      
      await sql`
        ALTER TABLE thoughts 
        ADD COLUMN ai_data JSONB DEFAULT NULL
      `;
      
      console.log('ai_data column added successfully');
    } else {
      console.log('ai_data column already exists');
    }

    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully'
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 