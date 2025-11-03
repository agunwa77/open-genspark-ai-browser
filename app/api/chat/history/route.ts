import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = Buffer.from(token.split(":")[0], "base64").toString()

    const messages = await executeQuery(
      `SELECT cm.* FROM chat_messages cm
       JOIN chat_sessions cs ON cm.session_id = cs.id
       WHERE cs.user_id = $1
       ORDER BY cm.created_at DESC LIMIT 50`,
      [userId],
    )

    return NextResponse.json(messages.reverse())
  } catch (error) {
    console.error("[Chat History Error]", error)
    return NextResponse.json({ error: "Failed to load history" }, { status: 500 })
  }
}
