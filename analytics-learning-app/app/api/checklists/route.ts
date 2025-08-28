import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const checklists = await db.checklist.findMany({
      include: {
        items: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(checklists)
  } catch (error) {
    console.error('Failed to fetch checklists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch checklists' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, items } = body

    if (!title || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Title and items are required' },
        { status: 400 }
      )
    }

    // Get user ID from header or create anonymous user
    const userId = request.headers.get('x-user-id') || 'anonymous'

    // Create or get user
    const user = await db.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId }
    })

    // Create checklist with items
    const checklist = await db.checklist.create({
      data: {
        title,
        description,
        userId: user.id,
        items: {
          create: items.map((text: string, index: number) => ({
            text,
            order: index,
          }))
        }
      },
      include: {
        items: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json(checklist)
  } catch (error) {
    console.error('Failed to create checklist:', error)
    return NextResponse.json(
      { error: 'Failed to create checklist' },
      { status: 500 }
    )
  }
}