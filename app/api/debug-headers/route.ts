import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET() {
  try {
    const headersList = await headers()
    const allHeaders = Object.fromEntries(headersList.entries())
    
    console.log('🔍 Debug: All request headers:', allHeaders)
    
    return NextResponse.json({
      headers: allHeaders,
      userId: headersList.get('user-id'),
      hasUserIdHeader: !!headersList.get('user-id')
    })
  } catch (error) {
    console.error('Debug headers error:', error)
    return NextResponse.json({ error: 'Error reading headers' }, { status: 500 })
  }
} 