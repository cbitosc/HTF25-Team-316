"use client"

import { useTheme } from "./theme-provider"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { SidebarMenu } from "./sidebar-menu"
import { ProfileDropdown } from "./profile-dropdown"
import { NotificationsDropdown } from "./notifications-dropdown"
import Link from "next/link"

interface TopBarProps {
  role: "student" | "teacher"
}

export function TopBar({ role }: TopBarProps) {
  const { theme, toggleTheme } = useTheme()

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const yOffset = -80 // Offset for sticky header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }

  const studentNavItems = [
    { id: "schedule-heading", label: "Schedule" },
    { id: "assignments-heading", label: "Assignments" },
    { id: "materials-heading", label: "Materials" },
    { id: "performance-heading", label: "Performance" },
  ]

  const teacherNavItems = [
    { id: "courses-heading", label: "Courses" },
    { id: "assignments-heading", label: "Assignments" },
    { id: "submissions-heading", label: "Submissions" },
    { id: "analytics-heading", label: "Analytics" },
  ]

  const navItems = role === "student" ? studentNavItems : teacherNavItems
  const dashboardLink = role === "student" ? "/" : "/teacher"

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-gradient-to-r from-card via-card to-card shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Sidebar Menu */}
          <SidebarMenu role={role} />
          
          <Link href={dashboardLink} className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EduDash
            </h1>
          </Link>

          {/* Section Navigation */}
          <nav className="hidden lg:flex gap-1 ml-4" aria-label="Page section navigation">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => scrollToSection(item.id)}
                className="text-sm text-gray-700 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-gray-100 dark:hover:bg-muted transition-colors font-medium"
              >
                {item.label}
              </Button>
            ))}
          </nav>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            className="hover:bg-gray-100 dark:hover:bg-muted transition-colors text-gray-700 dark:text-foreground"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          {/* Notifications Dropdown (Only for students) */}
          {role === "student" && (
            <NotificationsDropdown />
          )}

          {/* Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </div>
    </header>
  )
}
