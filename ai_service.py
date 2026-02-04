"""
AI service layer for Groq API interactions.
"""
import json
from prompts import get_next_question_prompt, get_roadmap_generation_prompt, format_history

def get_ai_flow(client, messages, user_answer):
    """
    Get the next question and options from the AI.
    
    Args:
        client: Groq client instance
        messages: List of previous Q&A messages
        user_answer: The user's most recent answer
        
    Returns:
        Dictionary with 'question', 'options', and 'status'
    """
    history = format_history(messages)
    prompt = get_next_question_prompt(history, user_answer)
    
    chat_completion = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="openai/gpt-oss-120b",  # Or llama-4-scout if available in your region
        response_format={"type": "json_object"}
    )
    return json.loads(chat_completion.choices[0].message.content)

def generate_final_roadmap(client, messages):
    """
    Generate the final career roadmap based on all answers.
    
    Args:
        client: Groq client instance
        messages: List of all Q&A messages
        
    Returns:
        Dictionary containing roadmap data
    """
    history = format_history(messages)
    prompt = get_roadmap_generation_prompt(history)
    
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="openai/gpt-oss-120b",  # Using GPT-OSS 120B for roadmap generation
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)
