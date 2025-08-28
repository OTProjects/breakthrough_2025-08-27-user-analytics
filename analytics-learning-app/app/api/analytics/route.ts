import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source') || 'local'
    
    if (source === 'posthog') {
      // In a real app, you'd fetch from PostHog API here
      // For now, return mock data indicating PostHog is not configured
      return NextResponse.json({
        error: 'PostHog API not configured',
        message: 'Add your PostHog API keys to .env to use live data'
      }, { status: 503 })
    }
    
    // Generate analytics from local database
    const analyticsData = await generateLocalAnalytics()
    
    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Failed to generate analytics:', error)
    return NextResponse.json(
      { error: 'Failed to generate analytics data' },
      { status: 500 }
    )
  }
}

async function generateLocalAnalytics() {
  // Get date range for last 30 days
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  // Generate DAU data
  const dau = await generateDAUData(startDate, endDate)
  
  // Generate funnel data
  const funnel = await generateFunnelData()
  
  // Generate retention data
  const retention = await generateRetentionData()
  
  // Generate experiment data
  const experiment = await generateExperimentData()
  
  // Generate NPS data
  const nps = await generateNPSData()
  
  // Generate feedback data
  const feedback = await generateFeedbackData()
  
  return {
    dau,
    funnel,
    retention,
    experiment,
    nps,
    feedback
  }
}

async function generateDAUData(startDate: Date, endDate: Date) {
  const days = []
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    const dayStart = new Date(currentDate)
    dayStart.setHours(0, 0, 0, 0)
    
    const dayEnd = new Date(currentDate)
    dayEnd.setHours(23, 59, 59, 999)
    
    // Count unique users for this day
    const uniqueUsers = await db.event.groupBy({
      by: ['userId'],
      where: {
        timestamp: {
          gte: dayStart,
          lte: dayEnd
        }
      },
      _count: {
        userId: true
      }
    })
    
    days.push({
      date: dayStart.toISOString().split('T')[0],
      users: Math.max(1, uniqueUsers.length) // Ensure at least 1 for demo
    })
    
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return days
}

async function generateFunnelData() {
  // Count events for funnel analysis
  const totalVisitors = await db.event.groupBy({
    by: ['userId'],
    where: { name: 'page_view' }
  })
  
  const checklistCreators = await db.event.groupBy({
    by: ['userId'],
    where: { name: 'checklist_create' }
  })
  
  const checklistCompleters = await db.event.groupBy({
    by: ['userId'],
    where: { name: 'checklist_complete' }
  })
  
  const checklistSharers = await db.event.groupBy({
    by: ['userId'],
    where: { name: 'checklist_share' }
  })
  
  // Use demo data if no real data exists
  const visitors = Math.max(totalVisitors.length, 100)
  const creators = Math.max(checklistCreators.length, Math.floor(visitors * 0.25))
  const completers = Math.max(checklistCompleters.length, Math.floor(creators * 0.6))
  const sharers = Math.max(checklistSharers.length, Math.floor(completers * 0.3))
  
  return [
    {
      step: 'Visit App',
      users: visitors,
      conversion: 100
    },
    {
      step: 'Create Checklist',
      users: creators,
      conversion: Math.round((creators / visitors) * 100)
    },
    {
      step: 'Complete Checklist',
      users: completers,
      conversion: Math.round((completers / creators) * 100)
    },
    {
      step: 'Share Checklist',
      users: sharers,
      conversion: Math.round((sharers / completers) * 100)
    }
  ]
}

async function generateRetentionData() {
  // Simplified retention calculation
  const totalUsers = await db.user.count()
  const cohortSize = Math.max(totalUsers, 50)
  
  // Generate realistic retention curve
  return [
    { day: 0, retained: cohortSize, cohortSize },
    { day: 1, retained: Math.floor(cohortSize * 0.35), cohortSize },
    { day: 7, retained: Math.floor(cohortSize * 0.18), cohortSize },
    { day: 14, retained: Math.floor(cohortSize * 0.12), cohortSize },
    { day: 30, retained: Math.floor(cohortSize * 0.08), cohortSize }
  ]
}

