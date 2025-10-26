"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TopBar } from "@/components/top-bar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, CheckCircle, Clock, XCircle, Download, Eye } from "lucide-react"

export default function TeacherSubmissionsPage() {
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

  const submissions = [
    {
      id: 1,
      student: "John Doe",
      studentId: "STU001",
      assignment: "RAG Model Project",
      course: "AI 101",
      submittedAt: "2 hours ago",
      status: "Graded",
      grade: "92%",
    },
    {
      id: 2,
      student: "Jane Smith",
      studentId: "STU002",
      assignment: "Physics Lab Report",
      course: "Physics 201",
      submittedAt: "5 hours ago",
      status: "Pending Review",
      grade: "-",
    },
    {
      id: 3,
      student: "Mike Johnson",
      studentId: "STU003",
      assignment: "Chemistry Quiz",
      course: "Chemistry 150",
      submittedAt: "1 day ago",
      status: "Graded",
      grade: "88%",
    },
    {
      id: 4,
      student: "Sarah Williams",
      studentId: "STU004",
      assignment: "Algorithm Analysis",
      course: "CS 101",
      submittedAt: "3 hours ago",
      status: "Pending Review",
      grade: "-",
    },
    {
      id: 5,
      student: "David Brown",
      studentId: "STU005",
      assignment: "Calculus Problem Set",
      course: "Mathematics 101",
      submittedAt: "6 hours ago",
      status: "Graded",
      grade: "95%",
    },
    {
      id: 6,
      student: "Emily Davis",
      studentId: "STU006",
      assignment: "Physics Lab Report",
      course: "Physics 201",
      submittedAt: "12 hours ago",
      status: "Graded",
      grade: "90%",
    },
    {
      id: 7,
      student: "James Wilson",
      studentId: "STU007",
      assignment: "Chemistry Quiz",
      course: "Chemistry 150",
      submittedAt: "1 day ago",
      status: "Pending Review",
      grade: "-",
    },
  ]

  const getStatusBadge = (status: string) => {
    if (status === "Graded") {
      return (
        <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Graded
        </Badge>
      )
    }
    if (status === "Pending Review") {
      return (
        <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Pending Review
        </Badge>
      )
    }
    return (
      <Badge variant="outline">
        {status}
      </Badge>
    )
  }

  const pendingCount = submissions.filter(s => s.status === "Pending Review").length
  const gradedCount = submissions.filter(s => s.status === "Graded").length

  return (
    <div className="min-h-screen bg-background">
      <TopBar role="teacher" />
      
      <main className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-primary/10">
              <Send className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">All Submissions</h1>
              <p className="text-muted-foreground">View and grade student submissions</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Submissions</p>
              <p className="text-2xl font-bold mt-1">{submissions.length}</p>
            </div>
          </Card>
          <Card className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">Graded</p>
              <p className="text-2xl font-bold mt-1 text-green-600">{gradedCount}</p>
            </div>
          </Card>
          <Card className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
              <p className="text-2xl font-bold mt-1 text-yellow-600">{pendingCount}</p>
            </div>
          </Card>
          <Card className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">Avg Grade</p>
              <p className="text-2xl font-bold mt-1">91%</p>
            </div>
          </Card>
        </div>

        {/* Submissions List */}
        <Card className="p-6">
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-all"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  {/* Student Info */}
                  <div>
                    <p className="font-semibold">{submission.student}</p>
                    <p className="text-sm text-muted-foreground">{submission.studentId}</p>
                  </div>

                  {/* Assignment Info */}
                  <div>
                    <p className="font-medium text-sm">{submission.assignment}</p>
                    <p className="text-xs text-muted-foreground">{submission.course}</p>
                  </div>

                  {/* Submission Time */}
                  <div className="text-sm text-muted-foreground">
                    {submission.submittedAt}
                  </div>

                  {/* Status */}
                  <div>
                    {getStatusBadge(submission.status)}
                  </div>

                  {/* Grade */}
                  <div className="flex items-center justify-between">
                    <span className={`text-lg font-bold ${
                      submission.grade === "-" ? "text-muted-foreground" : "text-primary"
                    }`}>
                      {submission.grade}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  )
}
