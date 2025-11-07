"use client"

import { useEffect, Suspense, lazy } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { TopBar } from "@/components/top-bar"
import { Loader2 } from "lucide-react"

// Dynamic imports for heavy components
const TeacherView = lazy(() => import("@/components/teacher-view").then(mod => ({ default: mod.TeacherView })))

// Loading skeleton component
function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-6 animate-pulse">
      <div className="h-48 bg-muted rounded-2xl" />
      <div className="h-64 bg-muted rounded-xl" />
      <div className="h-64 bg-muted rounded-xl" />
    </div>
  )
}

export default function TeacherDashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    // If not logged in, redirect to login page
    if (!loading && !user) {
      router.push('/login')
    }
    
    // If logged in but not a teacher, redirect to student dashboard
    if (!loading && user && user.role !== 'teacher') {
      router.push('/')
    }
  }, [user, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If user is authenticated and is a teacher, show teacher dashboard
  if (user && user.role === 'teacher') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <TopBar role="teacher" />

        <main className="flex-1" role="main">
          <Suspense fallback={<DashboardSkeleton />}>
            <TeacherView />
          </Suspense>
        </main>
      </div>
    )
  }

  // While redirecting, show loading
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
