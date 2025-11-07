"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Brain,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Moon,
  Sun,
} from "lucide-react"
import Link from "next/link"
import { useTheme } from "@/components/theme-provider"

export default function AnalyticsPage() {
  const { theme, toggleTheme } = useTheme()
  const performanceData = {
    overallGrade: 85,
    trend: "up",
    courses: [
      { name: "Mathematics 101", grade: 92, progress: 92, color: "from-blue-500 to-blue-600" },
      { name: "Physics 201", grade: 84, progress: 84, color: "from-purple-500 to-purple-600" },
      { name: "English Literature", grade: 78, progress: 78, color: "from-pink-500 to-pink-600" },
      { name: "Chemistry 150", grade: 88, progress: 88, color: "from-orange-500 to-orange-600" },
    ],
    assignmentStats: {
      completed: 15,
      pending: 3,
      overdue: 0,
      avgScore: 87,
    },
    studyTime: {
      thisWeek: 18,
      lastWeek: 15,
      avgPerDay: 2.5,
    },
  }

  const swotAnalysis = {
    strengths: [
      "Excellent performance in Mathematics (92%)",
      "Consistent assignment submission rate",
      "Strong analytical and problem-solving skills",
      "Active participation in class discussions",
    ],
    weaknesses: [
      "English Literature needs improvement (78%)",
      "Essay writing could be more structured",
      "Time management during exams",
      "Less engagement with study materials",
    ],
    opportunities: [
      "Join the Math Club to enhance skills",
      "Attend English tutoring sessions",
      "Participate in peer study groups",
      "Utilize additional online resources",
    ],
    threats: [
      "Upcoming challenging Physics concepts",
      "Multiple assignments due same week",
      "Potential for burnout if pace continues",
      "Competition for scholarship opportunities",
    ],
  }

  const recommendations = [
    {
      priority: "high",
      title: "Focus on English Literature",
      description: "Your weakest subject. Consider attending extra help sessions and forming study groups.",
      action: "Schedule tutoring session",
    },
    {
      priority: "medium",
      title: "Maintain Math Excellence",
      description: "You're excelling here! Consider helping peers or taking advanced challenges.",
      action: "Join Math Club",
    },
    {
      priority: "medium",
      title: "Improve Study Consistency",
      description: "Increase daily study time by 30 minutes for better long-term retention.",
      action: "Update study schedule",
    },
    {
      priority: "low",
      title: "Build Study Habits",
      description: "Create a structured routine for reviewing materials after each class.",
      action: "Create routine",
    },
  ]

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
          <h1 className="text-3xl font-bold">Performance Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Track your progress and get personalized improvement recommendations
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Overall Performance */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm opacity-90">Overall Grade</p>
                <p className="text-4xl font-bold mt-2">{performanceData.overallGrade}%</p>
              </div>
              {performanceData.trend === "up" ? (
                <TrendingUp className="h-8 w-8 opacity-80" />
              ) : (
                <TrendingDown className="h-8 w-8 opacity-80" />
              )}
            </div>
            <p className="text-xs opacity-80 mt-4">↑ 3% from last month</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assignments</p>
                <p className="text-3xl font-bold mt-2">{performanceData.assignmentStats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-4">Completed this semester</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Score</p>
                <p className="text-3xl font-bold mt-2">{performanceData.assignmentStats.avgScore}%</p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-4">Across all assignments</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Study Time</p>
                <p className="text-3xl font-bold mt-2">{performanceData.studyTime.thisWeek}h</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-4">This week</p>
          </Card>
        </div>

        {/* Course Performance */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Course Performance</h2>
          <div className="space-y-4">
            {performanceData.courses.map((course, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{course.name}</span>
                  <span className="font-semibold">{course.grade}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${course.color} transition-all`}
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* SWOT Analysis */}
        <div>
          <h2 className="text-2xl font-bold mb-4">SWOT Analysis</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Strengths */}
            <Card className="p-6 border-l-4 border-l-green-500">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold">Strengths</h3>
              </div>
              <ul className="space-y-2">
                {swotAnalysis.strengths.map((item, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Weaknesses */}
            <Card className="p-6 border-l-4 border-l-red-500">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <h3 className="text-lg font-semibold">Weaknesses</h3>
              </div>
              <ul className="space-y-2">
                {swotAnalysis.weaknesses.map((item, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400 mt-0.5">×</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Opportunities */}
            <Card className="p-6 border-l-4 border-l-blue-500">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold">Opportunities</h3>
              </div>
              <ul className="space-y-2">
                {swotAnalysis.opportunities.map((item, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Threats */}
            <Card className="p-6 border-l-4 border-l-yellow-500">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <h3 className="text-lg font-semibold">Threats</h3>
              </div>
              <ul className="space-y-2">
                {swotAnalysis.threats.map((item, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">!</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* Recommendations */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Personalized Recommendations</h2>
          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={
                        rec.priority === "high" ? "destructive" : rec.priority === "medium" ? "default" : "secondary"
                      }
                    >
                      {rec.priority}
                    </Badge>
                    <h3 className="font-semibold">{rec.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </div>
                <Button variant="outline" size="sm">
                  {rec.action}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
