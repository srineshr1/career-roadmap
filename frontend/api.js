/**
 * API Client for Career Roadmap Scout Backend
 * Handles all communication with Flask backend
 */

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * HTTP request helper
 */
async function apiRequest(endpoint, options = {}) {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
}

/**
 * Health check
 */
export async function checkHealth() {
    return apiRequest('/health');
}

/**
 * Create or get user by name
 * @param {string} name - User's name
 * @param {string} career - Career path (web, mobile, data, devops)
 * @param {string} level - Experience level (beginner, intermediate, advanced)
 */
export async function createUser(name, career, level) {
    return apiRequest('/user/create', {
        method: 'POST',
        body: JSON.stringify({ name, career, level })
    });
}

/**
 * Get next question in questionnaire flow
 * @param {Array} messages - Previous Q&A history
 * @param {string} userAnswer - User's latest answer
 */
export async function getNextQuestion(messages, userAnswer) {
    return apiRequest('/next-question', {
        method: 'POST',
        body: JSON.stringify({ messages, user_answer: userAnswer })
    });
}

/**
 * Generate personalized roadmap
 * @param {Array} messages - All Q&A history
 * @param {string} name - User's name
 * @param {string} career - Career path
 */
export async function generateRoadmap(messages, name, career) {
    return apiRequest('/generate-roadmap', {
        method: 'POST',
        body: JSON.stringify({ messages, name, career })
    });
}

/**
 * Save roadmap to MongoDB
 * @param {string} name - User's name
 * @param {Object} roadmap - Roadmap data
 */
export async function saveRoadmap(name, roadmap) {
    return apiRequest('/save-roadmap', {
        method: 'POST',
        body: JSON.stringify({ name, roadmap })
    });
}

/**
 * Get user's roadmap from MongoDB
 * @param {string} userName - User's name
 */
export async function getRoadmap(userName) {
    return apiRequest(`/roadmap/${encodeURIComponent(userName)}`);
}

/**
 * Update task completion status
 * @param {string} name - User's name
 * @param {string} date - Task date (YYYY-MM-DD)
 * @param {string} taskId - Task identifier
 * @param {boolean} completed - Completion status
 */
export async function updateTaskStatus(name, date, taskId, completed) {
    return apiRequest('/update-task', {
        method: 'PATCH',
        body: JSON.stringify({ name, date, task_id: taskId, completed })
    });
}

/**
 * Get user statistics
 * @param {string} userName - User's name
 */
export async function getUserStatistics(userName) {
    return apiRequest(`/statistics/${encodeURIComponent(userName)}`);
}

// Export default object with all methods
export default {
    checkHealth,
    createUser,
    getNextQuestion,
    generateRoadmap,
    saveRoadmap,
    getRoadmap,
    updateTaskStatus,
    getUserStatistics
};
