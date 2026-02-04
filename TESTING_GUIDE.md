# Testing Guide - Roadmap Format Fix

## What Was Fixed

### 1. **Backend Prompt Enhancement** (`prompts.py`)
- ✅ Added detailed JSON schema to the roadmap generation prompt
- ✅ Provided clear examples with the exact structure expected
- ✅ Specified requirements:
  - Exactly 6 steps (one per month)
  - Each step has `title` and `description`
  - 6-10 skills in `skills_to_learn` array
  - 3-5 projects with `title` and `description`

### 2. **Frontend Display Improvements** (`script.js`)
- ✅ Added console logging to debug what format is received
- ✅ Better error handling for missing or malformed data
- ✅ Support for both object and string formats in arrays
- ✅ Fallback displays when data is incomplete

### 3. **Backend Auto-Reload**
- ✅ Flask is running in debug mode and **already reloaded with new changes**

## Expected Roadmap Format

The AI (GPT-OSS 120B) should now return JSON in this format:

```json
{
  "steps": [
    {
      "title": "Month 1: Foundation Building",
      "description": "Learn core concepts and fundamentals..."
    },
    {
      "title": "Month 2: Intermediate Skills",
      "description": "Dive deeper into advanced topics..."
    }
    // ... 4 more steps
  ],
  "skills_to_learn": [
    "HTML & CSS",
    "JavaScript ES6+",
    "React.js",
    "Node.js",
    "REST APIs",
    "Git & GitHub"
  ],
  "recommended_projects": [
    {
      "title": "Portfolio Website",
      "description": "Build a responsive personal portfolio..."
    },
    {
      "title": "Task Manager App",
      "description": "Create a full-stack CRUD application..."
    }
  ]
}
```

## How to Test

### Step 1: Open Frontend
1. Navigate to `frontend/` folder
2. Open `index.html` in your browser (or use Live Server)

### Step 2: Complete the Flow
1. Enter your name
2. Select a career path (e.g., "Web Development")
3. Answer 5-10 AI-generated questions
4. Wait for roadmap generation

### Step 3: Check Console Logs
Open browser developer tools (F12) and check the Console tab. You should see:

```
Received roadmap: {steps: Array(6), skills_to_learn: Array(8), ...}
Roadmap type: object
Steps: (6) [{…}, {…}, {…}, {…}, {…}, {…}]
Skills: (8) ['HTML', 'CSS', 'JavaScript', ...]
Projects: (3) [{…}, {…}, {…}]
```

### Step 4: Verify Display
The roadmap should show:

✅ **Learning Path Section**
- 6 numbered steps with titles and descriptions
- Each step shows month and clear objectives

✅ **Skills to Master Section** (if provided)
- Pill-shaped tags for each skill
- Hover effects on tags

✅ **Recommended Projects Section** (if provided)
- Card layout for each project
- Project title and description
- Hover effects on cards

## Troubleshooting

### Issue: Roadmap shows "No specific steps provided"
**Cause:** AI returned empty or malformed data
**Solution:** 
1. Check console logs to see what was received
2. Check backend logs for API errors
3. Verify Groq API key is valid

### Issue: Skills or Projects not displaying
**Cause:** Data may be in unexpected format
**Solution:**
1. Check console logs - you'll see the raw data structure
2. The frontend now handles both object and string formats
3. If data is there but not displaying, check for typos in field names

### Issue: Backend changes not applying
**Cause:** Flask not reloading
**Solution:**
1. The backend is in debug mode and should auto-reload
2. You can manually restart: Ctrl+C then `python backend.py`

## What the Console Will Show

When a roadmap is generated, you'll see detailed logs like:

```javascript
// Full roadmap object
Received roadmap: {
  steps: Array(6),
  skills_to_learn: Array(8),
  recommended_projects: Array(3),
  user_name: "John",
  career_path: "Web Development"
}

// Type verification
Roadmap type: object

// Individual arrays
Steps: [
  {title: "Month 1: Foundation Building", description: "..."},
  {title: "Month 2: Intermediate Skills", description: "..."},
  ...
]

Skills: ["HTML", "CSS", "JavaScript", "React", ...]

Projects: [
  {title: "Portfolio Website", description: "..."},
  {title: "Task Manager App", description: "..."},
  ...
]
```

## Quick Test Checklist

- [ ] Backend is running (check terminal)
- [ ] Frontend loads without errors
- [ ] Can enter name and select career
- [ ] Questions appear and are answerable
- [ ] Loading indicator shows during AI processing
- [ ] Roadmap generates successfully
- [ ] Console shows roadmap data structure
- [ ] All 3 sections display (steps, skills, projects)
- [ ] Data looks relevant to chosen career
- [ ] UI is responsive and styled correctly

## Notes

- The prompt now gives GPT-OSS 120B very clear instructions
- Even if AI returns slightly different format, frontend can handle it
- Console logs help debug any format mismatches
- Changes are already live (Flask auto-reloaded)
