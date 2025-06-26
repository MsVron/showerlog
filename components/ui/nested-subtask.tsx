"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { WaterButton } from "@/components/ui/water-button"
import { useToast } from "@/hooks/use-toast"
import { 
  Clock, 
  ChevronDown, 
  ChevronRight, 
  Sparkles, 
  Loader2,
  BarChart3,
  Layers,
  Target
} from "lucide-react"
import { 
  type Subtask, 
  type NestedSubtask, 
  generateNestedSubtasks,
  calculateTaskProgress
} from "@/lib/ai-service"

interface NestedSubtaskProps {
  task: Subtask | NestedSubtask
  depth?: number
  maxDepth?: number
  onTaskUpdate: (taskId: number, updates: Partial<Subtask | NestedSubtask>) => void
  onToggleComplete: (taskId: number) => void
  parentContext?: string
}

export const NestedSubtaskComponent = ({ 
  task, 
  depth = 0, 
  maxDepth = 4,
  onTaskUpdate, 
  onToggleComplete,
  parentContext = ""
}: NestedSubtaskProps) => {
  const { toast } = useToast()
  const [isExpanded, setIsExpanded] = useState(task.expanded || false)
  const [isBreakingDown, setIsBreakingDown] = useState(false)

  const indentLevel = Math.min(depth, 3)
  const indentClass = {
    0: "ml-0",
    1: "ml-2 sm:ml-4",
    2: "ml-4 sm:ml-8", 
    3: "ml-6 sm:ml-12"
  }[indentLevel] || "ml-6 sm:ml-12"

  const progressPercentage = calculateTaskProgress(task)
  const hasSubtasks = task.subtasks && task.subtasks.length > 0
  const canBreakdown = depth < maxDepth && task.difficulty !== 'easy' && 
                      (task.estimated_time.includes('hour') && parseInt(task.estimated_time) > 1 ||
                       task.estimated_time.includes('day') ||
                       task.estimated_time.includes('week'))

  const handleBreakdownTask = async () => {
    if (isBreakingDown || depth >= maxDepth) return

    setIsBreakingDown(true)
    
    try {
      const result = await generateNestedSubtasks(
        task, 
        `${parentContext} > ${task.title}`,
        depth + 1
      )
      
      if (result.success && result.subtasks.length > 0) {
        const enhancedSubtasks = result.subtasks.map((subtask, index) => ({
          ...subtask,
          id: Date.now() + index,
          parentId: task.id,
          depth: depth + 1,
          completed: false,
          canBreakdown: subtask.difficulty !== 'easy' && depth + 1 < maxDepth
        }))

        onTaskUpdate(task.id, {
          subtasks: enhancedSubtasks,
          expanded: true,
          canBreakdown: false
        })
        
        setIsExpanded(true)
        
        toast({
          title: "Task Breakdown Complete!",
          description: `Generated ${result.subtasks.length} detailed subtasks with AI precision.`,
        })
      } else {
        throw new Error(result.error || 'Failed to breakdown task')
      }
    } catch (error) {
      console.error('Breakdown error:', error)
      toast({
        title: "Breakdown Failed",
        description: error instanceof Error ? error.message : "Failed to break down task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsBreakingDown(false)
    }
  }

  const handleToggleExpanded = () => {
    if (hasSubtasks) {
      const newExpanded = !isExpanded
      setIsExpanded(newExpanded)
      onTaskUpdate(task.id, { expanded: newExpanded })
    }
  }

  const getDepthColor = (depth: number) => {
    const colors = [
      "bg-blue-50/50 border-blue-200/30",
      "bg-purple-50/50 border-purple-200/30", 
      "bg-green-50/50 border-green-200/30",
      "bg-orange-50/50 border-orange-200/30",
      "bg-pink-50/50 border-pink-200/30"
    ]
    return colors[depth % colors.length]
  }

  const getDepthAccent = (depth: number) => {
    const accents = [
      "border-l-blue-400",
      "border-l-purple-400",
      "border-l-green-400", 
      "border-l-orange-400",
      "border-l-pink-400"
    ]
    return accents[depth % accents.length]
  }

  return (
    <div className={`${indentClass} transition-all duration-200`}>
      <div className={`
        flex flex-col p-3 sm:p-4 rounded-xl border-l-4 
        ${getDepthColor(depth)} ${getDepthAccent(depth)}
        hover:shadow-sm transition-all duration-200
        ${task.completed ? 'opacity-70' : ''}
      `}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 flex flex-col items-center space-y-2">
            <Checkbox
              id={`task-${task.id}`}
              checked={task.completed || false}
              onCheckedChange={() => onToggleComplete(task.id)}
              className="mt-1"
            />
            
            {(hasSubtasks || canBreakdown) && (
              <button
                onClick={handleToggleExpanded}
                className="p-1 rounded-full hover:bg-blue-100 transition-colors"
                disabled={!hasSubtasks && !canBreakdown}
              >
                {hasSubtasks ? (
                  isExpanded ? (
                    <ChevronDown className="w-3 h-3 text-blue-600" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-blue-600" />
                  )
                ) : (
                  <Layers className="w-3 h-3 text-blue-400" />
                )}
              </button>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="flex-1 min-w-0">
                <label
                  htmlFor={`task-${task.id}`}
                  className={`block cursor-pointer font-medium text-sm sm:text-base leading-snug ${
                    task.completed ? "line-through text-blue-500" : "text-blue-800"
                  }`}
                >
                  {task.title}
                </label>
                
                <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${
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

                  {depth > 0 && (
                    <span className="flex items-center text-purple-500">
                      <Target className="w-3 h-3 mr-1" />
                      L{depth + 1}
                    </span>
                  )}

                  {hasSubtasks && (
                    <span className="flex items-center text-green-600">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      {progressPercentage}%
                    </span>
                  )}
                </div>
              </div>

              {canBreakdown && !hasSubtasks && (
                <div className="flex-shrink-0 mt-2 sm:mt-0">
                  <WaterButton
                    onClick={handleBreakdownTask}
                    disabled={isBreakingDown}
                    size="sm"
                    variant="secondary"
                    className="text-xs px-2 py-1 h-auto"
                  >
                    {isBreakingDown ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3 mr-1" />
                    )}
                    {isBreakingDown ? 'Breaking...' : 'Break Down'}
                  </WaterButton>
                </div>
              )}
            </div>

            {hasSubtasks && (
              <div className="mt-3 w-full bg-blue-100 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>

        {isExpanded && hasSubtasks && (
          <div className="mt-3 space-y-2 border-t border-blue-100/50 pt-3">
            {task.subtasks!.map((subtask) => (
              <NestedSubtaskComponent
                key={subtask.id}
                task={subtask}
                depth={depth + 1}
                maxDepth={maxDepth}
                onTaskUpdate={onTaskUpdate}
                onToggleComplete={onToggleComplete}
                parentContext={`${parentContext} > ${task.title}`}
              />
            ))}
          </div>
        )}

        {isBreakingDown && (
          <div className="mt-3 flex items-center justify-center py-4 border-t border-blue-100/50">
            <div className="flex items-center space-x-2 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">AI is analyzing and breaking down this task...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 