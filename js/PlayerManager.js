/**
 * PlayerManager: Handles Create/Read/Update/Delete operations for player data (Model layer)
 * 
 * Responsbilities:
 * 1. Player CRUD Operations: Create, Read, Update, Delete player records
 * 2. Data Validation: Ensures player data integrity and completeness
 * 3. Position Management: Handles complex multi-position player scenarios
 * 4. Statistics Management: Manages both goalkeeper and outfield player stats
 * 5. Selection State: Tracks which players are selected for team generation
 * 
 * Technical Features:
 * - Dual-role player support (players who can play multiple positions)
 * - FIFA-style rating system (1-99 scale) for realistic simulation
 * - Dynamic form validation with real-time feedback
 * - Edit-in-place functionality for player modifications
 * - Bulk operations for efficient player management
 */

class PlayerManager {
    // Constructor establishes connection to main application
    constructor(app) {
        this.app = app; // Dependency injection for accessing shared state and other managers
    }

    /**
     * Adds a new player to the system with comprehensive validation
     * 
     * Process:
     * 1. Required field validation (name, positions)
     * 2. Position logic validation (preferred position consistency)
     * 3. Statistical range validation (1-99 FIFA scale)
     * 
     * Dual-Role Player Support:
     * - Supports players who can play both goalkeeper and outfield positions
     * - Collects appropriate statistics based on selected positions
     * - Manages preferred position selection intelligently
     * 
     * Optimizations:
     * - Automatic form reset after successful addition
     * - Focus management for efficient data entry
     * - Immediate UI updates and navigation to gallery
     */
    addPlayer() {
        // Extract and validate player name
        const nameInput = document.getElementById('playerName');
        const name = nameInput.value.trim();

        if (!name) {
            alert('Please enter a player name');
            nameInput.focus(); // UX: Return focus for immediate correction
            return;
        }

        // Extract selected positions from checkbox inputs
        const positionCheckboxes = document.querySelectorAll('input[name="position"]:checked');
        const positions = Array.from(positionCheckboxes).map(cb => cb.value);
        const preferredPosition = document.getElementById('preferredPosition').value;

        // Validate that at least one position is selected
        if (positions.length === 0) {
            alert('Please select at least one position');
            return;
        }

        // Analyze position types for appropriate stat collection
        const isGoalkeeper = positions.includes('GK');
        const hasOutfieldPositions = positions.some(pos => pos !== 'GK');

        // Create comprehensive player object with conditional statistics
        const player = {
            id: Date.now(),
            name: name,
            positions: positions,
            preferredPosition: preferredPosition || positions[0], // Use preferred or default to first position
            selected: true // New players are selected by default
        };

        // Collect outfield stats if needed
        if (hasOutfieldPositions) {
            player.outfieldStats = {
                pace: parseInt(document.getElementById('pace').value) || 75, // If input is invalid, default to 75
                shooting: parseInt(document.getElementById('shooting').value) || 75,
                passing: parseInt(document.getElementById('passing').value) || 75,
                dribbling: parseInt(document.getElementById('dribbling').value) || 75,
                defending: parseInt(document.getElementById('defending').value) || 75,
                physical: parseInt(document.getElementById('physical').value) || 75,
                overall: parseInt(document.getElementById('overall').value) || 75
            };
        }

        // Collect goalkeeper stats if needed
        if (isGoalkeeper) {
            player.gkStats = {
                diving: parseInt(document.getElementById('gk_diving').value) || 75, // If input is invalid, default to 75
                handling: parseInt(document.getElementById('gk_handling').value) || 75,
                kicking: parseInt(document.getElementById('gk_kicking').value) || 75,
                reflexes: parseInt(document.getElementById('gk_reflexes').value) || 75,
                speed: parseInt(document.getElementById('gk_speed').value) || 75,
                positioning: parseInt(document.getElementById('gk_positioning').value) || 75,
                overall: parseInt(document.getElementById('gk_overall').value) || 75
            };
        }

        // Adds player, updates UI and storage, resets form, and refocuses name input
        this.app.players.push(player);
        this.app.uiManager.updatePlayersList();
        this.app.dataManager.savePlayersToStorage();
        this.resetForm();
        nameInput.focus();
        
        // Check if team settings need update due to player count change
        this.app.teamGenerator.checkTeamSettingsChange();
        
        // Switch to gallery tab to show the newly added player
        this.app.uiManager.switchTab('player-gallery');
    }

    // Allows user to remove a player from the player gallery
    removePlayer(playerId) {
        this.app.players = this.app.players.filter(player => player.id !== playerId); // Allows you to remove a player from the this.app.players array by filtering out the one with the matching id
        this.app.uiManager.updatePlayersList();
        this.app.dataManager.savePlayersToStorage();
    }

