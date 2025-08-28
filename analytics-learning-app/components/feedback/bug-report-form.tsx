'use client'

import { useState } from 'react'
import { Camera, X } from 'lucide-react'
import html2canvas from 'html2canvas'
import { analytics } from '@/lib/analytics'

interface BugReportFormProps {
  onClose: () => void
}

export function BugReportForm({ onClose }: BugReportFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function captureScreenshot() {
    setIsCapturing(true)
    try {
      // Hide this modal temporarily
      const modal = document.querySelector('[data-bug-report-modal]') as HTMLElement
      if (modal) modal.style.display = 'none'
      
      await new Promise(resolve => setTimeout(resolve, 100)) // Brief delay
      
      const canvas = await html2canvas(document.body, {
        height: window.innerHeight,
        width: window.innerWidth,
        useCORS: true,
      })
      
      const imageData = canvas.toDataURL('image/png')
      setScreenshot(imageData)
      
      // Show modal again
      if (modal) modal.style.display = 'block'
    } catch (error) {
      console.error('Failed to capture screenshot:', error)
    } finally {
      setIsCapturing(false)
    }
  }

  function getConsoleErrors(): any[] {
    // In a real app, you'd want to set up a console error logger
    // For now, we'll return a mock error if available
    return []
  }

  async function handleSubmit() {
    if (!title.trim() || !description.trim()) return
    
    setIsSubmitting(true)
    
    try {
      const consoleErrors = getConsoleErrors()
      
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'BUG_REPORT',
          content: `${title}\n\n${description}`,
          screenshot: screenshot || undefined,
          userAgent: navigator.userAgent,
          url: window.location.href,
          consoleErrors: consoleErrors.length > 0 ? JSON.stringify(consoleErrors) : undefined,
        }),
      })

      if (response.ok) {
        await analytics.feedbackSubmitted(
          'bug_report',
          title.length + description.length,
          undefined,
          !!screenshot
        )
        
        setSubmitted(true)
        setTimeout(() => {
          onClose()
        }, 3000)
      }
    } catch (error) {
      console.error('Failed to submit bug report:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
        <div className="card card-content max-w-md w-full text-center">
          <div className="w-16 h-16 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-3">Bug Report Submitted!</h3>
          <p className="text-muted-foreground">
            Thank you for helping us improve the app. We'll look into this issue.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      data-bug-report-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="bug-report-title"
    >
      <div className="card card-content max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 id="bug-report-title" className="text-xl font-semibold text-foreground">Report a Bug</h3>
          <button 
            onClick={onClose} 
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Close bug report form"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
          <div>
            <label htmlFor="issue-title" className="label">
              Issue Title *
            </label>
            <input
              id="issue-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input w-full"
              placeholder="Brief description of the issue"
              required
              aria-required="true"
            />
          </div>
          
          <div>
            <label htmlFor="issue-description" className="label">
              Description *
            </label>
            <textarea
              id="issue-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea w-full"
              rows={4}
              placeholder="Please describe what happened, what you expected, and steps to reproduce..."
              required
              aria-required="true"
            />
          </div>
          
          <div>
            <label className="label">
              Screenshot (optional)
            </label>
            {screenshot ? (
              <div className="space-y-2">
                <img 
                  src={screenshot} 
                  alt="Screenshot" 
                  className="w-full h-32 object-cover border rounded-md"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={captureScreenshot}
                    disabled={isCapturing}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Retake Screenshot
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreenshot(null)}
                    className="text-sm text-destructive hover:text-destructive/80 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={captureScreenshot}
                disabled={isCapturing}
                className="w-full py-3 px-4 border border-dashed border-border rounded-lg flex items-center justify-center gap-2 hover:border-border/60 disabled:opacity-50 transition-colors bg-background hover:bg-accent/5"
                aria-label="Capture screenshot of current page"
              >
                <Camera className="w-4 h-4" />
                {isCapturing ? 'Capturing...' : 'Capture Screenshot'}
              </button>
            )}
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg text-small text-muted-foreground">
            <p className="font-medium text-foreground mb-2">What we'll collect:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Your browser info: {navigator.userAgent.split(' ')[0]}</li>
              <li>Current page: {window.location.pathname}</li>
              <li>Screenshot (if provided)</li>
              <li>No personal information</li>
            </ul>
          </div>
          
          <div className="flex gap-3 pt-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !description.trim() || isSubmitting}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Bug Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}