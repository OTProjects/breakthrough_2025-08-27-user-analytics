'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ClientOnly } from '@/components/ui/client-only'

interface DAUChartProps {
  data: Array<{ date: string; users: number }>
}

export function DAUChart({ data }: DAUChartProps) {
  console.log('DAUChart received data:', data) // Debug log
  
  if (!data || data.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-2">Daily & Weekly Active Users</h2>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p>No data available for DAU chart</p>
        </div>
      </div>
    )
  }

  // Calculate WAU (7-day rolling average)
  const dataWithWAU = data.map((item, index) => {
    const startIndex = Math.max(0, index - 6)
    const weekData = data.slice(startIndex, index + 1)
    const wau = Math.round(weekData.reduce((sum, d) => sum + d.users, 0) / 7)
    
    return {
      ...item,
      wau,
      date: new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  })

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Daily & Weekly Active Users</h2>
        <p className="text-gray-600">
          Track user engagement over time. DAU shows daily unique users, WAU is a 7-day rolling average.
        </p>
      </div>
      
      <div className="h-64 mb-6">
        <ClientOnly fallback={
          <div className="flex items-center justify-center h-full bg-gray-50 rounded border">
            <p className="text-gray-500">Loading chart...</p>
          </div>
        }>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataWithWAU}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => `Date: ${value}`}
                formatter={(value, name) => [
                  value,
                  name === 'users' ? 'DAU' : 'WAU (7-day avg)'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                name="users"
              />
              <Line 
                type="monotone" 
                dataKey="wau" 
                stroke="#10b981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#10b981', strokeWidth: 2 }}
                name="wau"
              />
            </LineChart>
          </ResponsiveContainer>
        </ClientOnly>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-2">📖 How to read this chart</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>DAU (solid line):</strong> Daily unique users. Expect weekday/weekend patterns.</li>
          <li>• <strong>WAU (dashed line):</strong> Smoothed trend that reduces daily noise.</li>
          <li>• <strong>Growth is good, but watch for:</strong> Sudden spikes (often bots) or steady decline.</li>
          <li>• <strong>Context matters:</strong> Compare to marketing campaigns, product releases, or external events.</li>
        </ul>
      </div>
    </div>
  )
}