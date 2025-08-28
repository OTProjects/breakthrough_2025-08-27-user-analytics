'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { track, analytics } from '@/lib/analytics'

interface NPSModalProps {
  onClose: () => void
  onSubmit: () => void
}

export function NPSModal({ onClose, onSubmit }: NPSModalProps) {
  const [score, setScore] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function getScoreCategory(score: number): string {
    if (score >= 9) return 'promoter'
    if (score >= 7) return 'passive'
    return 'detractor'
  }

  function getScoreColor(scoreValue: number, selectedScore: number | null): string {
    if (selectedScore === null) return 'bg-gray-100 hover:bg-gray-200'
    if (scoreValue === selectedScore) {
      if (scoreValue >= 9) return 'bg-green-500 text-white'
      if (scoreValue >= 7) return 'bg-yellow-500 text-white'
      return 'bg-red-500 text-white'
    }
    return 'bg-gray-100'
  }

  async function handleSubmit() {
    if (score === null) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'NPS',
          content: comment || `NPS Score: ${score}`,
          rating: score,
          sentiment: getScoreCategory(score),
        }),
      })

      if (response.ok) {
        // Track NPS score
        await track('nps_scored', {
          score,
          category: getScoreCategory(score),
          followup_comment: comment.length > 0,
        })
        
        await analytics.feedbackSubmitted(
          'nps',
          comment.length,
          score
        )
        
        setSubmitted(true)
        
        // Store that user has seen NPS recently
        localStorage.setItem('nps_last_shown', new Date().toISOString())
        
        setTimeout(() => {
          onSubmit()
        }, 3000)
      }
    } catch (error) {
      console.error('Failed to submit NPS:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
          <div className="text-green-600 text-4xl mb-4">🙏</div>
          <h3 className="text-xl font-semibold mb-2">Thank you!</h3>
          <p className="text-gray-600 mb-4">
            Your feedback helps us understand how to improve the Analytics Learning App.
          </p>
          {score !== null && score >= 9 && (
            <p className="text-sm text-blue-600">
              We'd love to hear what you enjoyed most!
            </p>
          )}
          {score !== null && score <= 6 && (
            <p className="text-sm text-orange-600">
              We'll work on addressing the areas that need improvement.
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Quick Question</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          How likely are you to recommend this Analytics Learning App to a friend or colleague?
        </p>
        
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Not at all likely</span>
            <span>Extremely likely</span>
          </div>
          <div className="grid grid-cols-11 gap-1">
            {Array.from({ length: 11 }, (_, i) => i).map((num) => (
              <button
                key={num}
                onClick={() => setScore(num)}
                className={`aspect-square rounded text-sm font-medium transition-colors ${getScoreColor(num, score)}`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
        
        {score !== null && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's the main reason for your score? (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                rows={3}
                placeholder="Your feedback helps us improve..."
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Skip
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}