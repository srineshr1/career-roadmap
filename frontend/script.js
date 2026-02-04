/**
 * Orvia — Personalized Learning Onboarding with AI Integration
 * =============================================================
 * Connected to Flask backend using GPT-OSS 120B for dynamic Q&A
 */

// =============================================
// Configuration
// =============================================
const API_BASE_URL = 'http://localhost:5000/api';

// =============================================
// State
// =============================================
const state = {
    currentStep: 1,
    name: '',
    career: '',
    messages: [],  // Track Q&A history
    currentQuestion: '',
    currentOptions: [],
    isLoading: false,
    activeView: 'onboarding'  // 'onboarding', 'questions', 'roadmap'
};

// Career display names
const careerNames = {
    'web': 'Web Development',
    'mobile': 'Mobile Development',
    'data': 'Data Science / ML',
    'devops': 'DevOps / Cloud'
};

// =============================================
// DOM Elements
// =============================================
const steps = {
    1: document.getElementById('step1'),
    2: document.getElementById('step2'),
    3: document.getElementById('step3')
};

const progressBar = document.getElementById('progressBar');
const nameInput = document.getElementById('nameInput');
const continueBtn = document.getElementById('continueBtn');
const displayName = document.getElementById('displayName');
const careerOptions = document.getElementById('careerOptions');
const backBtn = document.getElementById('backBtn');
const viewRoadmapBtn = document.getElementById('viewRoadmapBtn');