    // Allows user to edit a player from the player gallery
    editPlayer(playerId) {
        const player = this.app.players.find(p => p.id === playerId); // Allows you to edit a player from the this.app.players array by filtering out the one with the matching id
        if (!player) return;

        // Store the player being edited
        this.app.playerBeingEdited = player;

        // Switch to add players tab and populate the form
        this.app.uiManager.switchTab('add-players');
        this.populateEditForm(player);
        
        // Update the form title
        document.getElementById('player-form-title').textContent = `Edit Player: ${player.name}`;
        
        // Update the add button to show edit mode
        const addButton = document.querySelector('.form-actions button[onclick="addPlayer()"]');
        addButton.textContent = 'Update Player';
        addButton.setAttribute('onclick', 'updatePlayer()');
        
        // Show cancel edit button
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel Edit';
        cancelButton.setAttribute('onclick', 'cancelEdit()');
        cancelButton.className = 'cancel-edit-btn';
        addButton.parentNode.insertBefore(cancelButton, addButton.nextSibling);

        // Scroll to top of page
        window.scrollTo(0, 0);
    }

    // Populates the edit form with the selected player's name, positions, and stats
    populateEditForm(player) {
        // Populate name
        document.getElementById('playerName').value = player.name;

        // Clear all position checkboxes first
        document.querySelectorAll('input[name="position"]').forEach(cb => {
            cb.checked = false;
        });

        // Check the player's positions
        player.positions.forEach(position => {
            const checkbox = document.querySelector(`input[name="position"][value="${position}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });

        // Update preferred position options and set the player's preferred position
        this.app.uiManager.updatePreferredPositionOptions();
        if (player.preferredPosition) {
            document.getElementById('preferredPosition').value = player.preferredPosition;
        }

        // Populate outfield stats if they exist
        if (player.outfieldStats) {
            document.getElementById('pace').value = player.outfieldStats.pace;
            document.getElementById('shooting').value = player.outfieldStats.shooting;
            document.getElementById('passing').value = player.outfieldStats.passing;
            document.getElementById('dribbling').value = player.outfieldStats.dribbling;
            document.getElementById('defending').value = player.outfieldStats.defending;
            document.getElementById('physical').value = player.outfieldStats.physical;
            document.getElementById('overall').value = player.outfieldStats.overall;
        }

        // Populate goalkeeper stats if they exist
        if (player.gkStats) {
            document.getElementById('gk_diving').value = player.gkStats.diving;
            document.getElementById('gk_handling').value = player.gkStats.handling;
            document.getElementById('gk_kicking').value = player.gkStats.kicking;
            document.getElementById('gk_reflexes').value = player.gkStats.reflexes;
            document.getElementById('gk_speed').value = player.gkStats.speed;
            document.getElementById('gk_positioning').value = player.gkStats.positioning;
            document.getElementById('gk_overall').value = player.gkStats.overall;
        }

        // Update stat labels visibility
        this.app.uiManager.updateStatLabels();
    }

    // Used to update player
    updatePlayer() {
        if (!this.app.playerBeingEdited) return;

        const nameInput = document.getElementById('playerName');
        const name = nameInput.value.trim();

        if (!name) {
            alert('Please enter a player name');
            nameInput.focus();
            return;
        }

        // Get selected positions
        const positionCheckboxes = document.querySelectorAll('input[name="position"]:checked');
        const positions = Array.from(positionCheckboxes).map(cb => cb.value);
        const preferredPosition = document.getElementById('preferredPosition').value;

        if (positions.length === 0) {
            alert('Please select at least one position');
            return;
        }

        const isGoalkeeper = positions.includes('GK');
        const hasOutfieldPositions = positions.some(pos => pos !== 'GK');

        // Update player object
        this.app.playerBeingEdited.name = name;
        this.app.playerBeingEdited.positions = positions;
        this.app.playerBeingEdited.preferredPosition = preferredPosition || positions[0];

        // Update outfield stats if needed
        if (hasOutfieldPositions) {
            this.app.playerBeingEdited.outfieldStats = {
                pace: parseInt(document.getElementById('pace').value) || 75,
                shooting: parseInt(document.getElementById('shooting').value) || 75,
                passing: parseInt(document.getElementById('passing').value) || 75,
                dribbling: parseInt(document.getElementById('dribbling').value) || 75,
                defending: parseInt(document.getElementById('defending').value) || 75,
                physical: parseInt(document.getElementById('physical').value) || 75,
                overall: parseInt(document.getElementById('overall').value) || 75
            };
        } else {
            // Remove outfield stats if no longer needed
            delete this.app.playerBeingEdited.outfieldStats;
        }

        // Update goalkeeper stats if needed
        if (isGoalkeeper) {
            this.app.playerBeingEdited.gkStats = {
                diving: parseInt(document.getElementById('gk_diving').value) || 75,
                handling: parseInt(document.getElementById('gk_handling').value) || 75,
                kicking: parseInt(document.getElementById('gk_kicking').value) || 75,
                reflexes: parseInt(document.getElementById('gk_reflexes').value) || 75,
                speed: parseInt(document.getElementById('gk_speed').value) || 75,
                positioning: parseInt(document.getElementById('gk_positioning').value) || 75,
                overall: parseInt(document.getElementById('gk_overall').value) || 75
            };
        } else {
            // Remove GK stats if no longer needed
            delete this.app.playerBeingEdited.gkStats;
        }

        // Save and update UI
        this.app.uiManager.updatePlayersList();
        this.app.dataManager.savePlayersToStorage();
        this.cancelEdit();
        
        // Switch back to gallery to show updated player
        this.app.uiManager.switchTab('player-gallery');
        
        alert('Player updated successfully!');
    }

    // Cancel edit mode
    cancelEdit() {
        // Reset edit mode
        this.app.playerBeingEdited = null;
        
        // Reset form title
        document.getElementById('player-form-title').textContent = 'Add New Player';
        
        // Reset form
        this.resetForm();
        
        // Restore add button
        const addButton = document.querySelector('.form-actions button[onclick="updatePlayer()"]');
        if (addButton) {
            addButton.textContent = 'Add Player';
            addButton.setAttribute('onclick', 'addPlayer()');
        }
        
        // Remove cancel button
        const cancelButton = document.querySelector('.cancel-edit-btn');
        if (cancelButton) {
            cancelButton.remove();
        }
    }

    // Used to reset the form for adding players
    resetForm() {
        document.getElementById('playerName').value = '';
        
        // Uncheck all position checkboxes
        document.querySelectorAll('input[name="position"]').forEach(cb => {
            cb.checked = false;
        });

        // Reset preferred position
        document.getElementById('preferredPosition').value = '';
        this.app.uiManager.updatePreferredPositionOptions();

        // Reset outfield stats to 75
        const outfieldStatInputs = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical', 'overall'];
        outfieldStatInputs.forEach(stat => {
            document.getElementById(stat).value = 75;
        });

        // Reset goalkeeper stats to 75
        const gkStatInputs = ['gk_diving', 'gk_handling', 'gk_kicking', 'gk_reflexes', 'gk_speed', 'gk_positioning', 'gk_overall'];
        gkStatInputs.forEach(stat => {
            document.getElementById(stat).value = 75;
        });

        this.app.uiManager.updateStatLabels(); // Update visibility of stat sections
        document.getElementById('playerName').focus();
    }

    // Shuffle players in the player gallery
    shufflePlayers() {
        for (let i = this.app.players.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.app.players[i], this.app.players[j]] = [this.app.players[j], this.app.players[i]];
        }
        this.app.uiManager.updatePlayersList();
        this.app.dataManager.savePlayersToStorage();
    }

    // Clear players in the player gallery
    clearPlayers() {
        if (this.app.players.length === 0) return;
        
        if (confirm(`Are you sure you want to remove all ${this.app.players.length} players?`)) {
            this.app.players = [];
            this.app.teams = [];
            this.app.uiManager.updatePlayersList();
            this.app.uiManager.updateTeamsDisplay(); // This will call enableGenerateButton when teams are empty
            this.app.dataManager.savePlayersToStorage();
        }
    }

    // Toggle players
    togglePlayerSelection(playerId) {
        const player = this.app.players.find(p => p.id === playerId);
        if (player) {
            player.selected = !player.selected;
            this.app.uiManager.updatePlayersList();
            this.app.dataManager.savePlayersToStorage();
        }
    }

    // Select all players
    selectAllPlayers() {
        this.app.players.forEach(player => {
            player.selected = true;
        });
        this.app.uiManager.updatePlayersList();
        this.app.dataManager.savePlayersToStorage();
    }

    // Deselect all players
    deselectAllPlayers() {
        this.app.players.forEach(player => {
            player.selected = false;
        });
        this.app.uiManager.updatePlayersList();
        this.app.dataManager.savePlayersToStorage();
    }

    // Get all selected players
    getSelectedPlayers() {
        return this.app.players.filter(player => player.selected);
    }

    // Get a player's overall rating based on their role and stats
    getPlayerOverallRating(player) {
        // For players with both GK and outfield stats, prioritize based on preferred position
        if (player.gkStats && player.outfieldStats) {
            if (player.preferredPosition === 'GK') {
                return player.gkStats.overall;
            } else {
                return player.outfieldStats.overall;
            }
        }
        
        // For players with only one set of stats
        if (player.gkStats) {
            return player.gkStats.overall;
        }
        
        if (player.outfieldStats) {
            return player.outfieldStats.overall;
        }
        
        // Fallback
        return 75;
    }

    // Get a player's rating based on the position they are actually playing
    getPlayerRatingForPosition(player, assignedPosition) {
        // If the assigned position is GK and player has GK stats, use GK overall
        if (assignedPosition === 'GK' && player.gkStats) {
            return player.gkStats.overall;
        }
        
        // Otherwise use outfield stats if available
        if (player.outfieldStats) {
            return player.outfieldStats.overall;
        }
        
        // If no outfield stats but has GK stats (emergency outfield player)
        if (player.gkStats) {
            // Penalty for GK playing outfield
            return Math.max(player.gkStats.overall - 20, 40);
        }
        
        // Fallback
        return 75;
    }
}
