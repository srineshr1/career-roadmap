"""
Prompt templates for AI interactions.
"""

def get_next_question_prompt(history, user_answer):
    """
    Generate a prompt for getting the next question in the flow.
    
    Args:
        history: String containing previous Q&A history
        user_answer: The user's most recent answer
        
    Returns:
        Formatted prompt string
    """
    return f"""
    Context: A user is building a career roadmap. 
    History: {history}
    User's last choice: {user_answer}
    
    Task: Generate the NEXT logical question and 4 multiple-choice options.
    If we have enough info (at question 10), signal 'FINISH'.
    
    Output ONLY valid JSON:
    {{
      "question": "The next logical question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "status": "CONTINUE or FINISH"
    }}
    """

def get_roadmap_generation_prompt(history):
    """
    Generate a prompt for creating the final career roadmap with daily tasks.
    
    Args:
        history: String containing all Q&A history
        
    Returns:
        Formatted prompt string
    """
    from datetime import datetime, timedelta
    
    # Calculate start date (today) and 6 months from now
    start_date = datetime.now()
    end_date = start_date + timedelta(days=180)  # Approximately 6 months
    
    return f"""Based on this user profile: {history}

Generate a comprehensive 6-month career roadmap as a DAILY CALENDAR with specific tasks for each date.

Start Date: {start_date.strftime('%Y-%m-%d')}
End Date: {end_date.strftime('%Y-%m-%d')}

IMPORTANT: Return ONLY valid JSON matching this exact structure:

{{
  "start_date": "{start_date.strftime('%Y-%m-%d')}",
  "daily_tasks": [
    {{
      "date": "2026-02-04",
      "day_name": "Tuesday",
      "tasks": [
        {{
          "title": "Set up development environment",
          "description": "Install necessary tools and configure workspace",
          "duration": "2 hours",
          "priority": "high"
        }},
        {{
          "title": "Learn basic HTML syntax",
          "description": "Study HTML elements, tags, and structure",
          "duration": "1 hour",
          "priority": "high"
        }}
      ]
    }},
    {{
      "date": "2026-02-05",
      "day_name": "Wednesday",
      "tasks": [
        {{
          "title": "Practice HTML exercises",
          "description": "Complete 5 HTML coding exercises",
          "duration": "1.5 hours",
          "priority": "medium"
        }}
      ]
    }}
    // Continue for 180 days (6 months)
  ],
  "skills_to_learn": [
    "Skill 1",
    "Skill 2",
    "Skill 3",
    "Skill 4",
    "Skill 5",
    "Skill 6"
  ],
  "recommended_projects": [
    {{
      "title": "Project 1",
      "description": "Build this project by Week 4",
      "deadline": "2026-03-04"
    }},
    {{
      "title": "Project 2",
      "description": "Complete by end of Month 3",
      "deadline": "2026-05-04"
    }}
  ]
}}

Requirements:
- Generate tasks for EVERY DAY for 6 months (approximately 180 days)
- Each day should have 1-3 specific, actionable tasks
- Tasks should progress logically from basics to advanced
- Include rest/review days (weekends can have lighter tasks or be review days)
- Each task must have: title, description, duration estimate, and priority (high/medium/low)
- Make tasks specific to the user's career path and experience level
- Distribute learning across the timeline progressively
- Include practical exercises, not just theory
- Weekend tasks should be lighter (practice, review, or optional challenges)

Task Distribution Guidelines:
- Week 1-2: Setup and fundamentals
- Week 3-4: Core concepts and first small projects  
- Month 2: Intermediate skills with hands-on practice
- Month 3-4: Real projects and specialization
- Month 5: Advanced topics and portfolio building
- Month 6: Interview prep, networking, job applications

Output ONLY the JSON, no other text."""

def format_history(messages):
    """
    Format message history into a readable string.
    
    Args:
        messages: List of message dictionaries with 'q' and 'a' keys
        
    Returns:
        Formatted history string
    """
    return "\n".join([f"Q: {m['q']} | A: {m['a']}" for m in messages])
