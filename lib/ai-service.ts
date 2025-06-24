const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:5000';

export interface Subtask {
  id: number;
  title: string;
  description: string;
  estimated_time: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface TaskBreakdownResult {
  main_goal: string;
  subtasks: Subtask[];
  category: string;
  priority: 'high' | 'medium' | 'low';
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
    const headers: Record<string, string> = {};
    if (AI_API_URL.includes('ngrok')) {
      headers['ngrok-skip-browser-warning'] = 'true';
    }
    
    const response = await fetch(`${AI_API_URL}/health`, { headers });
    return response.ok;
  } catch (error) {
    console.error('AI Health Check Error:', error);
    return false;
  }
}

export async function getAIStatus() {
  try {
    const headers: Record<string, string> = {};
    if (AI_API_URL.includes('ngrok')) {
      headers['ngrok-skip-browser-warning'] = 'true';
    }
    
    const response = await fetch(`${AI_API_URL}/health`, { headers });
    
    if (!response.ok) {
      return { status: 'offline', details: null };
    }

    const result = await response.json();
    return { status: 'online', details: result };
  } catch (error) {
    return { status: 'offline', details: null };
  }
} 