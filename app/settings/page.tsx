"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/ui/header"
import { WaterButton } from "@/components/ui/water-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, User, Mail } from "lucide-react"
import Link from "next/link"

interface User {
  id: string
  email: string
  name: string | null
  emailVerified: boolean
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/user')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          setName(userData.name || "")
        } else {
          router.push('/signin')
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
        router.push('/signin')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim() }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        toast({
          title: "Profile Updated",
          description: "Your name has been updated successfully.",
        })
      } else {
        throw new Error('Update failed')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-blue-600">Loading...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Link href="/dashboard">
            <WaterButton variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </WaterButton>
          </Link>
          <h1 className="pixel-font text-3xl text-blue-800 mb-2">Account Settings</h1>
          <p className="text-blue-600">Manage your account information</p>
        </div>

        <div className="glass-effect rounded-3xl p-8 bubble-shadow">
          <div className="space-y-6">
            <div>
              <Label htmlFor="name" className="flex items-center text-blue-700 font-medium mb-2">
                <User className="w-4 h-4 mr-2" />
                Display Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
              <p className="text-sm text-blue-500 mt-1">
                This is how your name will appear in the app
              </p>
            </div>

            <div>
              <Label className="flex items-center text-blue-700 font-medium mb-2">
                <Mail className="w-4 h-4 mr-2" />
                Email Address
              </Label>
              <Input
                value={user?.email || ""}
                disabled
                className="rounded-xl border-blue-200 bg-gray-50 cursor-not-allowed"
              />
              <p className="text-sm text-blue-500 mt-1">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            <div className="pt-4">
              <WaterButton 
                onClick={handleSave} 
                isLoading={isSaving}
                disabled={!name.trim() || name.trim() === (user?.name || "")}
                size="lg"
                className="w-full sm:w-auto"
              >
                Save Changes
              </WaterButton>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 