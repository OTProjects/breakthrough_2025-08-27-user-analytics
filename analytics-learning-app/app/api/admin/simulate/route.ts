import { NextResponse } from 'next/server'
import { exec } from 'child_process'

export async function POST() {
  try {
    // In a real app, you'd have proper authentication here
    console.log('Starting traffic simulation...')
    
    // Start simulation in background
    const child = exec('npm run simulate')
    
    child.stdout?.on('data', (data) => {
      console.log(data)
    })
    
    child.stderr?.on('data', (data) => {
      console.error(data)
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Traffic simulation started. Check server logs for progress.',
      pid: child.pid
    })
  } catch (error) {
    console.error('Simulation failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}