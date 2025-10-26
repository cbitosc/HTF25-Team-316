"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardPage } from "@/components/dashboard-page"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    // If not logged in, redirect to login page
    if (!loading && !user) {
      router.push('/login')
    }
    
    // If logged in as teacher, redirect to teacher dashboard
    if (!loading && user && user.role === 'teacher') {
      router.push('/teacher')
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

  // If user is authenticated and is a student, show dashboard
  if (user && user.role === 'student') {
    return <DashboardPage />
  }

  // While redirecting, show loading
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
