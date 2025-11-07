"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TopBar } from "@/components/top-bar"
import { Loader2, BarChart3, TrendingUp, TrendingDown, Minus, User } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function TeacherStudentAnalyticsPage() {
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

  const students = [
    {
      id: 1,
      name: "Sarah Johnson",
      studentId: "ST2025001",
      overallGrade: 94,
      assignmentCompletion: 100,
      avgSubmissionTime: "On time",
      trend: "up",
      courses: 4,
    },
    {
      id: 2,
      name: "Michael Chen",
      studentId: "ST2025002",
      overallGrade: 88,
      assignmentCompletion: 95,
      avgSubmissionTime: "1 day early",
      trend: "up",
      courses: 3,
    },
    {
      id: 3,
      name: "Emily Davis",
      studentId: "ST2025003",
      overallGrade: 92,
      assignmentCompletion: 100,
      avgSubmissionTime: "On time",
      trend: "stable",
      courses: 4,
    },
    {
      id: 4,
      name: "David Wilson",
      studentId: "ST2025004",
      overallGrade: 76,
      assignmentCompletion: 80,
      avgSubmissionTime: "2 days late",
      trend: "down",
      courses: 3,
    },
    {
      id: 5,
      name: "Jessica Lee",
      studentId: "ST2025005",
      overallGrade: 90,
      assignmentCompletion: 95,
      avgSubmissionTime: "On time",
      trend: "up",
      courses: 4,
    },
  ]

  const classAvg = Math.round(students.reduce((sum, s) => sum + s.overallGrade, 0) / students.length)
  const avgCompletion = Math.round(students.reduce((sum, s) => sum + s.assignmentCompletion, 0) / students.length)

  return (
    <div className="min-h-screen bg-background">
      <TopBar role="teacher" />
      
      <main className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Student Analytics</h1>
              <p className="text-muted-foreground">Class performance and individual student progress</p>
            </div>
          </div>
        </div>

        {/* Class Average Section */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Class Average Performance</h2>
          <div className="grid gap-6 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Overall Grade</p>
              <p className="text-3xl font-bold text-blue-600">{classAvg}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Assignment Completion</p>
              <p className="text-3xl font-bold text-green-600">{avgCompletion}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Students</p>
              <p className="text-3xl font-bold">{students.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Engagement Rate</p>
              <p className="text-3xl font-bold text-purple-600">89%</p>
            </div>
          </div>
        </Card>

        {/* Individual Students Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Individual Student Performance</h2>
          <div className="grid gap-4">
            {students.map((student) => (
              <Card key={student.id} className="p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{student.name}</h3>
                        <span className="text-sm text-muted-foreground">({student.studentId})</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{student.courses} courses enrolled</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {student.trend === 'up' && (
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="h-5 w-5" />
                        <span className="text-sm font-medium">Improving</span>
                      </div>
                    )}
                    {student.trend === 'down' && (
                      <div className="flex items-center gap-1 text-red-600">
                        <TrendingDown className="h-5 w-5" />
                        <span className="text-sm font-medium">Declining</span>
                      </div>
                    )}
                    {student.trend === 'stable' && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Minus className="h-5 w-5" />
                        <span className="text-sm font-medium">Stable</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-3 mb-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Overall Grade</span>
                      <span className="text-sm font-bold">{student.overallGrade}%</span>
                    </div>
                    <Progress value={student.overallGrade} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Assignment Completion</span>
                      <span className="text-sm font-bold">{student.assignmentCompletion}%</span>
                    </div>
                    <Progress value={student.assignmentCompletion} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Submission Timing</span>
                      <span className={`text-sm font-bold ${
                        student.avgSubmissionTime.includes('late') ? 'text-red-600' :
                        student.avgSubmissionTime.includes('early') ? 'text-green-600' :
                        'text-blue-600'
                      }`}>
                        {student.avgSubmissionTime}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" size="sm">View Detailed Report</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
