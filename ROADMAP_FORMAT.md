# Roadmap Data Format Specification

## Overview
This document specifies the exact JSON format that GPT-OSS 120B should return and that the frontend expects to receive.

---

## Complete Format

```json
{
  "steps": [
    {
      "title": "Month 1: Foundation Building", 
      "description": "Detailed description of what to learn and accomplish this month"
    },
    {
      "title": "Month 2: Intermediate Skills",
      "description": "Detailed description for month 2"
    },
    {
      "title": "Month 3: Practical Application",
      "description": "Detailed description for month 3"
    },
    {
      "title": "Month 4: Specialization",
      "description": "Detailed description for month 4"
    },
    {
      "title": "Month 5: Advanced Topics",
      "description": "Detailed description for month 5"
    },
    {
      "title": "Month 6: Job Readiness",
      "description": "Detailed description for month 6"
    }
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
    {
      "title": "Project 1 Name",
      "description": "Detailed description of the project and what it teaches"
    },
    {
      "title": "Project 2 Name",
      "description": "Detailed description of the project and what it teaches"
    },
    {
      "title": "Project 3 Name",
      "description": "Detailed description of the project and what it teaches"
    }
  ]
}
```

---

## Field Specifications

### `steps` (Array of Objects) - REQUIRED
- **Type:** Array
- **Min Length:** 6
- **Max Length:** 6
- **Item Structure:**
  ```json
  {
    "title": "Month X: Phase Name",
    "description": "What to focus on this month"
  }
  ```
- **Title Format:** Should include month number and descriptive phase
- **Description:** 1-3 sentences explaining objectives

**Example for Web Development:**
```json
{
  "title": "Month 1: HTML & CSS Fundamentals",
  "description": "Master HTML5 semantic elements and CSS3 styling. Learn flexbox and grid layouts. Build responsive static websites."
}
```

---

### `skills_to_learn` (Array of Strings) - REQUIRED
- **Type:** Array of Strings
- **Min Length:** 6
- **Max Length:** 10
- **Format:** Simple skill names

**Example for Web Development:**
```json
[
  "HTML5 & Semantic Elements",
  "CSS3 & Responsive Design",
  "JavaScript ES6+",
  "React.js",
  "Node.js & Express",
  "MongoDB",
  "REST API Design",
  "Git & GitHub"
]
```

**Example for Data Science:**
```json
[
  "Python Programming",
  "NumPy & Pandas",
  "Data Visualization (Matplotlib, Seaborn)",
  "Statistical Analysis",
  "Machine Learning Basics",
  "scikit-learn",
  "SQL & Databases",
  "Jupyter Notebooks"
]
```

---

### `recommended_projects` (Array of Objects) - REQUIRED
- **Type:** Array
- **Min Length:** 3
- **Max Length:** 5
- **Item Structure:**
  ```json
  {
    "title": "Project Name",
    "description": "What the project involves and teaches"
  }
  ```

**Example for Web Development:**
```json
[
  {
    "title": "Personal Portfolio Website",
    "description": "Build a responsive portfolio using HTML, CSS, and vanilla JavaScript. Showcase your projects, include contact form, and deploy on GitHub Pages or Netlify."
  },
  {
    "title": "Full-Stack Task Manager",
    "description": "Create a CRUD application with React frontend and Node.js/Express backend. Implement user authentication, database storage with MongoDB, and RESTful API design."
  },
  {
    "title": "E-commerce Product Page",
    "description": "Develop a dynamic product page with shopping cart functionality, image gallery, and responsive design. Focus on state management and API integration."
  }
]
```

---

## How Frontend Handles the Data

### Steps Display
```javascript
// Frontend extracts:
step.title → Displayed as <h3> heading
step.description → Displayed as <p> paragraph
index + 1 → Displayed as numbered circle badge
```

**Rendered HTML:**
```html
<div class="roadmap-step">
  <div class="step-number">1</div>
  <div class="step-content">
    <h3>Month 1: Foundation Building</h3>
    <p>Learn core concepts and fundamentals...</p>
  </div>
</div>
```

---

### Skills Display
```javascript
// Frontend uses each string directly
skills_to_learn[i] → Displayed as skill tag
```

**Rendered HTML:**
```html
<span class="skill-tag">HTML5</span>
<span class="skill-tag">CSS3</span>
<span class="skill-tag">JavaScript</span>
```

---

### Projects Display
```javascript
// Frontend extracts:
project.title → Displayed as <h4> heading
project.description → Displayed as <p> paragraph
```

