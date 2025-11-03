"use client"

import { useState, useCallback, useEffect } from "react"
import { useAuthStore } from "@/lib/auth-store"
import { AuthPage } from "@/components/auth-page"
import { BrowserHeader } from "@/components/browser-header"
import { BrowserViewport } from "@/components/browser-viewport"
import { DOMInspector } from "@/components/dom-inspector"
import { AgentOutput } from "@/components/agent-output"
import { ScrapingOutput } from "@/components/scraping-output"
import { ControlPanel } from "@/components/control-panel"
import { SettingsPage } from "@/components/settings-page"
import { ClaudeChat } from "@/components/claude-chat"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, SettingsIcon, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [agentRunning, setAgentRunning] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [agentLogs, setAgentLogs] = useState<any[]>([])
  const [scrapingResults, setScrapingResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { isAuthenticated, setUser, logout } = useAuthStore()

  const handleAgentTask = useCallback(async (task: string, url: string) => {
    setAgentRunning(true)
    setAgentLogs([
      {
        id: "1",
        timestamp: new Date().toLocaleTimeString(),
        type: "info",
        message: "Agent initialized",
        details: "Starting task execution",
      },
    ])

    try {
      setAgentLogs((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          type: "info",
          message: "Navigating to URL",
          details: `Target: ${url}`,
        },
      ])

      const response = await fetch("/api/browser/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          extractText: true,
          extractLinks: true,
          extractImages: true,
        }),
      })

      if (!response.ok) throw new Error("Scraping failed")
      const data = await response.json()

      setAgentLogs((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          type: "success",
          message: "Page loaded successfully",
          details: `Document title: ${data.title}`,
        },
      ])

      setScrapingResults((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          url,
          timestamp: new Date().toLocaleTimeString(),
          status: "success",
          dataType: "structured",
          preview: `Extracted content from ${data.title}`,
          fullData: JSON.stringify(data, null, 2),
        },
      ])

      setAgentLogs((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          type: "success",
          message: "Task completed",
          details: "Data extraction finished successfully",
        },
      ])
    } catch (error) {
      setAgentLogs((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          type: "error",
          message: "Error during execution",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      ])
    } finally {
      setAgentRunning(false)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) setUser(data.user)
        })
        .catch(() => logout())
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [setUser, logout])

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    return <AuthPage />
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <BrowserHeader />

      <div className="flex justify-end px-4 py-2 border-b border-border/30">
        <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden gap-4 p-4">
        <div className="flex-1 flex flex-col gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>Chat</span>
              </TabsTrigger>
              <TabsTrigger value="browser">Browser</TabsTrigger>
              <TabsTrigger value="dom">DOM Inspector</TabsTrigger>
              <TabsTrigger value="output">Agent Output</TabsTrigger>
              <TabsTrigger value="scraping">Scraping Results</TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <SettingsIcon className="w-4 h-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 overflow-hidden">
              <ClaudeChat onSettingsClick={() => setActiveTab("settings")} />
            </TabsContent>

            <TabsContent value="browser" className="flex-1 overflow-hidden">
              <BrowserViewport isActive={agentRunning} />
            </TabsContent>

            <TabsContent value="dom" className="flex-1 overflow-hidden">
              <DOMInspector />
            </TabsContent>

            <TabsContent value="output" className="flex-1 overflow-hidden">
              <AgentOutput logs={agentLogs} />
            </TabsContent>

            <TabsContent value="scraping" className="flex-1 overflow-hidden">
              <ScrapingOutput results={scrapingResults} />
            </TabsContent>

            <TabsContent value="settings" className="flex-1 overflow-hidden">
              <SettingsPage />
            </TabsContent>
          </Tabs>
        </div>

        {(activeTab === "browser" || activeTab === "output" || activeTab === "scraping") && (
          <div className="w-80">
            <ControlPanel
              agentRunning={agentRunning}
              onToggleAgent={() => setAgentRunning(!agentRunning)}
              onExecuteTask={handleAgentTask}
            />
          </div>
        )}
      </div>
    </div>
  )
}
