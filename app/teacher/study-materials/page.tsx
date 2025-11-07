"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TopBar } from "@/components/top-bar"
import { UploadMaterialDialog } from "@/components/upload-material-dialog"
import { Loader2, FolderOpen, FileText, Download, Trash2, Eye, AlertCircle } from "lucide-react"
import api from "@/lib/api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Material {
  id: string
  title: string
  description: string | null
  course_id: string
  type: string
  file_size: number
  tags: string[]
  is_public: boolean
  created_at: string
  view_count: number
  download_count: number
}

export default function TeacherStudyMaterialsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [materials, setMaterials] = useState<Material[]>([])
  const [loadingMaterials, setLoadingMaterials] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
    if (!loading && user && user.role !== 'teacher') {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && user.role === 'teacher') {
      fetchMaterials()
    }
  }, [user])

  const fetchMaterials = async () => {
    try {
      setLoadingMaterials(true)
      const { data } = await api.get('/materials/')
      setMaterials(data.materials || [])
    } catch (error) {
      console.error('Failed to fetch materials:', error)
    } finally {
      setLoadingMaterials(false)
    }
  }

  const handleDelete = async () => {
    if (!materialToDelete) return

    try {
      setDeleting(true)
      await api.delete(`/materials/${materialToDelete}`)
      setMaterials(prev => prev.filter(m => m.id !== materialToDelete))
      setDeleteDialogOpen(false)
      setMaterialToDelete(null)
    } catch (error) {
      console.error('Failed to delete material:', error)
    } finally {
      setDeleting(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (user.role !== 'teacher') return null

  const totalDownloads = materials.reduce((sum, m) => sum + m.download_count, 0)
  const totalSize = materials.reduce((sum, m) => sum + (m.file_size || 0), 0)
  const lastUpload = materials.length > 0 ? materials[0].created_at : null

  return (
    <div className="min-h-screen bg-background">
      <TopBar role="teacher" />
      
      <main className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <FolderOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Study Materials</h1>
                <p className="text-muted-foreground">View and manage uploaded study materials</p>
              </div>
            </div>
            <UploadMaterialDialog onSuccess={fetchMaterials} />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Materials</p>
              <p className="text-2xl font-bold mt-1">{materials.length}</p>
            </div>
          </Card>
          <Card className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Downloads</p>
              <p className="text-2xl font-bold mt-1 text-blue-600">
                {totalDownloads}
              </p>
            </div>
          </Card>
          <Card className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Size</p>
              <p className="text-2xl font-bold mt-1">{formatFileSize(totalSize)}</p>
            </div>
          </Card>
          <Card className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">Last Upload</p>
              <p className="text-sm font-bold mt-1">
                {lastUpload ? formatDate(lastUpload) : 'N/A'}
              </p>
            </div>
          </Card>
        </div>

        {/* Materials List */}
        {loadingMaterials ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : materials.length === 0 ? (
          <Card className="p-12 text-center">
            <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No materials yet</h3>
            <p className="text-muted-foreground mb-6">
              Upload your first study material to get started
            </p>
            <UploadMaterialDialog onSuccess={fetchMaterials} />
          </Card>
        ) : (
          <div className="grid gap-4">
            {materials.map((material) => (
              <Card key={material.id} className="p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{material.title}</h3>
                      {material.description && (
                        <p className="text-sm text-muted-foreground mb-2">{material.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span>Course: {material.course_id}</span>
                        <span>•</span>
                        <span>{material.type.toUpperCase()}</span>
                        <span>•</span>
                        <span>{formatFileSize(material.file_size)}</span>
                        <span>•</span>
                        <span>Uploaded: {formatDate(material.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          {material.download_count} downloads
                        </span>
                        <span>•</span>
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {material.view_count} views
                        </span>
                        {material.is_public && (
                          <>
                            <span>•</span>
                            <span className="text-purple-600 dark:text-purple-400 font-medium">
                              Public
                            </span>
                          </>
                        )}
                      </div>
                      {material.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {material.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setMaterialToDelete(material.id)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Material?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the material
              and remove it from all students' access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
