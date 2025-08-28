'use client'

import { useState } from 'react'
import { X, ThumbsUp, ThumbsDown } from 'lucide-react'
import { analytics } from '@/lib/analytics'

interface MicroSurveyProps {
  trigger: string
  onClose: () => void
  onSubmit: () => void
}

export function MicroSurvey({ trigger, onClose, onSubmit }: MicroSurveyProps) {
  const [rating, setRating] = useState<'positive' | 'negative' | null>(null)
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit() {
    if (rating === null) return

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'MICRO_SURVEY',
          content: feedback || `User rated: ${rating}`,
          rating: rating === 'positive' ? 5 : 2,
          sentiment: rating,
        }),
      })

      if (response.ok) {
        await analytics.feedbackSubmitted(
          'micro_survey',
          feedback.length,
          rating === 'positive' ? 5 : 2
        )
        
        setSubmitted(true)
        setTimeout(() => {
          onSubmit()
        }, 2000)
      }
    } catch (error) {
      console.error('Failed to submit micro survey:', error)
    }
  }

  if (submitted) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border max-w-sm z-50">
        <div className="text-center">
          <div className="text-green-600 text-2xl mb-2">✓</div>
          <p className="font-medium">Thank you for your feedback!</p>
          <p className="text-sm text-gray-600">This helps us improve the app.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border max-w-sm z-50">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium">Quick feedback</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        How was your experience creating checklists?
      </p>
      
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setRating('positive')}
          className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
            rating === 'positive'
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-200 hover:border-green-300'
          }`}
        >
          <ThumbsUp className="w-5 h-5" />
          Good
        </button>
        <button
          onClick={() => setRating('negative')}
          className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
            rating === 'negative'
              ? 'border-red-500 bg-red-50 text-red-700'
              : 'border-gray-200 hover:border-red-300'
          }`}
        >
          <ThumbsDown className="w-5 h-5" />
          Could be better
        </button>
      </div>
      
      {rating && (
        <div className="space-y-3">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Any specific thoughts? (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
            rows={2}
          />
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm"
          >
            Submit Feedback
          </button>
        </div>
      )}
    </div>
  )
}