"use client"

import { Suspense, lazy } from "react"
import { TopBar } from "./top-bar"
import { Skeleton } from "./ui/skeleton"

// Dynamic imports for heavy components
const StudentView = lazy(() => import("./student-view").then(mod => ({ default: mod.StudentView })))
const RAGFlow = lazy(() => import("./rag-flow").then(mod => ({ default: mod.RAGFlow })))
const ScoutAssistant = lazy(() => import("./scout-assistant").then(mod => ({ default: mod.ScoutAssistant })))

// Loading skeleton component
function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-6 animate-pulse">
      <div className="h-48 bg-muted rounded-2xl" />
      <div className="h-64 bg-muted rounded-xl" />
      <div className="h-64 bg-muted rounded-xl" />
    </div>
  )
}

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar role="student" />

      <main className="flex-1" role="main">
        <Suspense fallback={<DashboardSkeleton />}>
          <StudentView />
        </Suspense>
      </main>

      {/* RAG Flow - Sticky bottom-center button - Loaded lazily */}
      <Suspense fallback={null}>
        <RAGFlow />
      </Suspense>

      {/* Scout Assistant - Chatbot - Loaded lazily */}
      <Suspense fallback={null}>
        <ScoutAssistant />
      </Suspense>
    </div>
  )
}
