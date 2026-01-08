// SoccerTeamGenerator: Main controller that coordinates between different managers

// Main application class that orchestrates all soccer team generation functionality
class SoccerTeamGenerator {
    /** 
     * Constructor initializes the main application state and all manager instances
     * 
     * Initialization Steps:
     * 1. Set up core application state
     * 2. Initialize all manager classes with dependency injection
     * 3. Set up event listeners for user interactions
     * 4. Load persisted data from localStorage
     */

    constructor() {
        // Core application state - acts as a shared data store between modules
        this.players = [];                     // Array of player objects with stats and positions
        this.teams = [];                       // Generated teams with formation structures
        this.currentTab = 'add-players';       // Current active UI tab for navigation
        this.playerBeingEdited = null;         // Reference to player currently being edited
        this.lastGenerationPlayerCount = null; // Used for change detection in team generation
        
        // Dependency Injection: Initialize all manager classes with reference to main app
        // This creates a centralized communication hub between modules
        this.playerManager = new PlayerManager(this);   // Handles player operations
        this.teamGenerator = new TeamGenerator(this);   // Implements team generation algorithms
        this.uiManager = new UIManager(this);           // Manages all UI updates and rendering
        this.dataManager = new DataManager(this);       // Handles data persistence and I/O
        
        // Initialize event listeners after all managers are created
        this.initializeEventListeners();
    }

    // Sets up all event listeners for user interactions across the application
    initializeEventListeners() {
        // Tab Navigation System: Enables single-page application behavior
        // Uses event delegation pattern for efficient event handling
        document.querySelectorAll('.tab-btn').forEach(button => {
            button.addEventListener('click', (e) => this.uiManager.switchTab(e.target.dataset.tab));
        });

        // Enhanced User Experience: Enter key support for player name input
        // Improves accessibility and user workflow efficiency
        document.getElementById('playerName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.playerManager.addPlayer();
        });

        // Dynamic Form Updates: Real-time validation and UI state management
        // Updates available positions and stat labels based on selected positions
        document.querySelectorAll('input[name="position"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.uiManager.updateStatLabels();               // Show/hide relevant stat sections
                this.uiManager.updatePreferredPositionOptions(); // Update dropdown options
            });
        });

        // Team Generation Change Detection: Smart UI state management
        // Automatically enables/disables generation button based on settings changes
        const teamCountSelect = document.getElementById('teamCount');
        const playerSelectionSelect = document.getElementById('playerSelection');
        
        console.log('Setting up team generation event listeners...');
        console.log('teamCountSelect:', teamCountSelect);
        console.log('playerSelectionSelect:', playerSelectionSelect);
        
        // Team count change detection: Re-enables generation when user changes team count
        if (teamCountSelect) {
            teamCountSelect.addEventListener('change', () => {
                console.log('Team count changed to:', teamCountSelect.value);
                this.teamGenerator.checkTeamSettingsChange(); // Smart change detection
            });
        }
        
        // Player selection strategy change detection: Handles "All Players" vs "Selected Only"
        if (playerSelectionSelect) {
            playerSelectionSelect.addEventListener('change', () => {
                console.log('Player selection changed to:', playerSelectionSelect.value);
                this.teamGenerator.checkTeamSettingsChange(); // Consistent state management
            });
        }

        // Application Initialization: Load persisted data and set initial UI state
        this.dataManager.loadPlayersFromStorage();    // Restore user's previous session
        this.uiManager.updatePlayersList();           // Render loaded players
        this.uiManager.switchTab('add-players');      // Set default tab for new users
    }
}

// Application Initialization and Global Function Bridge

// Global application instance
let teamGenerator;

/**
 * Application Bootstrap: Ensures proper initialization timing
 * DOMContentLoaded ensures all HTML elements exist before JavaScript attempts to access them
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM ready - initializing Soccer Team Generator...');
    teamGenerator = new SoccerTeamGenerator();
    console.log('Application initialized successfully');
});

// Global Function Bridge for HTML Onclick Handlers

/**
 * Player Management Functions
 * Handle CRUD operations for player data
 */
function addPlayer() {
    if (teamGenerator) teamGenerator.playerManager.addPlayer();
}

function resetForm() {
    if (teamGenerator) teamGenerator.playerManager.resetForm();
}

function updatePlayer() {
    if (teamGenerator) teamGenerator.playerManager.updatePlayer();
}

function cancelEdit() {
    if (teamGenerator) teamGenerator.playerManager.cancelEdit();
}

/**
 * Team Generation Functions
 * Handle the core team generation and regeneration logic
 */
function generateTeams() {
    if (teamGenerator) teamGenerator.teamGenerator.generateTeams();
}

function regenerateTeams() {
    if (teamGenerator) teamGenerator.teamGenerator.regenerateTeams();
}

/**
 * Player Gallery Management Functions
 * Handle bulk operations on player collections
 */
function clearAllPlayers() {
    if (teamGenerator) teamGenerator.playerManager.clearPlayers();
}

function shufflePlayers() {
    if (teamGenerator) teamGenerator.playerManager.shufflePlayers();
}

function selectAllPlayers() {
    if (teamGenerator) teamGenerator.playerManager.selectAllPlayers();
}

function deselectAllPlayers() {
    if (teamGenerator) teamGenerator.playerManager.deselectAllPlayers();
}

/**
 * Data Import/Export Functions
 * Handle data persistence and portability
 */
function loadSamplePlayers() {
    if (teamGenerator) teamGenerator.dataManager.addSamplePlayers();
}

function exportPlayersToJSON() {
    if (teamGenerator) teamGenerator.dataManager.exportPlayersToJSON();
}

function importPlayersFromJSON() {
    if (teamGenerator) teamGenerator.dataManager.importPlayersFromJSON();
}
