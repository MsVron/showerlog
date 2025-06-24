import { testConnection } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      return NextResponse.json({ 
        message: 'Database connected successfully!',
        status: 'success'
      });
    } else {
      return NextResponse.json({ 
        message: 'Database connection failed',
        status: 'error'
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ 
      message: 'Database connection error',
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    }, { status: 500 });
  }
} 