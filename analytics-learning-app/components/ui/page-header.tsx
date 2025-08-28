import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  showBackButton?: boolean
  backHref?: string
  backLabel?: string
  children?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  showBackButton = false,
  backHref = "/",
  backLabel = "Back to Home",
  children
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
      <div className="flex items-center gap-4">
        {showBackButton && (
          <Link 
            href={backHref}
            className="btn-ghost text-sm h-auto px-3 py-2"
            aria-label={`Return to ${backLabel.toLowerCase()}`}
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>
        )}
        <div>
          <h1 className="text-h2 text-foreground">{title}</h1>
          {description && (
            <p className="text-muted-foreground text-sm mt-1">{description}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-4">
          {children}
        </div>
      )}
    </div>
  )
}