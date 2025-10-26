"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, Mic, X, Loader2, Volume2, Copy, ThumbsUp, ThumbsDown } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isLoading?: boolean
}

export function ScoutAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm Scout, your navigation guide for EduDash. 🧭 I can help you find your way around the platform - just ask me how to access assignments, study materials, analytics, courses, or any other page. Where would you like to go?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onstart = () => {
          console.log('🎤 Voice recognition started')
          setIsListening(true)
        }

        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join("")
          console.log('🎤 Transcript:', transcript)
          setInput(transcript)
          setIsListening(false)
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('🎤 Voice recognition error:', event.error)
          setIsListening(false)
          
          // Show user-friendly error messages
          if (event.error === 'not-allowed' || event.error === 'permission-denied') {
            alert('Microphone access denied. Please allow microphone permissions in your browser settings.')
          } else if (event.error === 'no-speech') {
            alert('No speech detected. Please try again and speak clearly.')
          } else if (event.error === 'network') {
            alert('Network error. Voice recognition requires an internet connection.')
          }
        }

        recognitionRef.current.onend = () => {
          console.log('🎤 Voice recognition ended')
          setIsListening(false)
        }
      } else {
        console.warn('🎤 Web Speech API not supported in this browser. Use Chrome, Edge, or Safari.')
      }
    }
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSending) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    const userInput = input
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsSending(true)

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    }
    setMessages((prev) => [...prev, loadingMessage])

    try {
      // Call Gemini API through your backend
      const response = await fetch('http://localhost:8000/api/scout/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userInput,
          conversation_history: messages.filter(m => !m.isLoading).map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      })

      const data = await response.json()

      setMessages((prev) =>
        prev.map((msg) =>
          msg.isLoading
            ? {
                ...msg,
                content: data.response || "Sorry, I couldn't process that request.",
                isLoading: false,
              }
            : msg,
        ),
      )
    } catch (error) {
      console.error('Scout chat error:', error)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.isLoading
            ? {
                ...msg,
                content: "Sorry, I'm having trouble connecting. Please try again.",
                isLoading: false,
              }
            : msg,
        ),
      )
    } finally {
      setIsSending(false)
    }
  }

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari, or type your message instead.')
      return
    }

    if (isListening) {
      console.log('🎤 Stopping voice recognition...')
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      console.log('🎤 Starting voice recognition...')
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (error) {
        console.error('🎤 Failed to start voice recognition:', error)
        alert('Failed to start voice recognition. Please check your microphone permissions.')
        setIsListening(false)
      }
    }
  }

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const quickQuestions = [
    "How do I submit assignments?",
    "Where can I see my grades?",
    "How to access study materials?",
    "Where is the teacher dashboard?",
  ]

  if (!mounted) return null

  const content = (
    <>
      {/* Chat Window - Fixed Position */}
      {isOpen && (
        <div 
          className="!fixed bottom-24 right-6 !z-50 w-[420px] animate-fade-in"
          style={{ position: 'fixed', bottom: '6rem', right: '1.5rem', zIndex: 9999 }}
        >
          <Card className="flex h-[550px] flex-col shadow-2xl border-2 border-primary/20">
            {/* Header - Minimalist */}
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-card">
              <h3 className="text-sm font-normal text-muted-foreground">Scout Assistant</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 p-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2.5 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted text-foreground rounded-bl-none"
                    }`}
                  >
                    {message.isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        {message.role === "assistant" && (
                          <div className="mt-2 flex items-center gap-0.5 opacity-50 hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleCopyMessage(message.content)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Volume2 className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions - Compact */}
            {messages.length === 1 && (
              <div className="border-t border-border px-4 py-2 bg-muted/30">
                <p className="text-xs text-muted-foreground mb-1.5">Quick questions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {quickQuestions.map((question) => (
                    <button
                      key={question}
                      onClick={() => {
                        setInput(question)
                      }}
                      className="text-xs rounded-full bg-background border border-border px-2.5 py-1 hover:bg-muted transition-colors text-left"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSendMessage} className="border-t border-border p-3">
              {/* Voice listening indicator */}
              {isListening && (
                <div className="mb-2 flex items-center gap-2 text-sm text-red-600 animate-pulse">
                  <div className="flex gap-1">
                    <div className="w-1 h-4 bg-red-600 rounded-full animate-pulse"></div>
                    <div className="w-1 h-4 bg-red-600 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-4 bg-red-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="font-medium">Listening... Speak now!</span>
                </div>
              )}
              
              <div className="flex gap-2">
                <Input
                  placeholder={isListening ? "Listening to your voice..." : "Ask Scout or click 🎤 to speak..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isSending || isListening}
                  className={`text-sm h-10 ${isListening ? 'border-red-300 bg-red-50/50' : ''}`}
                />
                <Button
                  type="button"
                  variant={isListening ? "default" : "ghost"}
                  size="icon"
                  onClick={handleVoiceInput}
                  className={`h-10 w-10 flex-shrink-0 transition-all ${
                    isListening 
                      ? "bg-red-600 hover:bg-red-700 text-white animate-pulse" 
                      : "hover:bg-primary/10"
                  }`}
                  disabled={isSending}
                  title={isListening ? "Click to stop listening" : "Click to use voice input"}
                >
                  <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
                </Button>
                <Button type="submit" size="icon" className="h-10 w-10 flex-shrink-0" disabled={isSending || !input.trim()}>
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Floating Button - Fixed Position */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="!fixed bottom-6 right-6 !z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 bg-primary hover:bg-primary/90"
        style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999 }}
        size="icon"
        aria-label="Toggle Scout Assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </>
  )

  return createPortal(content, document.body)
}
