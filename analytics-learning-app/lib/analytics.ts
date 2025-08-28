import { z } from 'zod'
import posthog from '@/lib/posthog-client'
// Import db only when needed on server-side
// import { db } from '@/lib/db'

// Event schemas based on event_schema.json
const eventSchemas = {
  app_open: z.object({
    user_agent: z.string(),
    referrer: z.string().optional(),
    timestamp: z.string(),
  }),
  page_view: z.object({
    page: z.string(),
    title: z.string(),
    url: z.string(),
  }),
  signup: z.object({
    method: z.string(),
    user_id: z.string(),
  }),
  login: z.object({
    method: z.string(),
    user_id: z.string(),
  }),
  checklist_create: z.object({
    checklist_id: z.string(),
    title: z.string(),
    items_count: z.number(),
    experiment_variant: z.string().optional(),
  }),
  checklist_complete: z.object({
    checklist_id: z.string(),
    title: z.string(),
    items_count: z.number(),
    completion_time_ms: z.number(),
    experiment_variant: z.string().optional(),
  }),
  checklist_share: z.object({
    checklist_id: z.string(),
    share_method: z.string(),
  }),
  cta_click: z.object({
    cta_text: z.string(),
    cta_location: z.string(),
    target_page: z.string().optional(),
  }),
  error: z.object({
    error_type: z.string(),
    error_message: z.string(),
    stack_trace: z.string().optional(),
    page: z.string(),
  }),
  feedback_opened: z.object({
    feedback_type: z.string(),
    trigger: z.string(),
  }),
  feedback_submitted: z.object({
    feedback_type: z.string(),
    rating: z.number().optional(),
    has_screenshot: z.boolean().optional(),
    content_length: z.number(),
  }),
  nps_shown: z.object({
    trigger: z.string(),
    user_segment: z.string().optional(),
  }),
  nps_scored: z.object({
    score: z.number(),
    category: z.string(),
    followup_comment: z.boolean(),
  }),
} as const

export type EventName = keyof typeof eventSchemas
export type EventProperties<T extends EventName> = z.infer<typeof eventSchemas[T]>

// Get or create anonymous user ID
function getAnonymousId(): string {
  if (typeof window === 'undefined') return 'anonymous'
  
  let anonymousId = localStorage.getItem('anonymous_id')
  if (!anonymousId) {
    anonymousId = `anon_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('anonymous_id', anonymousId)
  }
  return anonymousId
}

// Get current session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return 'session_unknown'
  
  let sessionId = sessionStorage.getItem('session_id')
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    sessionStorage.setItem('session_id', sessionId)
  }
  return sessionId
}

// Check if user has consented to analytics
function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('analytics_consent') === 'true'
}

// Check Do Not Track
function shouldRespectDNT(): boolean {
  if (typeof window === 'undefined') return true
  return navigator.doNotTrack === '1'
}

// Main tracking function with type safety
export async function track<T extends EventName>(
  eventName: T,
  properties: EventProperties<T>,
  userId?: string
) {
  // Respect privacy settings
  if (shouldRespectDNT() && !hasAnalyticsConsent()) {
    console.log('Analytics disabled due to DNT or lack of consent')
    return
  }

  // Validate event properties
  try {
    const schema = eventSchemas[eventName]
    const validatedProps = schema.parse(properties)
    
    const anonymousId = getAnonymousId()
    const sessionId = getSessionId()
    
    // Add standard properties
    const enrichedProps = {
      ...validatedProps,
      $session_id: sessionId,
      $lib: 'analytics-learning-app',
      timestamp: new Date().toISOString(),
    }

    // Send to PostHog (if configured)
    if (posthog && hasAnalyticsConsent()) {
      posthog.capture(eventName, enrichedProps)
    }

    // Store locally in our database (server-side only)
    if (typeof window === 'undefined') {
      try {
        const { db } = await import('@/lib/db')
        await db.event.create({
          data: {
            name: eventName,
            properties: JSON.stringify(enrichedProps),
            sessionId,
            userId: userId || anonymousId,
            timestamp: new Date(),
          },
        })
      } catch (error) {
        console.error('Failed to store event locally:', error)
      }
    } else {
      // For browser environments, send to an API endpoint instead
      try {
        await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: eventName,
            properties: enrichedProps,
            sessionId,
            userId: userId || anonymousId,
            timestamp: new Date().toISOString(),
          }),
        })
      } catch (error) {
        console.error('Failed to send event to server:', error)
      }
    }
    
  } catch (error) {
    console.error('Invalid event properties:', error)
    
    // Track the validation error
    await track('error', {
      error_type: 'EventValidationError',
      error_message: error instanceof Error ? error.message : 'Unknown validation error',
      page: window.location.pathname,
    })
  }
}

// Convenience functions for common events
export const analytics = {
  pageView: (page: string, title: string) =>
    track('page_view', { page, title, url: window.location.href }),
    
  ctaClick: (text: string, location: string, targetPage?: string) =>
    track('cta_click', { cta_text: text, cta_location: location, target_page: targetPage }),
    
  error: (errorType: string, message: string, stackTrace?: string) =>
    track('error', {
      error_type: errorType,
      error_message: message,
      stack_trace: stackTrace,
      page: window.location.pathname,
    }),
    
  feedbackOpened: (type: string, trigger: string) =>
    track('feedback_opened', { feedback_type: type, trigger }),
    
  feedbackSubmitted: (type: string, contentLength: number, rating?: number, hasScreenshot?: boolean) =>
    track('feedback_submitted', {
      feedback_type: type,
      content_length: contentLength,
      rating,
      has_screenshot: hasScreenshot,
    }),
}

// Initialize analytics on app start
export function initializeAnalytics() {
  if (typeof window === 'undefined') return
  
  // Track app open
  track('app_open', {
    user_agent: navigator.userAgent,
    referrer: document.referrer || undefined,
    timestamp: new Date().toISOString(),
  })
  
  // Set up error tracking
  window.addEventListener('error', (event) => {
    analytics.error('JavaScriptError', event.message, event.error?.stack)
  })
  
  window.addEventListener('unhandledrejection', (event) => {
    analytics.error('UnhandledPromiseRejection', event.reason?.toString() || 'Unknown promise rejection')
  })
}