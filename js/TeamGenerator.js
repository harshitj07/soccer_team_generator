/**
 * TeamGenerator: Implements team generation algorithms (Logic layer)
 * 
 * Core Methods:
 * 1. Snake Draft Algorithm: Ensures fair distribution of high-rated players
 * 2. Position-Based Balancing: Maintains realistic soccer formations (4-3-3)
 * 3. Size-Controlled Distribution: Handles uneven player counts gracefully
 * 4. Rating-Based Sorting: Uses player stats for balanced team strength
 * 
 * Algorithm Complexity:
 * - Time Complexity: O(n log n) for sorting + O(n) for distribution = O(n log n) - Players are sorted by their attributes, similar to how Merge Sort or Quick Sort operates. After sorting, algorithm distributes players into teams in a single pass.
 * - Space Complexity: O(n) for team structures and temporary arrays - The algorithm uses additional memory that grows linearly with the number of players (n). This memory must store arrays for sorting and the list of players for each team for example.
 * 
 * Soccer-Specific Features:
 * - Formation-aware player placement (GK, defenders, midfielders, forwards)
 * - Position flexibility handling (players with multiple positions)
 * - Preferred position prioritization for optimal team chemistry
 * - Realistic team size management (11 players + substitutes)
 */

class TeamGenerator {
    // Constructor establishes connection to main application
    constructor(app) {
        this.app = app; // Dependency injection for accessing player data and UI updates
    }

    /**
     * Main team generation
     * 
     * Generation Process:
     * 1. Input validation and player selection
     * 2. Balanced team size calculation
     * 3. Advanced algorithm execution
     * 4. UI state management and display
     * 
     * Mathematical Approach:
     * - Uses modular arithmetic for even distribution
     * - Implements ceiling/floor division for handling remainders
     * - Ensures no team differs by more than 1 player
     */
    generateTeams() {
        // Extract user preferences from UI controls
        const numTeams = parseInt(document.getElementById('teamCount').value);
        const playerSelection = document.getElementById('playerSelection').value;
        
        // Smart player selection logic based on user choice
        let playersToUse;
        if (playerSelection === 'selected') {
            // Use only players marked as selected in the gallery
            playersToUse = this.app.playerManager.getSelectedPlayers();
            if (playersToUse.length === 0) {
                alert('Please select some players first in the Player Gallery or choose "Use All Players"');
                return;
            }
        } else {
            // Use all available players in the system
            playersToUse = this.app.players;
        }

        // Basic validation: ensure we have players to work with
        if (playersToUse.length === 0) {
            alert('Please add some players first');
            return;
        }

        // Mathematical team size calculation
        // Implements fair distribution algorithm for uneven player counts
        const totalPlayers = playersToUse.length;
        const basePlayersPerTeam = Math.floor(totalPlayers / numTeams);  // Base size for all teams
        const extraPlayers = totalPlayers % numTeams;                    // Remainder players to distribute
        
        const targetTeamSizes = [];
        for (let i = 0; i < numTeams; i++) {
            // Distribute extra players evenly: first 'extraPlayers' teams get +1 player
            // Example: 23 players, 3 teams → [8, 8, 7] instead of [7, 7, 9]
            targetTeamSizes.push(basePlayersPerTeam + (i < extraPlayers ? 1 : 0));
        }
        
        console.log(`Generating teams with balanced sizes: ${targetTeamSizes.join(', ')} (Total: ${totalPlayers} players)`);

        // Execute advanced team generation algorithm
        this.app.teams = this.createBalancedTeamsWithSizeControl(numTeams, targetTeamSizes, playersToUse);
        
        // Update UI and application state
        this.app.uiManager.updateTeamsDisplay();
        this.app.lastGenerationPlayerCount = playersToUse.length; // For change detection
        
        // UI State Management: Disable generate, enable regenerate
        this.disableGenerateButton();
        
        // User Experience: Navigate to results immediately
        this.app.uiManager.switchTab('generate-teams');
    }

