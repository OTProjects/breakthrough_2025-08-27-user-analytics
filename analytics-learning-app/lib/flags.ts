import posthog from '@/lib/posthog-client'
import { db } from '@/lib/db'

export type ExperimentVariant = 'control' | 'treatment'

// Local fallback for when PostHog is not available
const localFlags: Record<string, boolean> = {
  smart_hints: true, // Default to ON for local development
}

// Get user's experiment variant with consistent assignment
export async function getExperimentVariant(
  experimentId: string,
  userId: string
): Promise<ExperimentVariant> {
  try {
    // First check if user already has an assignment in our DB
    const existing = await db.experimentVariant.findUnique({
      where: {
        experimentId_userId: {
          experimentId,
          userId,
        },
      },
    })
    
    if (existing) {
      return existing.variant as ExperimentVariant
    }
    
    // If PostHog is available, use it for assignment
    // Note: In a real app, you'd use proper PostHog SDK methods here
    if (posthog) {
      // Simplified for demo - use local assignment
      const hash = simpleHash(userId + experimentId)
      const variant = hash % 2 === 0 ? 'control' : 'treatment'
      
      // Store the assignment in our DB for consistency
      await db.experimentVariant.create({
        data: {
          experimentId,
          userId,
          variant,
        },
      })
      
      return variant
    }
    
    // Fallback to local assignment based on user ID hash
    const hash = simpleHash(userId + experimentId)
    const variant = hash % 2 === 0 ? 'control' : 'treatment'
    
    await db.experimentVariant.create({
      data: {
        experimentId,
        userId,
        variant,
      },
    })
    
    return variant
    
  } catch (error) {
    console.error('Error getting experiment variant:', error)
    // Default to control on error
    return 'control'
  }
}

// Simple hash function for consistent assignment
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

// Check if a feature flag is enabled
export async function isFeatureEnabled(
  flagName: string,
  userId?: string
): Promise<boolean> {
  try {
    // Note: In a real app, you'd use proper PostHog SDK methods here
    // For demo purposes, we use local flags
    return localFlags[flagName] ?? false
    
  } catch (error) {
    console.error('Error checking feature flag:', error)
    return localFlags[flagName] ?? false
  }
}

// Client-side feature flag hook (for React components)
export function useFeatureFlag(flagName: string, defaultValue = false) {
  // This would typically use PostHog's React hooks in a real app
  // For simplicity, we'll return the local default
  return localFlags[flagName] ?? defaultValue
}

// Toggle local flag (for admin/testing purposes)
export function toggleLocalFlag(flagName: string) {
  localFlags[flagName] = !localFlags[flagName]
  console.log(`Flag ${flagName} toggled to:`, localFlags[flagName])
}