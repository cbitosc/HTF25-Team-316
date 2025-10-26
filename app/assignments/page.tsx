"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Filter,
  Search,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Moon,
  Sun,
} from "lucide-react"
import Link from "next/link"
import { useTheme } from "@/components/theme-provider"

export default function AssignmentsPage() {
  const { theme, toggleTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed">("all")

  const assignments = useMemo(() => [
    {
      id: 1,
      title: "Math Problem Set - Chapter 5",
      course: "Mathematics 101",
      description:
        "Complete problems 1-25 from Chapter 5 covering integration techniques including substitution, parts, and partial fractions. Show all work and include graphs where applicable.",
      dueDate: "2025-10-27",
      daysLeft: 2,
      status: "pending",
      progress: 60,
      points: 100,
      type: "Problem Set",
    },
    {
      id: 2,
      title: "Physics Lab Report - Newton's Laws",
      course: "Physics 201",
      description:
        "Write a comprehensive lab report on the Newton's Laws experiment conducted in class. Include hypothesis, methodology, data analysis, results, and conclusion. Minimum 5 pages.",
      dueDate: "2025-10-30",
      daysLeft: 5,
      status: "pending",
      progress: 30,
      points: 150,
      type: "Lab Report",
    },
    {
      id: 3,
      title: "English Essay - Shakespearean Themes",
      course: "English Literature",
      description:
        "Analyze the recurring themes in Shakespeare's Hamlet. Discuss the themes of revenge, madness, and mortality with specific examples from the text. Include at least 5 scholarly sources.",
      dueDate: "2025-11-01",
      daysLeft: 7,
      status: "pending",
      progress: 0,
      points: 200,
      type: "Essay",
    },
    {
      id: 4,
      title: "Chemistry: Periodic Table Quiz",
      course: "Chemistry 150",
      description:
        "Complete the online quiz covering elements 1-36 of the periodic table. Questions will include element names, symbols, atomic numbers, and properties.",
      dueDate: "2025-10-20",
      daysLeft: -5,
      status: "completed",
      progress: 100,
      points: 50,
      type: "Quiz",
      grade: "95%",
    },
    {
      id: 5,
      title: "Biology: Cell Structure Presentation",
      course: "Biology 101",
      description:
        "Create a 10-minute presentation on cell structure comparing prokaryotic and eukaryotic cells. Include diagrams, examples, and real-world applications.",
      dueDate: "2025-11-05",
      daysLeft: 11,
      status: "pending",
      progress: 15,
      points: 120,
      type: "Presentation",
    },
  ], [])

  const filteredAssignments = useMemo(() => 
    assignments.filter((assignment) => {
      const matchesSearch =
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.course.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter =
        filterStatus === "all" ||
        (filterStatus === "pending" && assignment.status === "pending") ||
        (filterStatus === "completed" && assignment.status === "completed")
      return matchesSearch && matchesFilter
    }),
    [assignments, searchQuery, filterStatus]
  )

  const getStatusColor = (daysLeft: number, status: string) => {
    if (status === "completed") return "text-blue-700 dark:text-primary"
    if (daysLeft < 0) return "text-red-700 dark:text-destructive"
    if (daysLeft <= 2) return "text-red-700 dark:text-destructive"
    if (daysLeft <= 4) return "text-yellow-700 dark:text-yellow-400"
    return "text-blue-700 dark:text-primary"
  }

  const getStatusBadge = (daysLeft: number, status: string) => {
    if (status === "completed") return { label: "Completed", color: "bg-blue-100 text-blue-800 dark:bg-primary/30 dark:text-primary-foreground border border-blue-300 dark:border-primary/30" }
    if (daysLeft < 0) return { label: "Overdue", color: "bg-red-100 text-red-800 dark:bg-destructive/30 dark:text-destructive-foreground border border-red-300 dark:border-destructive/30" }
    if (daysLeft <= 2) return { label: "Urgent", color: "bg-red-100 text-red-800 dark:bg-destructive/30 dark:text-destructive-foreground border border-red-300 dark:border-destructive/30" }
    if (daysLeft <= 4) return { label: "Due Soon", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/30 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-500/30" }
    return { label: "On Track", color: "bg-blue-100 text-blue-800 dark:bg-primary/30 dark:text-primary-foreground border border-blue-300 dark:border-primary/30" }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-start justify-between mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              className="hover:bg-muted transition-colors"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>
          <h1 className="text-3xl font-bold">All Assignments</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track all your assignments in one place
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
            >
              All ({assignments.length})
            </Button>
            <Button
              variant={filterStatus === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("pending")}
            >
              Pending ({assignments.filter((a) => a.status === "pending").length})
            </Button>
            <Button
              variant={filterStatus === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("completed")}
            >
              Completed ({assignments.filter((a) => a.status === "completed").length})
            </Button>
          </div>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => {
            const statusBadge = getStatusBadge(assignment.daysLeft, assignment.status)
            return (
              <Card key={assignment.id} className="p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-primary bg-gradient-to-br from-card to-primary/5">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Section */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{assignment.title}</h3>
                        <p className="text-sm text-muted-foreground">{assignment.course}</p>
                      </div>
                      <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{assignment.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span>{assignment.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className={`flex items-center gap-2 font-medium ${getStatusColor(assignment.daysLeft, assignment.status)}`}>
                        <Clock className="h-4 w-4" />
                        <span>
                          {assignment.status === "completed"
                            ? `Submitted`
                            : assignment.daysLeft < 0
                              ? `${Math.abs(assignment.daysLeft)} days overdue`
                              : `${assignment.daysLeft} days left`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="lg:w-64 space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{assignment.progress}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            assignment.status === "completed"
                              ? "bg-primary"
                              : "bg-gradient-to-r from-primary to-accent"
                          }`}
                          style={{ width: `${assignment.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Points</span>
                      <span className="font-semibold">{assignment.points} pts</span>
                    </div>
                    {assignment.grade && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Grade</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {assignment.grade}
                        </span>
                      </div>
                    )}
                    <Button
                      className="w-full"
                      variant={assignment.status === "completed" ? "outline" : "default"}
                    >
                      {assignment.status === "completed" ? "View Submission" : "Continue Working"}
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {filteredAssignments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No assignments found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
