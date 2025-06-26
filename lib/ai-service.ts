const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:5000';

export interface Subtask {
  id: number;
  title: string;
  description: string;
  estimated_time: string;
  difficulty: 'easy' | 'medium' | 'hard';
  completed?: boolean;
  subtasks?: NestedSubtask[];
  expanded?: boolean;
  isBreakdownLoading?: boolean;
  canBreakdown?: boolean;
  parentId?: number;
  depth?: number;
  completionPercentage?: number;
}

export interface NestedSubtask {
  id: number;
  title: string;
  description: string;
  estimated_time: string;
  difficulty: 'easy' | 'medium' | 'hard';
  completed?: boolean;
  subtasks?: NestedSubtask[];
  expanded?: boolean;
  isBreakdownLoading?: boolean;
  canBreakdown?: boolean;
  parentId?: number;
  depth?: number;
  completionPercentage?: number;
}

export interface TaskBreakdownResult {
  main_goal: string;
  subtasks: Subtask[];
  category: string;
  priority: 'high' | 'medium' | 'low';
  project_type?: string;
  complexity_score?: number;
  total_estimated_hours?: number;
}

export interface NestedBreakdownResult {
  success: boolean;
  subtasks: NestedSubtask[];
  context?: string;
  depth_level?: number;
  breakdown_reasoning?: string;
  error?: string;
  timestamp: string;
  processing_time?: string;
}

export interface AIResponse {
  success: boolean;
  data?: TaskBreakdownResult;
  error?: string;
  timestamp: string;
  processing_time?: string;
}

export interface RandomThoughtsResponse {
  success: boolean;
  thoughts: string[];
  timestamp: string;
}

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': '*'
  };
  
  if (AI_API_URL.includes('ngrok')) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }
  
  return headers;
};

