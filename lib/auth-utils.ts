import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { headers } from "next/headers"
import { sql } from "@/lib/db"

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required")
}

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h" // Default to 24 hours if not set

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function generateToken(userId: string): Promise<string> {
  const header = {
    alg: "HS256",
    typ: "JWT",
  }

  const now = Math.floor(Date.now() / 1000)
  const exp = now + (parseInt(JWT_EXPIRES_IN) || 24 * 60 * 60) // Convert to seconds

  const payload = {
    userId,
    iat: now,
    exp,
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

  return `${data}.${encodedSignature}`
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) {
      return null
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts
    const data = `${encodedHeader}.${encodedPayload}`

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    )

    const signature = base64UrlDecode(encodedSignature)
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      new TextEncoder().encode(data)
    )

    if (!isValid) {
      return null
    }

    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(encodedPayload))
    )

    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      return null
    }

    return { userId: payload.userId }
  } catch {
    return null
  }
}

export function generateVerificationToken(): string {
  return uuidv4()
}

function base64UrlEncode(input: string | ArrayBuffer): string {
  let str = input instanceof ArrayBuffer 
    ? new Uint8Array(input).reduce((str, byte) => str + String.fromCharCode(byte), '')
    : input
    
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
}

function base64UrlDecode(input: string): ArrayBuffer {
  input = input.replace(/-/g, "+").replace(/_/g, "/")
  while (input.length % 4) input += "="
  
  const binary = atob(input)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

export async function getUserFromToken(token: string) {
  try {
    const decoded = await verifyToken(token)
    if (!decoded) {
      return null
    }

    const user = await sql`
      SELECT id, email, name, email_verified, created_at
      FROM users 
      WHERE id = ${decoded.userId}
    `

    return user.length > 0 ? user[0] : null
  } catch {
    return null
  }
}

export async function handleAuthError(router: { push: (path: string) => void }) {
  try {
    await fetch('/api/auth/logout', { method: 'POST' })
  } catch (error) {
    console.error('Error during logout cleanup:', error)
  } finally {
    router.push('/')
  }
}
