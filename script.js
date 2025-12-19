// ==================== Authentication Check ====================
// Check if user is logged in
const isLoggedIn = localStorage.getItem('isLoggedIn');
if (!isLoggedIn) {
    window.location.href = 'login.html';
}

// Get user info
const userName = localStorage.getItem('userName') || 'User';
const userEmail = localStorage.getItem('userEmail') || '';

// ==================== Data ====================
let teamsData = [];
let playersData = [];

const scheduleData = [
    {
        id: 1,
        date: "2025-12-20T15:00:00",
        homeTeam: "Manchester United",
        awayTeam: "Manchester City",
        homeIcon: "👹",
        awayIcon: "💙",
        venue: "Old Trafford"
    },
    {
        id: 2,
        date: "2025-12-21T17:30:00",
        homeTeam: "Liverpool",
        awayTeam: "Arsenal",
        homeIcon: "🔴",
        awayIcon: "🔫",
        venue: "Anfield"
    },
    {
        id: 3,
        date: "2025-12-22T12:30:00",
        homeTeam: "Chelsea",
        awayTeam: "Tottenham Hotspur",
        homeIcon: "🦁",
        awayIcon: "⚪",
        venue: "Stamford Bridge"
    },
    {
        id: 4,
        date: "2025-12-26T20:00:00",
        homeTeam: "Arsenal",
        awayTeam: "Manchester City",
        homeIcon: "🔫",
        awayIcon: "💙",
        venue: "Emirates Stadium"
    }
];

// ==================== Initialize Database and Load Data ====================
async function initializeApp() {
    try {
        // Initialize database
        await initDB();

        // Seed database if empty
        await seedDatabase();

        // Load data from database
        teamsData = await getAllTeams();
        playersData = await getAllPlayers();

        console.log('Loaded teams:', teamsData.length);
        console.log('Loaded players:', playersData.length);

        // Update hero stats
        updateHeroStats();

        // Render initial data
        renderTeams();
        renderPlayers();

    } catch (error) {
        console.error('Error initializing app:', error);
        alert('Error loading data from database');
    }
}

// Update hero stats based on loaded data
function updateHeroStats() {
    const playersStat = document.querySelector('[data-target="72"]');
    const teamsStat = document.querySelector('[data-target="6"]');

    if (playersStat) {
        playersStat.setAttribute('data-target', playersData.length);
        animateCounter(playersStat, playersData.length);
    }

    if (teamsStat) {
        teamsStat.setAttribute('data-target', teamsData.length);
        animateCounter(teamsStat, teamsData.length);
    }
}

// Call initialization when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// ====================/Theme Management ====================
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Load saved theme or default to light
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Add animation
    themeToggle.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        themeToggle.style.transform = '';
    }, 300);
});

// ==================== User Profile & Logout ====================
// Display user name
const userNameDisplay = document.getElementById('userNameDisplay');
if (userNameDisplay && userName) {
    userNameDisplay.textContent = userName.split(' ')[0]; // Display first name only
}

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            window.location.href = 'login.html';
        }
    });
}

