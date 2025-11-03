import { neon } from "@neondatabase/serverless"

// --- START MOCKING FOR REVIEW ---
const IS_MOCK_MODE = process.env.NODE_ENV !== "production" && process.env.MOCK_DB === "true"

let sql: any
if (IS_MOCK_MODE) {
  console.log("[DB MOCK] Initializing database in mock mode.")
  sql = async (query: string, params?: any[]) => {
    console.log(`[DB MOCK] Executing query: ${query.trim().split('\\n')[0]}... with params:`, params)
    if (query.includes("SELECT * FROM users WHERE email")) {
      // Mock user not found
      return []
    }
    if (query.includes("INSERT INTO users")) {
      // Mock new user creation
      return [{ id: 1, email: params[0], name: params[2] || params[0].split("@")[0] }]
    }
    if (query.includes("SELECT 1 FROM information_schema.tables")) {
      // Mock successful table check
      return [{ '?column?': 1 }]
    }
    // Mock successful execution for other queries (preferences, memory, etc.)
    return []
  }
} else {
  sql = neon(process.env.NEON_DATABASE_URL || "")
}
// --- END MOCKING FOR REVIEW ---

export async function executeQuery(query: string, params?: any[]) {
  try {
    const result = await sql(query, params)
    return result
  } catch (error) {
    console.error("[DB Error]", error)
    throw error
  }
}

export async function initializeDatabase() {
  try {
    await sql(`
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'users' LIMIT 1
    `)
    console.log("[DB Init] Database check successful.")
  } catch (error) {
    console.error("[DB Init Error]", error)
  }
}
