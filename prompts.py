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
    return (
        f"Based on this profile: {history}, generate a 6-month career roadmap "
        "in JSON format with 'steps', 'skills_to_learn', and 'recommended_projects'."
    )

def format_history(messages):
    """
    Format message history into a readable string.
    
    Args:
        messages: List of message dictionaries with 'q' and 'a' keys
        
    Returns:
        Formatted history string
    """
    return "\n".join([f"Q: {m['q']} | A: {m['a']}" for m in messages])
