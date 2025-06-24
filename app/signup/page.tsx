"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/ui/header"
import { WaterButton } from "@/components/ui/water-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const validateForm = () => {
    const newErrors = {}

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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Account Created Successfully! 🎉",
        description: "Welcome to Shower Thoughts! You can now sign in.",
      })
      // In a real app, redirect to signin or dashboard
    }, 2000)
  }

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 water-drop bg-gradient-to-br from-blue-400 to-cyan-300 animate-float"></div>
          <h1 className="pixel-font text-3xl text-blue-800 mb-2">Create Account</h1>
          <p className="text-blue-600">Join the community of creative thinkers</p>
        </div>

        <div className="glass-effect rounded-3xl p-8 bubble-shadow">
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div>
              <Label htmlFor="confirmPassword" className="text-blue-700 font-medium">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange("confirmPassword")}
                className={`mt-1 rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400 ${
                  errors.confirmPassword ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                }`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            <WaterButton type="submit" size="lg" isLoading={isLoading} className="w-full">
              Create Account
            </WaterButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-blue-600">
              Already have an account?{" "}
              <Link href="/signin" className="text-blue-800 hover:text-blue-900 font-medium underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
