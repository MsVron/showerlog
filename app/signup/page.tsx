"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/ui/header"
import { WaterButton } from "@/components/ui/water-button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface Errors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  form?: string
}

export default function SignUpPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Errors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const validateForm = () => {
    const newErrors: Errors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        toast({
          title: "Account Created Successfully! 🎉",
          description: data.message || "Welcome to ShowerLog! Please check your email to verify your account.",
        })
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        })
      } else {
        setErrors({ form: data.error || 'Something went wrong' })
        toast({
          title: "Error",
          description: data.error || 'Failed to create account',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Signup error:', error)
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

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
    if (errors.form) {
      setErrors((prev) => ({ ...prev, form: "" }))
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 water-drop bg-gradient-to-br from-blue-400 to-cyan-300 animate-float"></div>
          <h1 className="pixel-font text-2xl sm:text-3xl text-blue-800 mb-2">Create Account</h1>
          <p className="text-blue-600 text-sm sm:text-base">Join the community of creative thinkers</p>
        </div>

        <div className="glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 bubble-shadow">
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-blue-800">Check Your Email!</h2>
              <p className="text-blue-600 text-sm sm:text-base">
                We've sent a verification link to your email address. Please click the link to verify your account and complete the signup process.
              </p>
              <p className="text-xs sm:text-sm text-blue-500">
                Didn't receive the email? Check your spam folder or try signing up again.
              </p>
              <button
                onClick={() => setIsSuccess(false)}
                className="text-blue-800 hover:text-blue-900 font-medium underline text-sm sm:text-base"
              >
                Back to signup form
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {errors.form && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-xs sm:text-sm text-red-600">{errors.form}</p>
                  </div>
                )}

                <div>
                  <Label htmlFor="name" className="text-blue-700 font-medium text-sm sm:text-base">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange("name")}
                    className={`mt-1 rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400 text-sm sm:text-base ${
                      errors.name ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                    }`}
                    placeholder="Your full name"
                  />
                  {errors.name && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="email" className="text-blue-700 font-medium text-sm sm:text-base">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    className={`mt-1 rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400 text-sm sm:text-base ${
                      errors.email ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="password" className="text-blue-700 font-medium text-sm sm:text-base">
                    Password
                  </Label>
                  <PasswordInput
                    id="password"
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    className={`mt-1 rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400 text-sm sm:text-base ${
                      errors.password ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                    }`}
                    placeholder="••••••••"
                  />
                  {errors.password && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.password}</p>}
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-blue-700 font-medium text-sm sm:text-base">
                    Confirm Password
                  </Label>
                  <PasswordInput
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange("confirmPassword")}
                    className={`mt-1 rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400 text-sm sm:text-base ${
                      errors.confirmPassword ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                    }`}
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>

                <WaterButton type="submit" size="lg" isLoading={isLoading} className="w-full text-sm sm:text-base">
                  {isLoading ? "Creating Account..." : "Create Account"}
                </WaterButton>
              </form>

              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-blue-600 text-xs sm:text-sm">
                  Already have an account?{" "}
                  <Link href="/signin" className="font-medium underline hover:text-blue-800">
                    Sign in here
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
