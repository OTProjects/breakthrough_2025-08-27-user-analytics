'use client'

import { useState, useEffect } from 'react'
import { Plus, Check, Share2, Trash2, CheckSquare, Sparkles } from 'lucide-react'
import { track } from '@/lib/analytics'
import { getExperimentVariant } from '@/lib/flags'
import { useUser } from '@/hooks/use-user'
import { useToast } from '@/components/toast'

interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

interface Checklist {
  id: string
  title: string
  description?: string
  items: ChecklistItem[]
  completed: boolean
  createdAt: Date
}

export default function ChecklistsPage() {
  const { userId } = useUser()
  const { showToast } = useToast()
  const [checklists, setChecklists] = useState<Checklist[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [experimentVariant, setExperimentVariant] = useState<'control' | 'treatment'>('control')
  
  // New checklist form state
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newItems, setNewItems] = useState([''])

  useEffect(() => {
    loadChecklists()
    determineExperimentVariant()
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadChecklists() {
    try {
      const response = await fetch('/api/checklists')
      if (response.ok) {
        const data = await response.json()
        setChecklists(data)
      }
    } catch (error) {
      console.error('Failed to load checklists:', error)
    }
  }

  async function determineExperimentVariant() {
    if (!userId) return
    
    try {
      const variant = await getExperimentVariant('smart_hints', userId)
      setExperimentVariant(variant)
    } catch (error) {
      console.error('Failed to get experiment variant:', error)
    }
  }

  async function createChecklist() {
    if (!newTitle.trim()) return

    const validItems = newItems.filter(item => item.trim())
    if (validItems.length === 0) return

    try {
      const response = await fetch('/api/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription || undefined,
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

        // Reset form
        setNewTitle('')
        setNewDescription('')
        setNewItems([''])
        setShowCreateForm(false)
        
        // Show success toast
        showToast({
          type: 'success',
          title: 'Checklist Created!',
          message: `"${newChecklist.title}" is ready to go`,
        })
      }
    } catch (error) {
      console.error('Failed to create checklist:', error)
      showToast({
        type: 'error',
        title: 'Failed to Create Checklist',
        message: 'Please try again',
      })
    }
  }

  async function toggleItem(checklistId: string, itemId: string) {
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
    }
  }

  async function shareChecklist(checklist: Checklist) {
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

  function addNewItem() {
    setNewItems(prev => [...prev, ''])
  }

  function updateNewItem(index: number, value: string) {
    setNewItems(prev => prev.map((item, i) => i === index ? value : item))
  }

  function removeNewItem(index: number) {
    setNewItems(prev => prev.filter((_, i) => i !== index))
  }

  const SmartHint = ({ children }: { children: React.ReactNode }) => {
    if (experimentVariant !== 'treatment') return null
    
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-indigo-100/20 animate-pulse"></div>
        <div className="flex items-start gap-3 relative z-10">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Smart Hint</span>
              <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
              <span className="text-xs text-blue-600">A/B Test Active</span>
            </div>
            <p className="text-sm text-blue-800 leading-relaxed">{children}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Checklists</h1>
            <p className="text-muted-foreground">Organize your tasks and track your productivity</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Checklist
          </button>
        </div>

        {showCreateForm && (
          <div className="card card-content mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">Create New Checklist</h2>
            
            <SmartHint>
              Tip: Break down big tasks into smaller, actionable steps for better completion rates!
            </SmartHint>
            
            <div className="space-y-6">
              <div>
                <label className="label">
                  Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input w-full"
                  placeholder="What needs to be done?"
                />
              </div>
              
              <div>
                <label className="label">
                  Description (optional)
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="textarea w-full"
                  rows={2}
                  placeholder="Additional context or notes..."
                />
              </div>
              
              <div>
                <label className="label">
                  Items *
                </label>
                <div className="space-y-2">
                  {newItems.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateNewItem(index, e.target.value)}
                        className="input flex-1"
                        placeholder={`Item ${index + 1}`}
                      />
                      {newItems.length > 1 && (
                        <button
                          onClick={() => removeNewItem(index)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addNewItem}
                  className="mt-3 text-accent hover:text-accent/80 text-sm font-medium transition-colors"
                >
                  + Add another item
                </button>
              </div>
              
              <div className="flex gap-3 pt-6 border-t border-border">
                <button
                  onClick={createChecklist}
                  disabled={!newTitle.trim() || newItems.filter(i => i.trim()).length === 0}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Checklist
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {checklists.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl text-center py-16 px-6">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-gray-900 text-lg font-semibold mb-2">No checklists yet</h3>
              <p className="text-gray-600">Create your first checklist to get started with tracking your tasks.</p>
            </div>
          ) : (
            checklists.map((checklist) => (
              <div
                key={checklist.id}
                className={`card card-content transition-all duration-200 hover:shadow-lg ${
                  checklist.completed ? 'border-l-4 border-l-success bg-success/5' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-xl font-semibold transition-colors ${
                        checklist.completed ? 'text-success line-through' : 'text-foreground'
                      }`}>
                        {checklist.title}
                      </h3>
                      {checklist.completed && (
                        <span className="badge-success text-xs">Completed</span>
                      )}
                    </div>
                    {checklist.description && (
                      <p className="text-muted-foreground text-sm">{checklist.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => shareChecklist(checklist)}
                      className="btn-ghost p-2 h-auto w-auto"
                      title="Share checklist"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {checklist.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-accent/5 transition-colors">
                      <button
                        onClick={() => toggleItem(checklist.id, item.id)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          item.completed
                            ? 'bg-success border-success text-white'
                            : 'border-border hover:border-success hover:bg-success/5'
                        }`}
                      >
                        {item.completed && <Check className="w-3 h-3" />}
                      </button>
                      <span
                        className={`flex-1 text-sm transition-colors ${
                          item.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                        }`}
                      >
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-foreground">
                      {checklist.items.filter(i => i.completed).length} of {checklist.items.length} completed
                    </div>
                    <div className="flex-1 bg-border rounded-full h-1.5 min-w-[100px]">
                      <div 
                        className="bg-success h-1.5 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(checklist.items.filter(i => i.completed).length / checklist.items.length) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Created {new Date(checklist.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}