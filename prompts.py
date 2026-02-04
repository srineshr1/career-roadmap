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
    Generate a prompt for creating the final career roadmap.
    
    Args:
        history: String containing all Q&A history
        
    Returns:
        Formatted prompt string
    """
    return f"""Based on this user profile: {history}

Generate a comprehensive 6-month career roadmap in JSON format.

IMPORTANT: Return ONLY valid JSON matching this exact structure:

{{
  "steps": [
    {{
      "title": "Month 1: Foundation Building",
      "description": "Learn core concepts and fundamentals. Set up development environment and complete basic tutorials."
    }},
    {{
      "title": "Month 2: Intermediate Skills",
      "description": "Dive deeper into advanced topics. Build small projects to practice."
    }},
    {{
      "title": "Month 3: Practical Application",
      "description": "Work on real-world projects. Start building portfolio pieces."
    }},
    {{
      "title": "Month 4: Specialization",
      "description": "Focus on specific areas of interest. Learn industry-standard tools."
    }},
    {{
      "title": "Month 5: Advanced Topics",
      "description": "Master complex concepts. Contribute to open source or collaborate."
    }},
    {{
      "title": "Month 6: Job Readiness",
      "description": "Polish portfolio, prepare for interviews, and network with professionals."
    }}
  ],
  "skills_to_learn": [
    "Skill 1",
    "Skill 2",
    "Skill 3",
    "Skill 4",
    "Skill 5",
    "Skill 6",
    "Skill 7",
    "Skill 8"
  ],
  "recommended_projects": [
    {{
      "title": "Project 1 Name",
      "description": "Build a [specific project] to practice [specific skills]. This will demonstrate your ability to [outcome]."
    }},
    {{
      "title": "Project 2 Name",
      "description": "Create a [specific project] that showcases [specific skills]. Focus on [key aspects]."
    }},
    {{
      "title": "Project 3 Name",
      "description": "Develop a [specific project] integrating [technologies]. This will help you master [concepts]."
    }}
  ]
}}

Requirements:
- Provide exactly 6 steps (one per month)
- Each step must have "title" and "description" fields
- Include 6-10 relevant skills in the skills_to_learn array
- Provide 3-5 project ideas, each with "title" and "description"
- Make it specific to the user's profile and goals
- Be practical and actionable

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
