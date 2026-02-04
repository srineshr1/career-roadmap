/**
 * Progress Page - Real-time Data Sync with MongoDB
 * Displays actual user progress statistics
 */

const API_BASE_URL = 'http://localhost:5000/api';

async function loadProgressData() {
    const userName = localStorage.getItem('userName');

    if (!userName) {
        console.log('No user logged in');
        return;
    }

    try {
        // Fetch user's roadmap to calculate progress
        const roadmapResponse = await fetch(`${API_BASE_URL}/roadmap/${encodeURIComponent(userName)}`);

        if (!roadmapResponse.ok) {
            console.error('No roadmap found');
            return;
        }

        const roadmapData = await roadmapResponse.json();
        const roadmap = roadmapData.roadmap;

        if (!roadmap || !roadmap.daily_tasks) {
            return;
        }

        // Calculate statistics
        let totalTasks = 0;
        let completedTasks = 0;
        let todayTasks = 0;
        let todayCompleted = 0;
        const today = new Date().toISOString().split('T')[0];

        // Weekly activity tracking
        const weeklyActivity = {
            Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0
        };

        roadmap.daily_tasks.forEach(day => {
            const tasks = day.tasks || [];
            totalTasks += tasks.length;

            tasks.forEach(task => {
                if (task.completed) {
                    completedTasks++;

                    // Track weekly activity
                    const date = new Date(day.date);
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    if (weeklyActivity[dayName] !== undefined) {
                        weeklyActivity[dayName]++;
                    }
                }
            });

            // Track today's tasks
            if (day.date === today) {
                todayTasks = tasks.length;
                todayCompleted = tasks.filter(t => t.completed).length;
            }
        });

        // Calculate streak
        let streak = 0;
        for (const day of roadmap.daily_tasks) {
            const tasks = day.tasks || [];
            if (tasks.length > 0) {
                const allCompleted = tasks.every(t => t.completed);
                if (allCompleted) {
                    streak++;
                } else if (tasks.some(t => t.completed)) {
                    // Partial completion breaks streak
                    break;
                } else {
                    break;
                }
            }
        }

        // Update UI
        document.getElementById('totalCompleted').textContent = completedTasks;
        document.getElementById('currentStreak').textContent = streak;

        // Calculate estimated hours (assuming each task takes 1 hour on average)
        const hoursLearned = completedTasks * 1.5; // 1.5 hours per task average
        document.getElementById('hoursLearned').textContent = hoursLearned.toFixed(1);

        // Badges earned (simple calculation: 1 badge per 10 completed tasks)
        const badgesEarned = Math.floor(completedTasks / 10);
        document.getElementById('badgesEarned').textContent = badgesEarned;

        // Update weekly activity chart
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const chartBars = document.querySelectorAll('.activity-chart .chart-bar');
        const maxActivity = Math.max(...Object.values(weeklyActivity), 1);

        chartBars.forEach((bar, index) => {
            const day = days[index];
            const value = weeklyActivity[day];
            const height = (value / maxActivity) * 100;
            bar.style.setProperty('--height', `${Math.max(height, 5)}%`);
            bar.setAttribute('data-value', value);
        });

        // Update progress section
        const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Overall completion
        document.querySelector('.progress-item:nth-child(1) .progress-percent').textContent = `${completionPercent}%`;
        document.querySelector('.progress-item:nth-child(1) .progress-fill').style.width = `${completionPercent}%`;

        // Group tasks by weeks for section progress
        const weeksCount = Math.ceil(roadmap.daily_tasks.length / 7);
        const progressContainer = document.querySelector('.progress-columns .section-card:first-child');

        // Clear existing progress items (except the first one)
        const progressItems = progressContainer.querySelectorAll('.progress-item');
        progressItems.forEach((item, index) => {
            if (index > 0) item.remove();
        });

        // Add week-based progress
        for (let i = 0; i < Math.min(weeksCount, 4); i++) {
            const weekStart = i * 7;
            const weekEnd = Math.min((i + 1) * 7, roadmap.daily_tasks.length);
            const weekDays = roadmap.daily_tasks.slice(weekStart, weekEnd);

            let weekTotal = 0;
            let weekCompleted = 0;

            weekDays.forEach(day => {
                const tasks = day.tasks || [];
                weekTotal += tasks.length;
                weekCompleted += tasks.filter(t => t.completed).length;
            });

            const weekPercent = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

            const progressItem = document.createElement('div');
            progressItem.className = 'progress-item';
            progressItem.innerHTML = `
                <div class="progress-label">
                    <span>Week ${i + 1}: Days ${weekStart + 1}-${weekEnd}</span>
                    <span class="progress-percent">${weekPercent}%</span>
                </div>
                <div class="progress-track ${weekPercent === 100 ? 'complete' : ''}">
                    <div class="progress-fill" style="width: ${weekPercent}%"></div>
                </div>
            `;
            progressContainer.appendChild(progressItem);
        }

        // Update recent activity
        updateRecentActivity(roadmap.daily_tasks);

    } catch (error) {
        console.error('Error loading progress data:', error);
    }
}

function updateRecentActivity(dailyTasks) {
    const activityFeed = document.querySelector('.activity-feed');
    activityFeed.innerHTML = '';

    // Get recently completed tasks
    const recentTasks = [];

    dailyTasks.forEach(day => {
        (day.tasks || []).forEach(task => {
            if (task.completed) {
                recentTasks.push({
                    title: task.title,
                    date: day.date,
                    priority: task.priority
                });
            }
        });
    });

    // Sort by date (most recent first) and take top 5
    recentTasks.sort((a, b) => new Date(b.date) - new Date(a.date));
    const topRecent = recentTasks.slice(0, 5);

    if (topRecent.length === 0) {
        activityFeed.innerHTML = '<p class="text-muted">No activity yet. Start completing tasks!</p>';
        return;
    }

    topRecent.forEach(task => {
        const date = new Date(task.date);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let timeAgo = '';
        if (diffDays === 0) timeAgo = 'Today';
        else if (diffDays === 1) timeAgo = 'Yesterday';
        else if (diffDays < 7) timeAgo = `${diffDays} days ago`;
        else timeAgo = date.toLocaleDateString();

        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon green">✓</div>
            <div class="activity-content">
                <span class="activity-text">Completed "${task.title}"</span>
                <span class="activity-time">${timeAgo}</span>
            </div>
        `;
        activityFeed.appendChild(activityItem);
    });
}

// Load progress data when page is navigated to
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-page="progress"]').forEach(navItem => {
        navItem.addEventListener('click', () => {
            setTimeout(loadProgressData, 100);
        });
    });
});

// Auto-load on page load if on progress page
if (document.readyState === 'complete') {
    const progressPage = document.getElementById('progressPage');
    if (progressPage && progressPage.classList.contains('active')) {
        loadProgressData();
    }
}