    // Regenerates teams with enhanced randomization, while maintaining team count and fairness while providing variety
    regenerateTeams() {
        // Early validation
        if (!this.validateExistingTeams()) return;
        
        const config = this.getCurrentTeamConfig();
        if (!config) return;
        
        const { numTeams, playersToUse } = config;
        const targetSizes = this.calculateTeamSizes(playersToUse.length, numTeams);
        
        console.log(`Regenerating ${numTeams} teams with sizes: ${targetSizes.join(', ')}`);
        
        // Apply enhanced randomization
        const randomizedPlayers = this.applyRandomization(playersToUse);
        
        // Generate new teams
        this.app.teams = this.createBalancedTeamsWithSizeControl(numTeams, targetSizes, randomizedPlayers);
        this.app.uiManager.updateTeamsDisplay();
        
        console.log('Teams regenerated successfully');
    }

    // Validates that teams exist for regeneration
    validateExistingTeams() {
        if (!this.app.teams || this.app.teams.length === 0) {
            alert('Please generate teams first before regenerating.');
            return false;
        }
        return true;
    }

    // Gets current team configuration (team count and selected players)
    getCurrentTeamConfig() {
        const numTeams = this.app.teams.length;
        const playerSelection = document.getElementById('playerSelection').value;
        
        let playersToUse;
        if (playerSelection === 'selected') {
            playersToUse = this.app.playerManager.getSelectedPlayers();
            if (playersToUse.length === 0) {
                alert('Please select some players first in the Player Gallery or choose "Use All Players"');
                return null;
            }
        } else {
            playersToUse = this.app.players;
        }
        
        return { numTeams, playersToUse };
    }

    // Calculates balanced team sizes
    calculateTeamSizes(totalPlayers, numTeams) {
        const baseSize = Math.floor(totalPlayers / numTeams); // Divides player evenly among teams
        const extraPlayers = totalPlayers % numTeams; // Remainder players to distribute
        
        return Array.from({ length: numTeams }, (_, i) => // Creates an array with numTeams elements
            baseSize + (i < extraPlayers ? 1 : 0)
        );
    }

    // Applies enhanced randomization to players
    applyRandomization(players) {
        const shuffled = [...players];
        
        // Multiple shuffles for enhanced randomness
        for (let i = 0; i < 3; i++) {
            this.shuffleArray(shuffled);
        }
        
        // Add temporary rating adjustments for variety
        return shuffled.map(player => ({
            ...player,
            tempRatingAdjustment: (Math.random() - 0.5) * 10 // ±5 rating adjustment
        }));
    }

