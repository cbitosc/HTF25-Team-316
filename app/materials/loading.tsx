export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-10 w-48 bg-muted rounded" />
            <div className="h-6 w-96 bg-muted rounded" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="space-y-6 animate-pulse">
          <div className="h-12 bg-muted rounded" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="h-80 bg-muted rounded-xl" />
            <div className="h-80 bg-muted rounded-xl" />
            <div className="h-80 bg-muted rounded-xl" />
            <div className="h-80 bg-muted rounded-xl" />
            <div className="h-80 bg-muted rounded-xl" />
            <div className="h-80 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
