import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      type, 
      content, 
      rating, 
      screenshot, 
      userAgent, 
      url, 
      consoleErrors, 
      sentiment 
    } = body

    if (!type || !content) {
      return NextResponse.json(
        { error: 'Type and content are required' },
        { status: 400 }
      )
    }

    // Get user ID from header or use anonymous
    const userId = request.headers.get('x-user-id') || 'anonymous'

    // Create or get user
    const user = await db.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId }
    })

    // Create feedback entry
    const feedback = await db.feedback.create({
      data: {
        type,
        content,
        rating,
        screenshot,
        userAgent,
        url,
        consoleErrors,
        sentiment,
        userId: user.id,
      }
    })

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Failed to create feedback:', error)
    return NextResponse.json(
      { error: 'Failed to create feedback' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const feedback = await db.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            createdAt: true,
          }
        }
      }
    })

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Failed to fetch feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}