// =============================================
// API Functions
// =============================================
async function apiCall(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

async function startSession() {
    return await apiCall('/start', 'POST', {
        name: state.name,
        career: careerNames[state.career]
    });
}

async function getNextQuestion(userAnswer) {
    return await apiCall('/next-question', 'POST', {
        messages: state.messages,
        user_answer: userAnswer
    });
}

async function generateRoadmap() {
    return await apiCall('/generate-roadmap', 'POST', {
        messages: state.messages,
        name: state.name,
        career: careerNames[state.career]
    });
}

// =============================================
// Progress Bar
// =============================================
function updateProgress() {
    const progress = ((state.currentStep - 1) / 2) * 100;
    progressBar.style.width = `${progress}%`;
}

// =============================================
// Step Transitions
// =============================================
function goToStep(stepNumber) {
    const currentStepEl = steps[state.currentStep];
    currentStepEl.classList.add('exit');

    setTimeout(() => {
        currentStepEl.classList.remove('active', 'exit');
        state.currentStep = stepNumber;
        updateProgress();
        steps[stepNumber].classList.add('active');

        if (stepNumber === 1) {
            nameInput.focus();
        }
    }, 300);
}

// =============================================
// Step 1: Name Input
// =============================================
function handleNameInput() {
    const value = nameInput.value.trim();
    state.name = value;
    continueBtn.disabled = value.length === 0;
}

function handleContinue() {
    if (state.name.length === 0) return;
    displayName.textContent = state.name;
    goToStep(2);
}

// =============================================
// Step 2: Career Selection
// =============================================
async function handleCareerSelect(careerKey) {
    state.career = careerKey;

    // Visual feedback
    document.querySelectorAll('.career-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');

    // Short delay then proceed to AI-powered questions
    setTimeout(async () => {
        await startQuestionFlow();
    }, 300);
}

function handleBack() {
    goToStep(1);
    nameInput.focus();
}

// =============================================
// Dynamic Question Flow (GPT-OSS 120B)
// =============================================
async function startQuestionFlow() {
    try {
        state.isLoading = true;

        // Hide step 2, create question interface
        steps[2].classList.remove('active');
        createQuestionInterface();

        // Get first question from backend
        const firstQuestion = await startSession();

        // Store and display the question
        state.currentQuestion = firstQuestion.question;
        state.currentOptions = firstQuestion.options;

        displayQuestion(firstQuestion.question, firstQuestion.options);

    } catch (error) {
        console.error('Error starting question flow:', error);
        alert('Failed to start AI questions. Please check if backend is running.');
        goToStep(2);
    } finally {
        state.isLoading = false;
    }
}

function createQuestionInterface() {
    // Create a new question container
    let questionContainer = document.getElementById('questionContainer');

    if (!questionContainer) {
        questionContainer = document.createElement('div');
        questionContainer.id = 'questionContainer';
        questionContainer.className = 'question-container';
        questionContainer.innerHTML = `
            <div class="card">
                <div class="card-content">
                    <div class="question-progress" id="questionProgress"></div>
                    <h2 class="question-text" id="questionText"></h2>
                    <div class="options-container" id="optionsContainer"></div>
                    <div class="loading-indicator" id="loadingIndicator" style="display: none;">
                        <div class="spinner"></div>
                        <p>AI is thinking...</p>
                    </div>
                </div>
            </div>
        `;
        document.querySelector('.main-container').appendChild(questionContainer);
    }

    questionContainer.classList.add('active');
}

function displayQuestion(question, options) {
    const questionText = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    const questionProgress = document.getElementById('questionProgress');

    questionText.textContent = question;
    questionProgress.textContent = `Question ${state.messages.length + 1}`;

    // Clear previous options
    optionsContainer.innerHTML = '';

    // Add new options
    options.forEach((option, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'option-btn';
        optionBtn.textContent = option;
        optionBtn.onclick = () => handleAnswerSelect(option);
        optionsContainer.appendChild(optionBtn);
    });
}

async function handleAnswerSelect(answer) {
    try {
        // Store the Q&A pair
        state.messages.push({
            q: state.currentQuestion,
            a: answer
        });

        // Show loading
        document.getElementById('loadingIndicator').style.display = 'block';
        document.getElementById('optionsContainer').style.opacity = '0.5';

        // Get next question from AI
        const response = await getNextQuestion(answer);

        // Check if we should finish
        if (response.status === 'FINISH' || state.messages.length >= 10) {
            await showRoadmapGeneration();
        } else {
            // Update and display next question
            state.currentQuestion = response.question;
            state.currentOptions = response.options;
            displayQuestion(response.question, response.options);
        }

    } catch (error) {
        console.error('Error getting next question:', error);
        alert('Failed to get next question. Please try again.');
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
        document.getElementById('optionsContainer').style.opacity = '1';
    }
}

// =============================================
// Roadmap Generation
// =============================================
async function showRoadmapGeneration() {
    const questionContainer = document.getElementById('questionContainer');
    questionContainer.innerHTML = `
        <div class="card">
            <div class="card-content completion-content">
                <div class="success-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </div>
                <h1 class="card-title">Generating Your Roadmap...</h1>
                <p class="card-subtitle">AI is creating a personalized learning path for you</p>
                <div class="loading-indicator">
                    <div class="spinner"></div>
                    <p>Please wait...</p>
                </div>
            </div>
        </div>
    `;

    try {
        const roadmap = await generateRoadmap();
        displayRoadmap(roadmap);
    } catch (error) {
        console.error('Error generating roadmap:', error);
        alert('Failed to generate roadmap. Please try again.');
    }
}

function displayRoadmap(roadmap) {
    const questionContainer = document.getElementById('questionContainer');

    // Debug logging
    console.log('Received roadmap:', roadmap);
    console.log('Roadmap type:', typeof roadmap);
    console.log('Steps:', roadmap.steps);
    console.log('Skills:', roadmap.skills_to_learn);
    console.log('Projects:', roadmap.recommended_projects);

    // Build steps HTML
    let stepsHTML = '';
    if (roadmap.steps && Array.isArray(roadmap.steps) && roadmap.steps.length > 0) {
        stepsHTML = roadmap.steps.map((step, index) => {
            // Handle both object and string formats
            const title = typeof step === 'object' ? (step.title || `Step ${index + 1}`) : step;
            const description = typeof step === 'object' ? (step.description || '') : '';

            return `
                <div class="roadmap-step">
                    <div class="step-number">${index + 1}</div>
                    <div class="step-content">
                        <h3>${title}</h3>
                        ${description ? `<p>${description}</p>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    } else {
        stepsHTML = '<p>No specific steps provided. Your roadmap is building!</p>';
    }

    // Build skills HTML
    let skillsHTML = '';
    if (roadmap.skills_to_learn && Array.isArray(roadmap.skills_to_learn) && roadmap.skills_to_learn.length > 0) {
        skillsHTML = roadmap.skills_to_learn.map(skill => {
            // Handle both object and string formats
            const skillName = typeof skill === 'object' ? (skill.name || skill.title || JSON.stringify(skill)) : skill;
            return `<span class="skill-tag">${skillName}</span>`;
        }).join('');
    }

    // Build projects HTML
    let projectsHTML = '';
    if (roadmap.recommended_projects && Array.isArray(roadmap.recommended_projects) && roadmap.recommended_projects.length > 0) {
        projectsHTML = roadmap.recommended_projects.map(project => {
            // Handle both object and string formats
            const title = typeof project === 'object' ? (project.title || project.name || 'Project') : project;
            const description = typeof project === 'object' ? (project.description || '') : '';

            return `
                <div class="project-card">
                    <h4>${title}</h4>
                    ${description ? `<p>${description}</p>` : ''}
                </div>
            `;
        }).join('');
    }

    questionContainer.innerHTML = `
        <div class="roadmap-display">
            <div class="roadmap-header">
                <h1>🎯 Your Personalized Career Roadmap</h1>
                <p>Hello ${state.name}! Here's your path to mastering ${careerNames[state.career]}</p>
            </div>
            
            <div class="roadmap-section">
                <h2>📚 Learning Path</h2>
                <div class="roadmap-steps">
                    ${stepsHTML}
                </div>
            </div>
            
            ${skillsHTML ? `
                <div class="roadmap-section">
                    <h2>💡 Skills to Master</h2>
                    <div class="skills-container">
                        ${skillsHTML}
                    </div>
                </div>
            ` : ''}
            
            ${projectsHTML ? `
                <div class="roadmap-section">
                    <h2>🚀 Recommended Projects</h2>
                    <div class="projects-container">
                        ${projectsHTML}
                    </div>
                </div>
            ` : ''}
            
            <div class="roadmap-actions">
                <button class="btn-primary" onclick="downloadRoadmap()">
                    Download PDF
                </button>
                <button class="btn-secondary" onclick="location.reload()">
                    Start Over
                </button>
            </div>
        </div>
    `;
}

function downloadRoadmap() {
    alert('PDF download feature coming soon!');
}

// =============================================
// Event Listeners
// =============================================
nameInput.addEventListener('input', handleNameInput);
nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !continueBtn.disabled) {
        handleContinue();
    }
});

continueBtn.addEventListener('click', handleContinue);

careerOptions.addEventListener('click', (e) => {
    const btn = e.target.closest('.career-btn');
    if (btn) {
        handleCareerSelect(btn.dataset.career);
    }
});

backBtn.addEventListener('click', handleBack);

// =============================================
// Initialize
// =============================================
updateProgress();
nameInput.focus();

console.log('Orvia AI-powered onboarding initialized');
console.log('Backend API:', API_BASE_URL);
