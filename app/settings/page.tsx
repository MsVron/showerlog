"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/ui/header"
import { WaterButton } from "@/components/ui/water-button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, User, Mail, Key, Trash2 } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface User {
  id: string
  email: string
  name: string | null
  emailVerified: boolean
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState("")
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleAuthCleanup = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch (error) {
      console.error('Error during logout cleanup:', error)
    } finally {
      router.push('/')
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include'
        })
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          setName(userData.name || "")
        } else if (response.status === 401) {
          await handleAuthCleanup()
        } else {
          router.push('/')
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
        router.push('/')
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
        credentials: 'include',
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

  const validatePassword = () => {
    const newErrors: { [key: string]: string } = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required"
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required"
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters"
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password"
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (passwordData.currentPassword && passwordData.newPassword && 
        passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = "New password must be different from current password"
    }

    setPasswordErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePasswordChange = async () => {
    if (!validatePassword()) return

    setIsChangingPassword(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
        setPasswordErrors({})
        toast({
          title: "Password Changed",
          description: "Your password has been updated successfully.",
        })
      } else {
        setPasswordErrors({ form: data.error || 'Failed to change password' })
        toast({
          title: "Error",
          description: data.error || 'Failed to change password',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Password change error:', error)
      setPasswordErrors({ form: 'Network error. Please try again.' })
      toast({
        title: "Error",
        description: 'Network error. Please try again.',
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handlePasswordInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData((prev) => ({ ...prev, [field]: e.target.value }))
    if (passwordErrors[field]) {
      setPasswordErrors((prev) => ({ ...prev, [field]: "" }))
    }
    if (passwordErrors.form) {
      setPasswordErrors((prev) => ({ ...prev, form: "" }))
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true)
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        toast({
          title: "Account Deleted",
          description: "Your account has been permanently deleted.",
        })
        await handleAuthCleanup()
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete account')
      }
    } catch (error) {
      console.error('Delete account error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to delete account. Please try again.',
        variant: "destructive",
      })
    } finally {
      setIsDeletingAccount(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-blue-600 text-sm sm:text-base">Loading...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-2xl">
        <div className="mb-6 sm:mb-8">
          <Link href="/dashboard">
            <WaterButton variant="ghost" size="sm" className="mb-4 text-xs sm:text-sm">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Back to Dashboard
            </WaterButton>
          </Link>
          <h1 className="pixel-font text-2xl sm:text-3xl text-blue-800 mb-2">Account Settings</h1>
          <p className="text-blue-600 text-sm sm:text-base">Manage your account information</p>
        </div>

        <div className="glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 bubble-shadow mb-6 sm:mb-8">
          <h2 className="pixel-font text-lg sm:text-xl text-blue-800 mb-4 sm:mb-6">Profile Information</h2>
          <div className="space-y-4 sm:space-y-6">
            <div>
              <Label htmlFor="name" className="flex items-center text-blue-700 font-medium mb-2 text-sm sm:text-base">
                <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Display Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400 text-sm sm:text-base"
              />
              <p className="text-xs sm:text-sm text-blue-500 mt-1">
                This is how your name will appear in the app
              </p>
            </div>

            <div>
              <Label className="flex items-center text-blue-700 font-medium mb-2 text-sm sm:text-base">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Email Address
              </Label>
              <Input
                value={user?.email || ""}
                disabled
                className="rounded-xl border-blue-200 bg-gray-50 cursor-not-allowed text-sm sm:text-base"
              />
              <p className="text-xs sm:text-sm text-blue-500 mt-1">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            <div className="pt-4">
              <WaterButton 
                onClick={handleSave} 
                isLoading={isSaving}
                disabled={!name.trim() || name.trim() === (user?.name || "")}
                size="lg"
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Save Changes
              </WaterButton>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 bubble-shadow mb-6 sm:mb-8">
          <h2 className="pixel-font text-lg sm:text-xl text-blue-800 mb-4 sm:mb-6">Change Password</h2>
          <div className="space-y-4 sm:space-y-6">
            {passwordErrors.form && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-xs sm:text-sm text-red-600">{passwordErrors.form}</p>
              </div>
            )}

            <div>
              <Label htmlFor="currentPassword" className="flex items-center text-blue-700 font-medium mb-2 text-sm sm:text-base">
                <Key className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Current Password
              </Label>
              <PasswordInput
                id="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordInputChange("currentPassword")}
                disabled={isChangingPassword}
                className={`rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400 text-sm sm:text-base ${
                  passwordErrors.currentPassword ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                }`}
                placeholder="Enter your current password"
              />
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{passwordErrors.currentPassword}</p>
              )}
            </div>

            <div>
              <Label htmlFor="newPassword" className="flex items-center text-blue-700 font-medium mb-2 text-sm sm:text-base">
                <Key className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                New Password
              </Label>
              <PasswordInput
                id="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordInputChange("newPassword")}
                disabled={isChangingPassword}
                className={`rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400 text-sm sm:text-base ${
                  passwordErrors.newPassword ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                }`}
                placeholder="Enter your new password"
              />
              {passwordErrors.newPassword && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{passwordErrors.newPassword}</p>
              )}
              <p className="text-xs sm:text-sm text-blue-500 mt-1">
                Must be at least 6 characters long
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="flex items-center text-blue-700 font-medium mb-2 text-sm sm:text-base">
                <Key className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Confirm New Password
              </Label>
              <PasswordInput
                id="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordInputChange("confirmPassword")}
                disabled={isChangingPassword}
                className={`rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400 text-sm sm:text-base ${
                  passwordErrors.confirmPassword ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""
                }`}
                placeholder="Re-enter your new password"
              />
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{passwordErrors.confirmPassword}</p>
              )}
            </div>

            <div className="pt-4">
              <WaterButton 
                onClick={handlePasswordChange} 
                isLoading={isChangingPassword}
                disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                size="lg"
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                {isChangingPassword ? "Changing Password..." : "Change Password"}
              </WaterButton>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 bubble-shadow border-red-100 mb-6 sm:mb-8">
          <h2 className="pixel-font text-lg sm:text-xl text-red-800 mb-4 sm:mb-6">Danger Zone</h2>
          <div className="space-y-4">
            <div className="p-3 sm:p-4 rounded-lg bg-red-50 border border-red-200">
              <h3 className="font-semibold text-red-800 mb-2 text-sm sm:text-base">Delete Account</h3>
              <p className="text-xs sm:text-sm text-red-600 mb-4">
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <WaterButton 
                    variant="destructive" 
                    size="lg"
                    disabled={isDeletingAccount}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base w-full sm:w-auto"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Delete Account
                  </WaterButton>
                </AlertDialogTrigger>
                <AlertDialogContent className="glass-effect border-red-200 mx-4 sm:mx-0">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-800 pixel-font text-lg sm:text-xl">
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-red-600 text-sm sm:text-base">
                      This action cannot be undone. This will permanently delete your account, 
                      all your thoughts, saved content, and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                    <AlertDialogCancel className="rounded-xl w-full sm:w-auto text-sm sm:text-base">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={isDeletingAccount}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-xl w-full sm:w-auto text-sm sm:text-base"
                    >
                      {isDeletingAccount ? "Deleting..." : "Yes, delete my account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 