# Shower Thoughts AI - Flan-T5 Setup Guide

## 📋 Complete Google Colab Notebook Setup

**Model Choice:** Google Flan-T5-Large - Second best option after Mistral-7B
- ✅ No authentication required
- ✅ Excellent for instruction following and task breakdown
- ✅ Works reliably on Google Colab
- ✅ Fast inference times

## 🚀 Upload This Notebook to Google Colab

Create a new notebook in Google Colab and copy these cells:

### Cell 1 (Markdown):
```markdown
# AI Task Breakdown System for Shower Thoughts App

**Model:** Google Flan-T5-Large - Excellent instruction following, no authentication required

## Why Flan-T5-Large?
- ✅ No authentication needed
- ✅ Perfect for structured task planning
- ✅ Fast and reliable on Colab
- ✅ Great alternative to Mistral-7B
```

### Cell 2 (Code) - Dependencies:
```python
%pip install -q transformers torch accelerate flask flask-cors pyngrok requests
%pip install -q sentencepiece protobuf

import warnings
warnings.filterwarnings('ignore')

print("✅ All dependencies installed!")
```

### Cell 3 (Code) - System Check:
```python
import torch
import psutil

print(f"🔥 CUDA Available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"🎯 GPU: {torch.cuda.get_device_name(0)}")
    print(f"💾 Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f} GB")
    
print(f"⚡ CPU Cores: {psutil.cpu_count()}")
print(f"🧠 RAM: {psutil.virtual_memory().total / 1024**3:.1f} GB")
```

### Cell 4 (Code) - Load Model:
```python
from transformers import T5ForConditionalGeneration, T5Tokenizer
from datetime import datetime

model_name = "google/flan-t5-large"
print(f"🔄 Loading {model_name}...")

# Load model and tokenizer
tokenizer = T5Tokenizer.from_pretrained(model_name)
device = "cuda" if torch.cuda.is_available() else "cpu"

model = T5ForConditionalGeneration.from_pretrained(
    model_name,
    torch_dtype=torch.float16 if device == "cuda" else torch.float32,
    device_map="auto" if device == "cuda" else None
)

if device == "cpu":
    model = model.to(device)

print(f"✅ Model loaded on {device}")
```

### Cell 5 (Code) - Task Breakdown System:
```python
import json
import re
from typing import Dict, Any

class TaskBreakdownAI:
    def __init__(self, model, tokenizer):
        self.model = model
        self.tokenizer = tokenizer
        
    def create_prompt(self, thought: str) -> str:
        return f"""Break down this idea into 5-7 actionable subtasks:

"{thought}"

Provide:
- Main goal
- Category (app/business/learning/etc)
- Priority (high/medium/low)
- List of subtasks with: title, description, time estimate, difficulty

Format as structured text."""

    def generate_breakdown(self, thought: str) -> Dict[str, Any]:
        try:
            prompt = self.create_prompt(thought)
            
            inputs = self.tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True)
            inputs = {k: v.to(self.model.device) for k, v in inputs.items()}
            
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=600,
                    temperature=0.7,
                    do_sample=True,
                    top_p=0.9
                )
            
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            parsed = self.parse_response(response, thought)
            
            return {"success": True, "data": parsed}
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "data": self.create_fallback(thought)
            }
    
    def parse_response(self, response: str, thought: str) -> Dict[str, Any]:
        lines = response.split('\n')
        
        # Default values
        main_goal = f"Execute: {thought}"
        category = "general"
        priority = "medium"
        subtasks = []
        
        # Parse response
        current_task = {}
        task_id = 1
        
        for line in lines:
            line = line.strip()
            
            if "main goal" in line.lower() or "goal:" in line.lower():
                main_goal = line.split(":")[-1].strip()
            elif "category" in line.lower():
                category = line.split(":")[-1].strip()
            elif "priority" in line.lower():
                priority = line.split(":")[-1].strip()
            elif re.match(r'^\d+\.', line) or "task" in line.lower():
                if current_task and "title" in current_task:
                    current_task["id"] = task_id
                    subtasks.append(current_task)
                    task_id += 1
                
                current_task = {"title": re.sub(r'^\d+\.\s*', '', line)}
            elif "description" in line.lower():
                current_task["description"] = line.split(":")[-1].strip()
            elif "time" in line.lower():
                current_task["estimated_time"] = line.split(":")[-1].strip()
            elif "difficulty" in line.lower():
                current_task["difficulty"] = line.split(":")[-1].strip()
        
        # Add last task
        if current_task and "title" in current_task:
            current_task["id"] = task_id
            subtasks.append(current_task)
        
        # Fill missing fields
        for task in subtasks:
            if "description" not in task:
                task["description"] = task["title"]
            if "estimated_time" not in task:
                task["estimated_time"] = "1 hour"
            if "difficulty" not in task:
                task["difficulty"] = "medium"
        
        # Use fallback if no tasks found
        if not subtasks:
            return self.create_fallback(thought)
        
        return {
            "main_goal": main_goal,
            "subtasks": subtasks[:7],
            "category": category,
            "priority": priority
        }
    
    def create_fallback(self, thought: str) -> Dict[str, Any]:
        return {
            "main_goal": f"Execute: {thought}",
            "subtasks": [
                {
                    "id": 1,
                    "title": "Research and Planning",
                    "description": "Research requirements and create a plan",
                    "estimated_time": "2 hours",
                    "difficulty": "easy"
                },
                {
                    "id": 2,
                    "title": "Gather Resources",
                    "description": "Collect necessary tools and materials",
                    "estimated_time": "1 hour",
                    "difficulty": "easy"
                },
                {
                    "id": 3,
                    "title": "Initial Setup",
                    "description": "Set up basic foundation",
                    "estimated_time": "3 hours",
                    "difficulty": "medium"
                },
                {
                    "id": 4,
                    "title": "Core Implementation",
                    "description": "Build main functionality",
                    "estimated_time": "4 hours",
                    "difficulty": "hard"
                },
                {
                    "id": 5,
                    "title": "Testing & Refinement",
                    "description": "Test and improve the implementation",
                    "estimated_time": "2 hours",
                    "difficulty": "medium"
                }
            ],
            "category": "general",
            "priority": "medium"
        }

# Initialize the AI system
task_ai = TaskBreakdownAI(model, tokenizer)
print("✅ Task Breakdown AI ready!")
```

