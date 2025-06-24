"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/ui/header"
import { WaterButton } from "@/components/ui/water-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function LandingPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleQuickSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please fill in both email and password.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Account Created! 🚿",
        description: "Welcome to Shower Thoughts! Redirecting to dashboard...",
      })
      // In a real app, redirect to dashboard
    }, 2000)
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 water-drop bg-gradient-to-br from-blue-400 to-cyan-300 animate-float"></div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-200 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-cyan-200 rounded-full animate-pulse"></div>
            </div>
          </div>

          <h1 className="pixel-font text-4xl md:text-6xl font-bold text-blue-800 mb-4">Shower Thoughts</h1>
          <p className="text-xl md:text-2xl text-blue-600 mb-8 max-w-2xl mx-auto">
            Transform your random thoughts into actionable tasks.
            <br />
            <span className="text-lg text-blue-500">Because the best ideas come when you least expect them.</span>
          </p>
        </div>

        {/* Quick Signup Form */}
        <div className="max-w-md mx-auto">
          <div className="glass-effect rounded-3xl p-8 bubble-shadow">
            <h2 className="pixel-font text-2xl text-blue-800 text-center mb-6">Start Your Journey</h2>

            <form onSubmit={handleQuickSignup} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-blue-700 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-blue-700 font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  placeholder="••••••••"
                />
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
        </div>

        {/* Features Preview */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">💭</span>
            </div>
            <h3 className="pixel-font text-lg text-blue-800 mb-2">Capture Thoughts</h3>
            <p className="text-blue-600 text-sm">Quickly jot down those fleeting moments of inspiration</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="pixel-font text-lg text-blue-800 mb-2">Generate Tasks</h3>
            <p className="text-blue-600 text-sm">Transform abstract ideas into concrete, actionable steps</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">💾</span>
            </div>
            <h3 className="pixel-font text-lg text-blue-800 mb-2">Save & Organize</h3>
            <p className="text-blue-600 text-sm">Keep your best thoughts and track your progress</p>
          </div>
        </div>
      </main>
    </div>
  )
}
