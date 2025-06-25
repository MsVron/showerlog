"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/ui/header"
import { WaterButton } from "@/components/ui/water-button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Lightbulb, Save, Sparkles, Wifi, WifiOff, Clock } from "lucide-react"
import { generateSubtasks, getRandomThoughts, checkAIHealth, type Subtask } from "@/lib/ai-service"

interface ExtendedSubtask extends Subtask {
  completed: boolean;
}

export default function DashboardPage() {
  const [thought, setThought] = useState("")
  const [subtasks, setSubtasks] = useState<ExtendedSubtask[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isGettingThought, setIsGettingThought] = useState(false)
  const [aiOnline, setAiOnline] = useState<boolean | null>(null)
  const [taskBreakdownData, setTaskBreakdownData] = useState<any>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    checkAIStatus()
  }, [])

  const checkAIStatus = async () => {
    try {
      const isOnline = await checkAIHealth()
      setAiOnline(isOnline)
    } catch (error) {
      setAiOnline(false)
    }
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
    
    // Clear previous subtasks and data when getting a new thought
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

  const saveToCollection = async () => {
    if (!thought.trim() || subtasks.length === 0) {
      toast({
        title: "Nothing to Save",
        description: "Generate some subtasks first!",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/thoughts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: thought,
          subtasks: subtasks,
          ai_data: taskBreakdownData,
          is_saved: true,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({
          title: "Saved to Collection!",
          description: "Your thought and AI-generated subtasks have been saved.",
        })
      } else {
        throw new Error(result.error || 'Failed to save')
      }
    } catch (error) {
      console.error('Failed to save thought:', error)
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save to collection. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="pixel-font text-2xl sm:text-3xl md:text-4xl text-blue-800 mb-2">Your Creative Space</h1>
          <p className="text-blue-600 text-sm sm:text-base">Transform your thoughts into actionable plans</p>
        </div>

        <div className="glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 bubble-shadow mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-6">
            <label htmlFor="thought" className="block text-blue-700 font-medium mb-2 sm:mb-3 pixel-font text-base sm:text-lg">
              What's on your mind?
            </label>
            <Textarea
              id="thought"
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              placeholder="Share your shower thought, random idea, or creative spark..."
              className="text-sm sm:text-lg rounded-xl sm:rounded-2xl border-blue-200 focus:border-blue-400 focus:ring-blue-400 resize-none"
              rows={2}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <WaterButton onClick={handleGenerateSubtasks} isLoading={isGenerating} size="lg" className="flex-1 text-sm sm:text-base">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Generate Subtasks
            </WaterButton>

            <WaterButton onClick={handleGetRandomThought} isLoading={isGettingThought} variant="secondary" size="lg" className="flex-1 text-sm sm:text-base">
              <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Get Random Thought
            </WaterButton>
          </div>

          {aiOnline !== null && (
            <div className="mt-3 sm:mt-4 flex items-center justify-center space-x-2 text-xs sm:text-sm">
              {aiOnline ? (
                <>
                  <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  <span className="text-green-600">AI Service Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                  <span className="text-red-600">AI Service Offline</span>
                </>
              )}
            </div>
          )}
        </div>

        {subtasks.length > 0 && (
          <div className="glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 bubble-shadow mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
              <div>
                <h2 className="pixel-font text-xl sm:text-2xl text-blue-800">Generated Subtasks</h2>
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
              <WaterButton onClick={saveToCollection} isLoading={isSaving} variant="secondary" size="sm" className="text-xs sm:text-sm w-full sm:w-auto">
                <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Save to Collection
              </WaterButton>
            </div>

            {taskBreakdownData && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50/30 rounded-xl">
                <h3 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">Main Goal:</h3>
                <p className="text-blue-700 text-sm sm:text-base">{taskBreakdownData.main_goal}</p>
              </div>
            )}

            <div className="space-y-3 sm:space-y-4">
              {subtasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start space-x-3 p-3 sm:p-4 rounded-xl bg-blue-50/50 hover:bg-blue-100/50 transition-colors"
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
                      className={`block cursor-pointer font-medium text-sm sm:text-base ${
                        task.completed ? "line-through text-blue-500" : "text-blue-800"
                      }`}
                    >
                      {task.title}
                    </label>
                    <p className={`text-xs sm:text-sm mt-1 ${
                      task.completed ? "line-through text-blue-400" : "text-blue-600"
                    }`}>
                      {task.description}
                    </p>
                    <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 text-xs">
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

        <div className="text-center">
          <Link href="/saved">
            <WaterButton variant="ghost" size="lg" className="text-sm sm:text-base">
              View My Saved Thoughts →
            </WaterButton>
          </Link>
        </div>
      </main>
    </div>
  )
}
