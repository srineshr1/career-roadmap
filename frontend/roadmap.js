/**
 * Roadmap Calendar with Backend Integration
 * ==========================
 * Calendar block-based tracking view with MongoDB persistence
 */

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Convert backend roadmap data to calendar format
 */
function convertRoadmapToCalendar(roadmapData) {
    const roadmap = roadmapData.roadmap;
    const weeks = [];

    if (!roadmap || !roadmap.daily_tasks) {
        return { title: "No Roadmap", subtitle: "", weeks: [] };
    }

    // Group tasks by weeks
    const dailyTasks = roadmap.daily_tasks;
    let weekNum = 1;

    for (let i = 0; i < dailyTasks.length; i += 7) {
        const weekTasks = dailyTasks.slice(i, i + 7);
        const startDate = new Date(weekTasks[0].date);
        const endDate = new Date(weekTasks[weekTasks.length - 1].date);

        const week = {
            number: weekNum++,
            start_date: weekTasks[0].date,
            end_date: weekTasks[weekTasks.length - 1].date,
            startDate: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            endDate: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            days: weekTasks.map(dayData => {
                const tasksList = dayData.tasks || [];
                const completedCount = tasksList.filter(t => t.completed).length;
                const today = new Date().toISOString().split('T')[0];

                return {
                    date: new Date(dayData.date).getDate(),
                    fullDate: dayData.date,
                    day_name: dayData.day_name,
                    tasks: tasksList,
                    completed: completedCount,
                    total: tasksList.length,
                    isToday: dayData.date === today,
                    locked: new Date(dayData.date) > new Date()
                };
            })
        };

        weeks.push(week);
    }

    const userName = roadmapData.user_name || "User";
    const career = roadmapData.roadmap.career_path || "Career";

    return {
        title: `${userName}'s ${career} Roadmap`,
        subtitle: "6-Month Learning Journey",
        weeks
    };
}

