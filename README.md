# Orvia - AI-Powered Career Roadmap Scout

## Overview
Orvia is an AI-powered personalized learning platform that uses **GPT-OSS 120B** to create customized career roadmaps through an interactive Q&A flow.

## Features
✨ **Dynamic AI Questions**: GPT-OSS 120B generates intelligent follow-up questions
🎯 **Personalized Roadmaps**: AI creates customized learning paths based on user answers
💡 **Skills & Projects**: Get relevant skill recommendations and project ideas
🎨 **Modern UI**: Beautiful, responsive interface with smooth animations

## Tech Stack
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Backend**: Flask (Python)
- **AI Model**: GPT-OSS 120B via Groq API
- **Architecture**: REST API

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js (optional, for serving frontend)
- Groq API Key (get one from https://console.groq.com)

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Run the Backend
```bash
python backend.py
```
The backend will start on `http://localhost:5000`

### 4. Run the Frontend
Open `frontend/index.html` in your browser, or serve it with a simple HTTP server:

**Option A: Using Python**
```bash
cd frontend
python -m http.server 8080
```
Then open `http://localhost:8080`

**Option B: Using Live Server (VS Code)**
- Install "Live Server" extension in VS Code
- Right-click on `frontend/index.html` and select "Open with Live Server"

**Option C: Direct File**
Simply open `frontend/index.html` in your browser (may have CORS issues)

## How It Works

### User Flow
1. **Enter Name**: User provides their name for personalization
2. **Select Career**: Choose from Web Dev, Mobile Dev, Data Science, or DevOps
3. **AI Questions**: Answer 5-10 dynamic questions powered by GPT-OSS 120B
4. **Get Roadmap**: AI generates a comprehensive 6-month career roadmap

### API Endpoints

#### Health Check
```
GET /api/health
```

#### Start Session
```
POST /api/start
Body: { "name": "John", "career": "Web Development" }
```

#### Get Next Question
```
POST /api/next-question
Body: { "messages": [...], "user_answer": "..." }
```

#### Generate Roadmap
```
POST /api/generate-roadmap
Body: { "messages": [...], "name": "John", "career": "Web Development" }
```

## Project Structure
```
Hackathon/
├── backend.py          # Flask API server
├── ai_service.py       # Groq API integration (GPT-OSS 120B)
├── prompts.py          # AI prompt templates
├── config.py           # Configuration & Groq client setup
├── requirements.txt    # Python dependencies
├── .env               # Environment variables (API keys)
├── frontend/
│   ├── index.html     # Main HTML
│   ├── script.js      # Frontend logic with API integration
│   └── style.css      # Styling
```

## Key Features

### GPT-OSS 120B Integration
- **Question Generation**: Dynamically creates follow-up questions based on user answers
- **Roadmap Creation**: Generates personalized learning paths with steps, skills, and projects
- **JSON Responses**: Structured output for easy frontend parsing

### Frontend Features
- Smooth step transitions and animations
- Real-time loading indicators
- Responsive design (mobile-friendly)
- Beautiful dark mode UI
- Error handling with user-friendly messages

### Backend Features
- RESTful API design
- CORS enabled for frontend communication
- Modular architecture (separated concerns)
- JSON response format
- Error handling and validation

## Troubleshooting

### Backend Not Starting
- Check if Python dependencies are installed: `pip install -r requirements.txt`
- Verify `.env` file exists with valid `GROQ_API_KEY`
- Check if port 5000 is available

### Frontend Can't Connect to Backend
- Ensure backend is running on `http://localhost:5000`
- Check browser console for CORS errors
- Verify `API_BASE_URL` in `script.js` matches backend URL

### AI Responses Failing
- Verify Groq API key is valid
- Check Groq API status and rate limits
- Review backend logs for error messages

## Future Enhancements
- [ ] PDF export for roadmaps
- [ ] Save/load roadmap functionality
- [ ] Progress tracking
- [ ] More career paths
- [ ] Email roadmap to user
- [ ] Share roadmap via link

## License
MIT

## Credits
Built with ❤️ using GPT-OSS 120B via Groq API
