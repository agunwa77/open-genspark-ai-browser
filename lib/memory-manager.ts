import { executeQuery } from "./db"

export interface ContextMemory {
  id?: string
  user_id: string
  context_type:
    | "user_profile"
    | "interaction_pattern"
    | "goal"
    | "preference"
    | "learned_behavior"
    | "conversation_context"
  context_data: Record<string, any>
  importance_score?: number
}

export async function saveMemory(memory: ContextMemory) {
  const result = await executeQuery(
    `INSERT INTO ai_memory (user_id, context_type, context_data, importance_score)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [memory.user_id, memory.context_type, JSON.stringify(memory.context_data), memory.importance_score || 5],
  )
  return result[0]
}

export async function loadMemory(userId: string, contextType?: string) {
  let query = "SELECT * FROM ai_memory WHERE user_id = $1"
  const params: any[] = [userId]

  if (contextType) {
    query += " AND context_type = $2"
    params.push(contextType)
  }

  query += " ORDER BY importance_score DESC, last_accessed DESC"

  const memories = await executeQuery(query, params)
  return memories
}

export async function buildContextPrompt(userId: string): Promise<string> {
  const memories = await loadMemory(userId)

  let contextPrompt = `You are an advanced AGI-like assistant with persistent memory.\n\n`

  const userProfile = memories.find((m: any) => m.context_type === "user_profile")
  if (userProfile) {
    contextPrompt += `User: ${userProfile.context_data.name || "User"}\n`
  }

  const behaviors = memories.filter((m: any) => m.context_type === "learned_behavior")
  if (behaviors.length > 0) {
    contextPrompt += `Known Patterns: ${behaviors.map((b: any) => b.context_data.pattern).join(", ")}\n`
  }

  return contextPrompt
}
