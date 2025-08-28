'use client'

import { useState, useEffect } from 'react'
import posthog from '@/lib/posthog-client'

export function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('analytics_consent')
    const dnt = navigator.doNotTrack === '1'
    
    if (consent === null && !dnt) {
      setShowBanner(true)
    }
    setIsLoading(false)
  }, [])

  const handleAccept = () => {
    localStorage.setItem('analytics_consent', 'true')
    
    // Enable session recording
    if (posthog) {
      posthog.startSessionRecording()
      posthog.capture('consent_granted', {
        consent_type: 'full',
        timestamp: new Date().toISOString(),
      })
    }
    
    setShowBanner(false)
  }

  const handleDecline = () => {
    localStorage.setItem('analytics_consent', 'false')
    
    if (posthog) {
      posthog.capture('consent_declined', {
        timestamp: new Date().toISOString(),
      })
    }
    
    setShowBanner(false)
  }

  if (isLoading || !showBanner) {
    return null
  }

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-50">
      <div className="card card-content border-l-4 border-l-accent">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">Analytics & Learning</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We collect anonymized usage data to demonstrate analytics concepts. Session recordings require your consent.
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            className="btn-secondary text-sm flex-1"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="btn-primary text-sm flex-1"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  )
}