'use client'

import { useState, useEffect } from 'react'
import { Database, Globe, Info } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { LoadingPage } from '@/components/ui/loading-spinner'
import { 
  DAUChart,
  FunnelChart,
  RetentionChart,
  ExperimentChart,
  NPSChart,
  FeedbackWordCloud
} from '@/components/charts/chart-wrapper'

interface AnalyticsData {
  dau: Array<{ date: string; users: number }>
  funnel: Array<{ step: string; users: number; conversion: number }>
  retention: Array<{ day: number; retained: number; cohortSize: number }>
  experiment: {
    control: { users: number; conversions: number }
    treatment: { users: number; conversions: number }
    uplift: number
    confidence: number
  }
  nps: Array<{ score: number; count: number }>
  feedback: Array<{ text: string; sentiment: string; type: string }>
}

export default function LabPage() {
  const [dataSource, setDataSource] = useState<'local' | 'posthog'>('local')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalyticsData()
  }, [dataSource]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadAnalyticsData() {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/analytics?source=${dataSource}`)
      
      if (!response.ok) {
        throw new Error('Failed to load analytics data')
      }
      
      const analyticsData = await response.json()
      console.log('Analytics data received:', analyticsData) // Debug log
      setData(analyticsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Failed to load analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingPage message="Loading analytics data..." />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-foreground">Error Loading Data</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={loadAnalyticsData}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <PageHeader
          title="Analytics Lab"
          description="Real-time insights from your usage data"
          showBackButton={true}
        >
          <div className="flex bg-card rounded-lg border border-border p-1 shadow-sm">
            <button
              onClick={() => setDataSource('local')}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
                dataSource === 'local'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
              aria-pressed={dataSource === 'local'}
            >
              <Database className="w-4 h-4" />
              Local Data
            </button>
            <button
              onClick={() => setDataSource('posthog')}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
                dataSource === 'posthog'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
              aria-pressed={dataSource === 'posthog'}
            >
              <Globe className="w-4 h-4" />
              PostHog API
            </button>
          </div>
        </PageHeader>

        {/* Introduction */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Welcome to the Analytics Lab
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                This dashboard shows real analytics from your usage of the app. Each chart teaches different 
                concepts about product analytics, A/B testing, and user feedback analysis.
              </p>
              <div className="bg-blue-100/50 rounded-lg p-4 border border-blue-200/50">
                <p className="text-sm text-gray-700">
                  <strong className="text-blue-800">Learning tip:</strong> Pay attention to the explanation sections below each chart. 
                  They explain common patterns and pitfalls in analytics interpretation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {data && (
          <div className="space-y-6">
            {/* DAU/WAU Chart */}
            <div className="card card-content">
              <DAUChart data={data.dau} />
            </div>

            {/* Funnel Analysis */}
            <div className="card card-content">
              <FunnelChart data={data.funnel} />
            </div>

            {/* Retention Analysis */}
            <div className="card card-content">
              <RetentionChart data={data.retention} />
            </div>

            {/* A/B Test Results */}
            <div className="card card-content">
              <ExperimentChart data={data.experiment} />
            </div>

            {/* NPS Distribution */}
            <div className="card card-content">
              <NPSChart data={data.nps} />
            </div>

            {/* Feedback Word Cloud */}
            <div className="card card-content">
              <FeedbackWordCloud data={data.feedback} />
            </div>
          </div>
        )}

        {/* Footer with learning resources */}
        <div className="mt-12 bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Continue Learning</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Analytics Guide</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Read the comprehensive guide on interpreting these metrics in 
                <code className="bg-gray-100 px-2 py-1 rounded text-xs ml-1 font-mono text-gray-800">/docs/analytics_guide.md</code>
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Generate Data</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Generate more data by using the app, then run 
                <code className="bg-gray-100 px-2 py-1 rounded text-xs ml-1 font-mono text-gray-800">npm run simulate</code> 
                to create realistic traffic patterns.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Data Analysis</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Run <code className="bg-gray-100 px-2 py-1 rounded text-xs ml-1 font-mono text-gray-800">npm run analyze</code> 
                in your terminal for detailed statistical analysis of your experiments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}