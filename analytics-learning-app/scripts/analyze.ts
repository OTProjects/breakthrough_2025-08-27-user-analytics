#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

interface AnalysisResult {
  experiment: {
    name: string
    control: { users: number; conversions: number; rate: number }
    treatment: { users: number; conversions: number; rate: number }
    uplift: number
    pValue: number
    isSignificant: boolean
    confidence: number
  }
  funnel: Array<{ step: string; users: number; dropOff: number; conversionRate: number }>
  feedback: {
    totalCount: number
    npsScore: number
    sentimentBreakdown: Record<string, number>
    topThemes: Array<{ word: string; count: number; sentiment: string }>
  }
  userMetrics: {
    totalUsers: number
    activeUsers: number
    retentionD1: number
    retentionD7: number
    avgSessionDuration: number
  }
}

// Helper function for statistical significance (simplified z-test)
function calculatePValue(controlRate: number, treatmentRate: number, controlSize: number, treatmentSize: number): number {
  if (controlSize === 0 || treatmentSize === 0) return 1
  
  const pooledRate = ((controlRate * controlSize) + (treatmentRate * treatmentSize)) / (controlSize + treatmentSize)
  const pooledStandardError = Math.sqrt(pooledRate * (1 - pooledRate) * ((1 / controlSize) + (1 / treatmentSize)))
  
  if (pooledStandardError === 0) return 1
  
  const zScore = Math.abs(treatmentRate - controlRate) / pooledStandardError
  
  // Simplified p-value approximation (for z-score)
  // This is not perfectly accurate but good enough for educational purposes
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)))
  return Math.min(1, Math.max(0, pValue))
}

function normalCDF(x: number): number {
  // Approximation of cumulative distribution function for standard normal distribution
  return 0.5 * (1 + erf(x / Math.sqrt(2)))
}

function erf(x: number): number {
  // Approximation of error function
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911
  
  const sign = x >= 0 ? 1 : -1
  x = Math.abs(x)
  
  const t = 1.0 / (1.0 + p * x)
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
  
  return sign * y
}

async function analyzeExperiment(): Promise<AnalysisResult['experiment']> {
  console.log('📊 Analyzing A/B test results...')
  
  // Get all experiment assignments
  const controlVariants = await db.experimentVariant.findMany({
    where: { experimentId: 'smart_hints', variant: 'control' }
  })
  
  const treatmentVariants = await db.experimentVariant.findMany({
    where: { experimentId: 'smart_hints', variant: 'treatment' }
  })
  
  // Count conversions (checklist completions) by variant
  const controlUserIds = controlVariants.map(v => v.userId)
  const treatmentUserIds = treatmentVariants.map(v => v.userId)
  
  const controlConversions = await db.event.count({
    where: {
      name: 'checklist_complete',
      userId: { in: controlUserIds }
    }
  })
  
  const treatmentConversions = await db.event.count({
    where: {
      name: 'checklist_complete',
      userId: { in: treatmentUserIds }
    }
  })
  
  const control = {
    users: controlVariants.length,
    conversions: controlConversions,
    rate: controlVariants.length > 0 ? controlConversions / controlVariants.length : 0
  }
  
  const treatment = {
    users: treatmentVariants.length,
    conversions: treatmentConversions,
    rate: treatmentVariants.length > 0 ? treatmentConversions / treatmentVariants.length : 0
  }
  
  const uplift = control.rate > 0 ? ((treatment.rate - control.rate) / control.rate) * 100 : 0
  const pValue = calculatePValue(control.rate, treatment.rate, control.users, treatment.users)
  const isSignificant = pValue < 0.05
  const confidence = Math.max(0, Math.min(100, (1 - pValue) * 100))
  
  return {
    name: 'Smart Hints Feature',
    control,
    treatment,
    uplift: Number(uplift.toFixed(2)),
    pValue: Number(pValue.toFixed(4)),
    isSignificant,
    confidence: Number(confidence.toFixed(1))
  }
}

