"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users, FileText, BarChart3, CheckCircle, Clock, AlertCircle, GraduationCap, BookOpen, Trophy, Loader2 } from "lucide-react"
import { CreateAssignmentModal } from "@/components/create-assignment-modal"
import api from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"

export function TeacherView() {
  const router = useRouter()
  const { user } = useAuth()
  const [showCreateAssignment, setShowCreateAssignment] = useState(false)
  const [motivationalQuote, setMotivationalQuote] = useState<string>("")
  const [loadingQuote, setLoadingQuote] = useState(true)

  useEffect(() => {
    fetchMotivationalQuote()
  }, [])

  const fetchMotivationalQuote = async () => {
    try {
      setLoadingQuote(true)
      const { data } = await api.get('/quote/motivational')
      setMotivationalQuote(data.quote || "Keep inspiring, keep teaching! 🌟")
    } catch (error) {
      console.error('Failed to fetch motivational quote:', error)
      setMotivationalQuote("Great teachers inspire greatness in others! ✨")
    } finally {
      setLoadingQuote(false)
    }
  }

  return (
    <div className="space-y-8 p-6">
      <section className="animate-fade-in">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 dark:from-indigo-950 dark:via-purple-950 dark:to-fuchsia-950 p-8 text-white shadow-2xl transform hover:scale-[1.01] transition-all duration-500 border border-white/20 dark:border-fuchsia-500/30">
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 dark:bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400/20 dark:bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/20 dark:bg-fuchsia-500/30 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/30 dark:border-fuchsia-400/50">
              <GraduationCap className="h-4 w-4 animate-pulse" />
              <span className="text-xs font-semibold">Teacher Dashboard</span>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight animate-slide-up">
                Welcome back, <span className="text-yellow-300 dark:text-yellow-400">{user?.display_name || 'Teacher'}!</span>
              </h2>
              
              {/* Motivational Quote Section */}
              <div className="mt-4 mb-2 animate-slide-up" style={{ animationDelay: "50ms" }}>
                {loadingQuote ? (
                  <div className="flex items-center justify-center gap-2 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-yellow-300" />
                    <span className="text-sm text-white/70">Loading inspiration...</span>
                  </div>
                ) : (
                  <div className="bg-white/15 dark:bg-fuchsia-500/25 backdrop-blur-md rounded-xl p-4 border border-white/30 dark:border-fuchsia-400/40 shadow-lg">
                    <p className="text-lg md:text-xl font-semibold text-center text-white italic leading-relaxed">
                      "{motivationalQuote}"
                    </p>
                  </div>
                )}
              </div>
              
              <p className="text-base text-white/90 font-medium animate-slide-up" style={{ animationDelay: "100ms" }}>
                You have <span className="text-yellow-300 dark:text-yellow-400 font-bold">24 students</span> across <span className="text-yellow-300 dark:text-yellow-400 font-bold">3 courses</span>
              </p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-2xl mt-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
              <div className="bg-white/10 dark:bg-fuchsia-500/20 backdrop-blur-md rounded-xl p-3 border border-white/20 dark:border-fuchsia-400/30 hover:bg-white/20 dark:hover:bg-fuchsia-500/30 transition-all duration-300 hover:scale-105 cursor-pointer group">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-400/20 dark:bg-blue-500/30 p-2 rounded-lg group-hover:bg-blue-400/30 dark:group-hover:bg-blue-500/40 transition-colors">
                    <Users className="h-5 w-5 text-blue-300 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold">24</p>
                    <p className="text-xs text-white/80">Total Students</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 dark:bg-fuchsia-500/20 backdrop-blur-md rounded-xl p-3 border border-white/20 dark:border-fuchsia-400/30 hover:bg-white/20 dark:hover:bg-fuchsia-500/30 transition-all duration-300 hover:scale-105 cursor-pointer group">
                <div className="flex items-center gap-2">
                  <div className="bg-green-400/20 dark:bg-green-500/30 p-2 rounded-lg group-hover:bg-green-400/30 dark:group-hover:bg-green-500/40 transition-colors">
                    <CheckCircle className="h-5 w-5 text-green-300 dark:text-green-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold">18</p>
                    <p className="text-xs text-white/80">Submissions</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 dark:bg-fuchsia-500/20 backdrop-blur-md rounded-xl p-3 border border-white/20 dark:border-fuchsia-400/30 hover:bg-white/20 dark:hover:bg-fuchsia-500/30 transition-all duration-300 hover:scale-105 cursor-pointer group">
                <div className="flex items-center gap-2">
                  <div className="bg-orange-400/20 dark:bg-orange-500/30 p-2 rounded-lg group-hover:bg-orange-400/30 dark:group-hover:bg-orange-500/40 transition-colors">
                    <Trophy className="h-5 w-5 text-orange-300 dark:text-orange-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold">92%</p>
                    <p className="text-xs text-white/80">Avg Score</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="animate-slide-up" style={{ animationDelay: "100ms" }}>
        <h3 id="assignments-heading" className="mb-4 text-xl font-semibold">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Button
            onClick={() => setShowCreateAssignment(true)}
            className="h-24 flex-col gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md"
          >
            <Plus className="h-6 w-6" />
            <span>Create Assignment</span>
          </Button>
          <Button
            onClick={() => router.push('/teacher/study-materials')}
            variant="outline"
            className="h-24 flex-col gap-2 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900/30 dark:hover:to-orange-900/40 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 font-semibold"
          >
            <FileText className="h-6 w-6" />
            <span>Upload Material</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col gap-2 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-900/30 hover:from-teal-100 hover:to-teal-200 dark:hover:from-teal-900/30 dark:hover:to-teal-900/40 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 font-semibold"
          >
            <Users className="h-6 w-6" />
            <span>View Submissions</span>
          </Button>
        </div>
      </section>

      <section className="animate-slide-up" style={{ animationDelay: "150ms" }}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Active Assignments</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={() => router.push('/teacher/assignments')}
          >
            View All
          </Button>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3 lg:grid-cols-4">
          {[
            {
              title: "RAG Model Project",
              course: "AI 101",
              dueDate: "Oct 30",
              totalStudents: 28,
              submitted: 18,
              color: "from-blue-500 to-cyan-500",
            },
            {
              title: "Physics Lab Report",
              course: "Physics 201",
              dueDate: "Oct 28",
              totalStudents: 32,
              submitted: 28,
              color: "from-purple-500 to-pink-500",
            },
            {
              title: "Chemistry Quiz",
              course: "Chemistry 150",
              dueDate: "Nov 2",
              totalStudents: 25,
              submitted: 12,
              color: "from-green-500 to-emerald-500",
            },
          ].map((assignment, idx) => {
            const completionPercentage = Math.round((assignment.submitted / assignment.totalStudents) * 100)
            return (
              <Card
                key={idx}
                className="p-3 hover:shadow-md transition-all duration-300 border-l-2 border-l-primary"
              >
                <div>
                  <h4 className="font-semibold text-sm line-clamp-1">{assignment.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{assignment.course}</p>
                  <div className="mt-2">
                    <span className="text-xs text-muted-foreground">Due: {assignment.dueDate}</span>
                  </div>
                </div>
                
                <div className="space-y-1.5 mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">
                      {assignment.submitted}/{assignment.totalStudents}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${assignment.color} transition-all duration-500`}
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-center font-medium text-muted-foreground">{completionPercentage}%</p>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="animate-slide-up" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center justify-between">
          <h3 id="courses-heading" className="text-xl font-semibold">Your Courses</h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/teacher/courses')}
          >
            View All Courses
          </Button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Mathematics 101",
              students: 28,
              assignments: 5,
              submissions: 24,
              color: "from-primary to-primary/70",
              borderColor: "border-l-primary",
            },
            {
              name: "Physics 201",
              students: 32,
              assignments: 4,
              submissions: 28,
              color: "from-accent to-accent/70",
              borderColor: "border-l-accent",
            },
            {
              name: "Chemistry 150",
              students: 25,
              assignments: 6,
              submissions: 20,
              color: "from-secondary to-secondary/70",
              borderColor: "border-l-secondary",
            },
          ].map((course, idx) => (
            <Card
              key={idx}
              className={`p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group border-l-4 ${course.borderColor} bg-gradient-to-br from-card to-primary/5`}
            >
              <div className="flex items-start justify-between">
                <h4 className="font-semibold group-hover:text-primary transition-colors">{course.name}</h4>
                <span
                  className={`text-xs font-semibold bg-blue-100 dark:bg-primary/30 text-blue-900 dark:text-primary-foreground border border-blue-300 dark:border-primary/30 px-3 py-1 rounded-full`}
                >
                  {course.students} students
                </span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Assignments</p>
                  <span className="font-semibold">{course.assignments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Submissions</p>
                  <span className="font-semibold text-green-700 dark:text-green-400">
                    {course.submissions}/{course.students}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${course.color}`}
                    style={{ width: `${(course.submissions / course.students) * 100}%` }}
                  />
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-4 w-full bg-gray-50 dark:bg-transparent hover:bg-gray-100 dark:hover:bg-muted font-medium">
                Manage Course
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section className="animate-slide-up" style={{ animationDelay: "300ms" }}>
        <div className="flex items-center justify-between">
          <h3 id="submissions-heading" className="text-xl font-semibold">Recent Submissions</h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/teacher/submissions')}
          >
            View All
          </Button>
        </div>
        <Card className="mt-4 p-6 border-t-4 border-t-primary bg-gradient-to-br from-card to-primary/5">
          <div className="space-y-3">
            {[
              {
                student: "John Doe",
                assignment: "Math Problem Set",
                status: "Submitted",
                grade: "92%",
                date: "2 hours ago",
              },
              {
                student: "Jane Smith",
                assignment: "Physics Lab",
                status: "Pending",
                grade: "-",
                date: "Pending",
              },
              {
                student: "Mike Johnson",
                assignment: "Chemistry Quiz",
                status: "Submitted",
                grade: "88%",
                date: "1 day ago",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-primary/10 dark:hover:bg-primary/20 transition-all duration-300 group"
              >
                <div className="flex-1">
                  <p className="font-semibold group-hover:text-primary transition-colors">{item.student}</p>
                  <p className="text-sm text-muted-foreground">{item.assignment}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      {item.status === "Submitted" ? (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          item.status === "Submitted"
                            ? "text-green-600 dark:text-green-400"
                            : "text-yellow-600 dark:text-yellow-400"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
                  </div>
                  <span className="text-sm font-semibold min-w-12 text-right">{item.grade}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="animate-slide-up" style={{ animationDelay: "400ms" }}>
        <div className="flex items-center justify-between">
          <h3 id="analytics-heading" className="text-xl font-semibold">Class Analytics</h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/teacher/student-analytics')}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Detailed Report
          </Button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            { label: "Total Students", value: "85", color: "from-blue-500 to-cyan-500", icon: "👥" },
            { label: "Avg. Submission Rate", value: "92%", color: "from-green-500 to-emerald-500", icon: "✓" },
            { label: "Avg. Grade", value: "84%", color: "from-purple-500 to-pink-500", icon: "📊" },
          ].map((stat, idx) => (
            <Card key={idx} className="p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-card to-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`mt-2 text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </div>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="animate-slide-up" style={{ animationDelay: "500ms" }}>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Recent Feedbacks</h3>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>
        <div className="mt-4 grid gap-3">
          {[
            {
              student: "Sarah Johnson",
              course: "Mathematics 101",
              feedback: "The lecture on differential equations was very clear and helpful. Would love more practice problems!",
              rating: 5,
              date: "2 hours ago",
              avatar: "SJ",
            },
            {
              student: "Michael Chen",
              course: "Physics 201",
              feedback: "Great explanation of quantum mechanics. The visual demonstrations really helped me understand the concepts better.",
              rating: 5,
              date: "5 hours ago",
              avatar: "MC",
            },
            {
              student: "Emma Williams",
              course: "Chemistry 150",
              feedback: "The lab experiment was interesting, but I think we need more time to complete the analysis section.",
              rating: 4,
              date: "1 day ago",
              avatar: "EW",
            },
          ].map((feedback, idx) => (
            <Card
              key={idx}
              className="p-4 hover:shadow-lg transition-all duration-300 border-t-2 border-t-yellow-500"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                  {feedback.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{feedback.student}</h4>
                      <p className="text-xs text-muted-foreground truncate">{feedback.course}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="flex items-center gap-0.5 mb-0.5">
                        {Array.from({ length: feedback.rating }).map((_, i) => (
                          <span key={i} className="text-yellow-500 text-xs">★</span>
                        ))}
                        {Array.from({ length: 5 - feedback.rating }).map((_, i) => (
                          <span key={i} className="text-gray-300 dark:text-gray-600 text-xs">★</span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">{feedback.date}</p>
                    </div>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed bg-muted/50 p-2 rounded-lg line-clamp-2">
                    "{feedback.feedback}"
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      Reply
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      Mark as Read
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Create Assignment Modal */}
      <CreateAssignmentModal 
        open={showCreateAssignment} 
        onOpenChange={setShowCreateAssignment}
        onSuccess={() => {
          // Optionally refresh data or show success message
          console.log('Assignment created successfully')
        }}
      />
    </div>
  )
}
