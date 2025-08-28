#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// Sample data for realistic seeding
const sampleUsers = [
  { id: 'user_1', email: 'alice@example.com' },
  { id: 'user_2', email: 'bob@example.com' },
  { id: 'user_3', email: 'charlie@example.com' },
  { id: 'user_4', email: 'diana@example.com' },
  { id: 'user_5', email: 'eve@example.com' },
  { id: 'user_6', email: 'frank@example.com' },
  { id: 'user_7', email: 'grace@example.com' },
  { id: 'user_8', email: 'henry@example.com' },
  { id: 'user_9', email: 'ivy@example.com' },
  { id: 'user_10', email: 'jack@example.com' },
]

const checklistTitles = [
  'Morning Routine',
  'Weekly Planning',
  'Grocery Shopping',
  'Project Launch Checklist',
  'Travel Preparation',
  'Health & Fitness Goals',
  'Home Cleaning Schedule',
  'Learning New Skills',
  'Team Meeting Prep',
  'Monthly Review'
]

const checklistItems = [
  // Morning Routine
  ['Wake up at 6 AM', 'Drink a glass of water', 'Exercise for 30 minutes', 'Meditation', 'Review daily goals'],
  // Weekly Planning
  ['Review last week\'s achievements', 'Set priorities for the week', 'Schedule important meetings', 'Plan meals', 'Check calendar conflicts'],
  // Grocery Shopping
  ['Check pantry inventory', 'Plan meals for the week', 'Make shopping list', 'Check for coupons', 'Buy groceries'],
  // And so on...
]

const feedbackTexts = [
  { text: 'Love the simplicity of creating checklists! Very intuitive interface.', sentiment: 'positive', type: 'GENERAL' },
  { text: 'The app helps me stay organized and productive throughout the day.', sentiment: 'positive', type: 'GENERAL' },
  { text: 'Could really use better mobile optimization. Text is too small on phone.', sentiment: 'negative', type: 'FEATURE_REQUEST' },
  { text: 'Sharing feature works great for team collaboration!', sentiment: 'positive', type: 'GENERAL' },
  { text: 'Found a bug when trying to delete items - nothing happens when I click delete.', sentiment: 'negative', type: 'BUG_REPORT' },
  { text: 'Interface is clean and intuitive. Great design choices.', sentiment: 'positive', type: 'GENERAL' },
  { text: 'Would love to see a dark mode option added.', sentiment: 'neutral', type: 'FEATURE_REQUEST' },
  { text: 'Perfect for managing my daily tasks. Highly recommend!', sentiment: 'positive', type: 'GENERAL' },
  { text: 'App crashes sometimes when I have many items in a list.', sentiment: 'negative', type: 'BUG_REPORT' },
  { text: 'Great for team projects. Sharing makes collaboration easy.', sentiment: 'positive', type: 'GENERAL' },
  { text: 'Loading times could be faster, especially on slower connections.', sentiment: 'negative', type: 'FEATURE_REQUEST' },
  { text: 'Simple but powerful. Does exactly what I need without bloat.', sentiment: 'positive', type: 'GENERAL' }
]

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generatePastDate(daysAgo: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  // Add some random hours/minutes to spread throughout the day
  date.setHours(getRandomInt(8, 22))
  date.setMinutes(getRandomInt(0, 59))
  return date
}

async function seedUsers() {
  console.log('🌱 Seeding users...')
  
  for (const userData of sampleUsers) {
    const createdAt = generatePastDate(getRandomInt(1, 30))
    
    await db.user.upsert({
      where: { id: userData.id },
      update: {},
      create: {
        id: userData.id,
        email: userData.email,
        hashedEmail: Buffer.from(userData.email).toString('base64'),
        createdAt,
        hasConsented: Math.random() > 0.2, // 80% consent rate
      }
    })
  }
  
  console.log(`✅ Created ${sampleUsers.length} users`)
}

