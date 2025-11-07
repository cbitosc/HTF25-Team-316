"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Mail, 
  BookOpen, 
  GraduationCap, 
  Award, 
  Calendar,
  ArrowLeft,
  Edit,
  School,
  IdCard
} from "lucide-react"

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) return null

  const getInitials = (name: string | undefined) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadgeColor = (role: string | undefined) => {
    switch (role?.toLowerCase()) {
      case "teacher":
        return "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
      case "student":
        return "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400"
      case "admin":
        return "bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400"
      default:
        return "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-background dark:to-muted/20 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-6 hover:bg-white dark:hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Profile Header Card */}
        <Card className="mb-6 border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
          <CardContent className="pt-8 pb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <Avatar className="h-32 w-32 ring-4 ring-white dark:ring-muted shadow-xl">
                <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary to-purple-600 text-white">
                  {getInitials(user.display_name)}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {user.display_name || "User"}
                  </h1>
                  <Badge className={`w-fit ${getRoleBadgeColor(user.role)} border-0`}>
                    {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || "Student"}
                  </Badge>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 dark:text-gray-400 mb-4">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-white dark:bg-muted hover:bg-gray-50 dark:hover:bg-muted/80"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Full Name
                </label>
                <p className="text-base text-gray-900 dark:text-white mt-1">
                  {user.display_name || "Not provided"}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email Address
                </label>
                <p className="text-base text-gray-900 dark:text-white mt-1">
                  {user.email}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Role
                </label>
                <p className="text-base text-gray-900 dark:text-white mt-1">
                  {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || "Student"}
                </p>
              </div>

              {/* Student-specific fields */}
              {user.role === "student" && (
                <>
                  {user.student_id && (
                    <>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <IdCard className="h-4 w-4" />
                          Student ID
                        </label>
                        <p className="text-base text-gray-900 dark:text-white mt-1">
                          {user.student_id}
                        </p>
                      </div>
                    </>
                  )}
                  {user.grade && (
                    <>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          Grade
                        </label>
                        <p className="text-base text-gray-900 dark:text-white mt-1">
                          {user.grade}
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Teacher-specific fields */}
              {user.role === "teacher" && (
                <>
                  {user.teacher_id && (
                    <>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <IdCard className="h-4 w-4" />
                          Teacher ID
                        </label>
                        <p className="text-base text-gray-900 dark:text-white mt-1">
                          {user.teacher_id}
                        </p>
                      </div>
                    </>
                  )}
                  {user.department && (
                    <>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <School className="h-4 w-4" />
                          Department
                        </label>
                        <p className="text-base text-gray-900 dark:text-white mt-1">
                          {user.department}
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Activity Stats */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Activity Overview
              </CardTitle>
              <CardDescription>Your learning statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                      Courses
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">12</p>
                  <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">Enrolled</p>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-100 dark:border-green-900/30">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-900 dark:text-green-300">
                      Completed
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-400">8</p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">Courses</p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-100 dark:border-purple-900/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-purple-900 dark:text-purple-300">
                      Achievements
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">24</p>
                  <p className="text-xs text-purple-600 dark:text-purple-500 mt-1">Earned</p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-100 dark:border-orange-900/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <span className="text-sm font-medium text-orange-900 dark:text-orange-300">
                      Streak
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-orange-700 dark:text-orange-400">15</p>
                  <p className="text-xs text-orange-600 dark:text-orange-500 mt-1">Days</p>
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Overall Progress
                  </span>
                  <span className="text-sm font-bold text-primary">67%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-purple-600 h-full rounded-full transition-all duration-500"
                    style={{ width: "67%" }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card className="mt-6 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>Your account information and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Account Type</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Free Account • Upgrade to Pro for more features
                </p>
              </div>
              <Button variant="default" size="sm">
                Upgrade to Pro
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
