"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/ui/header"
import { WaterButton } from "@/components/ui/water-button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Lightbulb, Save, Sparkles } from "lucide-react"

export default function DashboardPage() {
  const [thought, setThought] = useState("")
  const [subtasks, setSubtasks] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const generateSubtasks = async () => {
    if (!thought.trim()) {
      toast({
        title: "Empty Thought",
        description: "Please enter a thought first!",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    // Simulate API call to generate subtasks
    setTimeout(() => {
      const mockSubtasks = [
        { id: 1, text: `Research more about: ${thought.slice(0, 30)}...`, completed: false },
        { id: 2, text: "Break down into smaller actionable steps", completed: false },
        { id: 3, text: "Set a timeline for implementation", completed: false },
        { id: 4, text: "Identify required resources", completed: false },
        { id: 5, text: "Create a plan of action", completed: false },
      ]
      setSubtasks(mockSubtasks)
      setIsGenerating(false)
      toast({
        title: "Subtasks Generated! ✨",
        description: "Your thought has been broken down into actionable steps.",
      })
    }, 2000)
  }

  const getRandomThought = () => {
    const randomThoughts = [
      "What if we could taste colors?",
      "Why do we say 'after dark' when it's actually after light?",
      "If you replace all the parts of a ship, is it still the same ship?",
      "What if dreams are just loading screens for parallel universes?",
      "Why do we park in driveways and drive on parkways?",
      "What if plants are actually farming us, giving us oxygen until we decompose?",
      "If you're waiting for the waiter, aren't you the waiter?",
      "What if the hokey pokey really is what it's all about?",
    ]
    const randomThought = randomThoughts[Math.floor(Math.random() * randomThoughts.length)]
    setThought(randomThought)
    toast({
      title: "Random Thought Delivered! 💭",
      description: "Sometimes inspiration comes from unexpected places.",
    })
  }

  const toggleSubtask = (id) => {
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
    // Simulate API call to save
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Saved to Collection! 💾",
        description: "Your thought and subtasks have been saved.",
      })
    }, 1000)
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="pixel-font text-3xl md:text-4xl text-blue-800 mb-2">Your Creative Space</h1>
          <p className="text-blue-600">Transform your thoughts into actionable plans</p>
        </div>

        {/* Main Input */}
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
            <WaterButton onClick={generateSubtasks} isLoading={isGenerating} size="lg" className="flex-1">
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Subtasks
            </WaterButton>

            <WaterButton onClick={getRandomThought} variant="secondary" size="lg" className="flex-1">
              <Lightbulb className="w-5 h-5 mr-2" />
              Get Random Thought
            </WaterButton>
          </div>
        </div>

        {/* Generated Subtasks */}
        {subtasks.length > 0 && (
          <div className="glass-effect rounded-3xl p-8 bubble-shadow mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="pixel-font text-2xl text-blue-800">Generated Subtasks</h2>
              <WaterButton onClick={saveToCollection} isLoading={isSaving} variant="secondary" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save to Collection
              </WaterButton>
            </div>

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
                  <label
                    htmlFor={`task-${task.id}`}
                    className={`flex-1 cursor-pointer ${
                      task.completed ? "line-through text-blue-500" : "text-blue-800"
                    }`}
                  >
                    {task.text}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="text-center">
          <Link href="/saved">
            <WaterButton variant="ghost" size="lg">
              View My Saved Thoughts →
            </WaterButton>
          </Link>
        </div>
      </main>
    </div>
  )
}
