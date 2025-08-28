'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ClientOnly } from '@/components/ui/client-only'

interface FunnelChartProps {
  data: Array<{ step: string; users: number; conversion: number }>
}

export function FunnelChart({ data }: FunnelChartProps) {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
  
  const biggestDropIndex = data.reduce((maxIndex, item, index) => {
    if (index === 0) return 0
    const currentDrop = data[index - 1].conversion - item.conversion
    const maxDrop = data[maxIndex === 0 ? 1 : maxIndex - 1]?.conversion - data[maxIndex]?.conversion || 0
    return currentDrop > maxDrop ? index : maxIndex
  }, 0)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">User Journey Funnel</h2>
        <p className="text-gray-600">
          Shows how users progress through key actions. Each step shows the conversion rate from the previous step.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="h-64">
          <ClientOnly fallback={<div className="flex items-center justify-center h-full bg-gray-50 rounded border"><p className="text-gray-500">Loading chart...</p></div>}>
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="step" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'users' ? `${value} users` : `${value}%`,
                  name === 'users' ? 'Users' : 'Conversion Rate'
                ]}
              />
              <Bar dataKey="users" name="users">
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === biggestDropIndex ? '#ef4444' : colors[index % colors.length]} 
                  />
                ))}
              </Bar>
            </BarChart>
            </ResponsiveContainer>
          </ClientOnly>
        </div>
        
        <div className="flex flex-col justify-center">
          <h3 className="font-medium mb-4">Conversion Rates</h3>
          <div className="space-y-3">
            {data.map((step, index) => (
              <div key={step.step} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-3 h-3 rounded ${index === biggestDropIndex ? 'bg-red-500' : 'bg-gray-400'}`}
                  />
                  <span className="text-sm">{step.step}</span>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${index === biggestDropIndex ? 'text-red-600' : ''}`}>
                    {step.conversion}%
                  </div>
                  <div className="text-xs text-gray-500">{step.users} users</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-2">📖 How to read this funnel</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>Red bars indicate the biggest drop-off:</strong> Focus optimization efforts here first.</li>
          <li>• <strong>Typical patterns:</strong> Visit → Sign up (2-5%), Sign up → First action (20-40%), First action → Return (10-30%)</li>
          <li>• <strong>Common issues:</strong> Confusing UI, too many steps, unclear value proposition.</li>
          <li>• <strong>Improvement tactics:</strong> A/B test fewer steps, clearer CTAs, better onboarding.</li>
        </ul>
      </div>
    </div>
  )
}