async function seedChecklists() {
  console.log('🌱 Seeding checklists...')
  
  let checklistCount = 0
  
  for (let i = 0; i < sampleUsers.length; i++) {
    const user = sampleUsers[i]
    const numChecklists = getRandomInt(1, 4) // 1-4 checklists per user
    
    for (let j = 0; j < numChecklists; j++) {
      const title = getRandomElement(checklistTitles)
      const createdAt = generatePastDate(getRandomInt(0, 25))
      
      const numItems = getRandomInt(3, 8)
      const itemTexts = []
      for (let k = 0; k < numItems; k++) {
        itemTexts.push(`Item ${k + 1} for ${title}`)
      }
      
      const isCompleted = Math.random() > 0.4 // 60% completion rate
      const completedAt = isCompleted ? new Date(createdAt.getTime() + getRandomInt(1, 5) * 60 * 60 * 1000) : null
      
      await db.checklist.create({
        data: {
          title,
          description: Math.random() > 0.5 ? `Description for ${title}` : null,
          completed: isCompleted,
          completedAt,
          createdAt,
          userId: user.id,
          items: {
            create: itemTexts.map((text, index) => {
              const itemCompleted = isCompleted || Math.random() > 0.6
              return {
                text,
                order: index,
                completed: itemCompleted,
                completedAt: itemCompleted ? new Date(createdAt.getTime() + index * 10 * 60 * 1000) : null,
              }
            })
          }
        }
      })
      
      checklistCount++
    }
  }
  
  console.log(`✅ Created ${checklistCount} checklists`)
}

async function seedExperimentVariants() {
  console.log('🌱 Seeding experiment variants...')
  
  for (const user of sampleUsers) {
    // Assign users to A/B test variants (roughly 50/50 split)
    const variant = Math.random() > 0.5 ? 'treatment' : 'control'
    const assignedAt = generatePastDate(getRandomInt(20, 30))
    
    await db.experimentVariant.create({
      data: {
        experimentId: 'smart_hints',
        userId: user.id,
        variant,
        assignedAt
      }
    })
  }
  
  console.log('✅ Assigned experiment variants')
}

async function seedEvents() {
  console.log('🌱 Seeding events...')
  
  let eventCount = 0
  
  // Get all checklists for event generation
  const checklists = await db.checklist.findMany({
    include: { items: true, user: true }
  })
  
  // Get experiment assignments
  const experiments = await db.experimentVariant.findMany()
  const userVariants = experiments.reduce((acc, exp) => {
    acc[exp.userId] = exp.variant
    return acc
  }, {} as Record<string, string>)
  
  for (const checklist of checklists) {
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    const variant = userVariants[checklist.userId] || 'control'
    
    // Page view event
    await db.event.create({
      data: {
        name: 'page_view',
        properties: JSON.stringify({
          page: '/checklists',
          title: 'Checklists',
          url: 'http://localhost:3000/checklists'
        }),
        timestamp: checklist.createdAt,
        sessionId,
        userId: checklist.userId
      }
    })
    eventCount++
    
    // Checklist create event
    await db.event.create({
      data: {
        name: 'checklist_create',
        properties: JSON.stringify({
          checklist_id: checklist.id,
          title: checklist.title,
          items_count: checklist.items.length,
          experiment_variant: variant
        }),
        timestamp: new Date(checklist.createdAt.getTime() + 2 * 60 * 1000),
        sessionId,
        userId: checklist.userId
      }
    })
    eventCount++
    
    // Checklist complete event (if completed)
    if (checklist.completed && checklist.completedAt) {
      const completionTime = checklist.completedAt.getTime() - checklist.createdAt.getTime()
      
      await db.event.create({
        data: {
          name: 'checklist_complete',
          properties: JSON.stringify({
            checklist_id: checklist.id,
            title: checklist.title,
            items_count: checklist.items.length,
            completion_time_ms: completionTime,
            experiment_variant: variant
          }),
          timestamp: checklist.completedAt,
          sessionId,
          userId: checklist.userId
        }
      })
      eventCount++
      
      // Some users share after completing (30% chance)
      if (Math.random() > 0.7) {
        await db.event.create({
          data: {
            name: 'checklist_share',
            properties: JSON.stringify({
              checklist_id: checklist.id,
              share_method: getRandomElement(['link', 'native_share'])
            }),
            timestamp: new Date(checklist.completedAt.getTime() + 5 * 60 * 1000),
            sessionId,
            userId: checklist.userId
          }
        })
        eventCount++
      }
    }
    
    // Random CTA clicks
    if (Math.random() > 0.6) {
      await db.event.create({
        data: {
          name: 'cta_click',
          properties: JSON.stringify({
            cta_text: 'New Checklist',
            cta_location: 'header',
            target_page: '/checklists'
          }),
          timestamp: new Date(checklist.createdAt.getTime() - 30 * 1000),
          sessionId,
          userId: checklist.userId
        }
      })
      eventCount++
    }
  }
  
  // Add some app_open events
  for (const user of sampleUsers.slice(0, 7)) { // Not all users
    const openTime = generatePastDate(getRandomInt(0, 15))
    await db.event.create({
      data: {
        name: 'app_open',
        properties: JSON.stringify({
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          referrer: getRandomElement(['https://google.com', 'https://twitter.com', '']),
          timestamp: openTime.toISOString()
        }),
        timestamp: openTime,
        sessionId: `sess_open_${user.id}`,
        userId: user.id
      }
    })
    eventCount++
  }
  
  console.log(`✅ Created ${eventCount} events`)
}

