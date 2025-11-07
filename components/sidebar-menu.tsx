"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import {
  Menu,
  LayoutDashboard,
  FileText,
  BookOpen,
  BarChart3,
  HelpCircle,
  MessageSquare,
  ChevronRight,
  GraduationCap,
  Send,
  FolderOpen,
  ClipboardList,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface SidebarMenuProps {
  role: "student" | "teacher"
}

export function SidebarMenu({ role }: SidebarMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleNavigation = (path: string) => {
    setIsOpen(false)
    // For now, we'll scroll to sections or navigate to new pages
    if (path.startsWith("#")) {
      // Scroll to dashboard
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else if (path.startsWith("/")) {
      // Navigate to new page using Next.js router
      router.push(path)
    }
  }

  const studentMenuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "#",
      description: "Overview of your activities",
    },
    {
      icon: FileText,
      label: "Assignments",
      path: "/assignments",
      description: "View all assignments & deadlines",
    },
    {
      icon: BookOpen,
      label: "Study Materials",
      path: "/materials",
      description: "Access learning resources",
    },
    {
      icon: BarChart3,
      label: "Analytics",
      path: "/analytics",
      description: "Track your progress & performance",
    },
  ]

  const teacherMenuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/teacher",
      description: "Overview of your classes",
    },
    {
      icon: GraduationCap,
      label: "Courses",
      path: "/teacher/courses",
      description: "View all active courses/subjects",
    },
    {
      icon: ClipboardList,
      label: "Assignments",
      path: "/teacher/assignments",
      description: "View & manage all assignments",
    },
    {
      icon: Send,
      label: "Submissions",
      path: "/teacher/submissions",
      description: "View all student submissions",
    },
    {
      icon: FolderOpen,
      label: "Study Material",
      path: "/teacher/study-materials",
      description: "View uploaded study materials",
    },
    {
      icon: MessageSquare,
      label: "Feedback Review",
      path: "/teacher/feedbacks",
      description: "View all student feedbacks",
    },
    {
      icon: BarChart3,
      label: "Student Analytics",
      path: "/teacher/student-analytics",
      description: "View student performance & analytics",
    },
  ]

  const menuItems = role === "student" ? studentMenuItems : teacherMenuItems

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-muted transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 relative overflow-hidden">
                {/* Graduation cap icon */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
                  <path d="M12 3L2 8L12 13L22 8L12 3Z" fill="#FBBF24" opacity="0.9"/>
                  <path d="M12 3L22 8L12 13V3Z" fill="#F59E0B"/>
                  <line x1="20" y1="8" x2="20" y2="14" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="20" cy="15" r="1" fill="#FBBF24"/>
                  <rect x="9" y="13" width="6" height="8" rx="1" fill="white" opacity="0.95"/>
                  <rect x="10" y="14.5" width="4" height="1" rx="0.5" fill="#3B82F6"/>
                  <rect x="10" y="17" width="3" height="1" rx="0.5" fill="#3B82F6"/>
                  <rect x="10" y="19.5" width="4" height="1" rx="0.5" fill="#3B82F6"/>
                </svg>
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  EduDash
                </h2>
                <p className="text-xs text-muted-foreground capitalize">{role} Portal</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-3">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted transition-colors group text-left"
                >
                  <div className="rounded-lg bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </nav>
          </div>

          {/* Bottom Section - Help & Feedback */}
          <div className="border-t border-border">
            <div className="p-3 space-y-1">
              <button
                onClick={() => handleNavigation("/help")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group text-left"
              >
                <HelpCircle className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-sm font-medium">Help Center</span>
              </button>
              <button
                onClick={() => handleNavigation("/feedback")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group text-left"
              >
                <MessageSquare className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-sm font-medium">Send Feedback</span>
              </button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
