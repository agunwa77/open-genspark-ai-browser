import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = Buffer.from(token.split(":")[0], "base64").toString()

    const users = await executeQuery("SELECT id, email, name FROM users WHERE id = $1", [userId])
    const user = users[0]

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[Auth Error]", error)
    return NextResponse.json({ error: "Auth failed" }, { status: 500 })
  }
}
