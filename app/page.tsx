"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/ui/header"
import { WaterButton } from "@/components/ui/water-button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Lightbulb, Save, Sparkles, Wifi, WifiOff, Clock, LogIn, UserPlus } from "lucide-react"
import { generateSubtasks, getRandomThoughts, checkAIHealth, type Subtask } from "@/lib/ai-service"

interface ExtendedSubtask extends Subtask {
  completed: boolean;
}

export default function HomePage() {
  const [thought, setThought] = useState("")
  const [subtasks, setSubtasks] = useState<ExtendedSubtask[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGettingThought, setIsGettingThought] = useState(false)
  const [aiOnline, setAiOnline] = useState<boolean | null>(null)
  const [taskBreakdownData, setTaskBreakdownData] = useState<any>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    checkAuthAndAI()
  }, [])

  const checkAuthAndAI = async () => {
    try {
      const authResponse = await fetch('/api/auth/check', {
        credentials: 'include'
      })
      
      if (authResponse.ok) {
        const authData = await authResponse.json()
        if (authData.authenticated) {
          setIsAuthenticated(true)
          router.push('/dashboard')
          return
        }
      }
    } catch (error) {
      console.log('Auth check failed:', error)
    }

    try {
      const isOnline = await checkAIHealth()
      setAiOnline(isOnline)
    } catch (error) {
      setAiOnline(false)
    }

    setIsCheckingAuth(false)
  }

  const handleGenerateSubtasks = async () => {
    if (!thought.trim()) {
      toast({
        title: "Empty Thought",
        description: "Please enter a thought first!",
        variant: "destructive",
      })
      return
    }

    if (!aiOnline) {
      toast({
        title: "AI Offline",
        description: "The AI service is currently unavailable. Please try again later.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const result = await generateSubtasks(thought)
      
      if (result.success && result.data) {
        const processedSubtasks: ExtendedSubtask[] = result.data.subtasks.map(task => ({
          ...task,
          completed: false
        }))
        
        setSubtasks(processedSubtasks)
        setTaskBreakdownData(result.data)
        
        toast({
          title: "Subtasks Generated!",
          description: `AI created ${result.data.subtasks.length} actionable steps for your thought.`,
        })
      } else {
        throw new Error(result.error || 'Failed to generate subtasks')
      }
    } catch (error) {
      console.error('Failed to generate subtasks:', error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate subtasks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGetRandomThought = async () => {
    if (!aiOnline) {
      toast({
        title: "AI Offline",
        description: "The AI service is currently unavailable. Please try again later.",
        variant: "destructive",
      })
      return
    }

    setIsGettingThought(true)
    
    setSubtasks([])
    setTaskBreakdownData(null)
    
    try {
      const result = await getRandomThoughts()
      
      if (result.success && result.thoughts.length > 0) {
        const randomThought = result.thoughts[Math.floor(Math.random() * result.thoughts.length)]
        setThought(randomThought)
        toast({
          title: "Random Thought Delivered!",
          description: "AI-generated inspiration for your next project.",
        })
      } else {
        throw new Error('No thoughts received from AI')
      }
    } catch (error) {
      console.error('Failed to get random thought:', error)
      
      const fallbackThoughts = [
        "What if we could taste colors?",
        "Why do we say 'after dark' when it's actually after light?",
        "If you replace all the parts of a ship, is it still the same ship?",
        "What if dreams are just loading screens for parallel universes?",
        "Why do we park in driveways and drive on parkways?",
      ]
      const fallbackThought = fallbackThoughts[Math.floor(Math.random() * fallbackThoughts.length)]
      setThought(fallbackThought)
      
      toast({
        title: "Fallback Thought Delivered",
        description: "AI service unavailable, using backup inspiration.",
        variant: "destructive",
      })
    } finally {
      setIsGettingThought(false)
    }
  }

  const toggleSubtask = (id: number) => {
    setSubtasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const handleSavePrompt = () => {
    toast({
      title: "Sign In Required",
      description: "Please sign in or create an account to save your thoughts and subtasks.",
      action: (
        <div className="flex space-x-2">
          <Link href="/signin">
            <WaterButton size="sm" variant="secondary">
              Sign In
            </WaterButton>
          </Link>
        </div>
      ),
    })
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 water-drop bg-gradient-to-br from-blue-400 to-cyan-300 animate-float"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="pixel-font text-3xl md:text-4xl text-blue-800 mb-2">Your Creative Space</h1>
          <p className="text-blue-600">Transform your thoughts into actionable plans</p>
          <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-200">
            <p className="text-blue-700 text-sm">
              💡 Try the app for free! <Link href="/signin" className="font-medium underline hover:text-blue-800">Sign in</Link> or <Link href="/signup" className="font-medium underline hover:text-blue-800">create an account</Link> to save your thoughts.
            </p>
          </div>
        </div>

        <div className="glass-effect rounded-3xl p-8 bubble-shadow mb-8">
          <div className="mb-6">
            <label htmlFor="thought" className="block text-blue-700 font-medium mb-3 pixel-font text-lg">
              What's on your mind?
            </label>
            <Textarea
              id="thought"
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              placeholder="Share your shower thought, random idea, or creative spark..."
              className="min-h-32 text-lg rounded-2xl border-blue-200 focus:border-blue-400 focus:ring-blue-400 resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <WaterButton onClick={handleGenerateSubtasks} isLoading={isGenerating} size="lg" className="flex-1">
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Subtasks
            </WaterButton>

            <WaterButton onClick={handleGetRandomThought} isLoading={isGettingThought} variant="secondary" size="lg" className="flex-1">
              <Lightbulb className="w-5 h-5 mr-2" />
              Get Random Thought
            </WaterButton>
          </div>

          {aiOnline !== null && (
            <div className="mt-4 flex items-center justify-center space-x-2 text-sm">
              {aiOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">AI Service Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-500" />
                  <span className="text-red-600">AI Service Offline</span>
                </>
              )}
            </div>
          )}
        </div>

        {subtasks.length > 0 && (
          <div className="glass-effect rounded-3xl p-8 bubble-shadow mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="pixel-font text-2xl text-blue-800">Generated Subtasks</h2>
                {taskBreakdownData && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {taskBreakdownData.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      taskBreakdownData.priority === 'high' ? 'bg-red-100 text-red-700' :
                      taskBreakdownData.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {taskBreakdownData.priority} priority
                    </span>
                  </div>
                )}
              </div>
              <WaterButton onClick={handleSavePrompt} variant="secondary" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save to Collection
              </WaterButton>
            </div>

            <div className="mb-6 p-4 bg-amber-50/50 rounded-xl border border-amber-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                    <Save className="w-3 h-3 text-amber-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-amber-800 mb-1">Want to save this?</h3>
                  <p className="text-amber-700 text-sm mb-3">
                    Create a free account to save your thoughts and track your progress on subtasks.
                  </p>
                  <div className="flex space-x-2">
                    <Link href="/signup">
                      <WaterButton size="sm" className="text-xs">
                        <UserPlus className="w-3 h-3 mr-1" />
                        Sign Up Free
                      </WaterButton>
                    </Link>
                    <Link href="/signin">
                      <WaterButton size="sm" variant="secondary" className="text-xs">
                        <LogIn className="w-3 h-3 mr-1" />
                        Sign In
                      </WaterButton>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {taskBreakdownData && (
              <div className="mb-6 p-4 bg-blue-50/30 rounded-xl">
                <h3 className="font-medium text-blue-800 mb-2">Main Goal:</h3>
                <p className="text-blue-700">{taskBreakdownData.main_goal}</p>
              </div>
            )}

            <div className="space-y-4">
              {subtasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start space-x-3 p-4 rounded-xl bg-blue-50/50 hover:bg-blue-100/50 transition-colors"
                >
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => toggleSubtask(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`task-${task.id}`}
                      className={`block cursor-pointer font-medium ${
                        task.completed ? "line-through text-blue-500" : "text-blue-800"
                      }`}
                    >
                      {task.title}
                    </label>
                    <p className={`text-sm mt-1 ${
                      task.completed ? "line-through text-blue-400" : "text-blue-600"
                    }`}>
                      {task.description}
                    </p>
                    <div className="flex gap-3 mt-2 text-xs">
                      <span className="flex items-center text-blue-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {task.estimated_time}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        task.difficulty === 'hard' ? 'bg-red-100 text-red-600' :
                        task.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {task.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

        <div className="text-center mt-16">
          <div className="glass-effect rounded-3xl p-8 bubble-shadow">
            <h2 className="pixel-font text-2xl text-blue-800 mb-4">Ready to save your thoughts?</h2>
            <p className="text-blue-600 mb-6">
              Join thousands of creative minds who use Shower Thoughts to turn ideas into action.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <WaterButton size="lg" className="w-full sm:w-auto">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Free Account
                </WaterButton>
              </Link>
              <Link href="/signin">
                <WaterButton size="lg" variant="secondary" className="w-full sm:w-auto">
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </WaterButton>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
