#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// Simulation parameters
const SIMULATION_DURATION_MS = 2 * 60 * 1000 // 2 minutes
const EVENTS_PER_SECOND = 0.5 // Average events per second
const USER_POOL_SIZE = 15 // Simulate this many users

interface SimulatedUser {
  id: string
  sessionId: string
  variant: 'control' | 'treatment'
  currentPage: string
  lastActivity: Date
}

const pages = ['/checklists', '/feedback', '/lab', '/']
const checklistTitles = [
  'Daily Tasks', 'Shopping List', 'Work Projects', 'Weekend Plans',
  'Health Goals', 'Learning Objectives', 'Travel Checklist'
]

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function createSimulatedUser(): Promise<SimulatedUser> {
  const userId = `sim_user_${Math.random().toString(36).substr(2, 8)}`
  const sessionId = `sim_sess_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
  const variant = Math.random() > 0.5 ? 'treatment' : 'control'
  
  // Create user in database
  await db.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      hasConsented: Math.random() > 0.1, // 90% consent rate
      createdAt: new Date()
    }
  })
  
  // Assign experiment variant
  await db.experimentVariant.upsert({
    where: {
      experimentId_userId: {
        experimentId: 'smart_hints',
        userId
      }
    },
    update: {},
    create: {
      experimentId: 'smart_hints',
      userId,
      variant,
      assignedAt: new Date()
    }
  })
  
  return {
    id: userId,
    sessionId,
    variant,
    currentPage: '/',
    lastActivity: new Date()
  }
}

async function generateEvent(user: SimulatedUser): Promise<void> {
  const now = new Date()
  const timeSinceLastActivity = now.getTime() - user.lastActivity.getTime()
  
  // Simulate different user behaviors based on current page and time
  let eventType: string
  let properties: any = {}
  
  if (user.currentPage === '/' && Math.random() > 0.3) {
    // From home page, likely to navigate to checklists
    eventType = 'page_view'
    user.currentPage = '/checklists'
    properties = {
      page: '/checklists',
      title: 'Checklists',
      url: 'http://localhost:3000/checklists'
    }
  } else if (user.currentPage === '/checklists' && Math.random() > 0.6) {
    // On checklists page, might create a checklist
    eventType = 'checklist_create'
    const checklistId = `sim_checklist_${Math.random().toString(36).substr(2, 8)}`
    const title = getRandomElement(checklistTitles)
    const itemsCount = getRandomInt(3, 7)
    
    properties = {
      checklist_id: checklistId,
      title,
      items_count: itemsCount,
      experiment_variant: user.variant
    }
    
    // Create actual checklist in database
    const itemTexts = Array.from({ length: itemsCount }, (_, i) => `Item ${i + 1}`)
    await db.checklist.create({
      data: {
        id: checklistId,
        title,
        userId: user.id,
        items: {
          create: itemTexts.map((text, index) => ({
            text,
            order: index
          }))
        }
      }
    })
    
  } else if (user.currentPage === '/checklists' && Math.random() > 0.7) {
    // Might complete a checklist
    const userChecklists = await db.checklist.findMany({
      where: { userId: user.id, completed: false },
      take: 1
    })
    
    if (userChecklists.length > 0) {
      const checklist = userChecklists[0]
      eventType = 'checklist_complete'
      
      // Mark checklist as completed
      const completionTime = getRandomInt(30000, 300000) // 30s to 5min
      const completedAt = new Date(now.getTime() - completionTime)
      
      await db.checklist.update({
        where: { id: checklist.id },
        data: {
          completed: true,
          completedAt
        }
      })
      
      // Mark all items as completed
      await db.checklistItem.updateMany({
        where: { checklistId: checklist.id },
        data: {
          completed: true,
          completedAt
        }
      })
      
      properties = {
        checklist_id: checklist.id,
        title: checklist.title,
        items_count: await db.checklistItem.count({ where: { checklistId: checklist.id } }),
        completion_time_ms: completionTime,
        experiment_variant: user.variant
      }
    } else {
      // Fallback to CTA click
      eventType = 'cta_click'
      properties = {
        cta_text: 'New Checklist',
        cta_location: 'header',
        target_page: '/checklists'
      }
    }
    
  } else if (Math.random() > 0.8) {
    // Navigate to a different page
    eventType = 'page_view'
    user.currentPage = getRandomElement(pages)
    properties = {
      page: user.currentPage,
      title: user.currentPage.substring(1) || 'Home',
      url: `http://localhost:3000${user.currentPage}`
    }
    
  } else if (Math.random() > 0.95) {
    // Rare events: feedback or sharing
    if (Math.random() > 0.5) {
      eventType = 'feedback_opened'
      properties = {
        feedback_type: getRandomElement(['general', 'bug_report', 'nps']),
        trigger: 'button_click'
      }
    } else {
      // Find a completed checklist to share
      const completedChecklists = await db.checklist.findMany({
        where: { userId: user.id, completed: true },
        take: 1
      })
      
      if (completedChecklists.length > 0) {
        eventType = 'checklist_share'
        properties = {
          checklist_id: completedChecklists[0].id,
          share_method: getRandomElement(['link', 'native_share'])
        }
      } else {
        eventType = 'cta_click'
        properties = {
          cta_text: getRandomElement(['Get Started', 'View Dashboard', 'Give Feedback']),
          cta_location: getRandomElement(['homepage', 'header', 'sidebar']),
          target_page: getRandomElement(pages)
        }
      }
    }
    
  } else {
    // Default to CTA click
    eventType = 'cta_click'
    properties = {
      cta_text: getRandomElement(['Get Started', 'New Checklist', 'View Lab']),
      cta_location: getRandomElement(['homepage', 'header', 'button']),
      target_page: getRandomElement(pages)
    }
  }
  
  // Store event in database
  await db.event.create({
    data: {
      name: eventType,
      properties: JSON.stringify(properties),
      timestamp: now,
      sessionId: user.sessionId,
      userId: user.id
    }
  })
  
  user.lastActivity = now
  
  // Log the event for visibility
  console.log(`🎯 ${user.id.substring(0, 12)}... | ${eventType.padEnd(20)} | ${user.variant.padEnd(9)} | ${user.currentPage}`)
}

