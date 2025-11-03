"use client"

import { useState, useRef, useEffect } from "react"
import { Send, MessageCircle, Settings, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/lib/auth-store"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ClaudeChatProps {
  onSettingsClick?: () => void
}

export function ClaudeChat({ onSettingsClick }: ClaudeChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [showMemory, setShowMemory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuthStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  useEffect(() => {
    if (user) {
      loadChatHistory()
    }
  }, [user])

  const loadChatHistory = async () => {
    try {
      const response = await fetch("/api/chat/history", {
        headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
      })
      if (response.ok) {
        const history = await response.json()
        setMessages(history)
      }
    } catch (error) {
      console.error("Error loading chat history:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || !user) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setHasStarted(true)

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userId: user.id,
          temperature: 0.7,
          maxTokens: 2048,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response stream")

      const decoder = new TextDecoder()
      let fullContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        fullContent += chunk

        setMessages((prev) => {
          const updated = [...prev]
          const lastMsg = updated[updated.length - 1]
          if (lastMsg.role === "assistant") {
            lastMsg.content = fullContent
          }
          return updated
        })
      }

      await fetch("/api/chat/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage, assistantMessage],
        }),
      })
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-error`,
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
      {/* Chat Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white dark:text-black" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-lg">Open Genspark Chat</h2>
              <p className="text-xs text-muted-foreground">
                {user ? `Logged in as ${user.name} • Memory enabled` : "Sign in to enable persistent memory"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMemory(!showMemory)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Brain className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSettingsClick}
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {!hasStarted ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h3 className="text-3xl font-semibold text-black dark:text-white">How can I help?</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 max-w-md">
                    Ask me anything about web browsing, research, content analysis, or any other task. I can browse the
                    web, extract data, and provide intelligent insights.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 max-w-md">
                  {[
                    { icon: "🔍", text: "Search & summarize" },
                    { icon: "📊", text: "Extract data" },
                    { icon: "🧠", text: "Analyze content" },
                    { icon: "🚀", text: "Automation tasks" },
                  ].map((action) => (
                    <button
                      key={action.text}
                      onClick={() => setInput(action.text)}
                      className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm text-black dark:text-white flex items-center justify-center gap-2 group"
                    >
                      <span>{action.icon}</span>
                      <span className="group-hover:underline">{action.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center flex-shrink-0 mt-1">
                      <MessageCircle className="w-4 h-4 text-white dark:text-black" />
                    </div>
                  )}

                  <div className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`rounded-2xl px-5 py-3 max-w-2xl ${
                        message.role === "user"
                          ? "bg-black dark:bg-white text-white dark:text-black rounded-br-sm"
                          : "bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white rounded-bl-sm border border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-500 mt-1.5">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-zinc-400 dark:bg-zinc-600 flex items-center justify-center flex-shrink-0 mt-1 text-white dark:text-white font-semibold text-xs">
                      U
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-white dark:text-black animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 rounded-2xl px-5 py-3 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-pulse"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">Thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 backdrop-blur-sm px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder={user ? "Message Genspark (with memory)..." : "Sign in to enable persistent memory..."}
                disabled={isLoading || !user}
                className="pr-12 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 placeholder:text-zinc-500 dark:placeholder:text-zinc-500 rounded-full"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim() || !user}
                size="sm"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full w-8 h-8 p-0 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-900 dark:hover:bg-zinc-100"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 text-center">
            Press Shift+Enter for new line • Your memory is persistent across sessions
          </p>
        </div>
      </div>
    </div>
  )
}
