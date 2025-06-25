import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { headers } from "next/headers"
import { sql } from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Edge Runtime compatible JWT functions using Web Crypto API
export async function generateToken(userId: string): Promise<string> {
  console.log("=== TOKEN GENERATION DEBUG ===")
  console.log("Generating token for userId:", userId)
  console.log("JWT_SECRET exists:", !!JWT_SECRET)

  const header = {
    alg: "HS256",
    typ: "JWT",
  }

  const now = Math.floor(Date.now() / 1000)
  const payload = {
    userId,
    iat: now,
    exp: now + 7 * 24 * 60 * 60, // 7 days
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const data = `${encodedHeader}.${encodedPayload}`

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data))
  const encodedSignature = base64UrlEncode(signature)

  const token = `${data}.${encodedSignature}`
  console.log("Generated token preview:", `${token.substring(0, 20)}...`)
  return token
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    console.log("=== TOKEN VERIFICATION DEBUG ===")
    console.log("Token to verify:", token ? `${token.substring(0, 20)}...` : "null/undefined")
    console.log("JWT_SECRET exists:", !!JWT_SECRET)

    const parts = token.split(".")
    if (parts.length !== 3) {
      console.error("Invalid token format")
      return null
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts
    const data = `${encodedHeader}.${encodedPayload}`

    // Verify signature
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    )

    const signature = base64UrlDecode(encodedSignature)
    const isValid = await crypto.subtle.verify("HMAC", key, signature, new TextEncoder().encode(data))

    if (!isValid) {
      console.error("Invalid token signature")
      return null
    }

    // Decode payload
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(encodedPayload)))

    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      console.error("Token expired")
      return null
    }

    console.log("Token verification successful:", { userId: payload.userId })
    return { userId: payload.userId }
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

// Helper functions for base64url encoding/decoding
function base64UrlEncode(data: string | ArrayBuffer): string {
  let base64: string

  if (typeof data === "string") {
    base64 = btoa(data)
  } else {
    const bytes = new Uint8Array(data)
    let binary = ""
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    base64 = btoa(binary)
  }

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

function base64UrlDecode(data: string): Uint8Array {
  const base64 = data.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export function generateVerificationToken(): string {
  return uuidv4()
}

// Keep this function for server components that can access headers
export async function getCurrentUser() {
  try {
    console.log("🔍 Auth: Getting current user from headers...")
    const headersList = await headers()
    const userId = headersList.get("user-id")

    console.log("👤 Auth: User ID from headers:", userId)

    if (!userId) {
      console.log("❌ Auth: No user ID in headers")
      return null
    }

    console.log("🔍 Auth: Querying database for user:", userId)
    const user = await sql`
      SELECT id, email, name, email_verified, created_at
      FROM users 
      WHERE id = ${userId}
    `

    console.log("📊 Auth: Database query result:", user)
    const result = user.length > 0 ? user[0] : null
    console.log("✅ Auth: Returning user:", result)

    return result
  } catch (error) {
    console.error("❌ Auth: Error in getCurrentUser:", error)
    return null
  }
}

// New function for API routes that need to get user from token
export async function getUserFromToken(token: string) {
  try {
    console.log("🔍 Auth: Getting user from token...")

    const decoded = await verifyToken(token)
    if (!decoded) {
      console.log("❌ Auth: Invalid token")
      return null
    }

    console.log("🔍 Auth: Querying database for user:", decoded.userId)
    const user = await sql`
      SELECT id, email, name, email_verified, created_at
      FROM users 
      WHERE id = ${decoded.userId}
    `

    const result = user.length > 0 ? user[0] : null
    console.log("✅ Auth: Returning user from token:", result)

    return result
  } catch (error) {
    console.error("❌ Auth: Error in getUserFromToken:", error)
    return null
  }
}

export async function handleAuthError(router: any) {
  try {
    await fetch('/api/auth/logout', { method: 'POST' })
  } catch (error) {
    console.error('Error during logout cleanup:', error)
  } finally {
    router.push('/')
  }
}
