"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, Loader2, CheckCircle2, XCircle } from "lucide-react"
import api from "@/lib/api"

interface UploadMaterialDialogProps {
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function UploadMaterialDialog({ onSuccess, trigger }: UploadMaterialDialogProps) {
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    tags: '',
    isPublic: true, // Default to public so students can see materials
    vectorize: true,
    file: null as File | null
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrorMessage('Only PDF files are supported')
        setUploadStatus('error')
        return
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setErrorMessage('File size must be less than 50MB')
        setUploadStatus('error')
        return
      }
      setFormData(prev => ({ ...prev, file }))
      setUploadStatus('idle')
      setErrorMessage('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.file) {
      setErrorMessage('Please select a PDF file')
      setUploadStatus('error')
      return
    }

    if (!formData.title.trim()) {
      setErrorMessage('Please enter a title')
      setUploadStatus('error')
      return
    }

    if (!formData.courseId.trim()) {
      setErrorMessage('Please enter a course ID')
      setUploadStatus('error')
      return
    }

    setUploading(true)
    setUploadStatus('idle')
    setErrorMessage('')

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('file', formData.file)
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('course_id', formData.courseId)
      formDataToSend.append('tags', formData.tags)
      formDataToSend.append('is_public', formData.isPublic.toString())
      formDataToSend.append('vectorize', formData.vectorize.toString())

      const { data } = await api.post('/materials/upload', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setUploadStatus('success')
      
      // Reset form after a delay
      setTimeout(() => {
        setFormData({
          title: '',
          description: '',
          courseId: '',
          tags: '',
          isPublic: false,
          vectorize: true,
          file: null
        })
        setOpen(false)
        setUploadStatus('idle')
        if (onSuccess) onSuccess()
      }, 1500)

    } catch (error: any) {
      setUploadStatus('error')
      setErrorMessage(
        error.response?.data?.detail || 
        'Failed to upload material. Please try again.'
      )
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    if (!uploading) {
      setOpen(false)
      setUploadStatus('idle')
      setErrorMessage('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload New Material
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Study Material</DialogTitle>
          <DialogDescription>
            Upload a PDF document to share with students. Files will be automatically processed for AI-powered Q&A.
          </DialogDescription>
        </DialogHeader>

        {uploadStatus === 'success' ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Successful!</h3>
            <p className="text-sm text-muted-foreground">
              Your material has been uploaded and is being processed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* File Upload */}
              <div className="grid gap-2">
                <Label htmlFor="file">PDF File *</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={uploading}
                  required
                />
                {formData.file && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {/* Title */}
              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Introduction to Calculus"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  disabled={uploading}
                  required
                />
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the material..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  disabled={uploading}
                  rows={3}
                />
              </div>

              {/* Course ID */}
              <div className="grid gap-2">
                <Label htmlFor="courseId">Course ID *</Label>
                <Input
                  id="courseId"
                  placeholder="e.g., MATH101"
                  value={formData.courseId}
                  onChange={(e) => setFormData(prev => ({ ...prev, courseId: e.target.value }))}
                  disabled={uploading}
                  required
                />
              </div>

              {/* Tags */}
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="e.g., math, calculus, derivatives (comma-separated)"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  disabled={uploading}
                />
              </div>

              {/* Options */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, isPublic: checked as boolean }))
                    }
                    disabled={uploading}
                  />
                  <Label htmlFor="isPublic" className="text-sm font-normal cursor-pointer">
                    Make this material publicly accessible to all students
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="vectorize"
                    checked={formData.vectorize}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, vectorize: checked as boolean }))
                    }
                    disabled={uploading}
                  />
                  <Label htmlFor="vectorize" className="text-sm font-normal cursor-pointer">
                    Enable AI-powered Q&A for this material (recommended)
                  </Label>
                </div>
              </div>

              {/* Error Message */}
              {uploadStatus === 'error' && errorMessage && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Material
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
