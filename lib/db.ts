import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_DATABASE_URL || "")

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
  } catch (error) {
    console.error("[DB Init Error]", error)
  }
}
