"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, BookOpen, BarChart3, MessageSquare, Clock, MapPin, Sparkles, TrendingUp, Award, Loader2, FileText, CheckCircle } from "lucide-react"
import api from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { Badge } from "@/components/ui/badge"

interface Material {
  id: string
  title: string
  description: string | null
  course_id: string
  type: string
  file_size: number
  tags: string[]
  is_public: boolean
  created_at: string
  view_count: number
  download_count: number
}

export function StudentView() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [materials, setMaterials] = useState<Material[]>([])
  const [loadingMaterials, setLoadingMaterials] = useState(true)
  const [motivationalQuote, setMotivationalQuote] = useState<string>("")
  const [loadingQuote, setLoadingQuote] = useState(true)
  const [assignments, setAssignments] = useState<any[]>([])
  const [loadingAssignments, setLoadingAssignments] = useState(true)

  useEffect(() => {
    fetchMaterials()
    fetchMotivationalQuote()
    fetchAssignments()
  }, [])

  const fetchMaterials = async () => {
    try {
      setLoadingMaterials(true)
      const { data } = await api.get('/materials/')
      setMaterials(data.materials || [])
    } catch (error) {
      console.error('Failed to fetch materials:', error)
    } finally {
      setLoadingMaterials(false)
    }
  }

  const fetchMotivationalQuote = async () => {
    try {
      setLoadingQuote(true)
      const { data } = await api.get('/quote/motivational')
      setMotivationalQuote(data.quote || "Keep learning, keep growing! 🌱")
    } catch (error) {
      console.error('Failed to fetch motivational quote:', error)
      setMotivationalQuote("Every day is a new opportunity to learn something amazing! ✨")
    } finally {
      setLoadingQuote(false)
    }
  }

  const fetchAssignments = async () => {
    try {
      setLoadingAssignments(true)
      const { data } = await api.get('/assignments/')
      setAssignments(data.assignments || [])
    } catch (error) {
      console.error('Failed to fetch assignments:', error)
    } finally {
      setLoadingAssignments(false)
    }
  }

  // Helper function to calculate days until deadline
  const getDaysUntilDeadline = (dueDate: string) => {
    const now = new Date()
    const deadline = new Date(dueDate)
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get count of pending assignments (due this week)
  const getPendingAssignmentsCount = () => {
    const now = new Date()
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return assignments.filter(assignment => {
      const dueDate = new Date(assignment.due_date)
      return dueDate <= oneWeekFromNow && dueDate >= now
    }).length
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Get top 3 materials for preview
  const previewMaterials = materials.slice(0, 3)

  return (
    <div className="space-y-8 p-6">
      <section className="animate-fade-in" aria-labelledby="greeting-heading">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 dark:from-slate-900 dark:via-purple-900 dark:to-violet-900 p-8 text-white shadow-2xl transform hover:scale-[1.01] transition-all duration-500 border border-white/20 dark:border-purple-500/30">
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 dark:bg-violet-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/20 dark:bg-purple-500/30 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/30 dark:border-purple-400/50">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span className="text-xs font-semibold">Student Dashboard</span>
            </div>
            
            <div className="space-y-2">
              <h2 id="greeting-heading" className="text-3xl md:text-4xl font-bold tracking-tight animate-slide-up">
                Welcome back, <span className="text-yellow-300 dark:text-yellow-400">{user?.display_name || 'Student'}!</span>
              </h2>
              
              {/* Motivational Quote Section */}
              <div className="mt-4 mb-2 animate-slide-up" style={{ animationDelay: "50ms" }}>
                {loadingQuote ? (
                  <div className="flex items-center justify-center gap-2 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-yellow-300" />
                    <span className="text-sm text-white/70">Loading inspiration...</span>
                  </div>
                ) : (
                  <div className="bg-white/15 dark:bg-purple-500/25 backdrop-blur-md rounded-xl p-4 border border-white/30 dark:border-purple-400/40 shadow-lg">
                    <p className="text-lg md:text-xl font-semibold text-center text-white italic leading-relaxed">
                      "{motivationalQuote}"
                    </p>
                  </div>
                )}
              </div>
              
              <p className="text-base text-white/90 font-medium animate-slide-up" style={{ animationDelay: "100ms" }}>
                You have <span className="text-yellow-300 dark:text-yellow-400 font-bold">
                  {loadingAssignments ? '...' : getPendingAssignmentsCount()} {getPendingAssignmentsCount() === 1 ? 'assignment' : 'assignments'}
                </span> due this week
              </p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-2xl mt-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
              <div className="bg-white/10 dark:bg-purple-500/20 backdrop-blur-md rounded-xl p-3 border border-white/20 dark:border-purple-400/30 hover:bg-white/20 dark:hover:bg-purple-500/30 transition-all duration-300 hover:scale-105 cursor-pointer group">
                <div className="flex items-center gap-2">
                  <div className="bg-yellow-400/20 dark:bg-yellow-500/30 p-2 rounded-lg group-hover:bg-yellow-400/30 dark:group-hover:bg-yellow-500/40 transition-colors">
                    <Award className="h-5 w-5 text-yellow-300 dark:text-yellow-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold">85%</p>
                    <p className="text-xs text-white/80">Overall Grade</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 dark:bg-purple-500/20 backdrop-blur-md rounded-xl p-3 border border-white/20 dark:border-purple-400/30 hover:bg-white/20 dark:hover:bg-purple-500/30 transition-all duration-300 hover:scale-105 cursor-pointer group">
                <div className="flex items-center gap-2">
                  <div className="bg-green-400/20 dark:bg-green-500/30 p-2 rounded-lg group-hover:bg-green-400/30 dark:group-hover:bg-green-500/40 transition-colors">
                    <TrendingUp className="h-5 w-5 text-green-300 dark:text-green-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold">15</p>
                    <p className="text-xs text-white/80">Completed</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 dark:bg-purple-500/20 backdrop-blur-md rounded-xl p-3 border border-white/20 dark:border-purple-400/30 hover:bg-white/20 dark:hover:bg-purple-500/30 transition-all duration-300 hover:scale-105 cursor-pointer group">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-400/20 dark:bg-blue-500/30 p-2 rounded-lg group-hover:bg-blue-400/30 dark:group-hover:bg-blue-500/40 transition-colors">
                    <BookOpen className="h-5 w-5 text-blue-300 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold">{materials.length}</p>
                    <p className="text-xs text-white/80">Materials</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Assignments Section */}
      <section className="animate-slide-up" style={{ animationDelay: "150ms" }} aria-labelledby="assignments-heading">
        <div className="flex items-center justify-between mb-4">
          <h3 id="assignments-heading" className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Assignments
          </h3>
          {!loadingAssignments && assignments.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {assignments.length} Total
            </Badge>
          )}
        </div>

        {loadingAssignments ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="bg-primary/10 p-4 rounded-full">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-lg font-semibold">No assignments yet!</h4>
              <p className="text-sm text-muted-foreground">
                Your teachers haven't assigned any work yet. Check back later!
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((assignment) => {
              const daysUntil = getDaysUntilDeadline(assignment.due_date)
              const isOverdue = daysUntil < 0
              const isUrgent = daysUntil >= 0 && daysUntil <= 2
              const isDueSoon = daysUntil > 2 && daysUntil <= 7

              return (
                <Card 
                  key={assignment.id} 
                  className={`p-6 hover:shadow-lg transition-all duration-300 border-l-4 ${
                    isOverdue 
                      ? 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20' 
                      : isUrgent 
                      ? 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20'
                      : isDueSoon
                      ? 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20'
                      : 'border-l-primary'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header with course name */}
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className="text-xs">
                        {assignment.course_name || 'General'}
                      </Badge>
                      {assignment.points && (
                        <Badge variant="secondary" className="text-xs">
                          {assignment.points} pts
                        </Badge>
                      )}
                    </div>

                    {/* Assignment Title */}
                    <h4 className="font-semibold text-lg leading-tight line-clamp-2">
                      {assignment.title}
                    </h4>

                    {/* Description */}
                    {assignment.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {assignment.description}
                      </p>
                    )}

                    {/* Due Date with urgency indicator */}
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className={`h-4 w-4 ${
                        isOverdue ? 'text-red-500' : isUrgent ? 'text-orange-500' : 'text-muted-foreground'
                      }`} />
                      <span className={
                        isOverdue 
                          ? 'text-red-500 font-semibold' 
                          : isUrgent 
                          ? 'text-orange-500 font-semibold'
                          : 'text-muted-foreground'
                      }>
                        {isOverdue 
                          ? `Overdue by ${Math.abs(daysUntil)} ${Math.abs(daysUntil) === 1 ? 'day' : 'days'}`
                          : daysUntil === 0
                          ? 'Due today!'
                          : daysUntil === 1
                          ? 'Due tomorrow'
                          : `Due in ${daysUntil} days`
                        }
                      </span>
                    </div>

                    {/* Date */}
                    <div className="text-xs text-muted-foreground">
                      {formatDate(assignment.due_date)}
                    </div>

                    {/* Action Button */}
                    <Button 
                      size="sm" 
                      className="w-full mt-2"
                      variant={isOverdue ? 'destructive' : isUrgent ? 'default' : 'outline'}
                    >
                      {isOverdue ? 'Submit Late' : 'View & Submit'}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <section className="animate-slide-up" style={{ animationDelay: "100ms" }} aria-labelledby="schedule-heading">
        <div className="flex items-center justify-between">
          <h3 id="schedule-heading" className="text-xl font-semibold">
            Today's Schedule
          </h3>
          <Button variant="ghost" size="sm">
            <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
            View Full Schedule
          </Button>
        </div>
        <Card className="mt-4 p-6 border-l-4 border-l-primary bg-gradient-to-br from-card to-primary/5">
          <div className="space-y-4">
            {[
              { time: "09:00 AM", subject: "Mathematics", room: "A101", instructor: "Dr. Smith" },
              { time: "10:30 AM", subject: "Physics", room: "B205", instructor: "Prof. Johnson" },
              { time: "01:00 PM", subject: "English", room: "C310", instructor: "Ms. Williams" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-primary/10 dark:hover:bg-primary/20 transition-all duration-300 focus-within:ring-2 focus-within:ring-primary group"
                role="article"
                aria-label={`${item.subject} class at ${item.time} in room ${item.room}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="rounded-lg bg-primary/10 dark:bg-primary/20 p-3 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors"
                    aria-hidden="true"
                  >
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold group-hover:text-primary transition-colors">{item.subject}</p>
                    <p className="text-sm text-muted-foreground">{item.instructor}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{item.time}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    {item.room}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="animate-slide-up" style={{ animationDelay: "200ms" }} aria-labelledby="assignments-heading">
        <div className="flex items-center justify-between">
          <h3 id="assignments-heading" className="text-xl font-semibold">
            Active Assignments
          </h3>
          <Link href="/assignments">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
          {[
            { title: "Math Problem Set", due: "Due in 2 days", progress: 60, daysLeft: 2 },
            { title: "Physics Lab Report", due: "Due in 5 days", progress: 30, daysLeft: 5 },
            { title: "English Essay", due: "Due in 7 days", progress: 0, daysLeft: 7 },
          ].map((assignment, idx) => (
            <Card
              key={idx}
              className="min-w-80 flex-shrink-0 p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer focus-within:ring-2 focus-within:ring-accent border-t-4 border-t-accent hover:border-t-accent/80 bg-gradient-to-br from-card to-accent/10"
              role="article"
              aria-label={`${assignment.title}, ${assignment.due}, ${assignment.progress}% complete`}
            >
              <div className="flex items-start justify-between">
                <h4 className="font-semibold">{assignment.title}</h4>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    assignment.daysLeft <= 2
                      ? "bg-red-100 text-red-800 dark:bg-destructive/30 dark:text-destructive-foreground border border-red-300 dark:border-destructive/30"
                      : assignment.daysLeft <= 4
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/30 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-500/30"
                        : "bg-green-100 text-green-800 dark:bg-green-500/30 dark:text-green-300 border border-green-300 dark:border-green-500/30"
                  }`}
                  aria-label={`${assignment.daysLeft} days remaining`}
                >
                  {assignment.daysLeft}d left
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{assignment.due}</p>
              <div className="mt-4 space-y-2">
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-accent/70 transition-all"
                    style={{ width: `${assignment.progress}%` }}
                    role="progressbar"
                    aria-valuenow={assignment.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${assignment.progress}% complete`}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{assignment.progress}% complete</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full bg-purple-50 dark:bg-accent/20 border-purple-300 dark:border-accent/30 hover:bg-purple-100 dark:hover:bg-accent/30 text-purple-900 dark:text-accent-foreground hover:text-purple-900 dark:hover:text-accent-foreground font-medium"
              >
                Continue Working
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section className="animate-slide-up" style={{ animationDelay: "300ms" }} aria-labelledby="materials-heading">
        <div className="flex items-center justify-between">
          <h3 id="materials-heading" className="text-xl font-semibold">
            Study Materials
          </h3>
          <Link href="/materials">
            <Button variant="ghost" size="sm">
              <BookOpen className="mr-2 h-4 w-4" aria-hidden="true" />
              Browse All
            </Button>
          </Link>
        </div>
        
        {loadingMaterials ? (
          <div className="mt-4 flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : previewMaterials.length === 0 ? (
          <Card className="mt-4 p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">No materials available yet</p>
            <p className="text-xs text-muted-foreground mt-1">Check back later for study materials</p>
          </Card>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {previewMaterials.map((material) => (
              <Card
                key={material.id}
                className="p-4 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group focus-within:ring-2 focus-within:ring-secondary border-r-4 border-r-secondary hover:border-r-secondary/80 bg-gradient-to-br from-card to-secondary/10"
                role="article"
                aria-label={`${material.title}, ${formatFileSize(material.file_size)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium group-hover:text-secondary transition-colors">
                      {material.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{material.course_id}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatFileSize(material.file_size)}</p>
                  </div>
                  <span className="text-xs font-semibold text-teal-900 dark:text-secondary-foreground bg-teal-100 dark:bg-secondary/30 px-2 py-1 rounded border border-teal-300 dark:border-secondary/30">
                    {material.type.toUpperCase()}
                  </span>
                </div>
                <Link href="/materials">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full bg-teal-50 dark:bg-secondary/20 border-teal-300 dark:border-secondary/30 hover:bg-teal-100 dark:hover:bg-secondary/30 text-teal-900 dark:text-secondary-foreground hover:text-teal-900 dark:hover:text-secondary-foreground font-medium"
                  >
                    View
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="animate-slide-up" style={{ animationDelay: "400ms" }} aria-labelledby="performance-heading">
        <div className="flex items-center justify-between">
          <h3 id="performance-heading" className="text-xl font-semibold">
            Your Performance
          </h3>
          <Link href="/analytics">
            <Button variant="ghost" size="sm">
              <BarChart3 className="mr-2 h-4 w-4" aria-hidden="true" />
              Detailed Report
            </Button>
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            { label: "Average Score", value: "87%", color: "from-primary to-primary/70", icon: "📊", borderColor: "border-l-primary" },
            { label: "Assignments Done", value: "12/15", color: "from-secondary to-secondary/70", icon: "✓", borderColor: "border-l-secondary" },
            { label: "Attendance", value: "95%", color: "from-accent to-accent/70", icon: "📍", borderColor: "border-l-accent" },
          ].map((stat, idx) => (
            <Card
              key={idx}
              className={`p-6 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary bg-gradient-to-br from-card to-primary/5 border-l-4 ${stat.borderColor} cursor-pointer group`}
              role="article"
              aria-label={`${stat.label}: ${stat.value}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`mt-2 text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </div>
                <span className="text-2xl" aria-hidden="true">
                  {stat.icon}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="animate-slide-up" style={{ animationDelay: "500ms" }} aria-labelledby="feedback-heading">
        <div className="flex items-center justify-between">
          <h3 id="feedback-heading" className="text-xl font-semibold">
            Recent Feedback
          </h3>
          <Button variant="ghost" size="sm">
            <MessageSquare className="mr-2 h-4 w-4" aria-hidden="true" />
            View All
          </Button>
        </div>
        <Card className="mt-4 p-6 border-l-4 border-l-pink-500">
          <div className="space-y-4">
            {[
              {
                teacher: "Dr. Smith",
                subject: "Mathematics",
                feedback: "Great work on the last assignment! Keep it up.",
                date: "2 days ago",
              },
              {
                teacher: "Ms. Johnson",
                subject: "Physics",
                feedback: "Please review the lab procedures before next class.",
                date: "1 week ago",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border p-4 hover:bg-pink-50 dark:hover:bg-pink-950/20 transition-colors focus-within:ring-2 focus-within:ring-pink-500"
                role="article"
                aria-label={`Feedback from ${item.teacher} about ${item.subject}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{item.teacher}</p>
                    <p className="text-sm text-muted-foreground">{item.subject}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                </div>
                <p className="mt-2 text-sm">{item.feedback}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}
