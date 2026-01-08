/**
 * DataManager: Handles data persistence and import/export (Data Access layer)
 * 
 * Responsibilities:
 * 1. Local Storage Management: Persistent data storage using Web Storage API
 * 2. Data Import/Export: JSON-based data portability for sharing and backup
 * 3. Sample Data Generation: Realistic test data with professional soccer players
 * 4. Data Validation: Ensures data integrity during import operations
 * 
 * Data Structure:
 * Player objects contain: id, name, positions[], preferredPosition, selected, 
 * outfieldStats{}, gkStats{} for comprehensive soccer simulation
 */

class DataManager {
    // Constructor establishes connection to main application
    constructor(app) {
        this.app = app; // Dependency injection for accessing shared application state
    }

    /**
     * Persists player data to browser's localStorage
     * 
     * Technical Implementation:
     * - Uses JSON.stringify for object serialization
     * - Implements try-catch for graceful error handling
     * - Uses namespaced key to avoid conflicts with other applications
     * - Handles localStorage quota exceeded scenarios
     */
    savePlayersToStorage() {
        try {
            // Serialize player array to JSON string for storage
            const serializedData = JSON.stringify(this.app.players);
            
            // Store with namespaced key to prevent conflicts
            localStorage.setItem('soccerTeamGenerator_players', serializedData);
            
            console.log(`Successfully saved ${this.app.players.length} players to localStorage`);
        } catch (error) {
            // Handle storage quota exceeded or other localStorage errors
            console.error('Error saving players to localStorage:', error);
            
            // Could implement fallback strategies here (e.g., IndexedDB, server storage)
            if (error.name === 'QuotaExceededError') {
                alert('Storage quota exceeded. Please export your data and clear some space.');
            }
        }
    }

    /**
     * Loads previously saved player data from localStorage
     * 
     * Data Recivery Strategy:
     * - Attempts to parse stored JSON data
     * - Falls back to empty array on any errors
     * - Validates data structure after loading
     * - Provides user feedback on successful loads
     */
    loadPlayersFromStorage() {
        try {
            // Retrieve serialized data from localStorage
            const savedPlayers = localStorage.getItem('soccerTeamGenerator_players');
            
            if (savedPlayers) {
                // Deserialize JSON string back to JavaScript objects
                this.app.players = JSON.parse(savedPlayers);
                console.log(`Loaded ${this.app.players.length} players from localStorage`);
            } else {
                console.log('No saved player data found in localStorage');
            }
        } catch (error) {
            // Handle corrupted data or JSON parsing errors
            console.error('Error loading players from localStorage:', error);
            
            // Reset to empty state on any loading errors
            this.app.players = [];
            
            alert('Error loading saved data. Starting with empty player list.');
        }
    }

