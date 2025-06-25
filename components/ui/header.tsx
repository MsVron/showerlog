"use client"

import Link from "next/link"
import { Github, LogIn, LogOut, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  email: string
  name: string | null
  emailVerified: boolean
}

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/user')
        
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        toast({
          title: "Signed out successfully",
          description: "You have been logged out.",
        })
        router.push('/')
      } else {
        throw new Error('Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="w-full p-4 flex justify-between items-center relative z-10">
      <Link href="/" className="flex items-center space-x-2">
        <div className="w-8 h-8 water-drop bg-gradient-to-br from-blue-400 to-cyan-300"></div>
                    <span className="pixel-font text-xl text-blue-800">ShowerLog</span>
      </Link>
      
      <div className="flex items-center space-x-2">
        {user && (
          <div className="flex items-center space-x-3 mr-2">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-blue-800">
                {user.name || 'User'}
              </div>
              <div className="text-xs text-blue-600">
                {user.email}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="icon" asChild className="hover:bg-blue-100/50 transition-colors">
                <Link href="/settings">
                  <Settings className="h-4 w-4 text-blue-700" />
                </Link>
              </Button>
            </div>
          </div>
        )}
        
{(() => {
          const authPages = ['/signin', '/signup', '/forgot-password', '/reset-password', '/verify-email']
          const isAuthPage = authPages.some(page => pathname.includes(page))
          const shouldShowAuth = !user && !isLoading && !isAuthPage
          
          return shouldShowAuth && (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild className="hover:bg-blue-100/50 transition-colors">
                <Link href="/signin" className="flex items-center space-x-2">
                  <LogIn className="h-4 w-4 text-blue-700" />
                  <span className="text-blue-700 font-medium">Sign In</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="border-blue-300 hover:bg-blue-50 transition-colors">
                <Link href="/signup" className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-blue-700" />
                  <span className="text-blue-700 font-medium">Sign Up</span>
                </Link>
              </Button>
            </div>
          )
        })()}
        
        <Button variant="ghost" size="icon" asChild className="hover:bg-blue-100/50 transition-colors">
          <a href="https://github.com/MsVron/showerthoughts/" target="_blank" rel="noopener noreferrer">
            <Github className="h-5 w-5 text-blue-700" />
          </a>
        </Button>
        
        {user && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="hover:bg-red-100/50 transition-colors"
          >
            <LogOut className="h-4 w-4 text-red-600" />
          </Button>
        )}
      </div>
    </header>
  )
}
