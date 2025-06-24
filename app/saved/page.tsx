"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/ui/header"
import { WaterButton } from "@/components/ui/water-button"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Edit, ArrowLeft } from "lucide-react"

export default function SavedThoughtsPage() {
  const [savedThoughts, setSavedThoughts] = useState([])
  const [isLoading, setIsLoading] = useState(false) // Changed to false
  const { toast } = useToast()

  useEffect(() => {
    // Load data immediately without delay
    const mockSavedThoughts = [
      {
        id: 1,
        thought: "What if we could taste colors?",
        createdAt: "2024-01-15",
        subtasks: [
          { id: 1, text: "Research synesthesia and color-taste associations", completed: true },
          { id: 2, text: "Explore virtual reality applications", completed: false },
          { id: 3, text: "Design a prototype experience", completed: false },
        ],
      },
      {
        id: 2,
        thought: "Why do we park in driveways and drive on parkways?",
        createdAt: "2024-01-14",
        subtasks: [
          { id: 4, text: "Research etymology of 'driveway' and 'parkway'", completed: true },
          { id: 5, text: "Write a blog post about language quirks", completed: true },
          { id: 6, text: "Share findings on social media", completed: false },
        ],
      },
      {
        id: 3,
        thought: "What if plants are actually farming us?",
        createdAt: "2024-01-13",
        subtasks: [
          { id: 7, text: "Study plant-human symbiotic relationships", completed: false },
          { id: 8, text: "Write a short story based on this concept", completed: false },
          { id: 9, text: "Research oxygen production and consumption cycles", completed: true },
        ],
      },
    ]
    setSavedThoughts(mockSavedThoughts)
  }, [])

  const deleteThought = (thoughtId) => {
    setSavedThoughts((prev) => prev.filter((thought) => thought.id !== thoughtId))
    toast({
      title: "Thought Deleted",
      description: "The thought has been removed from your collection.",
    })
  }

  const toggleSubtask = (thoughtId, subtaskId) => {
    setSavedThoughts((prev) =>
      prev.map((thought) =>
        thought.id === thoughtId
          ? {
              ...thought,
              subtasks: thought.subtasks.map((subtask) =>
                subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask,
              ),
            }
          : thought,
      ),
    )
  }

  // Remove the loading condition entirely
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="pixel-font text-3xl md:text-4xl text-blue-800 mb-2">My Saved Thoughts</h1>
            <p className="text-blue-600">Your collection of creative ideas and their action plans</p>
          </div>

          <Link href="/dashboard">
            <WaterButton variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </WaterButton>
          </Link>
        </div>

        {savedThoughts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 water-drop bg-gradient-to-br from-blue-300 to-cyan-300 opacity-50"></div>
            <h2 className="pixel-font text-2xl text-blue-700 mb-4">No Saved Thoughts Yet</h2>
            <p className="text-blue-600 mb-8">Start creating and saving your thoughts to see them here!</p>
            <Link href="/dashboard">
              <WaterButton>Create Your First Thought</WaterButton>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {savedThoughts.map((savedThought) => (
              <div key={savedThought.id} className="glass-effect rounded-3xl p-8 bubble-shadow">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h2 className="pixel-font text-xl text-blue-800 mb-2">{savedThought.thought}</h2>
                    <p className="text-sm text-blue-500">
                      Saved on {new Date(savedThought.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <WaterButton variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </WaterButton>
                    <WaterButton
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteThought(savedThought.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </WaterButton>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-blue-700 mb-3">Action Items:</h3>
                  {savedThought.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-start space-x-3 p-3 rounded-xl bg-blue-50/50 hover:bg-blue-100/50 transition-colors"
                    >
                      <Checkbox
                        id={`saved-task-${subtask.id}`}
                        checked={subtask.completed}
                        onCheckedChange={() => toggleSubtask(savedThought.id, subtask.id)}
                        className="mt-1"
                      />
                      <label
                        htmlFor={`saved-task-${subtask.id}`}
                        className={`flex-1 cursor-pointer ${
                          subtask.completed ? "line-through text-blue-500" : "text-blue-800"
                        }`}
                      >
                        {subtask.text}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-blue-100">
                  <div className="flex justify-between items-center text-sm text-blue-600">
                    <span>
                      {savedThought.subtasks.filter((task) => task.completed).length} of {savedThought.subtasks.length}{" "}
                      completed
                    </span>
                    <div className="w-24 bg-blue-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(savedThought.subtasks.filter((task) => task.completed).length / savedThought.subtasks.length) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
