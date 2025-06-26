"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/ui/header"
import { WaterButton } from "@/components/ui/water-button"
import { Textarea } from "@/components/ui/textarea"
import { NestedSubtaskComponent } from "@/components/ui/nested-subtask"
import { useToast } from "@/hooks/use-toast"
import { Lightbulb, Save, Sparkles, Wifi, WifiOff, Clock, LogIn, UserPlus, AlertTriangle, BarChart3, Layers } from "lucide-react"
import { generateSmartBreakdown, getRandomThoughts, checkAIHealth, type Subtask, calculateTaskProgress, getTotalEstimatedTime } from "@/lib/ai-service"

interface ExtendedSubtask extends Subtask {
  completed: boolean;
}

export default function HomePage() {
  const router = useRouter()
  const { toast } = useToast()
  const subtasksRef = useRef<HTMLDivElement>(null)

  const [thought, setThought] = useState("")
  const [subtasks, setSubtasks] = useState<ExtendedSubtask[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGettingThought, setIsGettingThought] = useState(false)
  const [aiOnline, setAiOnline] = useState<boolean | null>(null)
  const [taskBreakdownData, setTaskBreakdownData] = useState<{ 
    subtasks: Subtask[]; 
    priority: string; 
    main_goal: string; 
    category: string;
    project_type?: string;
    complexity_score?: number;
    total_estimated_hours?: number;
  } | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [showThoughtTip, setShowThoughtTip] = useState(false)
  const [projectComplexity, setProjectComplexity] = useState<'simple' | 'moderate' | 'complex' | 'enterprise'>('moderate')

  const checkAuthAndAI = useCallback(async () => {
    try {
      const authResponse = await fetch('/api/auth/check', {
        credentials: 'include'
      })
      
      if (authResponse.ok) {
        const authData = await authResponse.json()
        if (authData.authenticated) {
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
    } catch {
      setAiOnline(false)
    }

    setIsCheckingAuth(false)
  }, [router])

  useEffect(() => {
    checkAuthAndAI()
  }, [checkAuthAndAI])

  const isThoughtTooShort = (text: string) => {
    const trimmed = text.trim()
    return trimmed.length < 15 || trimmed.split(' ').length < 3
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

    if (isThoughtTooShort(thought)) {
      setShowThoughtTip(true)
      return
    }

    setShowThoughtTip(false)

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
      // Detect project type from thought content with comprehensive context mapping
      const thoughtLower = thought.toLowerCase()
      let projectType = 'general'
      
      // Technology & Development
      if (thoughtLower.includes('app') || thoughtLower.includes('software') || thoughtLower.includes('website') || thoughtLower.includes('code') || thoughtLower.includes('programming')) {
        projectType = 'software'
      } else if (thoughtLower.includes('web') || thoughtLower.includes('frontend') || thoughtLower.includes('backend') || thoughtLower.includes('responsive')) {
        projectType = 'web'
      } else if (thoughtLower.includes('mobile') || thoughtLower.includes('ios') || thoughtLower.includes('android') || thoughtLower.includes('react native') || thoughtLower.includes('flutter')) {
        projectType = 'mobile'
      } else if (thoughtLower.includes('ai') || thoughtLower.includes('machine learning') || thoughtLower.includes('neural network') || thoughtLower.includes('data science')) {
        projectType = 'ai'
      
      // Business & Finance
      } else if (thoughtLower.includes('business') || thoughtLower.includes('company') || thoughtLower.includes('enterprise')) {
        projectType = 'business'
      } else if (thoughtLower.includes('startup') || thoughtLower.includes('mvp') || thoughtLower.includes('fundraising') || thoughtLower.includes('pitch')) {
        projectType = 'startup'
      } else if (thoughtLower.includes('finance') || thoughtLower.includes('budget') || thoughtLower.includes('investment') || thoughtLower.includes('money')) {
        projectType = 'finance'
      } else if (thoughtLower.includes('marketing') || thoughtLower.includes('seo') || thoughtLower.includes('social media') || thoughtLower.includes('campaign')) {
        projectType = 'marketing'
      
      // Creative & Arts
      } else if (thoughtLower.includes('art') || thoughtLower.includes('painting') || thoughtLower.includes('drawing') || thoughtLower.includes('sculpture')) {
        projectType = 'art'
      } else if (thoughtLower.includes('music') || thoughtLower.includes('song') || thoughtLower.includes('album') || thoughtLower.includes('recording')) {
        projectType = 'music'
      } else if (thoughtLower.includes('photo') || thoughtLower.includes('camera') || thoughtLower.includes('portrait') || thoughtLower.includes('wedding')) {
        projectType = 'photography'
      } else if (thoughtLower.includes('video') || thoughtLower.includes('film') || thoughtLower.includes('documentary') || thoughtLower.includes('editing')) {
        projectType = 'videography'
      } else if (thoughtLower.includes('design') || thoughtLower.includes('graphic') || thoughtLower.includes('ui') || thoughtLower.includes('ux') || thoughtLower.includes('brand')) {
        projectType = 'design'
      } else if (thoughtLower.includes('creative') || thoughtLower.includes('artistic')) {
        projectType = 'creative'
      
      // Health & Wellness
      } else if (thoughtLower.includes('fitness') || thoughtLower.includes('workout') || thoughtLower.includes('exercise') || thoughtLower.includes('gym')) {
        projectType = 'fitness'
      } else if (thoughtLower.includes('nutrition') || thoughtLower.includes('diet') || thoughtLower.includes('meal') || thoughtLower.includes('healthy eating')) {
        projectType = 'nutrition'
      } else if (thoughtLower.includes('beauty') || thoughtLower.includes('skincare') || thoughtLower.includes('makeup') || thoughtLower.includes('cosmetic')) {
        projectType = 'beauty'
      } else if (thoughtLower.includes('mental health') || thoughtLower.includes('therapy') || thoughtLower.includes('meditation') || thoughtLower.includes('mindfulness')) {
        projectType = 'mental_health'
      } else if (thoughtLower.includes('wellness') || thoughtLower.includes('wellbeing') || thoughtLower.includes('self-care')) {
        projectType = 'wellness'
      
      // Education & Learning
      } else if (thoughtLower.includes('learn') || thoughtLower.includes('study') || thoughtLower.includes('course') || thoughtLower.includes('education')) {
        projectType = 'learning'
      } else if (thoughtLower.includes('teach') || thoughtLower.includes('curriculum') || thoughtLower.includes('lesson') || thoughtLower.includes('instructor')) {
        projectType = 'teaching'
      } else if (thoughtLower.includes('language') || thoughtLower.includes('spanish') || thoughtLower.includes('french') || thoughtLower.includes('mandarin')) {
        projectType = 'language'
      } else if (thoughtLower.includes('research') || thoughtLower.includes('academic') || thoughtLower.includes('thesis') || thoughtLower.includes('study')) {
        projectType = 'research'
      
      // Sports & Recreation
      } else if (thoughtLower.includes('sport') || thoughtLower.includes('athletic') || thoughtLower.includes('training') || thoughtLower.includes('competition')) {
        projectType = 'sports'
      } else if (thoughtLower.includes('dance') || thoughtLower.includes('dancing') || thoughtLower.includes('choreography') || thoughtLower.includes('ballet')) {
        projectType = 'dancing'
      } else if (thoughtLower.includes('outdoor') || thoughtLower.includes('hiking') || thoughtLower.includes('camping') || thoughtLower.includes('adventure')) {
        projectType = 'outdoor'
      } else if (thoughtLower.includes('travel') || thoughtLower.includes('trip') || thoughtLower.includes('vacation') || thoughtLower.includes('tourism')) {
        projectType = 'travel'
      
      // Personal Development & Relationships
      } else if (thoughtLower.includes('relationship') || thoughtLower.includes('dating') || thoughtLower.includes('marriage') || thoughtLower.includes('family')) {
        projectType = 'relationships'
      } else if (thoughtLower.includes('personal development') || thoughtLower.includes('self-improvement') || thoughtLower.includes('goal') || thoughtLower.includes('habit')) {
        projectType = 'personal'
      } else if (thoughtLower.includes('parent') || thoughtLower.includes('child') || thoughtLower.includes('family') || thoughtLower.includes('kids')) {
        projectType = 'parenting'
      
      // Home & Lifestyle
      } else if (thoughtLower.includes('cook') || thoughtLower.includes('recipe') || thoughtLower.includes('baking') || thoughtLower.includes('culinary')) {
        projectType = 'cooking'
      } else if (thoughtLower.includes('garden') || thoughtLower.includes('plant') || thoughtLower.includes('grow') || thoughtLower.includes('organic')) {
        projectType = 'gardening'
      } else if (thoughtLower.includes('home') || thoughtLower.includes('house') || thoughtLower.includes('interior') || thoughtLower.includes('renovation')) {
        projectType = 'home'
      } else if (thoughtLower.includes('diy') || thoughtLower.includes('craft') || thoughtLower.includes('handmade') || thoughtLower.includes('woodworking')) {
        projectType = 'diy'
      
      // Career & Professional
      } else if (thoughtLower.includes('career') || thoughtLower.includes('professional') || thoughtLower.includes('job') || thoughtLower.includes('work')) {
        projectType = 'career'
      } else if (thoughtLower.includes('resume') || thoughtLower.includes('interview') || thoughtLower.includes('job hunting') || thoughtLower.includes('job search')) {
        projectType = 'job_hunting'
      } else if (thoughtLower.includes('freelance') || thoughtLower.includes('consultant') || thoughtLower.includes('independent')) {
        projectType = 'freelancing'
      
      // Science & Environment
      } else if (thoughtLower.includes('science') || thoughtLower.includes('research') || thoughtLower.includes('experiment') || thoughtLower.includes('laboratory')) {
        projectType = 'science'
      } else if (thoughtLower.includes('environment') || thoughtLower.includes('sustainability') || thoughtLower.includes('eco') || thoughtLower.includes('green')) {
        projectType = 'environment'
      
      // Other Categories
      } else if (thoughtLower.includes('volunteer') || thoughtLower.includes('community service') || thoughtLower.includes('charity')) {
        projectType = 'volunteer'
      } else if (thoughtLower.includes('hobby') || thoughtLower.includes('personal interest') || thoughtLower.includes('recreational')) {
        projectType = 'hobby'
      }

      console.log('=== CALLING generateSmartBreakdown ===');
      console.log('thought:', thought);
      console.log('thought length:', thought.length);
      console.log('thought trimmed:', thought.trim());
      console.log('projectType:', projectType);
      console.log('projectComplexity:', projectComplexity);
      
      const result = await generateSmartBreakdown(thought, projectType, projectComplexity)
      
      if (result.success && result.data) {
        const processedSubtasks: ExtendedSubtask[] = result.data.subtasks.map((task, index) => ({
          ...task,
          completed: false,
          expanded: false,
          canBreakdown: task.difficulty !== 'easy' && (
            task.estimated_time.includes('hour') && parseInt(task.estimated_time) > 2 ||
            task.estimated_time.includes('day') ||
            task.estimated_time.includes('week')
          ),
          depth: 0
        }))
        
        setSubtasks(processedSubtasks)
        setTaskBreakdownData(result.data)
        
        const totalHours = getTotalEstimatedTime(processedSubtasks)
        
        toast({
          title: "🚀 Advanced Task Breakdown Complete!",
          description: `Mistral 7B generated ${result.data.subtasks.length} intelligent subtasks. Estimated: ${totalHours}h total.`,
        })

        setTimeout(() => {
          subtasksRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          })
        }, 100)
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
    setShowThoughtTip(false)
    
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
        "Why do we say &apos;after dark&apos; when it&apos;s actually after light?",
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
    const updateTaskRecursively = (tasks: ExtendedSubtask[], targetId: number): ExtendedSubtask[] => {
      return tasks.map(task => {
        if (task.id === targetId) {
          return { ...task, completed: !task.completed }
        }
        if (task.subtasks) {
          return {
            ...task,
            subtasks: updateTaskRecursively(task.subtasks as ExtendedSubtask[], targetId)
          }
        }
        return task
      })
    }

    setSubtasks(prev => updateTaskRecursively(prev, id))
  }

  const updateTask = (taskId: number, updates: Partial<ExtendedSubtask>) => {
    const updateTaskRecursively = (tasks: ExtendedSubtask[], targetId: number): ExtendedSubtask[] => {
      return tasks.map(task => {
        if (task.id === targetId) {
          return { ...task, ...updates }
        }
        if (task.subtasks) {
          return {
            ...task,
            subtasks: updateTaskRecursively(task.subtasks as ExtendedSubtask[], targetId)
          }
        }
        return task
      })
    }

    setSubtasks(prev => updateTaskRecursively(prev, taskId))
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
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-16 h-16 water-drop bg-gradient-to-br from-blue-400 to-cyan-300 animate-float"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="pixel-font text-2xl sm:text-3xl md:text-4xl text-blue-800 mb-2">Your Creative Space</h1>
          <p className="text-blue-600 text-sm sm:text-base">Transform your thoughts into actionable plans</p>
          <div className="mt-4 p-3 sm:p-4 bg-blue-50/50 rounded-xl border border-blue-200">
            <p className="text-blue-700 text-xs sm:text-sm">
              💡 Try the app for free! <Link href="/signin" className="font-medium underline hover:text-blue-800">Sign in</Link> or <Link href="/signup" className="font-medium underline hover:text-blue-800">create an account</Link> to save your thoughts.
            </p>
          </div>
        </div>

        <div className="glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 bubble-shadow mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-6">
            <label htmlFor="thought" className="block text-blue-700 font-medium mb-2 sm:mb-3 pixel-font text-base sm:text-lg">
                              What&apos;s on your mind?
            </label>
            <Textarea
              id="thought"
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              placeholder="Share your shower thought, random idea, or creative spark..."
              className={`text-sm sm:text-lg rounded-xl sm:rounded-2xl border-blue-200 focus:border-blue-400 focus:ring-blue-400 resize-none transition-all duration-200 ${
                showThoughtTip ? 'border-amber-300 focus:border-amber-400 focus:ring-amber-400' : ''
              }`}
              rows={2}
            />
                          {showThoughtTip && (
                <div className="fixed top-4 left-4 right-4 z-50 p-3 bg-amber-50/95 backdrop-blur-sm rounded-lg border border-amber-200 shadow-lg sm:relative sm:top-auto sm:left-auto sm:right-auto sm:mt-3 sm:bg-amber-50/80 sm:backdrop-blur-none sm:shadow-none">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-amber-800 text-sm font-medium">Help me understand your idea better!</p>
                      <p className="text-amber-700 text-xs mt-1">
                        Try adding more details like what you want to achieve, why it matters, or what inspired this thought.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowThoughtTip(false)}
                      className="sm:hidden text-amber-600 hover:text-amber-800 transition-colors"
                      aria-label="Close tip"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
          
            {/* Project Complexity Selector */}
            <div className="mt-3 sm:mt-4">
              <label className="block text-blue-600 font-medium mb-2 text-sm">
                <Layers className="w-4 h-4 inline mr-2" />
                Project Complexity
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'simple', label: 'Simple', desc: 'Quick projects, 1-5 hours', color: 'green' },
                  { value: 'moderate', label: 'Moderate', desc: 'Medium projects, 1-2 weeks', color: 'yellow' },
                  { value: 'complex', label: 'Complex', desc: 'Large projects, 1-3 months', color: 'orange' },
                  { value: 'enterprise', label: 'Enterprise', desc: 'Major initiatives, 3+ months', color: 'red' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setProjectComplexity(option.value as any)}
                    className={`px-3 py-2 rounded-xl text-xs sm:text-sm border transition-all duration-300 pixel-font relative overflow-hidden group ${
                      projectComplexity === option.value
                        ? option.color === 'green' 
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800 shadow-emerald-200/50' 
                          : option.color === 'yellow'
                          ? 'bg-amber-100 border-amber-300 text-amber-800 shadow-amber-200/50'
                          : option.color === 'orange'
                          ? 'bg-orange-100 border-orange-300 text-orange-800 shadow-orange-200/50'
                          : 'bg-red-100 border-red-300 text-red-800 shadow-red-200/50'
                        : option.color === 'green'
                        ? 'glass-effect border-emerald-200 text-emerald-700 hover:bg-emerald-50/80'
                        : option.color === 'yellow'
                        ? 'glass-effect border-amber-200 text-amber-700 hover:bg-amber-50/80'
                        : option.color === 'orange'
                        ? 'glass-effect border-orange-200 text-orange-700 hover:bg-orange-50/80'
                        : 'glass-effect border-red-200 text-red-700 hover:bg-red-50/80'
                    } ${projectComplexity === option.value ? 'bubble-shadow' : 'hover:bubble-shadow'}`}
                    title={option.desc}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        option.color === 'green' ? 'bg-emerald-500' :
                        option.color === 'yellow' ? 'bg-amber-500' :
                        option.color === 'orange' ? 'bg-orange-500' :
                        'bg-red-500'
                      } ${projectComplexity === option.value ? 'animate-pulse' : ''}`}></div>
                      <span>{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <WaterButton 
              onClick={handleGenerateSubtasks} 
              isLoading={isGenerating} 
              size="lg" 
              className="flex-1 text-sm sm:text-base"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Generate Subtasks
            </WaterButton>

            <WaterButton 
              onClick={handleGetRandomThought} 
              isLoading={isGettingThought} 
              variant="secondary" 
              size="lg" 
              className="flex-1 text-sm sm:text-base"
            >
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
          <div ref={subtasksRef} className="glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 bubble-shadow mb-6 sm:mb-8">
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
              <WaterButton onClick={handleSavePrompt} variant="secondary" size="sm" className="text-xs sm:text-sm">
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

            {/* Nested Subtask Display */}
            <div className="space-y-3 sm:space-y-4">
              {subtasks.map((task) => (
                <NestedSubtaskComponent
                  key={task.id}
                  task={task}
                  depth={0}
                  maxDepth={4}
                  onTaskUpdate={updateTask}
                  onToggleComplete={toggleSubtask}
                  parentContext={taskBreakdownData?.main_goal || ''}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 sm:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-2xl flex items-center justify-center">
              <span className="text-xl sm:text-2xl">💭</span>
            </div>
            <h3 className="pixel-font text-base sm:text-lg text-blue-800 mb-2">Capture Thoughts</h3>
            <p className="text-blue-600 text-xs sm:text-sm">Quickly jot down those fleeting moments of inspiration</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-2xl flex items-center justify-center">
              <span className="text-xl sm:text-2xl">⚡</span>
            </div>
            <h3 className="pixel-font text-base sm:text-lg text-blue-800 mb-2">Generate Tasks</h3>
            <p className="text-blue-600 text-xs sm:text-sm">Transform abstract ideas into concrete, actionable steps</p>
          </div>

          <div className="text-center sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-2xl flex items-center justify-center">
              <span className="text-xl sm:text-2xl">💾</span>
            </div>
            <h3 className="pixel-font text-base sm:text-lg text-blue-800 mb-2">Save & Organize</h3>
            <p className="text-blue-600 text-xs sm:text-sm">Keep your best thoughts and track your progress</p>
          </div>
        </div>

        <div className="text-center mt-12 sm:mt-16">
          <div className="glass-effect rounded-2xl sm:rounded-3xl p-6 sm:p-8 bubble-shadow">
            <h2 className="pixel-font text-xl sm:text-2xl text-blue-800 mb-3 sm:mb-4">Ready to save your thoughts?</h2>
            <p className="text-blue-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Join thousands of creative minds who use ShowerLog to turn ideas into action.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/signup">
                <WaterButton size="lg" className="w-full sm:w-auto text-sm sm:text-base">
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Create Free Account
                </WaterButton>
              </Link>
              <Link href="/signin">
                <WaterButton size="lg" variant="secondary" className="w-full sm:w-auto text-sm sm:text-base">
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
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
