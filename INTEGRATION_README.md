# Career Roadmap Scout - Setup Instructions

## Quick Start

### 1. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and create a free account
2. Create a new cluster (Free M0 tier is perfect)
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Update `.env` file with your connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/career_roadmap
   ```
   - Replace `username` and `password` with your MongoDB credentials
   - Replace `cluster` with your actual cluster name

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Start the Backend

```bash
python backend.py
```

The backend will run on `http://localhost:5000`

### 4. Open the Frontend

Open `frontend/index.html` in your web browser or use a local server:

```bash
# Using Python's built-in server
cd frontend
python -m http.server 8000
```

Then navigate to `http://localhost:8000`

## Features

✅ **Name-Based Authentication**: Users can access their roadmap from any device using their name
✅ **Personalized Roadmaster**: AI-generated 6-month learning plans based on questionnaire answers  
✅ **Interactive Calendar**: Visual calendar showing daily tasks
✅ **Task Tracking**: Checkbox system to track completed tasks
✅ **MongoDB Persistence**: All progress saved to MongoDB Atlas for cross-device access
✅ **Real-time Stats**: Progress percentage, completed tasks, and streak tracking

## How It Works

1. **Onboarding**: User enters name, selects career path and experience level
2. **Questionnaire**: User answers personalized questions
3. **AI Generation**: Backend generates a 6-month roadmap with daily tasks
4. **Storage**: Roadmap saved to MongoDB with user's name
5. **Calendar View**: Tasks displayed in a calendar format
6. **Progress Tracking**: Click tasks to mark as complete, synced to MongoDB

## Endpoints

- `GET /api/health` - Health check
- `POST /api/user/create` - Create or get existing user
- `POST /api/generate-roadmap` - Generate personalized roadmap
- `POST /api/save-roadmap` - Save roadmap to database
- `GET /api/roadmap/<name>` - Get user's roadmap
- `PATCH /api/update-task` - Update task completion status
- `GET /api/statistics/<name>` - Get user statistics

## Troubleshooting

**Backend won't start?**
- Check MongoDB connection string in `.env`
- Ensure all dependencies are installed
- Verify GROQ_API_KEY is valid

**Frontend can't connect?**
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify API_BASE_URL in `frontend/roadmap.js` and `frontend/questionnaire.js`

**Tasks not saving?**
- Check MongoDB connection
- Verify user name is stored in localStorage
- Check browser console for errors

## Development

- Frontend: Pure HTML, CSS, JavaScript
- Backend: Python Flask with MongoDB
- AI: Groq API for roadmap generation
- Database: MongoDB Atlas cloud database
