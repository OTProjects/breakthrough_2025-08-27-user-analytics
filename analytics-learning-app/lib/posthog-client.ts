'use client'

import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false, // We'll handle this manually
    capture_pageleave: true,
    disable_session_recording: true, // Start disabled, enable with consent
  })
}

export default posthog