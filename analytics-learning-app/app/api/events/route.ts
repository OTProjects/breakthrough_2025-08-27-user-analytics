import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { name, properties, sessionId, userId, timestamp } = await request.json()
    
    await db.event.create({
      data: {
        name,
        properties: JSON.stringify(properties),
        sessionId,
        userId,
        timestamp: new Date(timestamp),
      },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to store event:', error)
    return NextResponse.json(
      { error: 'Failed to store event' },
      { status: 500 }
    )
  }
}