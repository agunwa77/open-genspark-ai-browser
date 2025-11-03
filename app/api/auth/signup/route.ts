import { type NextRequest, NextResponse } from "next/server"
import { createUser, generateSessionToken } from "@/lib/auth"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 })
    }

    const user = await createUser(email, password, name)

    await executeQuery("INSERT INTO user_preferences (user_id) VALUES ($1)", [user.id])

    await executeQuery(
      `INSERT INTO ai_memory (user_id, context_type, context_data, importance_score)
       VALUES ($1, $2, $3, $4)`,
      [user.id, "user_profile", JSON.stringify({ name: user.name, email: user.email }), 10],
    )

    const token = await generateSessionToken(user.id)

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    })
  } catch (error) {
    console.error("[Signup Error]", error)
    return NextResponse.json({ error: "Signup failed" }, { status: 500 })
  }
}
