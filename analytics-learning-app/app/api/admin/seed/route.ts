import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST() {
  try {
    // In a real app, you'd have proper authentication here
    console.log('Starting database seeding...')
    
    const { stdout, stderr } = await execAsync('npm run seed')
    
    if (stderr && !stderr.includes('warn')) {
      throw new Error(stderr)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully',
      output: stdout
    })
  } catch (error) {
    console.error('Seeding failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}