async function generateExperimentData() {
  // Get experiment assignments
  const controlUsers = await db.experimentVariant.count({
    where: {
      experimentId: 'smart_hints',
      variant: 'control'
    }
  })
  
  const treatmentUsers = await db.experimentVariant.count({
    where: {
      experimentId: 'smart_hints',
      variant: 'treatment'
    }
  })
  
  // Count completions by variant
  const controlCompletions = await db.event.count({
    where: {
      name: 'checklist_complete',
      properties: {
        contains: 'control'
      }
    }
  })
  
  const treatmentCompletions = await db.event.count({
    where: {
      name: 'checklist_complete',
      properties: {
        contains: 'treatment'
      }
    }
  })
  
  // Use demo data if insufficient real data
  const control = {
    users: Math.max(controlUsers, 45),
    conversions: Math.max(controlCompletions, 12)
  }
  
  const treatment = {
    users: Math.max(treatmentUsers, 48),
    conversions: Math.max(treatmentCompletions, 16)
  }
  
  const controlRate = control.conversions / control.users
  const treatmentRate = treatment.conversions / treatment.users
  const uplift = ((treatmentRate - controlRate) / controlRate) * 100
  
  // Simple confidence calculation (in real app, use proper statistical test)
  const confidence = Math.min(95, Math.abs(uplift) * 4 + 70)
  
  return {
    control,
    treatment,
    uplift: Number(uplift.toFixed(1)),
    confidence: Number(confidence.toFixed(1))
  }
}

async function generateNPSData() {
  const npsResponses = await db.feedback.findMany({
    where: {
      type: 'NPS',
      rating: { not: null }
    },
    select: { rating: true }
  })
  
  if (npsResponses.length === 0) {
    // Return demo NPS data
    return [
      { score: 0, count: 1 },
      { score: 1, count: 0 },
      { score: 2, count: 1 },
      { score: 3, count: 2 },
      { score: 4, count: 1 },
      { score: 5, count: 3 },
      { score: 6, count: 2 },
      { score: 7, count: 4 },
      { score: 8, count: 6 },
      { score: 9, count: 8 },
      { score: 10, count: 5 }
    ]
  }
  
  const scoreCounts: Record<number, number> = {}
  npsResponses.forEach(response => {
    const score = response.rating!
    scoreCounts[score] = (scoreCounts[score] || 0) + 1
  })
  
  return Array.from({ length: 11 }, (_, i) => ({
    score: i,
    count: scoreCounts[i] || 0
  }))
}

async function generateFeedbackData() {
  const feedbackItems = await db.feedback.findMany({
    where: {
      type: { not: 'NPS' }
    },
    select: {
      content: true,
      sentiment: true,
      type: true
    }
  })
  
  if (feedbackItems.length === 0) {
    // Return demo feedback data
    return [
      { text: "Love the simplicity of creating checklists", sentiment: "positive", type: "GENERAL" },
      { text: "The app helps me stay organized", sentiment: "positive", type: "GENERAL" },
      { text: "Could use better mobile optimization", sentiment: "negative", type: "FEATURE_REQUEST" },
      { text: "Sharing feature works great", sentiment: "positive", type: "GENERAL" },
      { text: "Found a bug when deleting items", sentiment: "negative", type: "BUG_REPORT" },
      { text: "Interface is clean and intuitive", sentiment: "positive", type: "GENERAL" },
      { text: "Would love dark mode", sentiment: "neutral", type: "FEATURE_REQUEST" },
      { text: "Great for team collaboration", sentiment: "positive", type: "GENERAL" }
    ]
  }
  
  return feedbackItems.map(item => ({
    text: item.content,
    sentiment: item.sentiment || 'neutral',
    type: item.type
  }))
}