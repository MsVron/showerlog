import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key" // Fallback for development
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h"

export function verifyToken(token: string): { userId: string } | null {
  try {
    console.log("=== TOKEN VERIFICATION DEBUG ===")
    console.log("Token to verify:", token ? `${token.substring(0, 20)}...` : "null/undefined")
    console.log("JWT_SECRET exists:", !!JWT_SECRET)
    console.log("JWT_SECRET value:", JWT_SECRET === "your-secret-key" ? "USING DEFAULT SECRET" : "CUSTOM SECRET SET")

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    console.log("Token verification successful:", decoded)
    return decoded
  } catch (error) {
    console.error("Token verification failed:", error)
    console.error("Error name:", error.name)
    console.error("Error message:", error.message)
    return null
  }
}

export function generateToken(userId: string): string {
  console.log("=== TOKEN GENERATION DEBUG ===")
  console.log("Generating token for userId:", userId)
  console.log("JWT_SECRET exists:", !!JWT_SECRET)
  console.log("JWT_SECRET value:", JWT_SECRET === "your-secret-key" ? "USING DEFAULT SECRET" : "CUSTOM SECRET SET")
  console.log("JWT_EXPIRES_IN:", JWT_EXPIRES_IN)

  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions)
  console.log("Generated token preview:", `${token.substring(0, 20)}...`)
  return token
}
