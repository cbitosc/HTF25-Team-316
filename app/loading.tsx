export default function Loading() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="space-y-8 animate-pulse">
        {/* Header skeleton */}
        <div className="h-48 bg-muted rounded-2xl" />
        
        {/* Content skeletons */}
        <div className="h-64 bg-muted rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="h-48 bg-muted rounded-xl" />
          <div className="h-48 bg-muted rounded-xl" />
          <div className="h-48 bg-muted rounded-xl" />
        </div>
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    </div>
  )
}