// ==================== Navigation ====================
const navbar = document.getElementById('navbar');
const navBurger = document.getElementById('navBurger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Scroll effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// Mobile menu toggle
navBurger.addEventListener('click', () => {
    navBurger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Active link handling
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Close mobile menu
        navBurger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ==================== Counter Animation ====================
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Animate stats when they come into view
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = parseInt(entry.target.dataset.target);
            animateCounter(entry.target, target);
            statsObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.stat-number').forEach(stat => {
    statsObserver.observe(stat);
});

// ==================== Modal Management ====================
const modal = document.getElementById('modal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalBody = document.getElementById('modalBody');

function openModal(content) {
    modalBody.innerHTML = content;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// ==================== Teams Rendering ====================
function renderTeams(filter = 'all') {
    const teamsGrid = document.getElementById('teamsGrid');
    const filteredTeams = filter === 'all'
        ? teamsData
        : teamsData.filter(team => team.sport === filter);

    teamsGrid.innerHTML = filteredTeams.map(team => `
        <div class="team-card fade-in" data-team-id="${team.id}">
            <div class="team-header" style="background: ${team.gradient}">
                <div class="team-icon">
                    ${team.logo
            ? `<img src="${team.logo}" alt="${team.name}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;">`
            : team.icon}
                </div>
                <h3 class="team-name">${team.name}</h3>
                <p class="team-sport">${team.sport.charAt(0).toUpperCase() + team.sport.slice(1)}</p>
            </div>
            <div class="team-body">
                <div class="team-stats">
                    <div class="team-stat">
                        <span class="stat-value">${team.players}</span>
                        <span class="stat-label-small">Players</span>
                    </div>
                    <div class="team-stat">
                        <span class="stat-value">${team.wins}</span>
                        <span class="stat-label-small">Wins</span>
                    </div>
                    <div class="team-stat">
                        <span class="stat-value">${team.losses}</span>
                        <span class="stat-label-small">Losses</span>
                    </div>
                </div>
                <div class="team-actions">
                    <button class="btn btn-primary" onclick="viewTeamDetails(${team.id})">View Details</button>
                    <button class="btn btn-secondary" onclick="editTeam(${team.id})">Edit</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Team filters
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTeams(btn.dataset.filter);
    });
});

function viewTeamDetails(teamId) {
    const team = teamsData.find(t => t.id === teamId);
    const teamPlayers = playersData.filter(p => p.teamId === teamId);

    const content = `
        <div style="background: ${team.gradient}; padding: 2rem; border-radius: 12px; color: white; margin-bottom: 1.5rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">${team.icon}</div>
            <h2 style="font-family: var(--font-display); font-size: 2rem; margin-bottom: 0.5rem;">${team.name}</h2>
            <p style="opacity: 0.9;">${team.sport.charAt(0).toUpperCase() + team.sport.slice(1)}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
            <div style="text-align: center; padding: 1rem; background: var(--color-bg-secondary); border-radius: 8px;">
                <div style="font-size: 2rem; font-weight: 700; color: var(--color-primary);">${team.players}</div>
                <div style="color: var(--color-text-secondary); font-size: 0.9rem;">Players</div>
            </div>
            <div style="text-align: center; padding: 1rem; background: var(--color-bg-secondary); border-radius: 8px;">
                <div style="font-size: 2rem; font-weight: 700; color: var(--color-success);">${team.wins}</div>
                <div style="color: var(--color-text-secondary); font-size: 0.9rem;">Wins</div>
            </div>
            <div style="text-align: center; padding: 1rem; background: var(--color-bg-secondary); border-radius: 8px;">
                <div style="font-size: 2rem; font-weight: 700; color: var(--color-danger);">${team.losses}</div>
                <div style="color: var(--color-text-secondary); font-size: 0.9rem;">Losses</div>
            </div>
        </div>
        
        <h3 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: 1rem;">Team Roster</h3>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${teamPlayers.map(player => `
                <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--color-bg-secondary); border-radius: 8px;">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background: ${team.gradient}; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">
                        ${player.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600;">${player.name}</div>
                        <div style="font-size: 0.9rem; color: var(--color-text-secondary);">${player.position}</div>
                    </div>
                    <div style="text-align: right; font-size: 0.9rem; color: var(--color-text-secondary);">
                        ${player.goals} Goals
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    openModal(content);
}

function editTeam(teamId) {
    const team = teamsData.find(t => t.id === teamId);

    const content = `
        <h2 style="font-family: var(--font-display); font-size: 2rem; margin-bottom: 1.5rem;">Edit Team</h2>
        <form id="editTeamForm">
            <div class="form-group">
                <label class="form-label">Team Name</label>
                <input type="text" class="form-input" value="${team.name}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Sport</label>
                <select class="form-select" required>
                    <option value="football" ${team.sport === 'football' ? 'selected' : ''}>Football</option>
                    <option value="basketball" ${team.sport === 'basketball' ? 'selected' : ''}>Basketball</option>
                    <option value="volleyball" ${team.sport === 'volleyball' ? 'selected' : ''}>Volleyball</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Icon</label>
                <input type="text" class="form-input" value="${team.icon}" maxlength="2">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
        </form>
    `;

    openModal(content);

    document.getElementById('editTeamForm').addEventListener('submit', (e) => {
        e.preventDefault();
        // In a real app, this would save to a backend
        alert('Team updated successfully!');
        closeModal();
    });
}

// ==================== Players Rendering ====================
function renderPlayers(searchTerm = '') {
    const playersGrid = document.getElementById('playersGrid');
    const filteredPlayers = searchTerm
        ? playersData.filter(player =>
            player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            player.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
            player.team.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : playersData;

    playersGrid.innerHTML = filteredPlayers.map(player => {
        const team = teamsData.find(t => t.id === player.teamId);
        const initials = player.name.split(' ').map(n => n[0]).join('');
        // Generate unique avatar URL for each player
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random&color=fff&size=200&bold=true&length=2`;

        return `
            <div class="player-card fade-in" onclick="viewPlayerDetails(${player.id})">
                <div class="player-header">
                    <div class="player-avatar" style="background: ${team.gradient}; padding: 0; overflow: hidden;">
                        <img src="${avatarUrl}" alt="${player.name}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div class="player-info">
                        <h3 class="player-name">${player.name}</h3>
                        <p class="player-position">${player.position}</p>
                        <p class="player-team-name">${player.team}</p>
                    </div>
                </div>
                <div class="player-stats">
                    <div class="player-stat">
                        <span class="stat-value">${player.goals}</span>
                        <span class="stat-label-small">Goals</span>
                    </div>
                    <div class="player-stat">
                        <span class="stat-value">${player.assists}</span>
                        <span class="stat-label-small">Assists</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Player search
const playerSearch = document.getElementById('playerSearch');
playerSearch.addEventListener('input', (e) => {
    renderPlayers(e.target.value);
});

function viewPlayerDetails(playerId) {
    const player = playersData.find(p => p.id === playerId);
    const team = teamsData.find(t => t.id === player.teamId);
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random&color=fff&size=200&bold=true&length=2`;

    const content = `
        <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem;">
            <div style="width: 100px; height: 100px; border-radius: 50%; overflow: hidden; border: 4px solid ${team.gradient.split(',')[0].split('(')[1]};">
                <img src="${avatarUrl}" alt="${player.name}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div>
                <h2 style="font-family: var(--font-display); font-size: 2rem; margin-bottom: 0.5rem;">${player.name}</h2>
                <p style="color: var(--color-text-secondary); font-size: 1.1rem;">${player.position}</p>
                <p style="color: var(--color-primary); font-weight: 600;">${player.team}</p>
            </div>
        </div>
        
        <h3 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: 1rem;">Season Statistics</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
            <div style="text-align: center; padding: 1.5rem; background: var(--color-bg-secondary); border-radius: 12px;">
                <div style="font-size: 2.5rem; font-weight: 700; color: var(--color-primary); margin-bottom: 0.5rem;">${player.goals}</div>
                <div style="color: var(--color-text-secondary);">Goals</div>
            </div>
            <div style="text-align: center; padding: 1.5rem; background: var(--color-bg-secondary); border-radius: 12px;">
                <div style="font-size: 2.5rem; font-weight: 700; color: var(--color-success); margin-bottom: 0.5rem;">${player.assists}</div>
                <div style="color: var(--color-text-secondary);">Assists</div>
            </div>
            <div style="text-align: center; padding: 1.5rem; background: var(--color-bg-secondary); border-radius: 12px;">
                <div style="font-size: 2.5rem; font-weight: 700; color: var(--color-secondary); margin-bottom: 0.5rem;">${player.matches}</div>
                <div style="color: var(--color-text-secondary);">Matches</div>
            </div>
        </div>
        
        <div style="display: flex; gap: 1rem;">
            <button class="btn btn-primary" style="flex: 1;">View Full Profile</button>
            <button class="btn btn-secondary" style="flex: 1;" onclick="closeModal()">Close</button>
        </div>
    `;

    openModal(content);
}

// ==================== Schedule Rendering ====================
function renderSchedule() {
    const scheduleTimeline = document.getElementById('scheduleTimeline');

    scheduleTimeline.innerHTML = scheduleData.map(match => {
        const matchDate = new Date(match.date);
        const formattedDate = matchDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        const formattedTime = matchDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="schedule-item fade-in">
                <div class="schedule-date">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>${formattedDate} • ${formattedTime}</span>
                </div>
                <div class="match-info">
                    <div class="team-info">
                        <div class="team-logo">${match.homeIcon}</div>
                        <div>
                            <h4>${match.homeTeam}</h4>
                            <span>Home</span>
                        </div>
                    </div>
                    <div class="vs">VS</div>
                    <div class="team-info away">
                        <div class="team-logo">${match.awayIcon}</div>
                        <div>
                            <h4>${match.awayTeam}</h4>
                            <span>Away</span>
                        </div>
                    </div>
                </div>
                <div>
                    <div>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        ${match.venue}
                    </div>
                    <button class="btn btn-primary btn-small" onclick="viewMatchDetails(${match.id})" title="View Details">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function viewMatchDetails(matchId) {
    const match = scheduleData.find(m => m.id === matchId);
    const matchDate = new Date(match.date);

    const content = `
        <h2 style="font-family: var(--font-display); font-size: 2rem; text-align: center; margin-bottom: 2rem;">Match Details</h2>
        
        <div style="display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 2rem; margin-bottom: 2rem;">
            <div style="text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">${match.homeIcon}</div>
                <h3 style="font-family: var(--font-display); font-size: 1.5rem;">${match.homeTeam}</h3>
                <p style="color: var(--color-text-secondary);">Home Team</p>
            </div>
            <div style="font-family: var(--font-display); font-size: 2rem; font-weight: 700; color: var(--color-text-secondary);">VS</div>
            <div style="text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">${match.awayIcon}</div>
                <h3 style="font-family: var(--font-display); font-size: 1.5rem;">${match.awayTeam}</h3>
                <p style="color: var(--color-text-secondary);">Away Team</p>
            </div>
        </div>
        
        <div style="background: var(--color-bg-secondary); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="color: var(--color-text-secondary); font-size: 0.9rem; margin-bottom: 0.25rem;">Date</div>
                    <div style="font-weight: 600;">${matchDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <div>
                    <div style="color: var(--color-text-secondary); font-size: 0.9rem; margin-bottom: 0.25rem;">Time</div>
                    <div style="font-weight: 600;">${matchDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div style="grid-column: 1 / -1;">
                    <div style="color: var(--color-text-secondary); font-size: 0.9rem; margin-bottom: 0.25rem;">Venue</div>
                    <div style="font-weight: 600;">${match.venue}</div>
                </div>
            </div>
        </div>
        
        <div style="display: flex; gap: 1rem;">
            <button class="btn btn-secondary" style="flex: 1;" onclick="closeModal()">Close</button>
            <button class="btn btn-primary" style="flex: 1;">Buy Tickets</button>
        </div>
    `;

    openModal(content);
}

// ==================== Analytics ====================
function renderAnalytics() {
    // Win Rate Chart (Simple circular representation)
    const winRateChart = document.getElementById('winRateChart');
    const ctx = winRateChart.getContext('2d');
    const centerX = winRateChart.width / 2;
    const centerY = winRateChart.height / 2;
    const radius = 80;

    // Clear canvas
    ctx.clearRect(0, 0, winRateChart.width, winRateChart.height);

    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-bg-secondary');
    ctx.lineWidth = 20;
    ctx.stroke();

    // Draw win rate arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, (-Math.PI / 2) + (2 * Math.PI * 0.68));
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-success');
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Draw percentage text
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text');
    ctx.font = 'bold 32px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('68%', centerX, centerY);

    // Performance bars
    const performanceBars = document.getElementById('performanceBars');
    const teamPerformance = [
        { name: 'Thunder Eagles', value: 85 },
        { name: 'Phoenix Flames', value: 92 },
        { name: 'Ocean Warriors', value: 78 },
        { name: 'Lightning Strikers', value: 95 },
        { name: 'Golden Panthers', value: 82 }
    ];

    performanceBars.innerHTML = teamPerformance.map(team => `
        <div class="performance-bar">
            <div class="bar-label">
                <span>${team.name}</span>
                <span style="font-weight: 700; color: var(--color-primary);">${team.value}%</span>
            </div>
            <div class="bar-track">
                <div class="bar-fill" style="width: ${team.value}%"></div>
            </div>
        </div>
    `).join('');

    // Progress chart
    const progressChart = document.getElementById('progressChart');
    const monthlyData = [65, 72, 68, 85, 78, 92];
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    progressChart.innerHTML = monthlyData.map((value, index) => `
        <div class="progress-bar" style="height: ${value}%;" title="${months[index]}: ${value}%">
            <div class="progress-label">${months[index]}</div>
        </div>
    `).join('');
}

// ==================== Quick Actions ====================
document.getElementById('addTeamBtn').addEventListener('click', () => {
    const content = `
        <h2 style="font-family: var(--font-display); font-size: 2rem; margin-bottom: 1.5rem;">Add New Team</h2>
        <form id="addTeamForm">
            <div class="form-group">
                <label class="form-label">Team Name</label>
                <input type="text" class="form-input" placeholder="Enter team name" required>
            </div>
            <div class="form-group">
                <label class="form-label">Sport</label>
                <select class="form-select" required>
                    <option value="">Select a sport</option>
                    <option value="football">Football</option>
                    <option value="basketball">Basketball</option>
                    <option value="volleyball">Volleyball</option>
                    <option value="baseball">Baseball</option>
                    <option value="hockey">Hockey</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Team Icon (Emoji)</label>
                <input type="text" class="form-input" placeholder="🏆" maxlength="2" required>
            </div>
            <div class="form-group">
                <label class="form-label">Number of Players</label>
                <input type="number" class="form-input" placeholder="0" min="1" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Create Team</button>
            </div>
        </form>
    `;

    openModal(content);

    document.getElementById('addTeamForm').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Team created successfully!');
        closeModal();
    });
});

document.getElementById('addPlayerBtn').addEventListener('click', () => {
    const content = `
        <h2 style="font-family: var(--font-display); font-size: 2rem; margin-bottom: 1.5rem;">Add New Player</h2>
        <form id="addPlayerForm">
            <div class="form-group">
                <label class="form-label">Player Name</label>
                <input type="text" class="form-input" placeholder="Enter player name" required>
            </div>
            <div class="form-group">
                <label class="form-label">Position</label>
                <input type="text" class="form-input" placeholder="e.g., Forward, Guard, Setter" required>
            </div>
            <div class="form-group">
                <label class="form-label">Team</label>
                <select class="form-select" required>
                    <option value="">Select a team</option>
                    ${teamsData.map(team => `<option value="${team.id}">${team.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Jersey Number</label>
                <input type="number" class="form-input" placeholder="0" min="0" max="99" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Add Player</button>
            </div>
        </form>
    `;

    openModal(content);

    document.getElementById('addPlayerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Player added successfully!');
        closeModal();
    });
});

document.getElementById('scheduleMatchBtn').addEventListener('click', () => {
    const content = `
        <h2 style="font-family: var(--font-display); font-size: 2rem; margin-bottom: 1.5rem;">Schedule New Match</h2>
        <form id="scheduleMatchForm">
            <div class="form-group">
                <label class="form-label">Home Team</label>
                <select class="form-select" required>
                    <option value="">Select home team</option>
                    ${teamsData.map(team => `<option value="${team.id}">${team.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Away Team</label>
                <select class="form-select" required>
                    <option value="">Select away team</option>
                    ${teamsData.map(team => `<option value="${team.id}">${team.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Date</label>
                <input type="date" class="form-input" required>
            </div>
            <div class="form-group">
                <label class="form-label">Time</label>
                <input type="time" class="form-input" required>
            </div>
            <div class="form-group">
                <label class="form-label">Venue</label>
                <input type="text" class="form-input" placeholder="Enter venue name" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Schedule Match</button>
            </div>
        </form>
    `;

    openModal(content);

    document.getElementById('scheduleMatchForm').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Match scheduled successfully!');
        closeModal();
    });
});

document.getElementById('viewAnalyticsBtn').addEventListener('click', () => {
    // Smooth scroll to analytics section
    document.getElementById('analytics').scrollIntoView({ behavior: 'smooth' });
});

// ==================== Initialize ====================
document.addEventListener('DOMContentLoaded', () => {
    renderTeams();
    renderPlayers();
    renderSchedule();
    renderAnalytics();

    // Add scroll animations
    const elements = document.querySelectorAll('.section');
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });

    elements.forEach(el => scrollObserver.observe(el));
});
