"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/ui/header"
import { WaterButton } from "@/components/ui/water-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const validateForm = () => {
    const newErrors = {}

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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Welcome back! 🚿",
          description: data.message || "Successfully signed in. Redirecting to dashboard...",
        })
        router.push("/dashboard")
      } else {
        setErrors({ form: data.error || 'Something went wrong' })
        toast({
          title: "Error",
          description: data.error || 'Failed to sign in',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Signin error:', error)
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

  const handleInputChange = (field) => (e) => {
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
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange("password")}
                className={`mt-1 rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400 ${
                  errors.password ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                }`}
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <WaterButton type="submit" size="lg" isLoading={isLoading} className="w-full">
              Sign In
            </WaterButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-blue-600">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-800 hover:text-blue-900 font-medium underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
