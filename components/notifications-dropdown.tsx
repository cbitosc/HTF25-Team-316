"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Clock, AlertCircle, FileText, X, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import api from "@/lib/api"

interface Assignment {
  id: string
  title: string
  description: string
  due_date: string
  course_name: string
  points: number
  created_at: string
}

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [seenAssignmentIds, setSeenAssignmentIds] = useState<Set<string>>(new Set())
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch assignments on mount
  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/assignments/')
      setAssignments(data.assignments || [])
    } catch (error) {
      console.error('Failed to fetch assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load seen assignments from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('seenAssignments')
    if (stored) {
      setSeenAssignmentIds(new Set(JSON.parse(stored)))
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Calculate days until deadline
  const getDaysUntilDeadline = (dueDate: string) => {
    const now = new Date()
    const deadline = new Date(dueDate)
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Check if assignment is newly assigned (within last 24 hours)
  const isNewlyAssigned = (createdAt: string) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffTime = now.getTime() - created.getTime()
    const diffHours = diffTime / (1000 * 60 * 60)
    return diffHours <= 24
  }

  // Filter notifications: newly assigned OR 2 days or less until deadline
  const notifications = assignments.filter(assignment => {
    const daysUntil = getDaysUntilDeadline(assignment.due_date)
    const isNew = isNewlyAssigned(assignment.created_at)
    const isUrgent = daysUntil >= 0 && daysUntil <= 2
    return isNew || isUrgent
  })

  // Count unseen notifications
  const unseenCount = notifications.filter(n => !seenAssignmentIds.has(n.id)).length

  // Mark all as seen when dropdown opens
  const handleOpen = () => {
    setIsOpen(true)
    if (notifications.length > 0) {
      const allIds = new Set(notifications.map(n => n.id))
      setSeenAssignmentIds(allIds)
      localStorage.setItem('seenAssignments', JSON.stringify([...allIds]))
    }
  }

  // Format relative time
  const getRelativeTime = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffTime = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:bg-accent transition-all duration-200"
        onClick={() => isOpen ? setIsOpen(false) : handleOpen()}
        aria-label="Notifications"
      >
        <Bell className={`h-5 w-5 transition-all duration-300 ${isOpen ? 'rotate-12 text-primary' : ''} ${unseenCount > 0 ? 'animate-pulse' : ''}`} />
        {unseenCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold animate-bounce"
          >
            {unseenCount > 9 ? '9+' : unseenCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute right-0 top-12 w-[380px] md:w-[420px] bg-background border border-border rounded-xl shadow-2xl z-50 animate-in slide-in-from-top-2 fade-in duration-200"
          style={{
            animation: 'slideDown 0.3s ease-out'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 to-purple-500/5">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Reminders</h3>
              {notifications.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {notifications.length}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <ScrollArea className="h-[400px]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-semibold text-lg mb-2">All caught up! 🎉</h4>
                <p className="text-sm text-muted-foreground">
                  No urgent assignments or new reminders at the moment.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((assignment) => {
                  const daysUntil = getDaysUntilDeadline(assignment.due_date)
                  const isNew = isNewlyAssigned(assignment.created_at)
                  const isUrgent = daysUntil >= 0 && daysUntil <= 2
                  const isOverdue = daysUntil < 0

                  return (
                    <div
                      key={assignment.id}
                      className={`p-4 hover:bg-accent/50 transition-all duration-200 cursor-pointer group ${
                        !seenAssignmentIds.has(assignment.id) ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            isOverdue
                              ? 'bg-red-100 dark:bg-red-950/30'
                              : isUrgent
                              ? 'bg-orange-100 dark:bg-orange-950/30'
                              : 'bg-blue-100 dark:bg-blue-950/30'
                          }`}
                        >
                          {isNew ? (
                            <FileText
                              className={`h-5 w-5 ${
                                isOverdue
                                  ? 'text-red-600 dark:text-red-400'
                                  : isUrgent
                                  ? 'text-orange-600 dark:text-orange-400'
                                  : 'text-blue-600 dark:text-blue-400'
                              }`}
                            />
                          ) : (
                            <Clock
                              className={`h-5 w-5 ${
                                isOverdue
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-orange-600 dark:text-orange-400'
                              }`}
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Header with badges */}
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {isNew && (
                                <Badge
                                  variant="default"
                                  className="text-xs bg-blue-500 hover:bg-blue-600"
                                >
                                  New
                                </Badge>
                              )}
                              {isOverdue ? (
                                <Badge
                                  variant="destructive"
                                  className="text-xs animate-pulse"
                                >
                                  Overdue
                                </Badge>
                              ) : isUrgent && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs bg-orange-500 hover:bg-orange-600"
                                >
                                  Urgent
                                </Badge>
                              )}
                            </div>
                            {isNew && (
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {getRelativeTime(assignment.created_at)}
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                            {assignment.title}
                          </h4>

                          {/* Course */}
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {assignment.course_name || 'General'}
                            {assignment.points && ` • ${assignment.points} pts`}
                          </p>

                          {/* Due date */}
                          <div className="flex items-center gap-1.5 mt-2">
                            <AlertCircle
                              className={`h-3.5 w-3.5 ${
                                isOverdue
                                  ? 'text-red-500'
                                  : isUrgent
                                  ? 'text-orange-500'
                                  : 'text-muted-foreground'
                              }`}
                            />
                            <span
                              className={`text-xs font-medium ${
                                isOverdue
                                  ? 'text-red-500'
                                  : isUrgent
                                  ? 'text-orange-500'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {isOverdue
                                ? `Overdue by ${Math.abs(daysUntil)} ${Math.abs(daysUntil) === 1 ? 'day' : 'days'}`
                                : daysUntil === 0
                                ? 'Due today!'
                                : daysUntil === 1
                                ? 'Due tomorrow'
                                : `Due in ${daysUntil} days`}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              • {formatDate(assignment.due_date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-border bg-muted/30">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs font-medium"
                onClick={() => setIsOpen(false)}
              >
                View All Assignments →
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Custom animation styles */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
