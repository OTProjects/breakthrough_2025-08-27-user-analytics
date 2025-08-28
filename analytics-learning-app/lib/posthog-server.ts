import { PostHog } from 'posthog-node'

let posthog: PostHog | null = null

export function getPostHogClient() {
  if (!posthog) {
    const key = process.env.POSTHOG_PROJECT_API_KEY
    if (!key) {
      console.warn('PostHog server API key not configured')
      return null
    }
    
    posthog = new PostHog(key, {
      host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
    })
  }
  return posthog
}

export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, any>
) {
  const client = getPostHogClient()
  if (!client) return
  
  client.capture({
    distinctId,
    event,
    properties: {
      ...properties,
      $lib: 'analytics-learning-app-server',
    },
  })
}