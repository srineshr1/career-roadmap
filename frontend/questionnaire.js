/**
 * Orvia — Dynamic Questionnaire Engine  
 * ======================================
 * AI-generated personalized questions
 */

// =============================================
// DYNAMIC QUESTIONNAIRE - AI Generated Questions
// =============================================
class DynamicQuestionnaireEngine {
    constructor() {
        this.messages = [];
        this.currentQuestion = null;
        this.selectedAnswer = null;
        this.questionCount = 0;
        this.maxQuestions = 8;
        this.userName = localStorage.getItem('userName');
        this.career = localStorage.getItem('career');
        this.level = localStorage.getItem('level');
    }

    async init() {
        // Start with first AI-generated question
        await this.loadFirstQuestion();
    }

    async loadFirstQuestion() {
        const container = document.getElementById('questionnaireContainer');

        // Show loading state
        container.innerHTML = `
            <div class="loading-state" style="text-align: center; padding: 3rem;">
                <div class="loading-spinner" style="width: 50px; height: 50px; border: 4px solid #27272a; border-top: 4px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1.5rem;"></div>
                <p style="color: var(--text-secondary);">Preparing your personalized questions...</p>
            </div>
        `;

        try {
            // Start conversation with AI
            const response = await fetch('http://localhost:5000/api/next-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [],
                    user_answer: `I'm interested in ${this.career} at ${this.level} level`,
                    career: this.career,
                    level: this.level
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get first question');
            }

            const data = await response.json();
            this.currentQuestion = data;
            this.questionCount++;
            this.renderQuestion();

        } catch (error) {
            console.error('Error loading question:', error);
            container.innerHTML = `
                <div class="error-state" style="text-align: center; padding: 2rem;">
                    <h3 style="color: #dc2626; margin-bottom: 1rem;">Error Loading Questions</h3>
                    <p style="margin-bottom: 1.5rem; color: var(--text-secondary);">${error.message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">Retry</button>
                </div>
            `;
        }
    }

