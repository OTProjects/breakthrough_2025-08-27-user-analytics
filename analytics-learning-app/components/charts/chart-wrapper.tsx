'use client'

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

// Dynamically import all chart components to avoid SSR issues
export const DAUChart = dynamic(() => import('./dau-chart').then(mod => ({ default: mod.DAUChart })), {
  ssr: false
})

export const FunnelChart = dynamic(() => import('./funnel-chart').then(mod => ({ default: mod.FunnelChart })), {
  ssr: false
})

export const RetentionChart = dynamic(() => import('./retention-chart').then(mod => ({ default: mod.RetentionChart })), {
  ssr: false
})

export const ExperimentChart = dynamic(() => import('./experiment-chart').then(mod => ({ default: mod.ExperimentChart })), {
  ssr: false
})

export const NPSChart = dynamic(() => import('./nps-chart').then(mod => ({ default: mod.NPSChart })), {
  ssr: false
})

export const FeedbackWordCloud = dynamic(() => import('./feedback-wordcloud').then(mod => ({ default: mod.FeedbackWordCloud })), {
  ssr: false
})