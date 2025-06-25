"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/ui/header"
import { WaterButton } from "@/components/ui/water-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const [hasAccess, setHasAccess] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    console.log("=== FORGOT PASSWORD ACCESS CHECK ===")
    console.log("Document referrer:", document.referrer)
    console.log("SessionStorage flag:", sessionStorage.getItem('forgotPasswordAccess'))
    
    // Check if user came from signin page or has valid session storage flag
    const hasSessionFlag = sessionStorage.getItem('forgotPasswordAccess') === 'true'
    const hasValidReferrer = document.referrer.includes('/signin')
    
    console.log("Has session flag:", hasSessionFlag)
    console.log("Has valid referrer:", hasValidReferrer)
    
    if (!hasSessionFlag && !hasValidReferrer) {
      console.log("❌ Access denied - redirecting to signin")
      toast({
        title: "Access Denied",
        description: "Please use the 'Forgot Password' link from the sign in page.",
        variant: "destructive",
      })
      router.push('/signin')
    } else {
      console.log("✅ Access granted")
      setHasAccess(true)
      // Clear the session storage flag
      sessionStorage.removeItem('forgotPasswordAccess')
    }
  }, [router, toast])

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("=== FORGOT PASSWORD FORM SUBMITTED ===")
    console.log("Email:", email)

    if (!email) {
      setError("Email is required")
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log("🔄 Calling forgot password API...")
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      
      console.log("📡 API Response status:", response.status)

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        toast({
          title: "Reset Link Sent",
          description: data.message,
        })
      } else {
        setError(data.error || 'Something went wrong')
        toast({
          title: "Error",
          description: data.error || 'Failed to send reset email',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      setError('Network error. Please try again.')
      toast({
        title: "Error",
        description: 'Network error. Please try again.',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error) {
      setError("")
    }
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 water-drop bg-gradient-to-br from-blue-400 to-cyan-300 animate-float"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 water-drop bg-gradient-to-br from-blue-400 to-cyan-300 animate-float"></div>
          <h1 className="pixel-font text-3xl text-blue-800 mb-2">Forgot Password</h1>
          <p className="text-blue-600">Enter your email to receive a password reset link</p>
        </div>

        <div className="glass-effect rounded-3xl p-8 bubble-shadow">
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-blue-800">Check Your Email!</h2>
              <p className="text-blue-600">
                If an account with that email exists, we&apos;ve sent you a password reset link. Please check your email and follow the instructions.
              </p>
              <p className="text-sm text-blue-500">
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsSuccess(false)
                    setEmail("")
                  }}
                  className="text-blue-800 hover:text-blue-900 font-medium underline block mx-auto"
                >
                  Try again
                </button>
                <Link
                  href="/signin"
                  className="text-blue-600 hover:text-blue-800 text-sm underline block"
                >
                  Back to sign in
                </Link>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div>
                  <Label htmlFor="email" className="text-blue-700 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`mt-1 rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400 ${
                      error ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                    }`}
                    placeholder="your@email.com"
                  />
                </div>

                <WaterButton type="submit" size="lg" isLoading={isLoading} className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </WaterButton>
              </form>

              <div className="mt-6 text-center">
                <p className="text-blue-600">
                  Remember your password?{" "}
                  <Link href="/signin" className="text-blue-800 hover:text-blue-900 font-medium underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
} 