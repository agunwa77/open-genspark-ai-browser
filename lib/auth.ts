import { executeQuery } from "./db"
import crypto from "crypto"

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

export async function verifyPassword(password: string, hash: string) {
  const [salt] = hash.split(":")
  const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  return testHash === hash.split(":")[1]
}

export async function getUserByEmail(email: string) {
  const users = await executeQuery("SELECT * FROM users WHERE email = $1", [email])
  return users[0] || null
}

export async function createUser(email: string, password: string, name?: string) {
  const hashedPassword = await hashPassword(password)
  const users = await executeQuery(
    "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name",
    [email, hashedPassword, name || email.split("@")[0]],
  )
  return users[0]
}

export async function verifyUser(email: string, password: string) {
  const user = await getUserByEmail(email)
  if (!user) return null

  const isValid = await verifyPassword(password, user.password_hash)
  if (!isValid) return null

  return user
}

export async function generateSessionToken(userId: string) {
  const token = Buffer.from(`${userId}:${Date.now()}`).toString("base64")
  return token
}
