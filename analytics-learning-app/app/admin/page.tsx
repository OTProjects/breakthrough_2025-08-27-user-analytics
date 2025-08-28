'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, RotateCcw, PlayCircle, Settings } from 'lucide-react'
import Link from 'next/link'
import { toggleLocalFlag } from '@/lib/flags'

export default function AdminPage() {
  const [flags, setFlags] = useState<Record<string, boolean>>({})
  const [isSeeding, setIsSeeding] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  
  useEffect(() => {
    // Load current flag states from localStorage or defaults
    const currentFlags = {
      smart_hints: localStorage.getItem('flag_smart_hints') === 'true'
    }
    setFlags(currentFlags)
  }, [])

  function handleFlagToggle(flagName: string) {
    const newValue = !flags[flagName]
    setFlags(prev => ({ ...prev, [flagName]: newValue }))
    localStorage.setItem(`flag_${flagName}`, newValue.toString())
    toggleLocalFlag(flagName)
  }

  async function handleSeedData() {
    setIsSeeding(true)
    try {
      const response = await fetch('/api/admin/seed', { method: 'POST' })
      if (response.ok) {
        alert('✅ Database seeded successfully! Visit /lab to see the new data.')
      } else {
        alert('❌ Failed to seed database. Check console for errors.')
      }
    } catch (error) {
      alert('❌ Error seeding database: ' + (error as Error).message)
    } finally {
      setIsSeeding(false)
    }
  }

  async function handleSimulateTraffic() {
    setIsSimulating(true)
    try {
      const response = await fetch('/api/admin/simulate', { method: 'POST' })
      if (response.ok) {
        alert('🤖 Traffic simulation started! Watch the console for live events.')
      } else {
        alert('❌ Failed to start simulation. Check console for errors.')
      }
    } catch (error) {
      alert('❌ Error starting simulation: ' + (error as Error).message)
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/" 
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Control feature flags, seed data, and simulate traffic for testing.
          </p>
        </div>

        {/* Feature Flags Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Feature Flags</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Smart Hints</h3>
                <p className="text-sm text-gray-600">
                  Show helpful tips when creating checklists (A/B test treatment)
                </p>
              </div>
              <button
                onClick={() => handleFlagToggle('smart_hints')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  flags.smart_hints ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    flags.smart_hints ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Note:</strong> Feature flags control local behavior only. 
              In production, you'd use PostHog feature flags for proper A/B testing.
            </p>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Data Management</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <RotateCcw className="w-5 h-5 text-green-600" />
                <h3 className="font-medium">Seed Database</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Generate 30 days of realistic demo data including users, checklists, events, and feedback.
              </p>
              <button
                onClick={handleSeedData}
                disabled={isSeeding}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isSeeding ? 'Seeding...' : 'Seed Database'}
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <PlayCircle className="w-5 h-5 text-purple-600" />
                <h3 className="font-medium">Simulate Traffic</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Generate live user activity for 2 minutes to see real-time analytics in action.
              </p>
              <button
                onClick={handleSimulateTraffic}
                disabled={isSimulating}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {isSimulating ? 'Simulating...' : 'Start Simulation'}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/lab"
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">Analytics Lab</div>
              <div className="text-sm text-gray-600">View dashboard</div>
            </Link>
            
            <Link
              href="/checklists"
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📝</div>
              <div className="font-medium">Create Checklist</div>
              <div className="text-sm text-gray-600">Test the feature</div>
            </Link>
            
            <Link
              href="/feedback"
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors text-center"
            >
              <div className="text-2xl mb-2">💬</div>
              <div className="font-medium">Give Feedback</div>
              <div className="text-sm text-gray-600">Test feedback system</div>
            </Link>
          </div>
        </div>

        {/* Terminal Commands */}
        <div className="mt-6 bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm">
          <div className="mb-2 text-gray-400"># Alternative: Use terminal commands</div>
          <div className="space-y-1">
            <div><span className="text-blue-400">$</span> npm run seed <span className="text-gray-500"># Seed database</span></div>
            <div><span className="text-blue-400">$</span> npm run simulate <span className="text-gray-500"># Start traffic simulation</span></div>
            <div><span className="text-blue-400">$</span> npm run analyze <span className="text-gray-500"># Generate analysis report</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}