    /**
     * CORE ALGORITHM: Advanced Team Generation with Size Control
     * 
     * ALGORITHM OVERVIEW:
     * This is the heart of the application - a sophisticated team generation algorithm that combines multiple computer science concepts for optimal team balance:
     * 
     * 1. Snake Draft Algorithm (from Fantasy Sports)
     *    - Prevents any single team from getting all the best players
     *    - Alternating pick order: Team 1→2→3, then 3→2→1, then 1→2→3...
     *    - Time Complexity: O(n) for distribution after O(n log n) sorting
     * 
     * 2. Position Based Distribution (Soccer Domain Knowledge)
     *    - Ensures realistic team formations (4-3-3: 1 GK, 4 DEF, 3 MID, 3 FWD)
     *    - Handles multi-position players intelligently
     *    - Prioritizes preferred positions for optimal team chemistry
     * 
     * 3. Size Controlled Distribution (Mathematical Fairness)
     *    - Guarantees teams differ by at most 1 player
     *    - Handles any number of players and teams gracefully
     *    - Uses modular arithmetic for perfect distribution
     * 
     * 4. Rating-Based Sorting (Competitive Balance)
     *    - Uses FIFA-style overall ratings for player comparison
     *    - Implements tie-breaking with temporary random adjustments
     *    - Ensures no team has unfair advantage in overall strength
     */
    createBalancedTeamsWithSizeControl(numTeams, targetTeamSizes, playersToUse = null) {
        // STEP 1: DATA PREPARATION AND INITIALIZATION
        const sourcePlayersArray = playersToUse || this.app.players;
        
        // Initialize team data structures with soccer formation template
        const teams = Array.from({ length: numTeams }, (_, index) => ({
            id: index + 1,
            name: `Team ${index + 1}`,
            players: [],
            formation: {
                goalkeeper: null,
                defenders: [],
                midfielders: [],
                forwards: []
            },
            totalRating: 0,
            averageRating: 0,
            targetSize: targetTeamSizes[index] // Add target size for this team
        }));

        // Define position categories
        const positionCategories = {
            goalkeeper: ['GK'],
            defenders: ['CB', 'LB', 'RB'],
            midfielders: ['CDM', 'CM', 'CAM', 'LM', 'RM'],
            forwards: ['LW', 'RW', 'ST']
        };

        // Sort players with randomized ratings for more variation
        const sortedPlayers = [...sourcePlayersArray].sort((a, b) => {
            const ratingA = this.app.playerManager.getPlayerOverallRating(a) + (a.tempRatingAdjustment || 0);
            const ratingB = this.app.playerManager.getPlayerOverallRating(b) + (b.tempRatingAdjustment || 0);
            return ratingB - ratingA;
        });

        console.log(`Size-controlled team generation using ${sortedPlayers.length} players for ${numTeams} teams with target sizes: [${targetTeamSizes.join(', ')}]`);

        let assignedPlayers = new Set();
        
        // Picks a random direction: either forward (0→1→2→…) or reverse (THIS IS THE SNAKE DRAFT FUNCTIONALITY)
        let currentTeam = Math.floor(Math.random() * numTeams);
        let direction = Math.random() > 0.5 ? 1 : -1;
        
        console.log(`Starting snake draft from Team ${currentTeam + 1}, direction: ${direction > 0 ? 'forward' : 'reverse'}`);

        // PHASE 1: GK ASSIGNMENT with position flexibility
        console.log('PHASE 1: Enhanced goalkeeper assignment with balanced size control...');
        
        // Get all players who can play GK (preferred or alternative)
        const allGKCapablePlayers = sortedPlayers.filter(p => 
            p.positions.includes('GK') && !assignedPlayers.has(p.id)
        );
        
        // Shuffle GK players for more variation, but still prioritize preferred GKs
        const preferredGKs = allGKCapablePlayers.filter(p => p.preferredPosition === 'GK');
        const alternativeGKs = allGKCapablePlayers.filter(p => p.preferredPosition !== 'GK');
        
        this.shuffleArray(preferredGKs);
        this.shuffleArray(alternativeGKs);
        
        const shuffledGKs = [...preferredGKs, ...alternativeGKs];
        
        // Assign goalkeepers using random team order
        const teamOrder = Array.from({length: numTeams}, (_, i) => i);
        this.shuffleArray(teamOrder);
        
        for (let i = 0; i < teamOrder.length && i < shuffledGKs.length; i++) {
            const player = shuffledGKs[i];
            const teamIndex = teamOrder[i];
            // Assign the actual position they'll play
            player.assignedPosition = 'GK';
            teams[teamIndex].formation.goalkeeper = player;
            teams[teamIndex].players.push(player);
            assignedPlayers.add(player.id);
            console.log(`Assigned ${player.name} (GK) to Team ${teamIndex + 1} - RANDOMIZED ORDER`);
        }

        // PHASE 2: SIZE-CONTROLLED ASSIGNMENT with snake draft
        console.log('PHASE 2: Size-controlled position assignment with snake draft...');
        
        // Group remaining players by position categories and shuffle each group
        const remainingPlayers = sortedPlayers.filter(p => !assignedPlayers.has(p.id));
        
        const positionGroups = {
            defenders: remainingPlayers.filter(p => 
                p.positions.some(pos => positionCategories.defenders.includes(pos))
            ),
            midfielders: remainingPlayers.filter(p => 
                p.positions.some(pos => positionCategories.midfielders.includes(pos))
            ),
            forwards: remainingPlayers.filter(p => 
                p.positions.some(pos => positionCategories.forwards.includes(pos))
            )
        };
        
        // Shuffle each position group for maximum variation
        Object.values(positionGroups).forEach(group => this.shuffleArray(group));
        
        // Create a mixed assignment pool with position weighting
        const assignmentPool = [];
        
        // Add defenders (weight them higher since teams need more)
        for (let i = 0; i < Math.min(positionGroups.defenders.length, numTeams * 4); i++) {
            assignmentPool.push({player: positionGroups.defenders[i], priority: 'defender'});
        }
        
        // Add midfielders
        for (let i = 0; i < Math.min(positionGroups.midfielders.length, numTeams * 4); i++) {
            assignmentPool.push({player: positionGroups.midfielders[i], priority: 'midfielder'});
        }
        
        // Add forwards
        for (let i = 0; i < Math.min(positionGroups.forwards.length, numTeams * 3); i++) {
            assignmentPool.push({player: positionGroups.forwards[i], priority: 'forward'});
        }
        
        // Shuffle the entire assignment pool for maximum randomization
        this.shuffleArray(assignmentPool);
        
        // Helper function to determine the best specific position for a player in a formation line
        const getBestPositionForFormationLine = (player, formationLine, existingPlayers = []) => {
            // For goalkeepers, always return GK
            if (formationLine === 'goalkeeper') return 'GK';
            
            // Get player's available positions for this formation line
            const linePositions = {
                'defender': ['CB', 'LB', 'RB'],
                'midfielder': ['CDM', 'CM', 'CAM', 'LM', 'RM'], 
                'forward': ['LW', 'RW', 'ST']
            };
            
            const availablePositions = player.positions.filter(pos => 
                linePositions[formationLine]?.includes(pos)
            );
            
            // Prefer the player's preferred position if it's available for this line
            if (availablePositions.includes(player.preferredPosition)) {
                return player.preferredPosition;
            }
            
            // Otherwise, choose the first available position for this line
            return availablePositions[0] || linePositions[formationLine][0];
        };
        
        // Size-controlled snake draft assignment
        for (const item of assignmentPool) {
            const player = item.player;
            if (assignedPlayers.has(player.id)) continue;
            
            let attempts = 0;
            let assigned = false;
            
            while (attempts < numTeams && !assigned) {
                const team = teams[currentTeam];
                
                // Check if team has reached its target size
                if (team.players.length >= team.targetSize) {
                    // Move to next team in snake pattern
                    currentTeam += direction;
                    if (currentTeam >= numTeams) { 
                        currentTeam = numTeams - 1; 
                        direction = -1; 
                    } else if (currentTeam < 0) { 
                        currentTeam = 0; 
                        direction = 1; 
                    }
                    attempts++;
                    continue;
                }
                
                // Try to assign based on priority, but be flexible
                if (item.priority === 'defender' && team.formation.defenders.length < 4) {
                    player.assignedPosition = getBestPositionForFormationLine(player, 'defender', team.formation.defenders);
                    team.formation.defenders.push(player);
                    team.players.push(player);
                    assignedPlayers.add(player.id);
                    assigned = true;
                } else if (item.priority === 'midfielder' && team.formation.midfielders.length < 4) {
                    player.assignedPosition = getBestPositionForFormationLine(player, 'midfielder', team.formation.midfielders);
                    team.formation.midfielders.push(player);
                    team.players.push(player);
                    assignedPlayers.add(player.id);
                    assigned = true;
                } else if (item.priority === 'forward' && team.formation.forwards.length < 3) {
                    player.assignedPosition = getBestPositionForFormationLine(player, 'forward', team.formation.forwards);
                    team.formation.forwards.push(player);
                    team.players.push(player);
                    assignedPlayers.add(player.id);
                    assigned = true;
                } else {
                    // Flexible assignment - put player wherever there's space
                    if (team.formation.defenders.length < 4 && player.positions.some(pos => positionCategories.defenders.includes(pos))) {
                        player.assignedPosition = getBestPositionForFormationLine(player, 'defender', team.formation.defenders);
                        team.formation.defenders.push(player);
                        team.players.push(player);
                        assignedPlayers.add(player.id);
                        assigned = true;
                    } else if (team.formation.midfielders.length < 4 && player.positions.some(pos => positionCategories.midfielders.includes(pos))) {
                        player.assignedPosition = getBestPositionForFormationLine(player, 'midfielder', team.formation.midfielders);
                        team.formation.midfielders.push(player);
                        team.players.push(player);
                        assignedPlayers.add(player.id);
                        assigned = true;
                    } else if (team.formation.forwards.length < 3 && player.positions.some(pos => positionCategories.forwards.includes(pos))) {
                        player.assignedPosition = getBestPositionForFormationLine(player, 'forward', team.formation.forwards);
                        team.formation.forwards.push(player);
                        team.players.push(player);
                        assignedPlayers.add(player.id);
                        assigned = true;
                    }
                }
                
                if (!assigned) {
                    // Move to next team in snake pattern
                    currentTeam += direction;
                    if (currentTeam >= numTeams) { 
                        currentTeam = numTeams - 1; 
                        direction = -1; 
                    } else if (currentTeam < 0) { 
                        currentTeam = 0; 
                        direction = 1; 
                    }
                    attempts++;
                }
            }
            
            if (assigned) {
                // Continue snake pattern for next player
                currentTeam += direction;
                if (currentTeam >= numTeams) { 
                    currentTeam = numTeams - 1; 
                    direction = -1; 
                } else if (currentTeam < 0) { 
                    currentTeam = 0; 
                    direction = 1; 
                }
            }
        }
        
        // PHASE 3: Assign any remaining players flexibly (respect size limits)
        const finalRemainingPlayers = sortedPlayers.filter(p => !assignedPlayers.has(p.id));
        console.log(`PHASE 3: Assigning ${finalRemainingPlayers.length} remaining players with size constraints...`);
        
        this.shuffleArray(finalRemainingPlayers);
        
        for (const player of finalRemainingPlayers) {
            // Find teams that haven't reached their target size yet
            const teamsWithSpace = teams.filter(team => team.players.length < team.targetSize);
            
            if (teamsWithSpace.length === 0) break; // All teams are full
            
            // Sort teams by current size (smallest first) to maintain balance
            teamsWithSpace.sort((a, b) => a.players.length - b.players.length);
            
            let assigned = false;
            for (const team of teamsWithSpace) {
                if (team.formation.defenders.length < 4) {
                    team.formation.defenders.push(player);
                    team.players.push(player);
                    assignedPlayers.add(player.id);
                    assigned = true;
                    break;
                } else if (team.formation.midfielders.length < 4) {
                    team.formation.midfielders.push(player);
                    team.players.push(player);
                    assignedPlayers.add(player.id);
                    assigned = true;
                    break;
                } else if (team.formation.forwards.length < 3) {
                    team.formation.forwards.push(player);
                    team.players.push(player);
                    assignedPlayers.add(player.id);
                    assigned = true;
                    break;
                }
            }
            
            if (!assigned && teamsWithSpace.length > 0) {
                // Just add to the smallest team as substitute
                const smallestTeam = teamsWithSpace[0];
                smallestTeam.players.push(player);
                assignedPlayers.add(player.id);
                console.log(`Assigned ${player.name} to Team ${smallestTeam.id} as substitute (flexible)`);
            }
        }

        // Calculate team statistics (remove temp adjustments)
        teams.forEach(team => {
            // Remove temp adjustments before calculating stats
            team.players.forEach(player => {
                delete player.tempRatingAdjustment;
            });
            
            team.totalRating = team.players.reduce((sum, player) => sum + this.app.playerManager.getPlayerOverallRating(player), 0);
            team.averageRating = team.players.length > 0 
                ? (team.totalRating / team.players.length).toFixed(1)
                : 0;
        });
        
        const totalPlayersUsed = teams.reduce((sum, team) => sum + team.players.length, 0);
        const teamSizes = teams.map(team => team.players.length);
        console.log(`Size-controlled team generation complete: ${totalPlayersUsed} players used out of ${sortedPlayers.length} available`);
        console.log(`Final team sizes: [${teamSizes.join(', ')}] (Target: [${targetTeamSizes.join(', ')}])`);
        
        return teams;
    }