async function seedFeedback() {
  console.log('🌱 Seeding feedback...')
  
  let feedbackCount = 0
  
  // Regular feedback
  for (let i = 0; i < feedbackTexts.length; i++) {
    const feedbackData = feedbackTexts[i]
    const user = getRandomElement(sampleUsers.slice(0, 8)) // Not all users give feedback
    const createdAt = generatePastDate(getRandomInt(0, 20))
    
    await db.feedback.create({
      data: {
        type: feedbackData.type,
        content: feedbackData.text,
        sentiment: feedbackData.sentiment,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        url: 'http://localhost:3000/feedback',
        createdAt,
        userId: user.id
      }
    })
    feedbackCount++
  }
  
  // NPS responses
  const npsScores = [10, 9, 9, 8, 8, 7, 6, 5, 9, 10, 8, 7, 4, 9, 8] // Skewed positive
  for (let i = 0; i < npsScores.length; i++) {
    const score = npsScores[i]
    const user = sampleUsers[i % sampleUsers.length]
    const createdAt = generatePastDate(getRandomInt(0, 25))
    
    let category = 'detractor'
    if (score >= 9) category = 'promoter'
    else if (score >= 7) category = 'passive'
    
    await db.feedback.create({
      data: {
        type: 'NPS',
        content: `NPS Score: ${score}`,
        rating: score,
        sentiment: category,
        createdAt,
        userId: user.id
      }
    })
    feedbackCount++
  }
  
  console.log(`✅ Created ${feedbackCount} feedback items`)
}

async function main() {
  console.log('🚀 Starting database seeding...')
  console.log('This will create realistic data for the last 30 days')
  
  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await db.event.deleteMany()
    await db.feedback.deleteMany()
    await db.experimentVariant.deleteMany()
    await db.checklistItem.deleteMany()
    await db.checklist.deleteMany()
    await db.user.deleteMany()
    
    // Seed new data
    await seedUsers()
    await seedChecklists()
    await seedExperimentVariants()
    await seedEvents()
    await seedFeedback()
    
    // Generate summary
    const stats = {
      users: await db.user.count(),
      checklists: await db.checklist.count(),
      events: await db.event.count(),
      feedback: await db.feedback.count()
    }
    
    console.log('\n🎉 Seeding completed successfully!')
    console.log('📊 Database stats:')
    console.log(`   Users: ${stats.users}`)
    console.log(`   Checklists: ${stats.checklists}`)
    console.log(`   Events: ${stats.events}`)
    console.log(`   Feedback: ${stats.feedback}`)
    console.log('\n💡 Next steps:')
    console.log('   1. Run `npm run dev` to start the app')
    console.log('   2. Visit /lab to see your analytics dashboard')
    console.log('   3. Run `npm run simulate` to generate more live data')
    console.log('   4. Run `npm run analyze` for detailed experiment analysis')
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

if (require.main === module) {
  main()
}