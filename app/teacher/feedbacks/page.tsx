"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TopBar } from "@/components/top-bar"
import { Loader2, MessageSquare, Star, Reply } from "lucide-react"

export default function TeacherFeedbacksPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
    if (!loading && user && user.role !== 'teacher') {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || user.role !== 'teacher') return null

  const feedbacks = [
    {
      id: 1,
      student: "Sarah Johnson",
      studentId: "ST2025001",
      course: "Artificial Intelligence 101",
      rating: 5,
      comment: "The RAG model assignment was excellent! Really helped me understand the concepts.",
      date: "2 days ago",
      replied: false,
    },
    {
      id: 2,
      student: "Michael Chen",
      studentId: "ST2025002",
      course: "Physics 201",
      rating: 4,
      comment: "The lab experiments were great, but would love more time for the reports.",
      date: "3 days ago",
      replied: true,
    },
    {
      id: 3,
      student: "Emily Davis",
      studentId: "ST2025003",
      course: "Chemistry 150",
      rating: 5,
      comment: "Your explanations are very clear and easy to understand. Thank you!",
      date: "4 days ago",
      replied: false,
    },
    {
      id: 4,
      student: "David Wilson",
      studentId: "ST2025004",
      course: "Computer Science 101",
      rating: 4,
      comment: "Great course content. The algorithm assignments are challenging but rewarding.",
      date: "1 week ago",
      replied: true,
    },
    {
      id: 5,
      student: "Jessica Lee",
      studentId: "ST2025005",
      course: "Artificial Intelligence 101",
      rating: 5,
      comment: "Best course I've taken! The Scout Assistant feature is really helpful.",
      date: "1 week ago",
      replied: false,
    },
  ]

  const avgRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
  const responseRate = Math.round((feedbacks.filter(f => f.replied).length / feedbacks.length) * 100)

  return (
    <div className="min-h-screen bg-background">
      <TopBar role="teacher" />
      
      <main className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Feedback Review</h1>
              <p className="text-muted-foreground">View and respond to student feedback</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Feedbacks</p>
              <p className="text-2xl font-bold mt-1">{feedbacks.length}</p>
            </div>
          </Card>
          <Card className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl font-bold text-yellow-600">{avgRating.toFixed(1)}</p>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(avgRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">Recent (7 days)</p>
              <p className="text-2xl font-bold mt-1 text-blue-600">3</p>
            </div>
          </Card>
          <Card className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">Response Rate</p>
              <p className="text-2xl font-bold mt-1 text-green-600">{responseRate}%</p>
            </div>
          </Card>
        </div>

        {/* Feedbacks List */}
        <div className="grid gap-4">
          {feedbacks.map((feedback) => (
            <Card key={feedback.id} className="p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{feedback.student}</h3>
                    <span className="text-sm text-muted-foreground">({feedback.studentId})</span>
                    {feedback.replied && (
                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                        Replied
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{feedback.course}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < feedback.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{feedback.date}</span>
                </div>
              </div>
              <p className="text-muted-foreground mb-4 italic">&ldquo;{feedback.comment}&rdquo;</p>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" className="gap-2">
                  <Reply className="h-4 w-4" />
                  {feedback.replied ? 'View Reply' : 'Reply'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
