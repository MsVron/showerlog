"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/ui/header"
import { WaterButton } from "@/components/ui/water-button"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (!tokenParam) {
      toast({
        title: "Invalid Reset Link",
        description: "The reset link is invalid or has expired.",
        variant: "destructive",
      })
      router.push('/forgot-password')
    } else {
      setToken(tokenParam)
    }
  }, [searchParams, router, toast])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !token) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        toast({
          title: "Password Reset Successfully!",
          description: data.message,
        })
      } else {
        setErrors({ form: data.error || 'Something went wrong' })
        toast({
          title: "Error",
          description: data.error || 'Failed to reset password',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Reset password error:', error)
      setErrors({ form: 'Network error. Please try again.' })
      toast({
        title: "Error",
        description: 'Network error. Please try again.',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
    if (errors.form) {
      setErrors((prev) => ({ ...prev, form: "" }))
    }
  }

  if (!token) {
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
          <h1 className="pixel-font text-3xl text-blue-800 mb-2">Reset Password</h1>
          <p className="text-blue-600">Enter your new password below</p>
        </div>

        <div className="glass-effect rounded-3xl p-8 bubble-shadow">
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-blue-800">Password Reset Successfully!</h2>
              <p className="text-blue-600">
                Your password has been reset. You can now sign in with your new password.
              </p>
              <WaterButton 
                onClick={() => router.push('/signin')}
                size="lg"
                className="w-full"
              >
                Go to Sign In
              </WaterButton>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.form && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600">{errors.form}</p>
                  </div>
                )}

                <div>
                  <Label htmlFor="password" className="text-blue-700 font-medium">
                    New Password
                  </Label>
                  <PasswordInput
                    id="password"
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    disabled={isLoading}
                    className={`mt-1 rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400 ${
                      errors.password ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                    }`}
                    placeholder="••••••••"
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-blue-700 font-medium">
                    Confirm New Password
                  </Label>
                  <PasswordInput
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange("confirmPassword")}
                    disabled={isLoading}
                    className={`mt-1 rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400 ${
                      errors.confirmPassword ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                    }`}
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>

                <WaterButton type="submit" size="lg" isLoading={isLoading} className="w-full" disabled={isLoading}>
                  {isLoading ? "Resetting..." : "Reset Password"}
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