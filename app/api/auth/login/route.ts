import { type NextRequest, NextResponse } from "next/server"
import { verifyUser, generateSessionToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 })
    }

    const user = await verifyUser(email, password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = await generateSessionToken(user.id)

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    })
  } catch (error) {
    console.error("[Login Error]", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