### Cell 6 (Code) - Test the System:
```python
# Test the task breakdown system
test_thoughts = [
    "Create a mobile app for finding hiking trails",
    "Start an online handmade crafts business",
    "Build a smart home automation system",
    "Learn machine learning and build an AI project"
]

print("🧪 Testing Task Breakdown System...\n")

for i, thought in enumerate(test_thoughts, 1):
    print(f"TEST {i}: {thought}")
    print("="*50)
    
    result = task_ai.generate_breakdown(thought)
    
    if result["success"]:
        data = result["data"]
        print(f"🎯 GOAL: {data['main_goal']}")
        print(f"📂 CATEGORY: {data['category']}")
        print(f"⚡ PRIORITY: {data['priority']}")
        print("\n📋 SUBTASKS:")
        
        for task in data['subtasks']:
            print(f"  {task['id']}. {task['title']}")
            print(f"     📝 {task['description']}")
            print(f"     ⏱️ {task['estimated_time']} | 🎚️ {task['difficulty']}")
            print()
    else:
        print(f"❌ Error: {result.get('error')}")
    
    print("-"*50 + "\n")

print("✅ Testing completed!")
```

### Cell 7 (Code) - Flask API Server:
```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import threading
import time
from datetime import datetime

app = Flask(__name__)
CORS(app)

last_activity = datetime.now()
keep_alive_url = None

@app.route('/health', methods=['GET'])
def health_check():
    global last_activity
    last_activity = datetime.now()
    return jsonify({
        "status": "healthy",
        "model": "google/flan-t5-large",
        "timestamp": last_activity.isoformat()
    })

@app.route('/breakdown', methods=['POST'])
def breakdown_task():
    global last_activity
    last_activity = datetime.now()
    
    try:
        data = request.get_json()
        
        if not data or 'thought' not in data:
            return jsonify({"error": "Missing 'thought' field", "success": False}), 400
        
        thought = data['thought'].strip()
        
        if len(thought) < 10:
            return jsonify({"error": "Thought too short", "success": False}), 400
        
        result = task_ai.generate_breakdown(thought)
        
        return jsonify({
            "success": result["success"],
            "data": result["data"],
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "success": False,
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/generate-thoughts', methods=['GET'])
def generate_thoughts():
    global last_activity
    last_activity = datetime.now()
    
    thoughts = [
        "Create a meditation app with guided sessions",
        "Build a community garden in my neighborhood", 
        "Start a YouTube channel about sustainable living",
        "Develop a habit tracking system",
        "Launch a local farmers market",
        "Create an online course teaching digital art",
        "Build a smart weather monitoring station",
        "Start a book club with virtual meetings",
        "Design a productivity workspace setup",
        "Create a plant care reminder app"
    ]
    
    import random
    selected = random.sample(thoughts, 3)
    
    return jsonify({
        "success": True,
        "thoughts": selected,
        "timestamp": datetime.now().isoformat()
    })

print("✅ Flask API server ready!")
```

