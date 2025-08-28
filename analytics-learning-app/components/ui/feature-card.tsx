import React from 'react'
import Link from 'next/link'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  buttonText: string
  buttonVariant?: 'primary' | 'secondary' | 'destructive'
  ariaDescribedById?: string
  ariaDescription?: string
}

export function FeatureCard({
  icon,
  title,
  description,
  href,
  buttonText,
  buttonVariant = 'primary',
  ariaDescribedById,
  ariaDescription
}: FeatureCardProps) {
  const buttonClass = buttonVariant === 'primary' 
    ? 'btn-primary' 
    : buttonVariant === 'secondary'
    ? 'btn-secondary'
    : 'btn-destructive'

  return (
    <div className="card card-content group hover:shadow-xl transition-all duration-300">
      <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
        {icon}
      </div>
      <h2 className="text-xl font-semibold mb-3 text-foreground">{title}</h2>
      <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
        {description}
      </p>
      <Link 
        href={href} 
        className={`${buttonClass} text-sm`}
        aria-describedby={ariaDescribedById}
      >
        {buttonText}
      </Link>
      {ariaDescription && (
        <p id={ariaDescribedById} className="sr-only">
          {ariaDescription}
        </p>
      )}
    </div>
  )
}