export async function generateSubtasks(thought: string): Promise<AIResponse> {
  try {
    console.log(`Calling AI API: ${AI_API_URL}/breakdown`);
    
    const response = await fetch(`${AI_API_URL}/breakdown`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ thought }),
    });

    console.log(`AI API Response Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI API Error Response: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
    }

    const result = await response.json();
    console.log('AI API Success:', result);
    return result;
  } catch (error) {
    console.error('AI API Error:', error);
    throw new Error(`Failed to generate subtasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateNestedSubtasks(
  parentTask: Subtask | NestedSubtask, 
  context?: string,
  depth?: number
): Promise<NestedBreakdownResult> {
  try {
    console.log(`Calling AI API: ${AI_API_URL}/breakdown-nested`);
    
    const response = await fetch(`${AI_API_URL}/breakdown-nested`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ 
        parent_task: {
          title: parentTask.title,
          description: parentTask.description,
          difficulty: parentTask.difficulty,
          estimated_time: parentTask.estimated_time
        },
        context: context || '',
        depth: depth || 1,
        max_depth: 5 // Prevent infinite recursion
      }),
      mode: 'cors',
      credentials: 'omit'
    });

    console.log(`Nested Breakdown API Response Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Nested Breakdown API Error Response: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
    }

    const result = await response.json();
    console.log('Nested Breakdown API Success:', result);
    return result;
  } catch (error) {
    console.error('Nested Breakdown API Error:', error);
    throw new Error(`Failed to generate nested subtasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateSmartBreakdown(
  task: string,
  projectType?: string,
  complexity?: 'simple' | 'moderate' | 'complex' | 'enterprise'
): Promise<AIResponse> {
  try {
    console.log('=== generateSmartBreakdown START ===');
    console.log('Raw task parameter:', task);
    console.log('Task type:', typeof task);
    console.log('Task length:', task ? task.length : 'undefined');
    
    if (!task || task.trim().length === 0) {
      console.error('Task validation failed - empty or undefined');
      throw new Error('Task parameter is required and cannot be empty');
    }

    const trimmedTask = task.trim();
    console.log('Trimmed task:', trimmedTask);
    console.log('Trimmed task length:', trimmedTask.length);
    
    console.log(`Calling AI API: ${AI_API_URL}/breakdown-smart`);
    console.log('AI_API_URL:', AI_API_URL);
    console.log('Project type:', projectType);
    console.log('Complexity:', complexity);
    
    const response = await fetch(`${AI_API_URL}/breakdown-smart`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ 
        thought: trimmedTask,
        project_type: projectType || 'general',
        complexity_level: complexity || 'moderate'
      }),
      mode: 'cors',
      credentials: 'omit'
    });

    console.log(`Smart Breakdown API Response Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Smart Breakdown API Error Response: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
    }

    const result = await response.json();
    console.log('Smart Breakdown API Success:', result);
    return result;
  } catch (error) {
    console.error('Smart Breakdown API Error:', error);
    throw new Error(`Failed to generate smart breakdown: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getRandomThoughts(): Promise<RandomThoughtsResponse> {
  try {
    console.log(`Calling AI API: ${AI_API_URL}/generate-thoughts`);
    
    const headers: Record<string, string> = {};
    if (AI_API_URL.includes('ngrok')) {
      headers['ngrok-skip-browser-warning'] = 'true';
    }
    
    const response = await fetch(`${AI_API_URL}/generate-thoughts`, {
      method: 'GET',
      headers
    });
    
    console.log(`Random Thoughts API Response Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Random Thoughts API Error Response: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
    }

    const result = await response.json();
    console.log('Random Thoughts API Success:', result);
    return result;
  } catch (error) {
    console.error('Random Thoughts API Error:', error);
    throw new Error(`Failed to get random thoughts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function checkAIHealth(): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (AI_API_URL.includes('ngrok')) {
      headers['ngrok-skip-browser-warning'] = 'true';
    }
    
    const response = await fetch(`${AI_API_URL}/health`, { 
      method: 'GET',
      headers,
      mode: 'cors',
      credentials: 'omit'
    });
    return response.ok;
  } catch (error) {
    console.error('AI Health Check Error:', error);
    return false;
  }
}

export async function getAIStatus() {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (AI_API_URL.includes('ngrok')) {
      headers['ngrok-skip-browser-warning'] = 'true';
    }
    
    const response = await fetch(`${AI_API_URL}/health`, { 
      method: 'GET',
      headers,
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      return { status: 'offline', details: null };
    }

    const result = await response.json();
    return { status: 'online', details: result };
  } catch {
    return { status: 'offline', details: null };
  }
}

// Utility functions for nested task management
export const calculateTaskProgress = (task: Subtask | NestedSubtask): number => {
  if (!task.subtasks || task.subtasks.length === 0) {
    return task.completed ? 100 : 0;
  }
  
  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter(subtask => 
    calculateTaskProgress(subtask) === 100
  ).length;
  
  return Math.round((completedSubtasks / totalSubtasks) * 100);
};

export const getTaskDepth = (task: Subtask | NestedSubtask): number => {
  if (!task.subtasks || task.subtasks.length === 0) {
    return 0;
  }
  
  return 1 + Math.max(...task.subtasks.map(subtask => getTaskDepth(subtask)));
};

export const getTotalEstimatedTime = (tasks: (Subtask | NestedSubtask)[]): number => {
  return tasks.reduce((total, task) => {
    const taskTime = parseEstimatedTime(task.estimated_time);
    const subtaskTime = task.subtasks ? getTotalEstimatedTime(task.subtasks) : 0;
    return total + Math.max(taskTime, subtaskTime);
  }, 0);
};

const parseEstimatedTime = (timeString: string): number => {
  const time = timeString.toLowerCase();
  const numbers = time.match(/\d+/);
  const value = numbers ? parseInt(numbers[0]) : 1;
  
  if (time.includes('minute')) return value / 60;
  if (time.includes('hour')) return value;
  if (time.includes('day')) return value * 8;
  if (time.includes('week')) return value * 40;
  if (time.includes('month')) return value * 160;
  
  return value;
}; 