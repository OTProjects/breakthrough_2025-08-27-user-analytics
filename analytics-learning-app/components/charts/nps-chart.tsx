'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ClientOnly } from '@/components/ui/client-only'

interface NPSChartProps {
  data: Array<{ score: number; count: number }>
}

export function NPSChart({ data }: NPSChartProps) {
  // Ensure we have data for all scores 0-10
  const fullData = Array.from({ length: 11 }, (_, i) => {
    const existing = data.find(d => d.score === i)
    return {
      score: i,
      count: existing?.count || 0
    }
  })

  const totalResponses = fullData.reduce((sum, item) => sum + item.count, 0)
  
  const promoters = fullData.filter(d => d.score >= 9).reduce((sum, d) => sum + d.count, 0)
  const passives = fullData.filter(d => d.score >= 7 && d.score <= 8).reduce((sum, d) => sum + d.count, 0)
  const detractors = fullData.filter(d => d.score <= 6).reduce((sum, d) => sum + d.count, 0)
  
  const npsScore = totalResponses > 0 ? 
    Math.round(((promoters - detractors) / totalResponses) * 100) : 0

  function getNPSGrade(score: number): { grade: string; color: string; interpretation: string } {
    if (score >= 70) return {
      grade: 'Excellent',
      color: 'text-green-600',
      interpretation: 'Users love your product! Focus on growth and retention.'
    }
    if (score >= 50) return {
      grade: 'Great',
      color: 'text-blue-600',
      interpretation: 'Strong user satisfaction with room for improvement.'
    }
    if (score >= 30) return {
      grade: 'Good',
      color: 'text-yellow-600',
      interpretation: 'Users are satisfied but not enthusiastic.'
    }
    if (score >= 0) return {
      grade: 'Poor',
      color: 'text-orange-600',
      interpretation: 'Mixed feelings. Address user concerns.'
    }
    return {
      grade: 'Critical',
      color: 'text-red-600',
      interpretation: 'Users are unhappy. Immediate action needed.'
    }
  }

  const npsGrade = getNPSGrade(npsScore)

  function getBarColor(score: number): string {
    if (score >= 9) return '#10b981' // green for promoters
    if (score >= 7) return '#f59e0b' // yellow for passives
    return '#ef4444' // red for detractors
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Net Promoter Score (NPS)</h2>
        <p className="text-gray-600">
          Measures user loyalty by asking "How likely are you to recommend this app?"
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
              <BarChart data={fullData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="score" 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Score', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Responses', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value) => [`${value}`, 'Responses']}
                  labelFormatter={(score) => `Score: ${score}`}
                />
                <Bar dataKey="count">
                  {fullData.map((entry) => (
                    <Cell key={`cell-${entry.score}`} fill={getBarColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ClientOnly>
        </div>
        
        <div className="flex flex-col justify-center space-y-4">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
            <div className={`text-3xl font-bold ${npsGrade.color}`}>
              {npsScore}
            </div>
            <div className="text-sm text-gray-600 mt-1">NPS Score</div>
            <div className={`text-sm font-medium mt-1 ${npsGrade.color}`}>
              {npsGrade.grade}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm">Promoters (9-10)</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{promoters}</div>
                <div className="text-xs text-gray-500">
                  {totalResponses > 0 ? Math.round((promoters / totalResponses) * 100) : 0}%
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-sm">Passives (7-8)</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{passives}</div>
                <div className="text-xs text-gray-500">
                  {totalResponses > 0 ? Math.round((passives / totalResponses) * 100) : 0}%
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-sm">Detractors (0-6)</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{detractors}</div>
                <div className="text-xs text-gray-500">
                  {totalResponses > 0 ? Math.round((detractors / totalResponses) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-2">📖 Understanding NPS</h3>
        <p className={`text-sm mb-3 ${npsGrade.color} font-medium`}>
          {npsGrade.interpretation}
        </p>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>Calculation:</strong> NPS = (% Promoters) - (% Detractors). Range: -100 to +100</li>
          <li>• <strong>Promoters (9-10):</strong> Loyal enthusiasts who will refer others and fuel growth.</li>
          <li>• <strong>Passives (7-8):</strong> Satisfied but unenthusiastic. Vulnerable to competition.</li>
          <li>• <strong>Detractors (0-6):</strong> Unhappy customers who may damage your brand through negative word-of-mouth.</li>
          <li>• <strong>Industry benchmarks:</strong> SaaS ~30, E-commerce ~45, Social Media ~10</li>
        </ul>
      </div>
    </div>
  )
}