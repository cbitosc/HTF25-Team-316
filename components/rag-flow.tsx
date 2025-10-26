"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, X, Loader2, BookOpen, FileText, Users, Sparkles, Check, Send } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import api from "@/lib/api"

interface SearchResult {
  id: string
  title: string
  type: "material" | "assignment" | "course"
  excerpt: string
  relevance: number
}

interface KnowledgeDocument {
  id: string
  title: string
  type: "material" | "assignment" | "course"
  dateAdded: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function RAGFlow() {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [creativityLevel, setCreativityLevel] = useState([0.5])
  const [docSearchQuery, setDocSearchQuery] = useState("")
  const [currentView, setCurrentView] = useState<"config" | "query" | "chat">("config")
  const [userQuery, setUserQuery] = useState("")
  const [followUpQuery, setFollowUpQuery] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const queryInputRef = useRef<HTMLInputElement>(null)
  const followUpInputRef = useRef<HTMLInputElement>(null)

  const [knowledgeDocuments, setKnowledgeDocuments] = useState<KnowledgeDocument[]>([])
  const [loadingDocs, setLoadingDocs] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchMaterials()
  }, [])

  const fetchMaterials = async () => {
    try {
      setLoadingDocs(true)
      const { data } = await api.get('/materials/')
      const docs = data.materials.map((m: any) => ({
        id: m.id,
        title: m.title,
        type: "material" as const,
        dateAdded: m.created_at
      }))
      setKnowledgeDocuments(docs)
    } catch (error) {
      console.error('Failed to fetch materials:', error)
    } finally {
      setLoadingDocs(false)
    }
  }

  // Filter documents based on search
  const filteredDocuments = knowledgeDocuments.filter((doc) =>
    doc.title.toLowerCase().includes(docSearchQuery.toLowerCase())
  )

  useEffect(() => {
    if (isOpen && inputRef.current && currentView === "config") {
      inputRef.current.focus()
    }
    if (currentView === "query" && queryInputRef.current) {
      queryInputRef.current.focus()
    }
    if (currentView === "chat" && followUpInputRef.current) {
      followUpInputRef.current.focus()
    }
  }, [isOpen, currentView])

  const mockSearchResults: SearchResult[] = [
    {
      id: "1",
      title: "Calculus Integration Techniques",
      type: "material",
      excerpt:
        "Learn various methods for solving integration problems including substitution, parts, and partial fractions...",
      relevance: 0.95,
    },
    {
      id: "2",
      title: "Math Problem Set - Chapter 5",
      type: "assignment",
      excerpt: "Assignment covering integration and differentiation. Due in 2 days. 15 problems total.",
      relevance: 0.88,
    },
    {
      id: "3",
      title: "Mathematics 101 Course",
      type: "course",
      excerpt: "Comprehensive course on calculus fundamentals. Instructor: Dr. Smith. 28 students enrolled.",
      relevance: 0.82,
    },
    {
      id: "4",
      title: "Advanced Calculus Notes",
      type: "material",
      excerpt: "Advanced topics in calculus including multivariable functions and applications...",
      relevance: 0.75,
    },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setHasSearched(true)

    // Simulate API call
    setTimeout(() => {
      setSearchResults(mockSearchResults)
      setIsSearching(false)
    }, 600)
  }

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query)
    setIsSearching(true)
    setHasSearched(true)

    setTimeout(() => {
      setSearchResults(mockSearchResults)
      setIsSearching(false)
    }, 600)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "material":
        return <BookOpen className="h-4 w-4" />
      case "assignment":
        return <FileText className="h-4 w-4" />
      case "course":
        return <Users className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "material":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case "assignment":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
      case "course":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  const handleDocumentToggle = (docId: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    )
  }

  const handleSelectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([])
    } else {
      setSelectedDocuments(filteredDocuments.map((doc) => doc.id))
    }
  }

  const handleDone = () => {
    if (selectedDocuments.length === 0) return
    setCurrentView("query")
  }

  const handleUserQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userQuery.trim()) return
    
    // Validate that documents are selected
    if (selectedDocuments.length === 0) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "⚠️ Please select at least one document from the knowledge base before asking a question.",
        timestamp: new Date(),
      }
      setMessages([errorMessage])
      return
    }

    setIsGenerating(true)
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userQuery,
      timestamp: new Date(),
    }
    setMessages([newMessage])

    try {
      // Call backend RAG API with creativity level
      const { data } = await api.post("/rag/query-multiple", {
        material_ids: selectedDocuments,
        query: userQuery,
        num_results: 3,
        temperature: creativityLevel[0], // Send creativity as temperature
      })
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer || "Sorry, I couldn't generate an answer at this time.",
        timestamp: new Date(),
      }
      setMessages([newMessage, aiMessage])
      setIsGenerating(false)
      setCurrentView("chat")
      setUserQuery("")
    } catch (error: any) {
      console.error("Error querying RAG:", error)
      let errorMsg = "Sorry, I encountered an error while processing your question."
      
      if (error.response?.status === 404) {
        errorMsg = "❌ The selected documents haven't been uploaded or vectorized yet. Teachers need to upload and vectorize study materials first."
      } else if (error.response?.status === 500) {
        errorMsg = "⚠️ Internal server error. The documents may not be properly vectorized. Please contact your teacher."
      } else if (error.response?.data?.detail) {
        errorMsg = `❌ ${error.response.data.detail}`
      } else if (error.message) {
        errorMsg = `⚠️ Error: ${error.message}`
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: errorMsg,
        timestamp: new Date(),
      }
      setMessages([newMessage, errorMessage])
      setIsGenerating(false)
    }
  }

  const handleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!followUpQuery.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: followUpQuery,
      timestamp: new Date(),
    }
    setMessages([...messages, newMessage])
    setFollowUpQuery("")
    setIsGenerating(true)

    try {
      // Call backend RAG API with creativity level
      const { data } = await api.post("/rag/query-multiple", {
        material_ids: selectedDocuments,
        query: followUpQuery,
        num_results: 3,
        temperature: creativityLevel[0], // Send creativity as temperature
      })
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer || "Sorry, I couldn't generate an answer at this time.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsGenerating(false)
    } catch (error: any) {
      console.error("Error querying RAG:", error)
      let errorMsg = "Sorry, I encountered an error while processing your question."
      
      if (error.response?.status === 404) {
        errorMsg = "The selected documents haven't been uploaded or vectorized yet. Please ask a teacher to upload study materials first."
      } else if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: errorMsg,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      setIsGenerating(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsExpanded(false)
    setCurrentView("config")
    setSearchQuery("")
    setDocSearchQuery("")
    setUserQuery("")
    setFollowUpQuery("")
    setMessages([])
    setSelectedDocuments([])
    setCreativityLevel([0.5])
  }

  if (!mounted) return null

  const content = (
    <div 
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
    >
      {/* Backdrop overlay when config modal is open */}
      {isOpen && currentView === "config" && (
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto animate-fade-in"
          onClick={handleClose}
        />
      )}
      
      <div 
        ref={containerRef}
        className={`absolute flex flex-col items-center pointer-events-auto transition-all duration-300 ${
          currentView === "config" 
            ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
            : "bottom-8 left-1/2 -translate-x-1/2"
        }`}
      >
        {/* Configuration Modal - Step 1 */}
        {isOpen && currentView === "config" && (
          <div className="w-[500px] animate-fade-in">
            <Card className="p-5 shadow-2xl border-2 border-primary/20 bg-card">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold">Configure Search</h3>
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Document Selection Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Select Documents</Label>
                    <Button
                      type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-7 text-xs"
                  >
                    {selectedDocuments.length === filteredDocuments.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>

                {/* Search Documents */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={inputRef}
                    placeholder="Search documents..."
                    value={docSearchQuery}
                    onChange={(e) => setDocSearchQuery(e.target.value)}
                    className="text-sm pl-9 h-9"
                  />
                </div>

                <ScrollArea className="h-40 rounded-md border border-border p-2">
                  <div className="space-y-1.5">
                    {filteredDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-start space-x-2 rounded-lg p-2 hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          id={doc.id}
                          checked={selectedDocuments.includes(doc.id)}
                          onCheckedChange={() => handleDocumentToggle(doc.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <Label htmlFor={doc.id} className="text-xs font-medium cursor-pointer flex items-center gap-1.5">
                            <div className={`rounded p-0.5 ${getTypeColor(doc.type)}`}>{getTypeIcon(doc.type)}</div>
                            <span className="truncate">{doc.title}</span>
                          </Label>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {doc.type} • {new Date(doc.dateAdded).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <p className="text-xs text-muted-foreground">
                  {selectedDocuments.length} of {knowledgeDocuments.length} documents selected
                </p>
              </div>

              {/* Creativity Level Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                    Creativity Level
                  </Label>
                  <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                    {creativityLevel[0].toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={creativityLevel}
                  onValueChange={setCreativityLevel}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.0 - Precise</span>
                  <span>0.5 - Balanced</span>
                  <span>1.0 - Creative</span>
                </div>
              </div>

              <Button
                onClick={handleDone}
                className="w-full h-10 font-semibold"
                disabled={selectedDocuments.length === 0}
              >
                <Check className="mr-2 h-4 w-4" />
                Done
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Query Input - Step 2 */}
      {isOpen && currentView === "query" && (
        <div className="mb-4 w-[700px] animate-fade-in">
          <form onSubmit={handleUserQuery} className="relative">
            <Input
              ref={queryInputRef}
              placeholder="Ask a question about your selected documents..."
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              className="h-14 text-base pr-24 shadow-2xl placeholder:text-foreground/60 placeholder:font-normal bg-card border-2 border-primary/20"
              disabled={isGenerating}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-10 w-10"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button type="submit" size="icon" disabled={!userQuery.trim() || isGenerating} className="h-10 w-10">
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Chat View - Step 3 */}
      {isOpen && currentView === "chat" && (
        <div className="mb-4 w-[700px] h-[500px] animate-fade-in flex flex-col">
          <Card className="flex-1 shadow-2xl flex flex-col border-2 border-primary/20 bg-card">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-card">
              <div>
                <h3 className="text-base font-semibold">Knowledge Base Chat</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedDocuments.length} documents • Creativity: {creativityLevel[0].toFixed(2)}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Follow-up Input */}
            <div className="p-4 border-t border-border">
              <form onSubmit={handleFollowUp} className="relative">
                <Input
                  ref={followUpInputRef}
                  placeholder="Ask a follow-up question..."
                  value={followUpQuery}
                  onChange={(e) => setFollowUpQuery(e.target.value)}
                  className="h-12 text-sm pr-14"
                  disabled={isGenerating}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!followUpQuery.trim() || isGenerating}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                >
                  {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}
      </div>
      
      {/* Sticky Button - Main Entry Point - Fixed at Bottom Center */}
      {!isOpen && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto z-[10000]">
          <Button
            ref={buttonRef}
            onClick={() => {
              setIsOpen(true)
              setIsExpanded(true)
            }}
            className="h-16 w-16 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 bg-accent hover:bg-accent/90"
            size="icon"
            aria-label="Open Knowledge Base Search"
          >
            <Search className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  )

  return createPortal(content, document.body)
}