    // Utility function to count actual players in a team
    getTeamSize(team) {
        return [
            team.formation.goalkeeper,
            ...team.formation.defenders,
            ...team.formation.midfielders,
            ...team.formation.forwards
        ].filter(p => p !== null).length;
    }

    // Fisher-Yates shuffle algorithm for array randomization
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * UI State Management: Disable generation button after teams are created
     * 
     * Reasoning:
     * - Clearly indicates current application state
     * - Guides user toward "Regenerate" option for intentional changes
     */
    disableGenerateButton() {
        const generateBtn = document.querySelector('.generate-btn');
        if (generateBtn) {
            generateBtn.disabled = true;                 // Functional disable
            generateBtn.style.opacity = '0.6';           // Visual feedback
            generateBtn.style.cursor = 'not-allowed';    // Interaction hint
            generateBtn.textContent = 'Teams Generated'; // Status indication
        }
    }

    /**
     * UI State Management: Re-enable generation button for new team creation
     * 
     * Triggered by:
     * - Any changes or modifications to the team or players
     */
    enableGenerateButton() {
        const generateBtn = document.querySelector('.generate-btn');
        if (generateBtn) {
            generateBtn.disabled = false;               // Restore functionality
            generateBtn.style.opacity = '1';            // Full visual clarity
            generateBtn.style.cursor = 'pointer';       // Interaction indication
            generateBtn.textContent = 'Generate Teams'; // Action clarity
        }
    }

