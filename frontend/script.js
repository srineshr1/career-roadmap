/**
 * Orvia — Professional UI with Dashboard
 */

const state = { step: 1, name: '', career: '', level: '' };

const labels = {
    career: { web: 'Web Development', mobile: 'Mobile Development', data: 'Data Science & ML', devops: 'DevOps & Cloud' },
    level: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }
};

const $ = id => document.getElementById(id);
const steps = { 1: $('step1'), 2: $('step2'), 3: $('step3') };

// =============================================
// RETURNING USER AUTO-LOGIN
// =============================================
async function checkReturningUser() {
    const savedName = localStorage.getItem('userName');
    const savedCareer = localStorage.getItem('career');
    const savedLevel = localStorage.getItem('level');

    if (savedName && savedCareer && savedLevel) {
        console.log('Returning user detected:', savedName);

        // Set state from localStorage
        state.name = savedName;
        state.career = savedCareer;
        state.level = savedLevel;

        // Show dashboard directly
        await showDashboard();
        return true;
    }
    return false;
}

// Check for returning user on page load
document.addEventListener('DOMContentLoaded', async () => {
    const isReturning = await checkReturningUser();
    if (isReturning) {
        console.log('Skipped onboarding for returning user');
    }
});


// =============================================
// ONBOARDING
// =============================================
function updateProgress() {
    $('progressBar').style.width = `${((state.step - 1) / 3) * 100}%`;
    $('stepLabel').textContent = `Step ${state.step} of 3`;
}

function goTo(n) {
    steps[state.step].classList.remove('active');
    state.step = n;
    steps[n].classList.add('active');
    updateProgress();
}

// Step 1
$('nameInput').addEventListener('input', e => {
    state.name = e.target.value.trim();
    $('continueBtn').disabled = !state.name;
});
$('nameInput').addEventListener('keydown', e => { if (e.key === 'Enter' && state.name) goTo(2); });
$('continueBtn').addEventListener('click', () => state.name && goTo(2));

// Step 2
$('careerOptions').addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    document.querySelectorAll('#careerOptions .card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    state.career = card.dataset.value;
    $('careerBtn').disabled = false;
});
$('careerBtn').addEventListener('click', () => state.career && goTo(3));
$('backBtn1').addEventListener('click', () => goTo(1));

// Step 3
$('levelOptions').addEventListener('click', e => {
    const opt = e.target.closest('.option');
    if (!opt) return;
    document.querySelectorAll('#levelOptions .option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    state.level = opt.dataset.value;
    $('levelBtn').disabled = false;
});
$('levelBtn').addEventListener('click', () => {
    if (!state.level) return;
    showDashboard();
});
$('backBtn2').addEventListener('click', () => goTo(2));

// =============================================
// DASHBOARD
// =============================================
async function showDashboard() {
    try {
        // Create or get user from backend
        const userData = await fetch('http://localhost:5000/api/user/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: state.name,
                career: state.career,
                level: state.level
            })
        }).then(res => res.json());

        if (!userData.success) {
            throw new Error('Failed to create user session');
        }

        // Store user name in localStorage for cross-device access
        localStorage.setItem('userName', state.name);
        localStorage.setItem('career', state.career);
        localStorage.setItem('level', state.level);

        // Hide onboarding
        $('onboardingWrapper').classList.add('hidden');
        // Show dashboard
        $('dashboardWrapper').classList.remove('hidden');
        // Set user info
        $('welcomeName').textContent = state.name;
        $('sidebarUserName').textContent = state.name;
        $('sidebarUserRole').textContent = labels.career[state.career];
        $('userAvatar').textContent = state.name.charAt(0).toUpperCase();

        console.log('User session created:', userData);
    } catch (error) {
        console.error('Error creating user session:', error);
        alert('Failed to create user session. Please check backend connection.');
    }
}

// Sidebar navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
        e.preventDefault();
        const page = item.dataset.page;

        // Update nav
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Update page
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        $(`${page}Page`).classList.add('active');

        // Update title
        const titles = { home: 'Home', roadmap: 'My Roadmap', progress: 'Progress', settings: 'Settings' };
        $('pageTitle').textContent = titles[page];
    });
});

// Logout
$('logoutBtn').addEventListener('click', () => {
    $('dashboardWrapper').classList.add('hidden');
    $('onboardingWrapper').classList.remove('hidden');
    state.step = 1;
    state.name = '';
    state.career = '';
    state.level = '';
    $('nameInput').value = '';
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
    $('continueBtn').disabled = true;
    $('careerBtn').disabled = true;
    $('levelBtn').disabled = true;
    steps[1].classList.add('active');
    updateProgress();
});

// =============================================
// QUESTIONNAIRE (Template - Integrate your code here)
// =============================================

// Answer selection
$('answerOptions').addEventListener('click', e => {
    const btn = e.target.closest('.answer-btn');
    if (!btn) return;
    document.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    // INTEGRATION: Store answer - btn.dataset.answer
    console.log('Selected answer:', btn.dataset.answer);
});

// Navigation buttons (connect to your logic)
$('nextQuestionBtn').addEventListener('click', () => {
    // INTEGRATION: Move to next question
    console.log('Next question clicked');
});

$('prevQuestionBtn').addEventListener('click', () => {
    // INTEGRATION: Move to previous question
    console.log('Previous question clicked');
});

// =============================================
// INIT
// =============================================
updateProgress();
$('nameInput').focus();
