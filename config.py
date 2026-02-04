"""
Configuration and session state initialization for Career Roadmap Scout.
"""
import streamlit as st
from groq import Groq
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_groq_client():
    """Initialize and return Groq client."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables")
    return Groq(api_key=api_key)

def initialize_session_state():
    """Initialize all session state variables."""
    if "messages" not in st.session_state:
        st.session_state.messages = []
    if "question_count" not in st.session_state:
        st.session_state.question_count = 0
    if "current_options" not in st.session_state:
        st.session_state.current_options = [
            "Student", 
            "Junior Developer", 
            "Mid-Level Professional", 
            "Career Changer"
        ]
    if "current_question" not in st.session_state:
        st.session_state.current_question = (
            "Welcome! To start your roadmap, what is your current professional status?"
        )

# App configuration constants
APP_TITLE = "Llama 4 Career Scout"
APP_ICON = "🚀"
MAX_QUESTIONS = 10
