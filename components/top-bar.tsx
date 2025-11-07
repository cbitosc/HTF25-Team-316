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
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 relative overflow-hidden">
              {/* Graduation cap icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-transparent">
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
