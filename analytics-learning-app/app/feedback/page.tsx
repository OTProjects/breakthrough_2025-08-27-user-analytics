'use client'

import { useState } from 'react'
import { MessageCircle, Bug, Star, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { BugReportForm } from '@/components/feedback/bug-report-form'
import { NPSModal } from '@/components/feedback/nps-modal'
import { analytics } from '@/lib/analytics'

export default function FeedbackPage() {
  const [showBugReport, setShowBugReport] = useState(false)
  const [showNPS, setShowNPS] = useState(false)
  const [generalFeedback, setGeneralFeedback] = useState('')
  const [isSubmittingGeneral, setIsSubmittingGeneral] = useState(false)
  const [generalSubmitted, setGeneralSubmitted] = useState(false)

  async function handleGeneralSubmit() {
    if (!generalFeedback.trim()) return
    
    setIsSubmittingGeneral(true)
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'GENERAL',
          content: generalFeedback,
          url: window.location.href,
        }),
      })

      if (response.ok) {
        await analytics.feedbackSubmitted(
          'general',
          generalFeedback.length
        )
        
        setGeneralSubmitted(true)
        setTimeout(() => {
          setGeneralFeedback('')
          setGeneralSubmitted(false)
        }, 3000)
      }
    } catch (error) {
      console.error('Failed to submit general feedback:', error)
    } finally {
      setIsSubmittingGeneral(false)
    }
  }

  function handleBugReportClick() {
    analytics.feedbackOpened('bug_report', 'feedback_page')
    setShowBugReport(true)
  }

  function handleNPSClick() {
    analytics.feedbackOpened('nps', 'feedback_page')
    setShowNPS(true)
  }

  function handleGeneralClick() {
    analytics.feedbackOpened('general', 'feedback_page')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/" 
            className="btn-ghost text-sm h-auto px-3 py-2"
            aria-label="Return to home page"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-h2 text-foreground mb-4">
            We'd Love Your Feedback
          </h1>
          <p className="text-large text-muted-foreground max-w-2xl mx-auto">
            Help us improve the Analytics Learning App by sharing your thoughts, 
            reporting bugs, or rating your experience.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="card card-content text-center group hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">General Feedback</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Share your thoughts on how we can improve the app.
            </p>
            <button
              onClick={handleGeneralClick}
              className="btn-primary w-full"
              aria-describedby="general-feedback-desc"
            >
              Give Feedback
            </button>
            <p id="general-feedback-desc" className="sr-only">
              Open general feedback form to share your thoughts and suggestions
            </p>
          </div>
          
          <div className="card card-content text-center group hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-destructive/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-destructive/20 transition-colors">
              <Bug className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Report a Bug</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Found something broken? Let us know with details.
            </p>
            <button
              onClick={handleBugReportClick}
              className="btn-destructive w-full"
              aria-describedby="bug-report-desc"
            >
              Report Bug
            </button>
            <p id="bug-report-desc" className="sr-only">
              Open bug report form to report technical issues and problems
            </p>
          </div>
          
          <div className="card card-content text-center group hover:shadow-xl transition-all duration-300 sm:col-span-2 lg:col-span-1">
            <div className="w-16 h-16 bg-warning/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-warning/20 transition-colors">
              <Star className="w-8 h-8 text-warning" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Rate the App</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              How likely are you to recommend this app?
            </p>
            <button
              onClick={handleNPSClick}
              className="bg-warning text-warning-foreground hover:bg-warning/90 btn btn-default w-full"
              aria-describedby="nps-rating-desc"
            >
              Rate Now
            </button>
            <p id="nps-rating-desc" className="sr-only">
              Open Net Promoter Score rating form to rate your experience
            </p>
          </div>
        </div>
        
        <div className="card card-content">
          <h2 className="text-xl font-semibold text-foreground mb-6">Quick Feedback</h2>
          
          {generalSubmitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-large font-medium text-foreground mb-2">Thank you for your feedback!</h3>
              <p className="text-muted-foreground">We really appreciate you taking the time to help us improve.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label htmlFor="general-feedback-textarea" className="label">
                  Your feedback
                </label>
                <textarea
                  id="general-feedback-textarea"
                  value={generalFeedback}
                  onChange={(e) => setGeneralFeedback(e.target.value)}
                  className="textarea w-full"
                  rows={4}
                  placeholder="What's on your mind? Suggestions, compliments, or areas for improvement..."
                  aria-describedby="feedback-char-count"
                  maxLength={1000}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span 
                  id="feedback-char-count"
                  className="text-small"
                  aria-live="polite"
                >
                  {generalFeedback.length}/1000 characters
                </span>
                <button
                  onClick={handleGeneralSubmit}
                  disabled={!generalFeedback.trim() || isSubmittingGeneral || generalFeedback.length > 1000}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-describedby="submit-feedback-desc"
                >
                  {isSubmittingGeneral ? 'Submitting...' : 'Submit'}
                </button>
                <p id="submit-feedback-desc" className="sr-only">
                  Submit your general feedback to help us improve the application
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {showBugReport && (
        <BugReportForm onClose={() => setShowBugReport(false)} />
      )}
      
      {showNPS && (
        <NPSModal 
          onClose={() => setShowNPS(false)}
          onSubmit={() => setShowNPS(false)}
        />
      )}
    </div>
  )
}