class CalendarRoadmap {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.data = null;
        this.selectedDay = null;
        this.userName = localStorage.getItem('userName') || '';
    }

    async loadFromServer() {
        if (!this.userName) {
            this.showError("Please complete onboarding first");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/roadmap/${encodeURIComponent(this.userName)}`);

            if (response.status === 404) {
                this.showNoRoadmap();
                return;
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const roadmapData = await response.json();
            const calendarData = convertRoadmapToCalendar(roadmapData);
            this.load(calendarData);
        } catch (error) {
            console.error('Error loading roadmap:', error);
            this.showError("Failed to load roadmap. Please check your connection.");
        }
    }

    load(data) {
        this.data = data;
        this.render();
    }

    showNoRoadmap() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="roadmap-empty">
                <h2>No Roadmap Found</h2>
                <p>Complete the questionnaire on the Home page to generate your personalized roadmap.</p>
                <button class="btn btn-primary" onclick="document.querySelector('[data-page=\\'home\\']').click()">
                    Go to Questionnaire
                </button>
            </div>
        `;
    }

    showError(message) {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="roadmap-error">
                <h2>Error</h2>
                <p>${message}</p>
            </div>
        `;
    }

    render() {
        if (!this.container || !this.data) return;

        const stats = this.calculateStats();

        this.container.innerHTML = `
            <div class="roadmap-template">
                <header class="roadmap-header">
                    <h1 class="roadmap-title">${this.data.title}</h1>
                    <p class="roadmap-subtitle">${this.data.subtitle}</p>
                </header>

                <div class="roadmap-overview">
                    <div class="overview-card highlight">
                        <div class="overview-value">${stats.completed}</div>
                        <div class="overview-label">Completed</div>
                    </div>
                    <div class="overview-card">
                        <div class="overview-value">${stats.remaining}</div>
                        <div class="overview-label">Remaining</div>
                    </div>
                    <div class="overview-card">
                        <div class="overview-value">${stats.progress}%</div>
                        <div class="overview-label">Progress</div>
                    </div>
                    <div class="overview-card">
                        <div class="overview-value">${stats.streak}</div>
                        <div class="overview-label">Day Streak</div>
                    </div>
                </div>

                <div class="calendar-container">
                    <div class="calendar-header">
                        <h2 class="calendar-title">Learning Schedule</h2>
                        <div class="calendar-nav">
                            <button class="nav-btn" data-nav="prev">←</button>
                            <button class="nav-btn" data-nav="next">→</button>
                        </div>
                    </div>

                    <div class="weekdays-header">
                        <div></div>
                        <div class="weekdays-labels">
                            <div class="weekday-label">Mon</div>
                            <div class="weekday-label">Tue</div>
                            <div class="weekday-label">Wed</div>
                            <div class="weekday-label">Thu</div>
                            <div class="weekday-label">Fri</div>
                            <div class="weekday-label">Sat</div>
                            <div class="weekday-label">Sun</div>
                        </div>
                    </div>

                    <div class="weeks-grid">
                        ${this.data.weeks.map(week => this.renderWeek(week)).join('')}
                    </div>

                    <div class="calendar-legend">
                        <div class="legend-item">
                            <div class="legend-dot completed"></div>
                            <span>Completed</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-dot partial"></div>
                            <span>In Progress</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-dot today"></div>
                            <span>Today</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-dot empty"></div>
                            <span>Upcoming</span>
                        </div>
                    </div>
                </div>

                <div class="task-modal" id="taskModal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 class="modal-title" id="modalTitle">Tasks</h3>
                            <button class="modal-close" id="modalClose">✕</button>
                        </div>
                        <div class="modal-body">
                            <div class="task-list" id="taskList"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachEvents();
    }

    renderWeek(week) {
        return `
            <div class="week-row">
                <div class="week-label">
                    <div class="week-number">Week ${week.number}</div>
                    <div class="week-dates">${week.startDate} - ${week.endDate}</div>
                </div>
                <div class="days-grid">
                    ${week.days.map(day => this.renderDay(day, week.number)).join('')}
                </div>
            </div>
        `;
    }

    renderDay(day, weekNum) {
        let statusClass = '';
        if (day.locked) statusClass = 'locked';
        else if (day.isToday) statusClass = 'today';
        else if (day.total > 0 && day.completed === day.total) statusClass = 'completed';
        else if (day.completed > 0) statusClass = 'partial';

        return `
            <div class="day-block ${statusClass}" data-week="${weekNum}" data-date="${day.fullDate}">
                <div class="day-header">
                    <span class="day-number">${day.date}</span>
                    <span class="day-status"></span>
                </div>
                <div class="day-content">
                    ${day.tasks.slice(0, 2).map(t => `<div class="day-task">${t.title}</div>`).join('')}
                    ${day.tasks.length > 2 ? `<div class="day-more">+${day.tasks.length - 2} more</div>` : ''}
                </div>
            </div>
        `;
    }

    calculateStats() {
        let completed = 0, total = 0, streak = 0;
        this.data.weeks.forEach(w => {
            w.days.forEach(d => {
                total += d.total;
                completed += d.completed;
            });
        });
        // Simple streak calculation
        for (const week of this.data.weeks) {
            for (const day of week.days) {
                if (day.total > 0 && day.completed === day.total) streak++;
                else if (day.total > 0 && day.completed < day.total) break;
            }
        }
        return {
            completed,
            remaining: total - completed,
            progress: total > 0 ? Math.round((completed / total) * 100) : 0,
            streak
        };
    }

    attachEvents() {
        // Day click
        this.container.querySelectorAll('.day-block:not(.locked)').forEach(block => {
            block.addEventListener('click', () => {
                const date = block.dataset.date;
                this.openDayModal(date);
            });
        });

        // Modal close
        document.getElementById('modalClose')?.addEventListener('click', () => {
            document.getElementById('taskModal').classList.remove('open');
        });

        document.getElementById('taskModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') {
                e.target.classList.remove('open');
            }
        });
    }

    openDayModal(date) {
        // Find the day data
        let dayData = null;
        for (const week of this.data.weeks) {
            dayData = week.days.find(d => d.fullDate === date);
            if (dayData) break;
        }

        if (!dayData || dayData.tasks.length === 0) return;

        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });

        document.getElementById('modalTitle').textContent = `${formattedDate} Tasks`;
        document.getElementById('taskList').innerHTML = dayData.tasks.map((task, i) => `
            <div class="task-item ${task.completed ? 'done' : ''}" data-task-id="${task.id}" data-date="${date}">
                <div class="task-checkbox">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <div class="task-content">
                    <span class="task-name">${task.title}</span>
                    <span class="task-desc">${task.description || ''}</span>
                    ${task.duration ? `<span class="task-meta">⏱ ${task.duration}</span>` : ''}
                </div>
            </div>
        `).join('');

        // Attach checkbox events
        this.attachTaskCheckboxEvents();

        document.getElementById('taskModal').classList.add('open');
    }

    attachTaskCheckboxEvents() {
        document.querySelectorAll('.task-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                const taskId = item.dataset.taskId;
                const date = item.dataset.date;
                const wasCompleted = item.classList.contains('done');
                const newCompleted = !wasCompleted;

                // Optimistic UI update
                if (newCompleted) {
                    item.classList.add('done');
                } else {
                    item.classList.remove('done');
                }

                // Update server
                try {
                    const response = await fetch(`${API_BASE_URL}/update-task`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: this.userName,
                            date,
                            task_id: taskId,
                            completed: newCompleted
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to update task');
                    }

                    // Reload roadmap to update stats
                    await this.loadFromServer();

                } catch (error) {
                    console.error('Error updating task:', error);
                    // Revert UI on error
                    if (newCompleted) {
                        item.classList.remove('done');
                    } else {
                        item.classList.add('done');
                    }
                    alert('Failed to update task. Please try again.');
                }
            });
        });
    }
}

// Initialize when roadmap page is viewed
function initRoadmap() {
    const container = document.getElementById('roadmapContainer');
    if (container) {
        window.calendarRoadmap = new CalendarRoadmap('roadmapContainer');

        // Load from server if user is logged in
        const userName = localStorage.getItem('userName');
        if (userName) {
            window.calendarRoadmap.loadFromServer();
        }
    }
}

// Initialize on navigation to roadmap page
document.addEventListener('DOMContentLoaded', () => {
    // Listen for navigation to roadmap page
    document.querySelectorAll('[data-page="roadmap"]').forEach(navItem => {
        navItem.addEventListener('click', () => {
            setTimeout(() => {
                initRoadmap();
            }, 100);
        });
    });
});

// Also initialize if we're already on the page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRoadmap);
} else {
    initRoadmap();
}