### Cell 8 (Code) - Start Server with ngrok:
```python
from pyngrok import ngrok
import threading
import time

def run_flask():
    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)

# Set your ngrok auth token
ngrok.set_auth_token("YOUR_NGROK_AUTH_TOKEN_HERE")  # Replace with your token

# Start Flask in background
flask_thread = threading.Thread(target=run_flask, daemon=True)
flask_thread.start()
time.sleep(3)

# Create ngrok tunnel
try:
    public_url = ngrok.connect(5000)
    keep_alive_url = str(public_url).split('"')[1]  # Extract just the URL part
    
    print("🚀 SERVER IS LIVE!")
    print(f"🌐 Public URL: {keep_alive_url}")
    print(f"🔗 API Endpoints:")
    print(f"   • {keep_alive_url}/breakdown (POST)")
    print(f"   • {keep_alive_url}/generate-thoughts (GET)")
    print(f"   • {keep_alive_url}/health (GET)")
    print(f"\n📝 For Next.js:")
    print(f"   const API_BASE_URL = '{keep_alive_url}';")
    
except Exception as e:
    print(f"❌ ngrok error: {e}")
    print("🔧 Local server: http://localhost:5000")
    keep_alive_url = "http://localhost:5000"
```

### Cell 9 (Code) - Test API:
```python
import requests

base_url = keep_alive_url

print(f"🧪 Testing API at: {base_url}")

# Test health check
try:
    response = requests.get(f"{base_url}/health")
    print("✅ Health:", response.json())
except Exception as e:
    print(f"❌ Health check failed: {e}")

# Test task breakdown
test_thought = "Create a mobile app for tracking daily water intake"
try:
    response = requests.post(
        f"{base_url}/breakdown",
        json={"thought": test_thought},
        headers={"Content-Type": "application/json"}
    )
    
    data = response.json()
    if data['success']:
        breakdown = data['data']
        print(f"\n🎯 Task Breakdown for: {test_thought}")
        print(f"📋 Goal: {breakdown['main_goal']}")
        print("🔧 Subtasks:")
        for task in breakdown['subtasks']:
            print(f"  {task['id']}. {task['title']}")
            print(f"     {task['description']}")
            print(f"     ⏱️ {task['estimated_time']} | 🎚️ {task['difficulty']}")
    
except Exception as e:
    print(f"❌ Breakdown test failed: {e}")

print(f"\n🔗 Integration: const API_BASE_URL = '{base_url}';")
```

### Cell 10 (Code) - Keep Session Alive:
```python
from IPython.display import Javascript, display, clear_output
import requests

# Keep Colab alive
display(Javascript('''
    function keepAlive() {
        setInterval(() => {
            const event = new MouseEvent('mousemove', {
                view: window, bubbles: true, cancelable: true,
                clientX: Math.random() * window.innerWidth,
                clientY: Math.random() * window.innerHeight
            });
            document.dispatchEvent(event);
        }, 300000); // 5 minutes
    }
    keepAlive();
    console.log("Keep-alive started");
'''))

def monitor_system():
    session_start = datetime.now()
    
    while True:
        try:
            clear_output(wait=True)
            
            current_time = datetime.now()
            runtime = current_time - session_start
            
            # Test API
            if keep_alive_url:
                try:
                    response = requests.get(f"{keep_alive_url}/health", timeout=5)
                    status = "✅ ONLINE" if response.status_code == 200 else "⚠️ DEGRADED"
                except:
                    status = "❌ OFFLINE"
            else:
                status = "🔧 LOCAL"
            
            print("🚀 SHOWER THOUGHTS AI - LIVE STATUS")
            print("="*40)
            print(f"⏰ Time: {current_time.strftime('%H:%M:%S')}")
            print(f"🕐 Runtime: {str(runtime).split('.')[0]}")
            print(f"🌐 API Status: {status}")
            print(f"🔗 URL: {keep_alive_url}")
            print(f"🤖 Model: google/flan-t5-large")
            print(f"📡 Server: Running")
            print("\n⚠️  Keep this running!")
            print("   Updates every 5 minutes")
            
            time.sleep(300)  # 5 minutes
            
        except KeyboardInterrupt:
            print("\n⏹️ Monitoring stopped")
            break
        except Exception as e:
            print(f"⚠️ Error: {e}")
            time.sleep(60)

print("🚀 Starting 24/7 monitoring...")
print("🔄 This prevents Colab timeout")
print("⚠️  Do NOT interrupt this cell")

monitor_system()
```

## 🎯 Next Steps

1. **Copy these cells** into a new Google Colab notebook
2. **Run cells 1-6** to set up the model
3. **Run cell 7-8** to start the API server
4. **Run cell 9** to test the API
5. **Run cell 10** and keep it running for 24/7 operation
6. **Copy the public URL** from cell 8 output for your Next.js app

## 📱 Integration with Your App

Use the public URL from the notebook in your Next.js app:

```javascript
const API_BASE_URL = 'your-ngrok-url-here';

// Break down a thought
const response = await fetch(`${API_BASE_URL}/breakdown`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ thought: userInput })
});

const result = await response.json();
```

This setup is much more reliable than the Mistral approach and will work immediately without authentication issues! 