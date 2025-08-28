interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      role="status"
      aria-label="Loading content"
    />
  )
}

export function ChecklistCardSkeleton() {
  return (
    <div className="card card-content">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
            <Skeleton className="w-5 h-5 rounded-md" />
            <Skeleton className="flex-1 h-4" />
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-1.5 w-24 rounded-full" />
        </div>
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

export function FeatureCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="w-12 h-12 bg-gray-100 rounded-xl mb-4">
        <Skeleton className="w-full h-full rounded-xl" />
      </div>
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-6" />
      <Skeleton className="h-9 w-24 rounded-lg" />
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="card card-content">
      <div className="card-header">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="card-content">
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  )
}