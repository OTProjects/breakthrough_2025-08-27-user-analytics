'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ClientOnly } from '@/components/ui/client-only'

interface RetentionChartProps {
  data: Array<{ day: number; retained: number; cohortSize: number }>
}

export function RetentionChart({ data }: RetentionChartProps) {
  const retentionData = data.map(item => ({
    ...item,
    retentionRate: Math.round((item.retained / item.cohortSize) * 100),
    dayLabel: item.day === 0 ? 'D0' : item.day === 1 ? 'D1' : item.day === 7 ? 'D7' : item.day === 30 ? 'D30' : `D${item.day}`
  }))

  const d1Retention = retentionData.find(d => d.day === 1)?.retentionRate || 0
  const d7Retention = retentionData.find(d => d.day === 7)?.retentionRate || 0

  function getRetentionGrade(d1: number, d7: number): { grade: string; color: string; message: string } {
    if (d1 >= 40 && d7 >= 20) return { 
      grade: 'A', 
      color: 'text-green-600', 
      message: 'Excellent retention! Users find strong value.' 
    }
    if (d1 >= 25 && d7 >= 15) return { 
      grade: 'B', 
      color: 'text-blue-600', 
      message: 'Good retention with room to improve.' 
    }
    if (d1 >= 15 && d7 >= 10) return { 
      grade: 'C', 
      color: 'text-yellow-600', 
      message: 'Average retention. Focus on onboarding.' 
    }
    return { 
      grade: 'D', 
      color: 'text-red-600', 
      message: 'Low retention. Users may not see value quickly enough.' 
    }
  }

  const retentionGrade = getRetentionGrade(d1Retention, d7Retention)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">User Retention Curve</h2>
        <p className="text-gray-600">
          Shows what percentage of users return after their first visit. The steeper the drop, the faster you're losing users.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2 h-64">
          <ClientOnly fallback={
            <div className="flex items-center justify-center h-full bg-gray-50 rounded border">
              <p className="text-gray-500">Loading chart...</p>
            </div>
          }>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="dayLabel" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={[0, 100]}
                  label={{ value: 'Retention %', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  labelFormatter={(value) => `${value}`}
                  formatter={(value) => [`${value}%`, 'Retention Rate']}
                />
                <Line 
                  type="monotone" 
                  dataKey="retentionRate" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ClientOnly>
        </div>
        
        <div className="flex flex-col justify-center space-y-4">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
            <div className={`text-3xl font-bold ${retentionGrade.color}`}>
              {retentionGrade.grade}
            </div>
            <div className="text-sm text-gray-600 mt-1">Retention Grade</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">D1 Retention</span>
              <span className="font-medium">{d1Retention}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">D7 Retention</span>
              <span className="font-medium">{d7Retention}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Cohort Size</span>
              <span className="font-medium">{data[0]?.cohortSize || 0}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-2">📖 Understanding retention</h3>
        <p className={`text-sm mb-3 ${retentionGrade.color} font-medium`}>
          {retentionGrade.message}
        </p>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>D1 (Day 1):</strong> Critical metric. If users don't return the next day, they likely won't return at all.</li>
          <li>• <strong>D7 (Day 7):</strong> Shows if users form a habit. Good D7 retention predicts long-term success.</li>
          <li>• <strong>The curve flattens:</strong> Users who stay longer tend to keep coming back (survivor bias).</li>
          <li>• <strong>Industry benchmarks:</strong> Social apps ~25% D1, Productivity ~15% D1, Games ~40% D1.</li>
        </ul>
      </div>
    </div>
  )
}