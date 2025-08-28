import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  message?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  className = '', 
  message 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`text-center ${className}`}>
      <div className={`spinner mx-auto mb-4 ${sizeClasses[size]}`} role="status" aria-label="Loading">
        <span className="sr-only">Loading...</span>
      </div>
      {message && (
        <p className="text-muted-foreground" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  )
}

interface LoadingPageProps {
  message?: string
}

export function LoadingPage({ message = "Loading..." }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <LoadingSpinner size="lg" message={message} />
    </div>
  )
}