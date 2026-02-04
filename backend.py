"""
Flask Backend API for Career Roadmap Scout
Provides REST API endpoints for the frontend to interact with AI services.
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import get_groq_client
from ai_service import get_ai_flow, generate_final_roadmap
from database import (
    create_or_get_user, 
    save_roadmap, 
    get_roadmap, 
    update_task_completion,
    get_user_statistics
)
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Initialize Groq client
client = get_groq_client()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "ok", "message": "Backend is running"})

@app.route('/api/user/create', methods=['POST'])
def create_user():
    """
    Create or get existing user by name.
    Name is used as unique identifier for cross-device access.
    
    Expected JSON:
    {
        "name": "User Name",
        "career": "web",
        "level": "beginner"
    }
    """
    try:
        data = request.json
        name = data.get('name', '').strip()
        career = data.get('career', '')
        level = data.get('level', '')
        
        if not name:
            return jsonify({"error": "Name is required"}), 400
        
        user = create_or_get_user(name, career, level)
        
        return jsonify({
            "success": True,
            "user_id": user["user_id"],
            "name": user["name"],
            "career": user["career"],
            "level": user["level"]
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/start', methods=['POST'])
def start_session():
    """
    Initialize a new career roadmap session.
    Returns the first question.
    """
    data = request.json
    name = data.get('name', 'there')
    career = data.get('career', '')
    
    # Initial question based on career selection
    initial_question = {
        "question": f"Great choice, {name}! What is your current experience level in {career}?",
        "options": [
            "Complete Beginner",
            "Some Basic Knowledge",
            "Intermediate Level",
            "Advanced Looking to Specialize"
        ],
        "status": "CONTINUE"
    }
    
    return jsonify(initial_question)

@app.route('/api/next-question', methods=['POST'])
def next_question():
    """
    Get the next question based on user's answer history.
    Uses AI to generate dynamic, personalized questions.
    
    Expected JSON body:
    {
        "messages": [{"q": "question", "a": "answer"}, ...],
        "user_answer": "latest answer",
        "career": "career path",
        "level": "experience level"
    }
    """
    try:
        data = request.json
        messages = data.get('messages', [])
        user_answer = data.get('user_answer', '')
        career = data.get('career', '')
        level = data.get('level', '')
        
        if not user_answer:
            return jsonify({"error": "user_answer is required"}), 400
        
        # Get next question from AI (dynamically generated)
        result = get_ai_flow(client, messages, user_answer)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-roadmap', methods=['POST'])
def create_roadmap():
    """
    Generate final career roadmap based on all user answers.
    
    Expected JSON body:
    {
        "messages": [{"q": "question", "a": "answer"}, ...],
        "name": "user name",
        "career": "career path"
    }
    """
    try:
        data = request.json
        messages = data.get('messages', [])
        name = data.get('name', 'User')
        career = data.get('career', 'your chosen path')
        
        if not messages:
            return jsonify({"error": "No messages provided"}), 400
        
        # Generate roadmap from AI
        roadmap = generate_final_roadmap(client, messages)
        
        # Add user info to response
        roadmap['user_name'] = name
        roadmap['career_path'] = career
        
        return jsonify(roadmap)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/save-roadmap', methods=['POST'])
def save_user_roadmap():
    """
    Save generated roadmap to MongoDB.
    
    Expected JSON:
    {
        "name": "User Name",
        "roadmap": { ... roadmap data ... }
    }
    """
    try:
        data = request.json
        name = data.get('name', '').strip()
        roadmap = data.get('roadmap', {})
        
        if not name:
            return jsonify({"error": "Name is required"}), 400
        if not roadmap:
            return jsonify({"error": "Roadmap data is required"}), 400
        
        result = save_roadmap(name, roadmap)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/roadmap/<user_name>', methods=['GET'])
def get_user_roadmap(user_name):
    """
    Retrieve user's roadmap by name.
    """
    try:
        roadmap_doc = get_roadmap(user_name)
        
        if not roadmap_doc:
            return jsonify({"error": "Roadmap not found"}), 404
        
        # Remove MongoDB _id from response
        if '_id' in roadmap_doc:
            del roadmap_doc['_id']
        
        return jsonify(roadmap_doc)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/update-task', methods=['PATCH'])
def update_task():
    """
    Update task completion status.
    
    Expected JSON:
    {
        "name": "User Name",
        "date": "2026-02-04",
        "task_id": "2026-02-04_task_0",
        "completed": true
    }
    """
    try:
        data = request.json
        name = data.get('name', '').strip()
        date = data.get('date', '')
        task_id = data.get('task_id', '')
        completed = data.get('completed', False)
        
        if not name:
            return jsonify({"error": "Name is required"}), 400
        if not date or not task_id:
            return jsonify({"error": "Date and task_id are required"}), 400
        
        result = update_task_completion(name, date, task_id, completed)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/statistics/<user_name>', methods=['GET'])
def get_statistics(user_name):
    """
    Get user's progress statistics.
    """
    try:
        stats = get_user_statistics(user_name)
        return jsonify(stats)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV', 'development') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)

