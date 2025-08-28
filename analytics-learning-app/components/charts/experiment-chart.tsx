'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ClientOnly } from '@/components/ui/client-only'

interface ExperimentChartProps {
  data: {
    control: { users: number; conversions: number }
    treatment: { users: number; conversions: number }
    uplift: number
    confidence: number
  }
}

export function ExperimentChart({ data }: ExperimentChartProps) {
  const controlRate = (data.control.conversions / data.control.users) * 100
  const treatmentRate = (data.treatment.conversions / data.treatment.users) * 100
  
  const chartData = [
    {
      variant: 'Control',
      conversionRate: Number(controlRate.toFixed(1)),
      users: data.control.users,
      conversions: data.control.conversions,
      color: '#6b7280'
    },
    {
      variant: 'Treatment\n(Smart Hints)',
      conversionRate: Number(treatmentRate.toFixed(1)),
      users: data.treatment.users,
      conversions: data.treatment.conversions,
      color: data.uplift > 0 ? '#10b981' : '#ef4444'
    }
  ]

  function getSignificanceLevel(confidence: number): { level: string; color: string; interpretation: string } {
    if (confidence >= 95) return {
      level: 'High',
      color: 'text-green-600',
      interpretation: 'Results are statistically significant. Safe to ship!'
    }
    if (confidence >= 90) return {
      level: 'Medium',
      color: 'text-yellow-600',
      interpretation: 'Promising results, but consider running longer for more confidence.'
    }
    return {
      level: 'Low',
      color: 'text-red-600',
      interpretation: 'Not enough evidence. Keep testing or increase sample size.'
    }
  }

  const significance = getSignificanceLevel(data.confidence)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">A/B Test: Smart Hints Feature</h2>
        <p className="text-gray-600">
          Testing whether showing helpful hints increases checklist completion rates.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="h-64">
          <ClientOnly fallback={
            <div className="flex items-center justify-center h-full bg-gray-50 rounded border">
              <p className="text-gray-500">Loading chart...</p>
            </div>
          }>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="variant" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={[0, 'dataMax + 5']}
                  label={{ value: 'Conversion %', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Conversion Rate']}
                  labelFormatter={(label) => `Variant: ${label.replace('\\n', ' ')}`}
                />
                <Bar dataKey="conversionRate">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ClientOnly>
        </div>
        
        <div className="flex flex-col justify-center space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-700">
                {controlRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Control</div>
              <div className="text-xs text-gray-500">
                {data.control.conversions}/{data.control.users}
              </div>
            </div>
            
            <div className={`${data.uplift > 0 ? 'bg-green-50' : 'bg-red-50'} rounded-lg p-3 text-center`}>
              <div className={`text-2xl font-bold ${data.uplift > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {treatmentRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Treatment</div>
              <div className="text-xs text-gray-500">
                {data.treatment.conversions}/{data.treatment.users}
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Uplift</span>
              <span className={`font-bold ${data.uplift > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.uplift > 0 ? '+' : ''}{data.uplift.toFixed(1)}%
              </span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Confidence</span>
              <span className={`font-medium ${significance.color}`}>
                {data.confidence.toFixed(1)}%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Significance</span>
              <span className={`font-medium ${significance.color}`}>
                {significance.level}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-2">📊 Experiment interpretation</h3>
        <p className={`text-sm mb-3 ${significance.color} font-medium`}>
          {significance.interpretation}
        </p>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>Statistical significance:</strong> We need 95%+ confidence before making decisions.</li>
          <li>• <strong>Effect size matters:</strong> A 0.1% improvement might be significant but not meaningful.</li>
          <li>• <strong>Sample size:</strong> Small samples can show big differences by chance. More data = more reliable.</li>
          <li>• <strong>Duration:</strong> Run tests for at least one full business cycle (usually 1-2 weeks).</li>
        </ul>
      </div>
    </div>
  )
}