"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/ui/header"
import { WaterButton } from "@/components/ui/water-button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("=== SIGNIN ATTEMPT STARTED ===")

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are handled properly
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()
      console.log("Signin response:", { status: response.status, data })

      if (response.ok && data.success) {
        console.log("=== SIGNIN SUCCESSFUL - REDIRECTING ===")

        // Show success message
        toast({
          title: "Welcome back! 🚿",
          description: "Successfully signed in. Redirecting...",
        })

        // Clear form
        setFormData({ email: "", password: "" })

        // Immediate redirect using router.push with error handling
        try {
          await router.push("/dashboard")
          console.log("Router.push completed successfully")
        } catch (routerError) {
          console.error("Router.push failed:", routerError)
          // Fallback to window.location
          window.location.href = "/dashboard"
        }

        // Additional safety net - if still on signin page after 2 seconds
        setTimeout(() => {
          if (window.location.pathname === "/signin") {
            console.log("Safety redirect triggered")
            window.location.replace("/dashboard")
          }
        }, 2000)
      } else {
        // Handle signin failure
        const errorMessage = data.error || "Invalid credentials"
        setErrors({ form: errorMessage })
        toast({
          title: "Sign In Failed",
          description: errorMessage,
          variant: "destructive",
        })
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Network error during signin:", error)
      setErrors({ form: "Network error. Please check your connection and try again." })
      toast({
        title: "Connection Error",
        description: "Unable to connect. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    // Clear errors when user starts typing
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

      <main className="container mx-auto px-4 py-8 max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 water-drop bg-gradient-to-br from-blue-400 to-cyan-300 animate-float"></div>
          <h1 className="pixel-font text-3xl text-blue-800 mb-2">Welcome Back</h1>
          <p className="text-blue-600">Sign in to continue your creative journey</p>
        </div>

        <div className="glass-effect rounded-3xl p-8 bubble-shadow">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.form && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{errors.form}</p>
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-blue-700 font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange("email")}
                disabled={isLoading}
                className={`mt-1 rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400 ${
                  errors.email ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                }`}
                placeholder="your@email.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="password" className="text-blue-700 font-medium">
                Password
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

            <WaterButton type="submit" size="lg" isLoading={isLoading} className="w-full" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </WaterButton>
          </form>

          <div className="mt-4 text-center">
            <Link
              href="/forgot-password"
              className="text-blue-600 hover:text-blue-800 text-sm underline"
              tabIndex={isLoading ? -1 : 0}
            >
              Forgot your password?
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-blue-600">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-blue-800 hover:text-blue-900 font-medium underline"
                tabIndex={isLoading ? -1 : 0}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
