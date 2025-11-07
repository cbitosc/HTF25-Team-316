"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TopBar } from "@/components/top-bar"
import { Progress } from "@/components/ui/progress"
import { Loader2, ClipboardList, Plus, Calendar, Users, FileText } from "lucide-react"
import { CreateAssignmentModal } from "@/components/create-assignment-modal"
import api from "@/lib/api"

export default function TeacherAssignmentsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [assignments, setAssignments] = useState<any[]>([])
  const [fetchingAssignments, setFetchingAssignments] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
    if (!loading && user && user.role !== 'teacher') {
      router.push('/')
    }
  }, [user, loading, router])

  // Fetch assignments
  const fetchAssignments = async () => {
    try {
      setFetchingAssignments(true)
      const response = await api.get('/assignments/')
      const assignmentsData = response.data.assignments || []
      
      // Transform API data
      const transformedAssignments = assignmentsData.map((assignment: any) => {
        const dueDate = new Date(assignment.due_date)
        const today = new Date()
        const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        return {
          id: assignment.id,
          title: assignment.title,
          course: assignment.course_name || "General",
          dueDate: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          totalStudents: 0, // This would come from a separate API
          submitted: 0,
          graded: 0,
          description: assignment.description,
          points: assignment.points || 100,
          daysLeft: daysLeft,
        }
      })
      
      setAssignments(transformedAssignments)
    } catch (error) {
      console.error('Failed to fetch assignments:', error)
      setAssignments([])
    } finally {
      setFetchingAssignments(false)
    }
  }

  useEffect(() => {
    if (user && user.role === 'teacher') {
      fetchAssignments()
    }
  }, [user])

  const handleAssignmentCreated = () => {
    // Refresh assignments list
    fetchAssignments()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || user.role !== 'teacher') return null

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
            <Button className="gap-2" onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Assignment
            </Button>
          </div>
        </div>

        {fetchingAssignments ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No assignments yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Create your first assignment to get started
            </p>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 mb-8">
              <Card className="p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Total Assignments</p>
                  <p className="text-2xl font-bold mt-1">{assignments.length}</p>
                </div>
              </Card>
              <Card className="p-6">
                <div>
                  <p className="text-sm text-muted-foreground">Active Assignments</p>
                  <p className="text-2xl font-bold mt-1 text-green-600">
                    {assignments.filter(a => a.daysLeft >= 0).length}
                  </p>
                </div>
              </Card>
            </div>

            {/* Assignments List */}
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="p-6 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground">{assignment.course}</p>
                      <p className="text-sm text-muted-foreground mt-2">{assignment.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {assignment.dueDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Points: </span>
                      <span className="font-semibold">{assignment.points}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Create Assignment Modal */}
      <CreateAssignmentModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={handleAssignmentCreated}
      />
    </div>
  )
}
