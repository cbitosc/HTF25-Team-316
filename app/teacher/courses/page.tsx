"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TopBar } from "@/components/top-bar"
import { Loader2, GraduationCap, Users, BookOpen, Plus, Edit, Trash2 } from "lucide-react"

export default function TeacherCoursesPage() {
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

  const courses = [
    {
      id: 1,
      name: "Mathematics 101",
      code: "MATH101",
      students: 28,
      assignments: 5,
      status: "Active",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: 2,
      name: "Physics 201",
      code: "PHYS201",
      students: 32,
      assignments: 4,
      status: "Active",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 3,
      name: "Chemistry 150",
      code: "CHEM150",
      students: 25,
      assignments: 6,
      status: "Active",
      color: "from-green-500 to-emerald-500",
    },
    {
      id: 4,
      name: "Computer Science 101",
      code: "CS101",
      students: 35,
      assignments: 7,
      status: "Active",
      color: "from-orange-500 to-red-500",
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
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">All Courses</h1>
                <p className="text-muted-foreground">Manage your active courses and subjects</p>
              </div>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Course
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold mt-1">{courses.length}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-primary opacity-50" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold mt-1">
                  {courses.reduce((sum, course) => sum + course.students, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assignments</p>
                <p className="text-2xl font-bold mt-1">
                  {courses.reduce((sum, course) => sum + course.assignments, 0)}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Status</p>
                <p className="text-2xl font-bold mt-1 text-green-600">All Active</p>
              </div>
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
            </div>
          </Card>
        </div>

        {/* Courses Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{course.name}</h3>
                    <p className="text-sm text-muted-foreground">{course.code}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                    {course.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Students Enrolled</span>
                  <span className="font-semibold">{course.students}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Assignments</span>
                  <span className="font-semibold">{course.assignments}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
