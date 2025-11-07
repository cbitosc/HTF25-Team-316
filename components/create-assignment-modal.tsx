"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, FileText, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import api from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface CreateAssignmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateAssignmentModal({ open, onOpenChange, onSuccess }: CreateAssignmentModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    course_name: "",
    points: "100",
    instructions: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Assignment title is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.due_date) {
      newErrors.due_date = "Due date is required"
    } else {
      const selectedDate = new Date(formData.due_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        newErrors.due_date = "Due date cannot be in the past"
      }
    }

    if (formData.points && (parseInt(formData.points) < 0 || parseInt(formData.points) > 1000)) {
      newErrors.points = "Points must be between 0 and 1000"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      // Convert due_date to ISO format
      const dueDate = new Date(formData.due_date).toISOString()

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        due_date: dueDate,
        course_name: formData.course_name.trim() || "General",
        points: parseInt(formData.points) || 100,
        instructions: formData.instructions.trim() || null
      }

      await api.post('/assignments/', payload)

      toast({
        title: "Success! 🎉",
        description: "Assignment has been published to all students",
        variant: "default"
      })

      // Reset form
      setFormData({
        title: "",
        description: "",
        due_date: "",
        course_name: "",
        points: "100",
        instructions: ""
      })
      setErrors({})

      // Close modal and notify parent
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }

    } catch (error: any) {
      console.error('Error creating assignment:', error)
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create assignment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FileText className="h-6 w-6 text-primary" />
            Create New Assignment
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to create and publish an assignment to all students
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Assignment Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              Assignment Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Chapter 5 Quiz, Final Project, Essay on..."
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className={errors.title ? "border-red-500" : ""}
              disabled={loading}
              maxLength={200}
            />
            {errors.title && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Course/Subject Name */}
          <div className="space-y-2">
            <Label htmlFor="course_name">Course/Subject Name</Label>
            <Input
              id="course_name"
              placeholder="e.g., Mathematics, Physics, English Literature"
              value={formData.course_name}
              onChange={(e) => handleChange("course_name", e.target.value)}
              disabled={loading}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">Optional - defaults to "General"</p>
          </div>

          {/* Due Date and Points in a row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="due_date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Due Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="due_date"
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => handleChange("due_date", e.target.value)}
                className={errors.due_date ? "border-red-500" : ""}
                min={today}
                disabled={loading}
              />
              {errors.due_date && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.due_date}
                </p>
              )}
            </div>

            {/* Points */}
            <div className="space-y-2">
              <Label htmlFor="points">Points/Marks</Label>
              <Input
                id="points"
                type="number"
                placeholder="100"
                value={formData.points}
                onChange={(e) => handleChange("points", e.target.value)}
                className={errors.points ? "border-red-500" : ""}
                min="0"
                max="1000"
                disabled={loading}
              />
              {errors.points && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.points}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Brief description of the assignment..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className={errors.description ? "border-red-500" : ""}
              rows={3}
              disabled={loading}
              maxLength={500}
            />
            {errors.description && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Detailed Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Detailed Instructions (Optional)</Label>
            <Textarea
              id="instructions"
              placeholder="Provide detailed instructions, requirements, rubric, or any additional information students need..."
              value={formData.instructions}
              onChange={(e) => handleChange("instructions", e.target.value)}
              rows={6}
              disabled={loading}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">
              {formData.instructions.length}/2000 characters
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Publishing Assignment
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Once you click "Assign to Students", this assignment will be immediately visible to all students on their dashboards with the specified deadline.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Assign to Students
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