    /**
     * Exports player data to downloadable JSON file
     * 
     * File Export Implementation:
     * - Creates structured data package with metadata
     * - Uses Blob API for client-side file generation
     * - Implements Object URL pattern for download
     * - Includes version info for future compatibility
     * - Automatic filename generation with timestamp
     */
    exportPlayersToJSON() {
        // Validation: Ensure there's data to export
        if (this.app.players.length === 0) {
            alert('No players to export. Please add some players first.');
            return;
        }

        // Create structured export package with metadata
        const dataToExport = {
            version: '1.0',                           // For future compatibility
            exportDate: new Date().toISOString(),     // Timestamp for organization
            playerCount: this.app.players.length,     // Quick reference
            application: 'Soccer Team Generator',     // Source identification
            players: this.app.players                 // Actual player data
        };

        // Convert to formatted JSON string for readability
        const jsonString = JSON.stringify(dataToExport, null, 2);
        
        // Create downloadable file using Blob API
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Programmatically trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = `soccer_players_${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        // Clean up memory by revoking object URL
        URL.revokeObjectURL(url);
        
        alert(`Successfully exported ${this.app.players.length} players to JSON file!`);
    }

    /**
     * Imports player data from user-selected JSON file
     * 
     * Import Process Architecture
     * 1. File Selection: Uses HTML5 File API for client-side file access
     * 2. Data Validation: Multi-layer validation for data integrity
     * 3. Conflict Resolution: Smart handling of duplicate names
     * 4. User Choice: Replace vs. Merge strategies for existing data
     * 5. UI Updates: Immediate refresh and navigation to results
     */
    importPlayersFromJSON() {
        // Create hidden file input for user file selection
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json'; // Restrict to JSON files only
        
        // Set up file processing event handler
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return; // User cancelled file selection

            // Use FileReader API for client-side file processing
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    // Parse JSON with error handling
                    const importedData = JSON.parse(e.target.result);
                    
                    // Validate top-level structure
                    if (!importedData.players || !Array.isArray(importedData.players)) {
                        alert('Invalid file format. Please select a valid player export file.');
                        return;
                    }
                    
                    const playersToImport = importedData.players;
                    
                    // Validate individual player records
                    const invalidPlayers = playersToImport.filter(player => 
                        !player.name || !player.positions || !Array.isArray(player.positions)
                    );
                    
                    if (invalidPlayers.length > 0) {
                        alert(`Found ${invalidPlayers.length} invalid player(s) in the file. Import cancelled.`);
                        return;
                    }
                    
                    // User choice for conflict resolution
                    const shouldReplace = this.app.players.length > 0 ? 
                        confirm(`You have ${this.app.players.length} existing players. Click OK to REPLACE them, or Cancel to MERGE with imported players.`) :
                        true;
                    
                    if (shouldReplace) {
                        this.app.players = []; // Clear existing data
                    }
                    
                    // Import with duplicate name handling
                    let importedCount = 0;
                    for (const playerData of playersToImport) {
                        // Check for duplicate names and add number suffix if needed
                        let finalName = playerData.name;
                        let nameCounter = 1;
                        while (this.app.players.some(existingPlayer => existingPlayer.name === finalName)) {
                            finalName = `${playerData.name} (${nameCounter})`;
                            nameCounter++;
                        }
                        
                        const newPlayer = {
                            id: Date.now() + Math.random(),
                            name: finalName,
                            positions: playerData.positions,
                            preferredPosition: playerData.preferredPosition || playerData.positions[0],
                            selected: playerData.selected !== undefined ? playerData.selected : false
                        };
                        
                        // Add stats if present
                        if (playerData.outfieldStats) {
                            newPlayer.outfieldStats = playerData.outfieldStats;
                        }
                        if (playerData.gkStats) {
                            newPlayer.gkStats = playerData.gkStats;
                        }
                        
                        this.app.players.push(newPlayer);
                        importedCount++;
                    }
                    
                    // Update UI and save
                    this.app.uiManager.updatePlayersList();
                    this.savePlayersToStorage();
                    
                    // Switch to gallery to show imported players
                    this.app.uiManager.switchTab('player-gallery');
                    
                    const message = shouldReplace 
                        ? `Successfully imported ${importedCount} players (replaced existing players).`
                        : `Successfully imported ${importedCount} players (merged with existing ${this.app.players.length - importedCount} players).`;
                    
                    alert(message);
                    
                } catch (error) {
                    console.error('Error importing players:', error);
                    alert('Error reading the file. Please make sure it\'s a valid JSON file exported from this application.');
                }
            };
            
            reader.readAsText(file);
        };
        
        // Trigger file selection dialog
        input.click();
    }

    // Generates realistic sample data for demonstration and testing
    addSamplePlayers() {
        // Sample array of 22 world-class players with realistic stats
        // Distribution: 2 GK (1 dual-role), 4 DEF, 8 MID, 8 FWD for formation flexibility
        const samplePlayers = [
            // Goalkeepers (2 players)
            
            // Pure Goalkeeper - Elite shot-stopper
            { 
                name: 'Alisson Becker', 
                positions: ['GK'],
                preferredPosition: 'GK',
                gkStats: { diving: 89, handling: 90, kicking: 86, reflexes: 85, speed: 54, positioning: 87, overall: 89 }
            },
            
            // Dual-role: Sweeper-Keeper (Revolutionary modern goalkeeper concept)
            // Can play as emergency center-back, excellent with feet
            { 
                name: 'Manuel Neuer', 
                positions: ['GK', 'CB'],
                preferredPosition: 'GK',
                gkStats: { diving: 91, handling: 88, kicking: 95, reflexes: 89, speed: 61, positioning: 91, overall: 90 },
                outfieldStats: { pace: 58, shooting: 65, passing: 91, dribbling: 82, defending: 75, physical: 85, overall: 78 }
            },
            
            // Defednders (6 players total)
            
            // Left Backs - Modern attacking fullbacks who can play midfield
            { name: 'Andrew Robertson', positions: ['LB', 'LM'], preferredPosition: 'LB', outfieldStats: { pace: 81, shooting: 59, passing: 81, dribbling: 73, defending: 85, physical: 77, overall: 87 }},
            { name: 'Alphonso Davies', positions: ['LB', 'LW'], preferredPosition: 'LB', outfieldStats: { pace: 96, shooting: 68, passing: 77, dribbling: 82, defending: 76, physical: 77, overall: 84 }},
            
            // Centre Backs - Including versatile defenders
            { name: 'Virgil van Dijk', positions: ['CB', 'CDM'], preferredPosition: 'CB', outfieldStats: { pace: 77, shooting: 60, passing: 71, dribbling: 72, defending: 91, physical: 86, overall: 90 }},
            { name: 'Rúben Dias', positions: ['CB', 'RB'], preferredPosition: 'CB', outfieldStats: { pace: 61, shooting: 47, passing: 65, dribbling: 61, defending: 88, physical: 85, overall: 88 }},
            
            // Dual-role: CB and GK (emergency keeper) - Ramos can also play RB
            { 
                name: 'Sergio Ramos', 
                positions: ['CB', 'GK', 'RB'],
                preferredPosition: 'CB',
                outfieldStats: { pace: 58, shooting: 64, passing: 68, dribbling: 71, defending: 88, physical: 83, overall: 84 },
                gkStats: { diving: 45, handling: 42, kicking: 68, reflexes: 48, speed: 58, positioning: 52, overall: 55 }
            },
            
            { name: 'Thiago Silva', positions: ['CB', 'CDM'], preferredPosition: 'CB', outfieldStats: { pace: 50, shooting: 38, passing: 68, dribbling: 62, defending: 85, physical: 76, overall: 83 }},
            
            // Right Backs (2) - both versatile attacking fullbacks
            { name: 'Trent Alexander-Arnold', positions: ['RB', 'RM', 'CM'], preferredPosition: 'RB', outfieldStats: { pace: 76, shooting: 66, passing: 89, dribbling: 73, defending: 78, physical: 71, overall: 87 }},
            { name: 'João Cancelo', positions: ['RB', 'LB', 'RM', 'LM'], preferredPosition: 'RB', outfieldStats: { pace: 85, shooting: 77, passing: 86, dribbling: 90, defending: 74, physical: 78, overall: 86 }},
            
            // Defensive Midfielders (2) - both can play CB
            { name: 'N\'Golo Kanté', positions: ['CDM', 'CM', 'CB'], preferredPosition: 'CDM', outfieldStats: { pace: 77, shooting: 66, passing: 75, dribbling: 82, defending: 87, physical: 82, overall: 89 }},
            { name: 'Casemiro', positions: ['CDM', 'CB', 'CM'], preferredPosition: 'CDM', outfieldStats: { pace: 62, shooting: 72, passing: 75, dribbling: 72, defending: 88, physical: 90, overall: 85 }},
            
            // Centre Midfielders (4) - each with different secondary strengths
            { name: 'Kevin De Bruyne', positions: ['CM', 'CAM', 'RM'], preferredPosition: 'CM', outfieldStats: { pace: 76, shooting: 86, passing: 93, dribbling: 88, defending: 64, physical: 78, overall: 91 }},
            { name: 'Luka Modrić', positions: ['CM', 'CAM', 'CDM'], preferredPosition: 'CM', outfieldStats: { pace: 74, shooting: 76, passing: 89, dribbling: 90, defending: 72, physical: 65, overall: 87 }},
            { name: 'Bruno Fernandes', positions: ['CM', 'CAM', 'RW'], preferredPosition: 'CM', outfieldStats: { pace: 75, shooting: 85, passing: 89, dribbling: 84, defending: 69, physical: 77, overall: 86 }},
            { name: 'Paul Pogba', positions: ['CM', 'CDM', 'CAM'], preferredPosition: 'CM', outfieldStats: { pace: 73, shooting: 79, passing: 86, dribbling: 85, defending: 59, physical: 87, overall: 85 }},
            
            // Left Wingers (2) - both can play across the front line
            { name: 'Sadio Mané', positions: ['LW', 'ST', 'RW'], preferredPosition: 'LW', outfieldStats: { pace: 94, shooting: 83, passing: 76, dribbling: 89, defending: 44, physical: 76, overall: 89 }},
            { name: 'Son Heung-min', positions: ['LW', 'ST', 'RW', 'CAM'], preferredPosition: 'LW', outfieldStats: { pace: 88, shooting: 89, passing: 82, dribbling: 86, defending: 42, physical: 69, overall: 89 }},
            
            // Strikers (2) - versatile center forwards
            { name: 'Robert Lewandowski', positions: ['ST', 'CAM'], preferredPosition: 'ST', outfieldStats: { pace: 78, shooting: 91, passing: 79, dribbling: 86, defending: 44, physical: 82, overall: 91 }},
            { name: 'Erling Haaland', positions: ['ST', 'RW'], preferredPosition: 'ST', outfieldStats: { pace: 89, shooting: 94, passing: 65, dribbling: 80, defending: 45, physical: 88, overall: 88 }},
            
            // Right Wingers (2) - elite attackers with multiple roles
            { name: 'Mohamed Salah', positions: ['RW', 'ST', 'RM'], preferredPosition: 'RW', outfieldStats: { pace: 90, shooting: 87, passing: 81, dribbling: 90, defending: 45, physical: 75, overall: 90 }},
            { name: 'Lionel Messi', positions: ['RW', 'CAM', 'ST'], preferredPosition: 'RW', outfieldStats: { pace: 85, shooting: 92, passing: 91, dribbling: 95, defending: 35, physical: 68, overall: 94 }}
        ];

        // Add sample players with unique IDs and proper data structure
        console.log(`Loading ${samplePlayers.length} sample players...`);
        samplePlayers.forEach((player, index) => {
            const newPlayer = {
                id: Date.now() + Math.random(),
                name: player.name,
                positions: player.positions,
                preferredPosition: player.preferredPosition || player.positions[0], // Use preferred or default to first position
                selected: true // Sample players are selected by default
            };

            // Add outfield stats if present
            if (player.outfieldStats) {
                newPlayer.outfieldStats = player.outfieldStats;
            }

            // Add GK stats if present
            if (player.gkStats) {
                newPlayer.gkStats = player.gkStats;
            }

            this.app.players.push(newPlayer);
        });

        console.log(`Successfully loaded ${this.app.players.length} players out of ${samplePlayers.length} sample players`);
        this.app.uiManager.updatePlayersList();
        this.savePlayersToStorage();
        
        // Switch to gallery tab to show the sample players
        this.app.uiManager.switchTab('player-gallery');
        alert('22 sample players added including dual-role players (Manuel Neuer: GK/CB, Sergio Ramos: CB/GK)!');
    }
}
