import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { messages } = body

    const userId = Buffer.from(token.split(":")[0], "base64").toString()

    const sessions = await executeQuery(
      "SELECT id FROM chat_sessions WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1",
      [userId],
    )

    let sessionId = sessions[0]?.id

    if (!sessionId) {
      const newSession = await executeQuery("INSERT INTO chat_sessions (user_id, title) VALUES ($1, $2) RETURNING id", [
        userId,
        `Chat ${new Date().toLocaleDateString()}`,
      ])
      sessionId = newSession[0].id
    }

    for (const msg of messages) {
      await executeQuery("INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3)", [
        sessionId,
        msg.role,
        msg.content,
      ])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Chat Save Error]", error)
    return NextResponse.json({ error: "Failed to save chat" }, { status: 500 })
  }
}