async function generateRandomFeedback(): Promise<void> {
  // Sometimes generate feedback during simulation
  if (Math.random() > 0.9) { // 10% chance per interval
    const users = await db.user.findMany({ take: USER_POOL_SIZE })
    if (users.length === 0) return
    
    const user = getRandomElement(users)
    const feedbackTypes = [
      {
        type: 'GENERAL',
        content: getRandomElement([
          'Great app! Really helps me stay organized.',
          'Love the simplicity of the interface.',
          'Perfect for managing daily tasks.',
          'Could use some more customization options.',
          'Works well for team collaboration.'
        ]),
        sentiment: getRandomElement(['positive', 'positive', 'neutral'])
      },
      {
        type: 'NPS',
        content: 'NPS Survey Response',
        rating: getRandomInt(6, 10), // Skewed positive
        sentiment: 'promoter'
      }
    ]
    
    const feedback = getRandomElement(feedbackTypes)
    
    await db.feedback.create({
      data: {
        type: feedback.type,
        content: feedback.content,
        rating: feedback.rating,
        sentiment: feedback.sentiment,
        userId: user.id,
        userAgent: 'Simulation Bot',
        url: 'http://localhost:3000/feedback'
      }
    })
    
    console.log(`💬 Generated ${feedback.type} feedback from ${user.id.substring(0, 12)}...`)
  }
}

async function main() {
  console.log('🤖 Starting traffic simulation...')
  console.log(`⏱️  Duration: ${SIMULATION_DURATION_MS / 1000} seconds`)
  console.log(`👥 Simulating ${USER_POOL_SIZE} concurrent users`)
  console.log(`📊 Target: ${EVENTS_PER_SECOND} events/second\n`)
  
  const startTime = Date.now()
  let eventCount = 0
  
  try {
    // Create simulated users
    const users: SimulatedUser[] = []
    for (let i = 0; i < USER_POOL_SIZE; i++) {
      const user = await createSimulatedUser()
      users.push(user)
    }
    
    console.log('👤 User ID           | Event Type           | Variant   | Page')
    console.log('─'.repeat(70))
    
    // Run simulation
    const intervalMs = 1000 / EVENTS_PER_SECOND
    
    const interval = setInterval(async () => {
      const currentTime = Date.now()
      
      if (currentTime - startTime >= SIMULATION_DURATION_MS) {
        clearInterval(interval)
        
        // Final statistics
        const endStats = {
          users: await db.user.count(),
          checklists: await db.checklist.count(),
          events: await db.event.count(),
          feedback: await db.feedback.count()
        }
        
        console.log('\n🎉 Simulation completed!')
        console.log('📊 Final stats:')
        console.log(`   Users: ${endStats.users}`)
        console.log(`   Checklists: ${endStats.checklists}`)
        console.log(`   Events: ${endStats.events}`)
        console.log(`   Feedback items: ${endStats.feedback}`)
        console.log(`   Events generated: ${eventCount}`)
        console.log(`   Duration: ${((currentTime - startTime) / 1000).toFixed(1)}s`)
        console.log('\n💡 Visit /lab to see the updated analytics!')
        
        await db.$disconnect()
        process.exit(0)
      }
      
      // Generate events from random users
      const activeUserCount = Math.ceil(Math.random() * users.length)
      const activeUsers = users.slice(0, activeUserCount)
      
      for (const user of activeUsers) {
        if (Math.random() > 0.7) { // 30% chance per user per interval
          try {
            await generateEvent(user)
            eventCount++
          } catch (error) {
            console.error(`Error generating event for ${user.id}:`, error)
          }
        }
      }
      
      // Occasionally generate feedback
      await generateRandomFeedback()
      
    }, intervalMs)
    
    // Handle cleanup on interruption
    process.on('SIGINT', async () => {
      console.log('\n\n⚡ Simulation interrupted')
      clearInterval(interval)
      await db.$disconnect()
      process.exit(0)
    })
    
  } catch (error) {
    console.error('❌ Simulation failed:', error)
    await db.$disconnect()
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}