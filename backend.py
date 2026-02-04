"""
Flask Backend API for Career Roadmap Scout
Provides REST API endpoints for the frontend to interact with AI services.
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import get_groq_client
from ai_service import get_ai_flow, generate_final_roadmap
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Initialize Groq client
client = get_groq_client()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "ok", "message": "Backend is running"})

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
    
    Expected JSON body:
    {
        "messages": [{"q": "question", "a": "answer"}, ...],
        "user_answer": "latest answer"
    }
    """
    try:
        data = request.json
        messages = data.get('messages', [])
        user_answer = data.get('user_answer', '')
        
        if not user_answer:
            return jsonify({"error": "user_answer is required"}), 400
        
        # Get next question from AI
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

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV', 'development') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