    renderQuestion() {
        const container = document.getElementById('questionnaireContainer');

        container.innerHTML = `
            <div class="question-wrapper">
                <p class="question-text">${this.currentQuestion.question}</p>
                
                <div class="answer-options" id="answerOptions">
                    ${this.currentQuestion.options.map((option, index) => `
                        <button class="answer-btn" data-answer="${option}">
                            ${option}
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="question-nav">
                <button class="btn btn-ghost" id="prevQuestionBtn" ${this.messages.length === 0 ? 'disabled' : ''}>
                    Previous
                </button>
                <span class="question-progress">${this.questionCount} / ${this.maxQuestions}</span>
                <button class="btn btn-primary" id="nextQuestionBtn" disabled>
                    ${this.questionCount >= this.maxQuestions || this.currentQuestion.status === 'FINISH' ? 'Generate Roadmap' : 'Next'}
                </button>
            </div>
        `;

        this.attachAnswerEvents();
        this.attachNavEvents();
    }

    attachAnswerEvents() {
        const optionsEl = document.getElementById('answerOptions');
        if (!optionsEl) return;

        optionsEl.addEventListener('click', (e) => {
            const btn = e.target.closest('.answer-btn');
            if (!btn) return;

            // Update selection
            optionsEl.querySelectorAll('.answer-btn').forEach(b => {
                b.classList.remove('selected');
            });
            btn.classList.add('selected');

            // Save answer
            this.selectedAnswer = btn.dataset.answer;

            // Enable next button
            document.getElementById('nextQuestionBtn').disabled = false;
        });
    }

    attachNavEvents() {
        const prevBtn = document.getElementById('prevQuestionBtn');
        const nextBtn = document.getElementById('nextQuestionBtn');

        if (prevBtn) {
            prevBtn.onclick = () => alert('Going back is not yet implemented. Please continue forward.');
        }

        if (nextBtn) {
            nextBtn.onclick = () => this.nextQuestion();
        }
    }

    async nextQuestion() {
        if (!this.selectedAnswer) {
            alert('Please select an answer');
            return;
        }

        // Save current Q&A
        this.messages.push({
            q: this.currentQuestion.question,
            a: this.selectedAnswer
        });

        // Check if we should finish
        if (this.questionCount >= this.maxQuestions || this.currentQuestion.status === 'FINISH') {
            await this.completeQuestionnaire();
            return;
        }

        // Load next question
        await this.loadNextQuestion();
    }

    async loadNextQuestion() {
        const container = document.getElementById('questionnaireContainer');

        // Show loading state
        container.innerHTML = `
            <div class="loading-state" style="text-align: center; padding: 3rem;">
                <div class="loading-spinner" style="width: 50px; height: 50px; border: 4px solid #27272a; border-top: 4px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1.5rem;"></div>
                <p style="color: var(--text-secondary);">Loading next question...</p>
            </div>
        `;

        try {
            const response = await fetch('http://localhost:5000/api/next-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: this.messages,
                    user_answer: this.selectedAnswer,
                    career: this.career,
                    level: this.level
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get next question');
            }

            const data = await response.json();
            this.currentQuestion = data;
            this.questionCount++;
            this.selectedAnswer = null;
            this.renderQuestion();

        } catch (error) {
            console.error('Error loading next question:', error);
            await this.completeQuestionnaire();
        }
    }

    async completeQuestionnaire() {
        const container = document.getElementById('questionnaireContainer');

        try {
            // Show loading state
            container.innerHTML = `
                <div class="loading-state" style="text-align: center; padding: 3rem;">
                    <div class="loading-spinner" style="width: 60px; height: 60px; border: 5px solid #27272a; border-top: 5px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1.5rem;"></div>
                    <h3 style="margin-bottom: 0.5rem;">Generating Your Personalized Roadmap...</h3>
                    <p style="color: var(--text-secondary);">This may take a moment as we create a custom 6-month learning plan just for you.</p>
                </div>
            `;

            // Generate roadmap from backend
            const response = await fetch('http://localhost:5000/api/generate-roadmap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: this.messages,
                    name: this.userName,
                    career: this.career
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate roadmap');
            }

            const roadmapData = await response.json();

            // Save roadmap to MongoDB
            const saveResponse = await fetch('http://localhost:5000/api/save-roadmap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: this.userName,
                    roadmap: roadmapData
                })
            });

            if (!saveResponse.ok) {
                throw new Error('Failed to save roadmap');
            }

            // Show success message
            container.innerHTML = `
                <div class="success-state" style="text-align: center; padding: 3rem;">
                    <div class="success-icon" style="width: 60px; height: 60px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1.5rem;">✓</div>
                    <h3 style="margin-bottom: 0.5rem;">Roadmap Generated Successfully!</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Your personalized 6-month learning plan is ready.</p>
                    <button class="btn btn-primary" id="viewRoadmapBtn">View My Roadmap</button>
                </div>
            `;

            // Navigate to roadmap page
            document.getElementById('viewRoadmapBtn').addEventListener('click', () => {
                document.querySelector('[data-page="roadmap"]').click();
            });

        } catch (error) {
            console.error('Error generating roadmap:', error);
            container.innerHTML = `
                <div class="error-state" style="text-align: center; padding: 2rem;">
                    <h3 style="color: #dc2626; margin-bottom: 1rem;">Error Generating Roadmap</h3>
                    <p style="margin-bottom: 0.5rem;">${error.message}</p>
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Please check that the backend server is running and try again.</p>
                    <button class="btn btn-primary" onclick="location.reload()">Retry</button>
                </div>
            `;
        }
    }
}

// =============================================
// INIT - Initialize Dynamic Questionnaire
// =============================================
function initDynamicQuestionnaire() {
    const container = document.getElementById('questionnaireContainer');
    if (container && localStorage.getItem('userName')) {
        window.dynamicQuestionnaire = new DynamicQuestionnaireEngine();
        window.dynamicQuestionnaire.init();
    }
}

// Initialize when dashboard is shown
document.addEventListener('DOMContentLoaded', () => {
    // Wait for user to be logged in
    setTimeout(() => {
        if (localStorage.getItem('userName')) {
            initDynamicQuestionnaire();
        }
    }, 500);
});

// Add CSS animation for spinner
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);
