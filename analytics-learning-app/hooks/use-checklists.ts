'use client'

import { useState, useEffect } from 'react'
import { track } from '@/lib/analytics'
import { useToast } from '@/components/toast'

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

export interface Checklist {
  id: string
  title: string
  description?: string
  items: ChecklistItem[]
  completed: boolean
  createdAt: Date
}

export function useChecklists() {
  const [checklists, setChecklists] = useState<Checklist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()

  const loadChecklists = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/checklists')
      if (response.ok) {
        const data = await response.json()
        setChecklists(data)
      } else {
        throw new Error('Failed to load checklists')
      }
    } catch (error) {
      console.error('Failed to load checklists:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
      showToast({
        type: 'error',
        title: 'Failed to Load Checklists',
        message: 'Please refresh the page to try again',
      })
    } finally {
      setLoading(false)
    }
  }

  const createChecklist = async (
    title: string,
    description: string,
    items: string[],
    experimentVariant: 'control' | 'treatment'
  ) => {
    try {
      const validItems = items.filter(item => item.trim())
      if (!title.trim() || validItems.length === 0) {
        return null
      }

      const response = await fetch('/api/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          items: validItems,
        }),
      })

      if (response.ok) {
        const newChecklist = await response.json()
        setChecklists(prev => [newChecklist, ...prev])
        
        // Track checklist creation
        await track('checklist_create', {
          checklist_id: newChecklist.id,
          title: newChecklist.title,
          items_count: validItems.length,
          experiment_variant: experimentVariant,
        })

        // Show success toast
        showToast({
          type: 'success',
          title: 'Checklist Created!',
          message: `"${newChecklist.title}" is ready to go`,
        })

        return newChecklist
      } else {
        throw new Error('Failed to create checklist')
      }
    } catch (error) {
      console.error('Failed to create checklist:', error)
      showToast({
        type: 'error',
        title: 'Failed to Create Checklist',
        message: 'Please try again',
      })
      return null
    }
  }

  const toggleItem = async (
    checklistId: string,
    itemId: string,
    experimentVariant: 'control' | 'treatment'
  ) => {
    try {
      const response = await fetch(`/api/checklists/${checklistId}/items/${itemId}`, {
        method: 'PATCH',
      })

      if (response.ok) {
        const updatedItem = await response.json()
        
        setChecklists(prev => prev.map(checklist => {
          if (checklist.id === checklistId) {
            const updatedItems = checklist.items.map(item =>
              item.id === itemId ? { ...item, completed: updatedItem.completed } : item
            )
            
            const allCompleted = updatedItems.every(item => item.completed)
            
            // Check if checklist just became complete
            if (allCompleted && !checklist.completed) {
              const completionTime = Date.now() - checklist.createdAt.getTime()
              
              // Track checklist completion
              track('checklist_complete', {
                checklist_id: checklistId,
                title: checklist.title,
                items_count: updatedItems.length,
                completion_time_ms: completionTime,
                experiment_variant: experimentVariant,
              })
              
              // Show completion celebration
              showToast({
                type: 'success',
                title: '🎉 Checklist Complete!',
                message: `Great job finishing "${checklist.title}"`,
              })
            }
            
            return {
              ...checklist,
              items: updatedItems,
              completed: allCompleted,
            }
          }
          return checklist
        }))
      }
    } catch (error) {
      console.error('Failed to toggle item:', error)
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not update checklist item',
      })
    }
  }

  const shareChecklist = async (checklist: Checklist) => {
    const url = `${window.location.origin}/checklists/shared/${checklist.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: checklist.title,
          text: `Check out my checklist: ${checklist.title}`,
          url: url,
        })
        
        await track('checklist_share', {
          checklist_id: checklist.id,
          share_method: 'native_share',
        })
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url)
        showToast({
          type: 'success',
          title: 'Link Copied!',
          message: 'Share link copied to clipboard',
        })
        
        await track('checklist_share', {
          checklist_id: checklist.id,
          share_method: 'clipboard',
        })
      } catch (error) {
        console.error('Failed to copy link:', error)
        showToast({
          type: 'error',
          title: 'Share Failed',
          message: 'Could not copy link to clipboard',
        })
      }
    }
  }

  useEffect(() => {
    loadChecklists()
  }, [])

  return {
    checklists,
    loading,
    error,
    createChecklist,
    toggleItem,
    shareChecklist,
    refreshChecklists: loadChecklists,
  }
}