**Rendered HTML:**
```html
<div class="project-card">
  <h4>Portfolio Website</h4>
  <p>Build a responsive personal portfolio...</p>
</div>
```

---

## Backend API Response

The `/api/generate-roadmap` endpoint returns:

```json
{
  "steps": [...],
  "skills_to_learn": [...],
  "recommended_projects": [...],
  "user_name": "John Doe",
  "career_path": "Web Development"
}
```

The `user_name` and `career_path` are added by the backend after receiving AI response.

---

## Error Handling

### Frontend Fallbacks

**If steps is empty or missing:**
```html
<p>No specific steps provided. Your roadmap is building!</p>
```

**If skills_to_learn is empty:**
- Entire "Skills to Master" section is hidden

**If recommended_projects is empty:**
- Entire "Recommended Projects" section is hidden

### Supported Formats

The frontend can handle:
1. **Standard format** (as specified above)
2. **String-only steps:** `["Step 1", "Step 2", ...]`
3. **String-only projects:** `["Project 1", "Project 2", ...]`
4. **Object skills:** `[{name: "Skill"}, ...]` (converts to string)

---

## Validation Checklist

✅ **Steps array has exactly 6 items**
✅ **Each step has both `title` and `description`**
✅ **Skills array has 6-10 items**
✅ **Each skill is a string**
✅ **Projects array has 3-5 items**
✅ **Each project has both `title` and `description`**
✅ **All descriptions are helpful and specific**
✅ **Content is relevant to the user's chosen career path**

---

## Example Complete Roadmap

### Web Development Career

```json
{
  "steps": [
    {
      "title": "Month 1: HTML & CSS Fundamentals",
      "description": "Master HTML5 semantic elements and CSS3 styling. Learn flexbox and grid layouts. Build 3-5 responsive static websites to practice."
    },
    {
      "title": "Month 2: JavaScript Essentials",
      "description": "Learn JavaScript ES6+ syntax, DOM manipulation, and event handling. Build interactive web components and understand async programming."
    },
    {
      "title": "Month 3: React.js & Modern Frontend",
      "description": "Build single-page applications with React. Master components, state management, hooks, and routing. Create a portfolio project."
    },
    {
      "title": "Month 4: Backend with Node.js",
      "description": "Learn server-side development with Node.js and Express. Build RESTful APIs, work with databases (MongoDB), and understand authentication."
    },
    {
      "title": "Month 5: Full-Stack Integration",
      "description": "Combine frontend and backend skills. Build complete MERN stack applications. Learn deployment strategies and DevOps basics."
    },
    {
      "title": "Month 6: Portfolio & Job Prep",
      "description": "Polish 3-4 strong portfolio projects. Prepare for technical interviews. Network on LinkedIn and apply to positions. Contribute to open source."
    }
  ],
  "skills_to_learn": [
    "HTML5 & Semantic Elements",
    "CSS3 & Responsive Design",
    "JavaScript ES6+",
    "React.js & Hooks",
    "Node.js & Express",
    "MongoDB & Mongoose",
    "REST API Design",
    "Git & GitHub",
    "Deployment (Vercel, Netlify)",
    "Testing (Jest, React Testing Library)"
  ],
  "recommended_projects": [
    {
      "title": "Personal Portfolio Website",
      "description": "Build a fully responsive portfolio showcasing your work. Use modern CSS animations, smooth scrolling, and contact form integration. Deploy on Netlify or Vercel."
    },
    {
      "title": "Full-Stack Task Management App",
      "description": "Create a MERN stack application with user authentication, CRUD operations, and real-time updates. Implement drag-and-drop functionality and data persistence."
    },
    {
      "title": "E-commerce Product Catalog",
      "description": "Develop a product listing page with filtering, sorting, and shopping cart. Integrate with a payment API (Stripe test mode) and implement responsive design."
    },
    {
      "title": "Weather Dashboard",
      "description": "Build a weather app using external APIs. Implement geolocation, data visualization with charts, and local storage for saved locations. Focus on async JavaScript and error handling."
    }
  ]
}
```

---

## Notes for AI (GPT-OSS 120B)

When generating roadmaps:
- Be specific and actionable
- Tailor content to user's experience level
- Include realistic timelines
- Suggest progression from basics to advanced
- Make project descriptions detailed enough to guide implementation
- Choose skills that are in-demand and relevant
- Ensure consistency between steps, skills, and projects
