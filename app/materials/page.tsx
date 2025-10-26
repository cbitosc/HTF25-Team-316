"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft,
  BookOpen,
  Download,
  Eye,
  FileText,
  Search,
  Filter,
  Calendar,
  User,
  Moon,
  Sun,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useTheme } from "@/components/theme-provider"
import api from "@/lib/api"

interface Material {
  id: string
  title: string
  description: string | null
  course_id: string
  teacher_id: string
  type: string
  file_size: number
  tags: string[]
  is_public: boolean
  created_at: string
  view_count: number
  download_count: number
}

export default function MaterialsPage() {
  const { theme, toggleTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [viewingMaterial, setViewingMaterial] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPdf, setLoadingPdf] = useState(false)

  useEffect(() => {
    fetchMaterials()
  }, [])

  const fetchMaterials = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/materials/')
      setMaterials(data.materials || [])
    } catch (error) {
      console.error('Failed to fetch materials:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const filteredMaterials = useMemo(() => 
    materials.filter((material) => {
      const matchesSearch =
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.course_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.tags.some((topic) => topic.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesType = selectedType === "all" || material.type.toLowerCase() === selectedType.toLowerCase()
      return matchesSearch && matchesType
    }),
    [materials, searchQuery, selectedType]
  )

  const handleDownload = useCallback(async (material: Material) => {
    try {
      // Use the download endpoint which increments count and serves file
      const response = await api.get(`/materials/${material.id}/download`, {
        responseType: 'blob'
      })
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${material.title}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download:', error)
      alert('Failed to download file. Please try again.')
    }
  }, [])

  const handleView = useCallback(async (materialId: string) => {
    setViewingMaterial(materialId)
    setLoadingPdf(true)
    setPdfUrl(null)
    
    try {
      // Fetch the PDF file
      const response = await api.get(`/materials/${materialId}/download`, {
        responseType: 'blob'
      })
      
      // Create blob URL for viewing
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      setPdfUrl(url)
    } catch (error) {
      console.error('Failed to load PDF:', error)
      alert('Failed to load PDF. Please try again.')
      setViewingMaterial(null)
    } finally {
      setLoadingPdf(false)
    }
  }, [])
  
  // Cleanup blob URL when component unmounts or PDF changes
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [pdfUrl])

  const currentMaterial = useMemo(() => 
    materials.find((m) => m.id === viewingMaterial),
    [materials, viewingMaterial]
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {viewingMaterial && currentMaterial ? (
        // Material Viewer
        <div className="flex flex-col h-screen">
          <div className="border-b border-border bg-card/95 backdrop-blur-sm px-6 py-4">
            <div className="container mx-auto flex items-center justify-between">
              <div>
                <Button variant="ghost" size="sm" onClick={() => setViewingMaterial(null)} className="mb-2">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Materials
                </Button>
                <h1 className="text-2xl font-bold">{currentMaterial.title}</h1>
                <p className="text-sm text-muted-foreground">{currentMaterial.course_id}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => handleDownload(currentMaterial)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
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
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="container mx-auto h-full p-6">
              {loadingPdf ? (
                <Card className="h-full flex items-center justify-center bg-muted/30">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                    <p className="text-lg font-medium">Loading PDF...</p>
                  </div>
                </Card>
              ) : pdfUrl ? (
                <Card className="h-full overflow-hidden">
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full"
                    title={currentMaterial.title}
                  />
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center bg-muted/30">
                  <div className="text-center">
                    <FileText className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">PDF Viewer</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {formatFileSize(currentMaterial.file_size)} • {currentMaterial.type.toUpperCase()}
                    </p>
                    {currentMaterial.description && (
                      <p className="text-sm text-muted-foreground mt-4 max-w-md">
                        {currentMaterial.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-4 max-w-md">
                      Failed to load PDF
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Materials List
        <>
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
              <h1 className="text-3xl font-bold">Study Materials</h1>
              <p className="text-muted-foreground mt-2">Access all your learning resources in one place</p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search materials by title, course, or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType("all")}
                >
                  All Types
                </Button>
                <Button
                  variant={selectedType === "pdf" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType("pdf")}
                >
                  PDF
                </Button>
              </div>
            </div>

            {/* Materials Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredMaterials.map((material) => (
                <Card key={material.id} className="p-6 hover:shadow-lg transition-shadow flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="secondary">{material.type.toUpperCase()}</Badge>
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{material.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{material.course_id}</p>

                  {material.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{material.description}</p>
                  )}

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {material.tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {material.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{material.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-auto space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(material.file_size)}</span>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{material.view_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        <span>{material.download_count}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Uploaded {new Date(material.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleView(material.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button size="sm" className="flex-1" onClick={() => handleDownload(material)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredMaterials.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No materials found</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
