import { streamText } from "ai"
import { type NextRequest, NextResponse } from "next/server"
import { buildContextPrompt } from "@/lib/memory-manager"

interface ChatRequest {
  messages: Array<{ role: string; content: string }>
  userId: string
  temperature?: number
  maxTokens?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { messages, userId, temperature = 0.7, maxTokens = 2048 } = body

    const contextPrompt = userId ? await buildContextPrompt(userId) : ""

    const systemPrompt =
      contextPrompt +
      "You are an intelligent AGI-like assistant with persistent memory and context awareness. " +
      "Help users navigate, analyze, and understand web content. Learn from interactions and remember patterns. " +
      "Provide clear, concise responses while maintaining conversation context."

    const result = await streamText({
      model: "openai/gpt-4o-mini",
      messages: messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      temperature,
      maxTokens,
      system: systemPrompt,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("[AI Stream Error]", error)
    return NextResponse.json({ error: "Failed to stream response" }, { status: 500 })
  }
}
