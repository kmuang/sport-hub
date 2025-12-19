// ==================== IndexedDB Database Service ====================

const DB_NAME = 'SportHubDB';
const DB_VERSION = 1;
let db = null;

// Initialize Database
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('Database failed to open');
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            console.log('Database opened successfully');
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            db = event.target.result;

            // Create Teams object store
            if (!db.objectStoreNames.contains('teams')) {
                const teamsStore = db.createObjectStore('teams', { keyPath: 'id', autoIncrement: true });
                teamsStore.createIndex('name', 'name', { unique: false });
                teamsStore.createIndex('sport', 'sport', { unique: false });
            }

            // Create Players object store
            if (!db.objectStoreNames.contains('players')) {
                const playersStore = db.createObjectStore('players', { keyPath: 'id', autoIncrement: true });
                playersStore.createIndex('name', 'name', { unique: false });
                playersStore.createIndex('teamId', 'teamId', { unique: false });
                playersStore.createIndex('position', 'position', { unique: false });
            }

            console.log('Database setup complete');
        };
    });
}

// ==================== Teams Operations ====================

// Add Team
function addTeam(teamData) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['teams'], 'readwrite');
        const objectStore = transaction.objectStore('teams');
        const request = objectStore.add(teamData);

        request.onsuccess = () => {
            console.log('Team added:', teamData.name);
            resolve(request.result);
        };

        request.onerror = () => {
            console.error('Error adding team');
            reject(request.error);
        };
    });
}

// Get All Teams
function getAllTeams() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['teams'], 'readonly');
        const objectStore = transaction.objectStore('teams');
        const request = objectStore.getAll();

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

// Get Team by ID
function getTeamById(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['teams'], 'readonly');
        const objectStore = transaction.objectStore('teams');
        const request = objectStore.get(id);

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

// Update Team
function updateTeam(teamData) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['teams'], 'readwrite');
        const objectStore = transaction.objectStore('teams');
        const request = objectStore.put(teamData);

        request.onsuccess = () => {
            console.log('Team updated:', teamData.name);
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

// Delete Team
function deleteTeam(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['teams'], 'readwrite');
        const objectStore = transaction.objectStore('teams');
        const request = objectStore.delete(id);

        request.onsuccess = () => {
            console.log('Team deleted:', id);
            resolve();
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

// ==================== Players Operations ====================

// Add Player
function addPlayer(playerData) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['players'], 'readwrite');
        const objectStore = transaction.objectStore('players');
        const request = objectStore.add(playerData);

        request.onsuccess = () => {
            console.log('Player added:', playerData.name);
            resolve(request.result);
        };

        request.onerror = () => {
            console.error('Error adding player');
            reject(request.error);
        };
    });
}

// Get All Players
function getAllPlayers() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['players'], 'readonly');
        const objectStore = transaction.objectStore('players');
        const request = objectStore.getAll();

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

// Get Players by Team ID
function getPlayersByTeamId(teamId) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['players'], 'readonly');
        const objectStore = transaction.objectStore('players');
        const index = objectStore.index('teamId');
        const request = index.getAll(teamId);

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

// Get Player by ID
function getPlayerById(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['players'], 'readonly');
        const objectStore = transaction.objectStore('players');
        const request = objectStore.get(id);

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

// Update Player
function updatePlayer(playerData) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['players'], 'readwrite');
        const objectStore = transaction.objectStore('players');
        const request = objectStore.put(playerData);

        request.onsuccess = () => {
            console.log('Player updated:', playerData.name);
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

// Delete Player
function deletePlayer(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['players'], 'readwrite');
        const objectStore = transaction.objectStore('players');
        const request = objectStore.delete(id);

        request.onsuccess = () => {
            console.log('Player deleted:', id);
            resolve();
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

// ==================== Seed Database with Initial Data ====================

async function seedDatabase() {
    try {
        // Check if data already exists
        const existingTeams = await getAllTeams();
        if (existingTeams.length > 0) {
            console.log('Database already seeded');
            return;
        }

        console.log('Seeding database with initial data...');

        // Seed Teams
        const initialTeams = [
            {
                name: "Manchester United",
                sport: "football",
                icon: "👹",
                logo: "manchester_united_logo.png",
                players: 1,
                wins: 18,
                losses: 4,
                gradient: "linear-gradient(135deg, #DA291C 0%, #FBE122 100%)"
            },
            {
                name: "Manchester City",
                sport: "football",
                icon: "💙",
                logo: "manchester_city_logo.png",
                players: 1,
                wins: 22,
                losses: 2,
                gradient: "linear-gradient(135deg, #6CABDD 0%, #00285E 100%)"
            },
            {
                name: "Liverpool",
                sport: "football",
                icon: "🔴",
                logo: "liverpool_logo.png",
                players: 1,
                wins: 20,
                losses: 3,
                gradient: "linear-gradient(135deg, #C8102E 0%, #00B2A9 100%)"
            },
            {
                name: "Arsenal",
                sport: "football",
                icon: "🔫",
                logo: "arsenal_logo.png",
                players: 1,
                wins: 19,
                losses: 5,
                gradient: "linear-gradient(135deg, #EF0107 0%, #023474 100%)"
            },
            {
                name: "Chelsea",
                sport: "football",
                icon: "🦁",
                logo: null,
                players: 1,
                wins: 17,
                losses: 6,
                gradient: "linear-gradient(135deg, #034694 0%, #DBA111 100%)"
            },
            {
                name: "Tottenham Hotspur",
                sport: "football",
                icon: "⚪",
                logo: null,
                players: 1,
                wins: 16,
                losses: 7,
                gradient: "linear-gradient(135deg, #132257 0%, #FFFFFF 100%)"
            }
        ];

        const teamIds = [];
        for (const team of initialTeams) {
            const id = await addTeam(team);
            teamIds.push(id);
        }

        // Seed Players (one player per team for initial data)
        const initialPlayers = [
            { name: "Bruno Fernandes", position: "Midfielder", teamId: teamIds[0], team: "Manchester United", goals: 12, assists: 15, matches: 22 },
            { name: "Erling Haaland", position: "Striker", teamId: teamIds[1], team: "Manchester City", goals: 28, assists: 6, matches: 24 },
            { name: "Mohamed Salah", position: "Forward", teamId: teamIds[2], team: "Liverpool", goals: 24, assists: 14, matches: 23 },
            { name: "Bukayo Saka", position: "Winger", teamId: teamIds[3], team: "Arsenal", goals: 16, assists: 13, matches: 24 },
            { name: "Cole Palmer", position: "Attacking Midfielder", teamId: teamIds[4], team: "Chelsea", goals: 19, assists: 11, matches: 24 },
            { name: "Son Heung-min", position: "Forward", teamId: teamIds[5], team: "Tottenham Hotspur", goals: 17, assists: 10, matches: 23 }
        ];

        for (const player of initialPlayers) {
            await addPlayer(player);
        }

        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

// ==================== Clear All Data (for testing) ====================

function clearAllData() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['teams', 'players'], 'readwrite');

        const teamsStore = transaction.objectStore('teams');
        const playersStore = transaction.objectStore('players');

        teamsStore.clear();
        playersStore.clear();

        transaction.oncomplete = () => {
            console.log('All data cleared');
            resolve();
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
}
