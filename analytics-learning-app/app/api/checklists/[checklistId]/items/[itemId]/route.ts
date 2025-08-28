import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { checklistId: string; itemId: string } }
) {
  try {
    const { checklistId, itemId } = params

    // Toggle the item completion status
    const currentItem = await db.checklistItem.findUnique({
      where: { id: itemId }
    })

    if (!currentItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    const updatedItem = await db.checklistItem.update({
      where: { id: itemId },
      data: {
        completed: !currentItem.completed,
        completedAt: !currentItem.completed ? new Date() : null,
      }
    })

    // Check if all items in the checklist are completed
    const allItems = await db.checklistItem.findMany({
      where: { checklistId }
    })

    const allCompleted = allItems.every(item => 
      item.id === itemId ? updatedItem.completed : item.completed
    )

    // Update checklist completion status if needed
    if (allCompleted) {
      await db.checklist.update({
        where: { id: checklistId },
        data: {
          completed: true,
          completedAt: new Date(),
        }
      })
    } else if (currentItem.completed && !updatedItem.completed) {
      // If we're unchecking an item, mark checklist as incomplete
      await db.checklist.update({
        where: { id: checklistId },
        data: {
          completed: false,
          completedAt: null,
        }
      })
    }

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Failed to update item:', error)
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    )
  }
}