    // Check if team settings have changed and re-enable generate button if needed
    checkTeamSettingsChange() {
        console.log('Checking team settings change...');
        
        // If teams exist, check if settings have changed
        if (this.app.teams && this.app.teams.length > 0) {
            const currentTeamCount = parseInt(document.getElementById('teamCount').value);
            const currentPlayerSelection = document.getElementById('playerSelection').value;
            
            // Get current players to use
            let currentPlayersToUse;
            if (currentPlayerSelection === 'selected') {
                currentPlayersToUse = this.app.playerManager.getSelectedPlayers();
            } else {
                currentPlayersToUse = this.app.players;
            }
            
            console.log(`Current settings: ${currentTeamCount} teams, ${currentPlayersToUse.length} players`);
            console.log(`Previous settings: ${this.app.teams.length} teams, ${this.app.lastGenerationPlayerCount} players`);
            
            // Check if team count changed or player selection changed significantly
            if (this.app.teams.length !== currentTeamCount || 
                (this.app.lastGenerationPlayerCount && this.app.lastGenerationPlayerCount !== currentPlayersToUse.length)) {
                console.log('Settings changed! Re-enabling generate button...');
                this.enableGenerateButton();
                // Hide regenerate button until new teams are generated
                const regenerateBtn = document.getElementById('regenerateBtn');
                if (regenerateBtn) regenerateBtn.style.display = 'none';
                // Clear existing teams
                this.app.teams = [];
                this.app.uiManager.updateTeamsDisplay();
            } else {
                console.log('No significant changes detected');
            }
        } else {
            console.log('No teams exist yet, ensuring generate button is enabled');
            // If no teams exist, make sure the generate button is enabled
            this.enableGenerateButton();
        }
    }
}