async function analyzeFunnel(): Promise<AnalysisResult['funnel']> {
  console.log('🔀 Analyzing conversion funnel...')
  
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
  
  const steps = [
    { step: 'Visit App', users: totalVisitors.length || 1 },
    { step: 'Create Checklist', users: checklistCreators.length },
    { step: 'Complete Checklist', users: checklistCompleters.length },
    { step: 'Share Checklist', users: checklistSharers.length }
  ]
  
  return steps.map((step, index) => {
    const prevUsers = index > 0 ? steps[index - 1].users : step.users
    const dropOff = prevUsers - step.users
    const conversionRate = prevUsers > 0 ? (step.users / prevUsers) * 100 : 0
    
    return {
      step: step.step,
      users: step.users,
      dropOff,
      conversionRate: Number(conversionRate.toFixed(1))
    }
  })
}

async function analyzeFeedback(): Promise<AnalysisResult['feedback']> {
  console.log('💬 Analyzing user feedback...')
  
  const allFeedback = await db.feedback.findMany()
  
  // Calculate NPS
  const npsResponses = allFeedback.filter(f => f.type === 'NPS' && f.rating !== null)
  const npsScore = calculateNPSScore(npsResponses.map(f => f.rating!))
  
  // Sentiment breakdown
  const sentimentBreakdown = allFeedback.reduce((acc, feedback) => {
    const sentiment = feedback.sentiment || 'neutral'
    acc[sentiment] = (acc[sentiment] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  // Extract top themes (simple word frequency)
  const topThemes = extractTopThemes(allFeedback)
  
  return {
    totalCount: allFeedback.length,
    npsScore,
    sentimentBreakdown,
    topThemes
  }
}

function calculateNPSScore(scores: number[]): number {
  if (scores.length === 0) return 0
  
  const promoters = scores.filter(score => score >= 9).length
  const detractors = scores.filter(score => score <= 6).length
  
  return Math.round(((promoters - detractors) / scores.length) * 100)
}

function extractTopThemes(feedback: any[]): Array<{ word: string; count: number; sentiment: string }> {
  const wordCounts: Record<string, { count: number; sentiments: string[] }> = {}
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'])
  
  feedback.forEach(item => {
    if (item.type === 'NPS') return // Skip NPS numeric responses
    
    const words = item.content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((word: string) => word.length > 3 && !stopWords.has(word))
    
    words.forEach((word: string) => {
      if (!wordCounts[word]) {
        wordCounts[word] = { count: 0, sentiments: [] }
      }
      wordCounts[word].count++
      if (item.sentiment) {
        wordCounts[word].sentiments.push(item.sentiment)
      }
    })
  })
  
  return Object.entries(wordCounts)
    .map(([word, data]) => {
      // Determine dominant sentiment
      const sentimentCounts = data.sentiments.reduce((acc, s) => {
        acc[s] = (acc[s] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const dominantSentiment = Object.entries(sentimentCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'neutral'
      
      return {
        word,
        count: data.count,
        sentiment: dominantSentiment
      }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

async function analyzeUserMetrics(): Promise<AnalysisResult['userMetrics']> {
  console.log('👥 Analyzing user metrics...')
  
  const totalUsers = await db.user.count()
  
  // Active users (users with events in last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const activeUsers = await db.event.groupBy({
    by: ['userId'],
    where: {
      timestamp: { gte: sevenDaysAgo }
    }
  })
  
  // Simple retention calculation
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const usersCreatedYesterday = await db.user.count({
    where: {
      createdAt: {
        gte: new Date(oneDayAgo.getTime() - 24 * 60 * 60 * 1000),
        lt: oneDayAgo
      }
    }
  })
  
  const usersActiveToday = await db.event.groupBy({
    by: ['userId'],
    where: {
      timestamp: { gte: oneDayAgo },
      user: {
        createdAt: {
          gte: new Date(oneDayAgo.getTime() - 24 * 60 * 60 * 1000),
          lt: oneDayAgo
        }
      }
    }
  })
  
  const retentionD1 = usersCreatedYesterday > 0 ? (usersActiveToday.length / usersCreatedYesterday) * 100 : 0
  
  // Simplified 7-day retention
  const usersCreatedWeekAgo = await db.user.count({
    where: {
      createdAt: {
        gte: new Date(sevenDaysAgo.getTime() - 24 * 60 * 60 * 1000),
        lt: sevenDaysAgo
      }
    }
  })
  
  const usersActiveThisWeek = await db.event.groupBy({
    by: ['userId'],
    where: {
      timestamp: { gte: sevenDaysAgo },
      user: {
        createdAt: {
          gte: new Date(sevenDaysAgo.getTime() - 24 * 60 * 60 * 1000),
          lt: sevenDaysAgo
        }
      }
    }
  })
  
  const retentionD7 = usersCreatedWeekAgo > 0 ? (usersActiveThisWeek.length / usersCreatedWeekAgo) * 100 : 0
  
  // Average session duration (simplified)
  const avgSessionDuration = 180 // Placeholder: 3 minutes average
  
  return {
    totalUsers,
    activeUsers: activeUsers.length,
    retentionD1: Number(retentionD1.toFixed(1)),
    retentionD7: Number(retentionD7.toFixed(1)),
    avgSessionDuration
  }
}

function formatNumber(num: number): string {
  return num.toLocaleString()
}

function formatPercent(num: number): string {
  return `${num.toFixed(1)}%`
}

async function main() {
  console.log('🔍 Analytics Learning App - Data Analysis Report')
  console.log('=' .repeat(60))
  console.log('')
  
  try {
    // Run all analyses
    const [experiment, funnel, feedback, userMetrics] = await Promise.all([
      analyzeExperiment(),
      analyzeFunnel(),
      analyzeFeedback(),
      analyzeUserMetrics()
    ])
    
    // Print A/B Test Results
    console.log('🧪 A/B TEST RESULTS: Smart Hints Feature')
    console.log('-'.repeat(50))
    console.log(`Control Group:     ${formatNumber(experiment.control.users)} users, ${formatNumber(experiment.control.conversions)} conversions (${formatPercent(experiment.control.rate * 100)})`)
    console.log(`Treatment Group:   ${formatNumber(experiment.treatment.users)} users, ${formatNumber(experiment.treatment.conversions)} conversions (${formatPercent(experiment.treatment.rate * 100)})`)
    console.log(`Uplift:            ${experiment.uplift > 0 ? '+' : ''}${experiment.uplift}%`)
    console.log(`P-value:           ${experiment.pValue}`)
    console.log(`Statistical Sig:   ${experiment.isSignificant ? '✅ YES' : '❌ NO'} (${formatPercent(experiment.confidence)} confidence)`)
    
    if (experiment.isSignificant) {
      console.log(`🎉 RECOMMENDATION: ${experiment.uplift > 0 ? 'SHIP IT!' : 'KILL IT!'} The ${experiment.uplift > 0 ? 'positive' : 'negative'} effect is statistically significant.`)
    } else {
      console.log(`⏳ RECOMMENDATION: KEEP TESTING. Need more data to reach statistical significance.`)
    }
    console.log('')
    
    // Print Funnel Analysis
    console.log('🔀 CONVERSION FUNNEL ANALYSIS')
    console.log('-'.repeat(50))
    funnel.forEach((step, index) => {
      const dropOffText = index > 0 ? ` (-${formatNumber(step.dropOff)})` : ''
      console.log(`${(index + 1)}. ${step.step.padEnd(20)} ${formatNumber(step.users).padStart(8)} users${dropOffText.padEnd(15)} ${formatPercent(step.conversionRate)}`)
    })
    
    const biggestDropIndex = funnel.reduce((maxIndex, step, index) => {
      if (index === 0) return 0
      return step.dropOff > funnel[maxIndex].dropOff ? index : maxIndex
    }, 0)
    
    if (biggestDropIndex > 0) {
      console.log(`🚨 BIGGEST DROP-OFF: ${funnel[biggestDropIndex].step} (${formatNumber(funnel[biggestDropIndex].dropOff)} users lost)`)
    }
    console.log('')
    
    // Print User Metrics
    console.log('👥 USER METRICS OVERVIEW')
    console.log('-'.repeat(50))
    console.log(`Total Users:       ${formatNumber(userMetrics.totalUsers)}`)
    console.log(`Active Users:      ${formatNumber(userMetrics.activeUsers)} (last 7 days)`)
    console.log(`D1 Retention:      ${formatPercent(userMetrics.retentionD1)}`)
    console.log(`D7 Retention:      ${formatPercent(userMetrics.retentionD7)}`)
    console.log(`Avg Session:       ${userMetrics.avgSessionDuration}s`)
    console.log('')
    
    // Print Feedback Analysis
    console.log('💬 FEEDBACK & NPS ANALYSIS')
    console.log('-'.repeat(50))
    console.log(`Total Feedback:    ${formatNumber(feedback.totalCount)} items`)
    console.log(`NPS Score:         ${feedback.npsScore}`)
    
    let npsGrade = 'Poor'
    if (feedback.npsScore >= 70) npsGrade = 'Excellent'
    else if (feedback.npsScore >= 50) npsGrade = 'Great'
    else if (feedback.npsScore >= 30) npsGrade = 'Good'
    else if (feedback.npsScore >= 0) npsGrade = 'Fair'
    
    console.log(`NPS Grade:         ${npsGrade}`)
    console.log('')
    
    console.log('Sentiment Breakdown:')
    Object.entries(feedback.sentimentBreakdown).forEach(([sentiment, count]) => {
      const percentage = feedback.totalCount > 0 ? (count / feedback.totalCount) * 100 : 0
      console.log(`  ${sentiment.padEnd(10)} ${formatNumber(count)} (${formatPercent(percentage)})`)
    })
    console.log('')
    
    if (feedback.topThemes.length > 0) {
      console.log('Top Feedback Themes:')
      feedback.topThemes.slice(0, 5).forEach((theme, index) => {
        const emoji = theme.sentiment === 'positive' ? '😊' : theme.sentiment === 'negative' ? '😞' : '😐'
        console.log(`  ${index + 1}. "${theme.word}" ${emoji} (${theme.count} mentions)`)
      })
    }
    console.log('')
    
    // Summary & Recommendations
    console.log('📋 KEY INSIGHTS & RECOMMENDATIONS')
    console.log('-'.repeat(50))
    
    // Experiment insights
    if (experiment.isSignificant) {
      if (experiment.uplift > 0) {
        console.log('✅ Smart Hints feature is working! Users with hints complete more checklists.')
        console.log('   → SHIP the Smart Hints feature to all users.')
      } else {
        console.log('❌ Smart Hints feature is hurting conversions. Users are less likely to complete checklists.')
        console.log('   → REMOVE the Smart Hints feature and investigate why it\'s not helping.')
      }
    } else {
      console.log('⏳ Smart Hints experiment needs more data to reach statistical significance.')
      console.log('   → CONTINUE testing until you have enough users for a reliable result.')
    }
    
    // Funnel insights
    if (biggestDropIndex > 0) {
      console.log(`🔍 Focus on improving "${funnel[biggestDropIndex].step}" - it\'s where you lose the most users.`)
    }
    
    // Retention insights
    if (userMetrics.retentionD1 < 20) {
      console.log('📉 D1 retention is low (<20%). Users aren\'t finding value quickly enough.')
      console.log('   → Improve onboarding and first-time user experience.')
    }
    
    if (userMetrics.retentionD7 < 10) {
      console.log('📉 D7 retention is low (<10%). Users aren\'t forming a habit.')
      console.log('   → Add engagement features like notifications or progress tracking.')
    }
    
    // NPS insights
    if (feedback.npsScore < 30) {
      console.log('📊 NPS is below 30. Users are not satisfied enough to recommend the app.')
      console.log('   → Address top negative feedback themes and improve core features.')
    }
    
    console.log('')
    console.log('🎓 LEARNING EXERCISE:')
    console.log('1. Which metric would you optimize first and why?')
    console.log('2. How would you design a follow-up experiment?')
    console.log('3. What additional data would help you make better decisions?')
    console.log('')
    console.log('📈 Next steps: Visit /lab to see these insights visualized!')
    
  } catch (error) {
    console.error('❌ Analysis failed:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

if (require.main === module) {
  main()
}