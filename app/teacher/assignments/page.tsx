"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TopBar } from "@/components/top-bar"
import { Progress } from "@/components/ui/progress"
import { Loader2, ClipboardList, Plus, Calendar, Users } from "lucide-react"

export default function TeacherAssignmentsPage() {
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

  const assignments = [
    {
      id: 1,
      title: "RAG Model Project",
      course: "Artificial Intelligence 101",
      dueDate: "Oct 30, 2025",
      totalStudents: 28,
      submitted: 18,
      graded: 12,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: 2,
      title: "Physics Lab Report",
      course: "Physics 201",
      dueDate: "Oct 28, 2025",
      totalStudents: 32,
      submitted: 28,
      graded: 28,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 3,
      title: "Chemistry Quiz",
      course: "Chemistry 150",
      dueDate: "Nov 2, 2025",
      totalStudents: 25,
      submitted: 12,
      graded: 8,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: 4,
      title: "Algorithm Analysis",
      course: "Computer Science 101",
      dueDate: "Nov 5, 2025",
      totalStudents: 35,
      submitted: 5,
      graded: 0,
      color: "from-orange-500 to-red-500",
    },
    {
      id: 5,
      title: "Calculus Problem Set",
      course: "Mathematics 101",
      dueDate: "Oct 27, 2025",
      totalStudents: 28,
      submitted: 25,
      graded: 20,
      color: "from-teal-500 to-blue-500",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <TopBar role="teacher" />
      
      <main className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">All Assignments</h1>
                <p className="text-muted-foreground">View and manage all assignments with completion status</p>
              </div>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Assignment
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Assignments</p>
              <p className="text-2xl font-bold mt-1">{assignments.length}</p>
            </div>
          </Card>
          <Card className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Submissions</p>
              <p className="text-2xl font-bold mt-1 text-green-600">
                {assignments.reduce((sum, a) => sum + a.submitted, 0)}
              </p>
            </div>
          </Card>
          <Card className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">Pending Grading</p>
              <p className="text-2xl font-bold mt-1 text-orange-600">
                {assignments.reduce((sum, a) => sum + (a.submitted - a.graded), 0)}
              </p>
            </div>
          </Card>
          <Card className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">Avg Completion</p>
              <p className="text-2xl font-bold mt-1">
                {Math.round(
                  (assignments.reduce((sum, a) => sum + a.submitted, 0) /
                    assignments.reduce((sum, a) => sum + a.totalStudents, 0)) *
                    100
                )}%
              </p>
            </div>
          </Card>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const completionPercentage = Math.round((assignment.submitted / assignment.totalStudents) * 100)
            const gradingPercentage = assignment.submitted > 0 
              ? Math.round((assignment.graded / assignment.submitted) * 100) 
              : 0

            return (
              <Card key={assignment.id} className="p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{assignment.title}</h3>
                    <p className="text-sm text-muted-foreground">{assignment.course}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {assignment.dueDate}</span>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Submission Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Submission Progress</span>
                      <span className="text-sm font-semibold">
                        {assignment.submitted}/{assignment.totalStudents} ({completionPercentage}%)
                      </span>
                    </div>
                    <Progress value={completionPercentage} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {assignment.totalStudents - assignment.submitted} students pending
                    </p>
                  </div>

                  {/* Grading Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Grading Progress</span>
                      <span className="text-sm font-semibold">
                        {assignment.graded}/{assignment.submitted} ({gradingPercentage}%)
                      </span>
                    </div>
                    <Progress value={gradingPercentage} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {assignment.submitted - assignment.graded} submissions need grading
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Grade Submissions
                  </Button>
                  <Button variant="outline" size="sm">
                    Send Reminder
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
