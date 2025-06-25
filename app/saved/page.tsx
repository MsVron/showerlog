"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/ui/header"
import { WaterButton } from "@/components/ui/water-button"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Edit, ArrowLeft, Clock } from "lucide-react"

interface SavedSubtask {
  id: number;
  title: string;
  description: string;
  estimated_time: string;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
}

interface SavedThought {
  id: string;
  content: string;
  subtasks: SavedSubtask[];
  ai_data?: {
    main_goal: string;
    category: string;
    priority: 'high' | 'medium' | 'low';
  };
  created_at: string;
  saved_at: string;
}

export default function SavedThoughtsPage() {
  const [savedThoughts, setSavedThoughts] = useState<SavedThought[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchSavedThoughts()
  }, [])

  const fetchSavedThoughts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/saved-thoughts')
      
      if (!response.ok) {
        throw new Error('Failed to fetch saved thoughts')
      }
      
      const result = await response.json()
      
      if (result.success) {
        setSavedThoughts(result.thoughts)
      } else {
        throw new Error(result.error || 'Failed to load saved thoughts')
      }
    } catch (error) {
      console.error('Error fetching saved thoughts:', error)
      toast({
        title: "Loading Failed",
        description: "Failed to load your saved thoughts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteThought = async (thoughtId: string) => {
    try {
      const response = await fetch(`/api/thoughts/${thoughtId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSavedThoughts((prev) => prev.filter((thought) => thought.id !== thoughtId))
        toast({
          title: "Thought Deleted",
          description: "The thought has been removed from your collection.",
        })
      } else {
        throw new Error('Failed to delete thought')
      }
    } catch (error) {
      console.error('Error deleting thought:', error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete the thought. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleSubtask = async (thoughtId: string, subtaskId: number) => {
    // Optimistically update UI
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

    try {
      const response = await fetch(`/api/thoughts/${thoughtId}/subtasks/${subtaskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !savedThoughts.find(t => t.id === thoughtId)?.subtasks.find(s => s.id === subtaskId)?.completed
        }),
      })

      if (!response.ok) {
        // Revert optimistic update on failure
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
        
        throw new Error('Failed to update subtask')
      }
    } catch (error) {
      console.error('Error updating subtask:', error)
      toast({
        title: "Update Failed",
        description: "Failed to update subtask. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl">
          <div className="text-center py-12 sm:py-20">
            <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-blue-600 text-sm sm:text-base">Loading your saved thoughts...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="pixel-font text-2xl sm:text-3xl md:text-4xl text-blue-800 mb-2">My Saved Thoughts</h1>
            <p className="text-blue-600 text-sm sm:text-base">Your collection of creative ideas and their action plans</p>
          </div>

          <Link href="/dashboard">
            <WaterButton variant="ghost" size="sm" className="text-xs sm:text-sm w-full sm:w-auto">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Back to Dashboard
            </WaterButton>
          </Link>
        </div>

        {savedThoughts.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 water-drop bg-gradient-to-br from-blue-300 to-cyan-300 opacity-50"></div>
            <h2 className="pixel-font text-xl sm:text-2xl text-blue-700 mb-3 sm:mb-4">No Saved Thoughts Yet</h2>
            <p className="text-blue-600 mb-6 sm:mb-8 text-sm sm:text-base">Start creating and saving your thoughts to see them here!</p>
            <Link href="/dashboard">
              <WaterButton className="text-sm sm:text-base">Create Your First Thought</WaterButton>
            </Link>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {savedThoughts.map((savedThought) => (
              <div key={savedThought.id} className="glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 bubble-shadow">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6 gap-3">
                  <div className="flex-1">
                    <h2 className="pixel-font text-lg sm:text-xl text-blue-800 mb-2">{savedThought.content}</h2>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <p className="text-xs sm:text-sm text-blue-500">
                        Saved on {new Date(savedThought.saved_at || savedThought.created_at).toLocaleDateString()}
                      </p>
                      {savedThought.ai_data && (
                        <>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {savedThought.ai_data.category}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            savedThought.ai_data.priority === 'high' ? 'bg-red-100 text-red-700' :
                            savedThought.ai_data.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {savedThought.ai_data.priority} priority
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 sm:ml-4">
                    <WaterButton variant="ghost" size="sm" className="text-xs sm:text-sm">
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                    </WaterButton>
                    <WaterButton
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteThought(savedThought.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </WaterButton>
                  </div>
                </div>

                {savedThought.ai_data && (
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50/30 rounded-xl">
                    <h3 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">Main Goal:</h3>
                    <p className="text-blue-700 text-sm sm:text-base">{savedThought.ai_data.main_goal}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="font-medium text-blue-700 mb-3 text-sm sm:text-base">Action Items:</h3>
                  {savedThought.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-start space-x-3 p-3 sm:p-4 rounded-xl bg-blue-50/50 hover:bg-blue-100/50 transition-colors"
                    >
                      <Checkbox
                        id={`saved-task-${subtask.id}`}
                        checked={subtask.completed}
                        onCheckedChange={() => toggleSubtask(savedThought.id, subtask.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={`saved-task-${subtask.id}`}
                          className={`block cursor-pointer font-medium text-sm sm:text-base ${
                            subtask.completed ? "line-through text-blue-500" : "text-blue-800"
                          }`}
                        >
                          {subtask.title}
                        </label>
                        <p className={`text-xs sm:text-sm mt-1 ${
                          subtask.completed ? "line-through text-blue-400" : "text-blue-600"
                        }`}>
                          {subtask.description}
                        </p>
                        <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 text-xs">
                          <span className="flex items-center text-blue-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {subtask.estimated_time}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            subtask.difficulty === 'hard' ? 'bg-red-100 text-red-600' :
                            subtask.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {subtask.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-blue-100">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs sm:text-sm text-blue-600">
                    <span>
                      {savedThought.subtasks.filter((task) => task.completed).length} of {savedThought.subtasks.length}{" "}
                      completed
                    </span>
                    <div className="w-full sm:w-24 bg-blue-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${savedThought.subtasks.length > 0 ? (savedThought.subtasks.filter((task) => task.completed).length / savedThought.subtasks.length) * 100 : 0}%`,
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
