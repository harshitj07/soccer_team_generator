/**
 * UIManager: Manages user interface updates and interactions (View layer)
 * 
 * RESPONSIBILITIES:
 * 1. Tab Navigation: Single-page application routing and state management
 * 2. Dynamic Content Rendering: Real-time updates of player galleries and team displays
 * 3. Form State Management: Context-aware form behavior and validation feedback
 * 4. Visual Feedback: Progress indicators, animations, and user interaction responses
 */

class UIManager {
    // Constructor establishes connection to main application
    constructor(app) {
        this.app = app; // Dependency injection for accessing application state
    }

    /**
     * Implements single-page application tab navigation
     * 
     * Navigation Architecture:
     * - CSS class-based state management for smooth transitions
     * - Maintains browser-like navigation experience
     * - Context-aware content updates (lazy loading pattern)
     * - State persistence for better user experience
     * 
     * Performance Optimizations:
     * - Only updates content when tab becomes active
     * - Uses efficient CSS selectors for class management
     */
    switchTab(tabId) {
        // Clear active states from all navigation elements
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(content => content.classList.remove('active'));

        // Activate selected tab and corresponding content panel
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');

        // Update application state for consistency
        this.app.currentTab = tabId;

        // Context-aware content updates: only refresh data when viewing gallery
        if (tabId === 'player-gallery') {
            this.updatePlayersList(); // Lazy loading pattern
        }
    }

    /**
     * Dynamic form behavior based on selected player positions
     * 
     * Adaptive UI Strategy:
     * - Shows relevant stat sections based on position selection
     * - Provides immediate visual feedback for user selections
     * - Reduces cognitive load by hiding irrelevant options
     * 
     * Technical Implementation
     */
    updateStatLabels() {
        // Analyze current position selections
        const gkCheckbox = document.querySelector('input[name="position"][value="GK"]');
        const outfieldCheckboxes = document.querySelectorAll('input[name="position"]:not([value="GK"])');
        
        const isGoalkeeper = gkCheckbox && gkCheckbox.checked;
        const hasOutfieldPositions = Array.from(outfieldCheckboxes).some(cb => cb.checked);
        
        const outfieldStats = document.getElementById('outfield-stats');
        const goalkeeperlStats = document.getElementById('goalkeeper-stats');
        
        if (isGoalkeeper && hasOutfieldPositions) {
            // Player can play both GK and outfield - show both stat sections
            outfieldStats.style.display = 'block';
            goalkeeperlStats.style.display = 'block';
        } else if (isGoalkeeper) {
            // Player is only GK - show only GK stats
            outfieldStats.style.display = 'none';
            goalkeeperlStats.style.display = 'block';
        } else {
            // Player is only outfield - show only outfield stats
            outfieldStats.style.display = 'block';
            goalkeeperlStats.style.display = 'none';
        }
    }

    // Used to enter a preferred position for players
    updatePreferredPositionOptions() {
        const preferredSelect = document.getElementById('preferredPosition');
        const selectedPositions = Array.from(document.querySelectorAll('input[name="position"]:checked'))
            .map(cb => cb.value);
        
        // Clear existing options
        preferredSelect.innerHTML = '';
        
        if (selectedPositions.length === 0) {
            preferredSelect.innerHTML = '<option value="">Select positions first</option>';
            preferredSelect.disabled = true;
            return;
        }
        
        // Add default option
        preferredSelect.innerHTML = '<option value="">Choose preferred position</option>';
        
        // Create position name mapping
        const positionNames = {
            'GK': 'Goalkeeper (GK)',
            'CB': 'Centre Back (CB)',
            'LB': 'Left Back (LB)',
            'RB': 'Right Back (RB)',
            'CDM': 'Defensive Midfielder (CDM)',
            'CM': 'Centre Midfielder (CM)',
            'CAM': 'Attacking Midfielder (CAM)',
            'LM': 'Left Midfielder (LM)',
            'RM': 'Right Midfielder (RM)',
            'LW': 'Left Wing (LW)',
            'RW': 'Right Wing (RW)',
            'ST': 'Striker (ST)'
        };
        
        // Add options for selected positions
        selectedPositions.forEach(position => {
            const option = document.createElement('option');
            option.value = position;
            option.textContent = positionNames[position] || position;
            preferredSelect.appendChild(option);
        });
        
        // Enable the select
        preferredSelect.disabled = false;
        
        // If only one position is selected, automatically select it as preferred
        if (selectedPositions.length === 1) {
            preferredSelect.value = selectedPositions[0];
        }
    }

    // Update the player gallery
    updatePlayersList() {
        const playersList = document.getElementById('player-list');
        const playerCount = document.getElementById('playerCount');
        const selectedCount = document.getElementById('selectedCount');
        
        playerCount.textContent = this.app.players.length;
        
        // Count selected players
        const selectedPlayers = this.app.players.filter(player => player.selected);
        selectedCount.textContent = selectedPlayers.length;

        if (this.app.players.length === 0) {
            playersList.innerHTML = '<div class="empty-state">No players added yet. Add some players to get started!</div>';
            return;
        }

        playersList.innerHTML = this.app.players.map(player => {
            const isGoalkeeper = player.positions.includes('GK');
            const hasOutfieldPositions = player.positions.some(pos => pos !== 'GK');
            const hasBothRoles = isGoalkeeper && hasOutfieldPositions;
            const isSelected = player.selected || false;

            // Determine which stats to display and get overall rating
            let displayStats, statLabels, overallRating;
            
            if (hasBothRoles) {
                // For dual-role players, show both sets of stats
                const outfieldStats = [
                    player.outfieldStats.pace, player.outfieldStats.shooting, player.outfieldStats.passing,
                    player.outfieldStats.dribbling, player.outfieldStats.defending, player.outfieldStats.physical
                ];
                const gkStats = [
                    player.gkStats.diving, player.gkStats.handling, player.gkStats.kicking,
                    player.gkStats.reflexes, player.gkStats.speed, player.gkStats.positioning
                ];
                
                return `
                <div class="player-card dual-role ${isSelected ? 'selected' : ''}">
                    <div class="player-card-header">
                        <div class="player-info">
                            <div class="player-name">${player.name}</div>
                            <div class="player-positions">
                                ${player.positions.map(pos => {
                                    const isPreferred = pos === player.preferredPosition;
                                    return `<span class="position-badge ${pos} ${isPreferred ? 'preferred' : ''}">${pos}${isPreferred ? ' ⭐' : ''}</span>`;
                                }).join('')}
                            </div>
                            ${player.preferredPosition ? `<div class="preferred-position-indicator">Prefers: ${player.preferredPosition}</div>` : ''}
                        </div>
                        <div class="player-overall-dual">
                            <div class="gk-overall">GK: ${player.gkStats.overall}</div>
                            <div class="outfield-overall">OUT: ${player.outfieldStats.overall}</div>
                        </div>
                    </div>
                    <div class="dual-stats">
                        <div class="stats-section">
                            <h4>Outfield Stats</h4>
                            <div class="player-stats">
                                ${['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'].map((label, index) => `
                                    <div class="stat-item">
                                        <div class="stat-label">${label}</div>
                                        <div class="stat-value">${outfieldStats[index]}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="stats-section">
                            <h4>Goalkeeper Stats</h4>
                            <div class="player-stats">
                                ${['DIV', 'HAN', 'KIC', 'REF', 'SPD', 'POS'].map((label, index) => `
                                    <div class="stat-item">
                                        <div class="stat-label">${label}</div>
                                        <div class="stat-value">${gkStats[index]}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="player-actions">
                        <div class="player-selection-checkbox">
                            <input type="checkbox" ${isSelected ? 'checked' : ''} 
                                   onchange="teamGenerator.playerManager.togglePlayerSelection(${player.id})" />
                        </div>
                        <button class="edit-player" onclick="teamGenerator.playerManager.editPlayer(${player.id})" title="Edit Player">
                            <span>✏️</span> Edit
                        </button>
                        <button class="delete-player" onclick="teamGenerator.playerManager.removePlayer(${player.id})" title="Delete Player">
                            <span>🗑️</span> Delete
                        </button>
                    </div>
                </div>
            `;
            } else if (isGoalkeeper && player.gkStats) {
                // Pure goalkeeper
                statLabels = ['DIV', 'HAN', 'KIC', 'REF', 'SPD', 'POS'];
                displayStats = [
                    player.gkStats.diving, player.gkStats.handling, player.gkStats.kicking,
                    player.gkStats.reflexes, player.gkStats.speed, player.gkStats.positioning
                ];
                overallRating = player.gkStats.overall;
            } else {
                // Outfield player
                statLabels = ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'];
                if (player.outfieldStats) {
                    displayStats = [
                        player.outfieldStats.pace, player.outfieldStats.shooting, player.outfieldStats.passing,
                        player.outfieldStats.dribbling, player.outfieldStats.defending, player.outfieldStats.physical
                    ];
                    overallRating = player.outfieldStats.overall;
                }
            }

            // Single role player card
            if (!hasBothRoles) {
                return `
                <div class="player-card ${isSelected ? 'selected' : ''}">
                    <div class="player-card-header">
                        <div class="player-info">
                            <div class="player-name">${player.name}</div>
                            <div class="player-positions">
                                ${player.positions.map(pos => {
                                    const isPreferred = pos === player.preferredPosition;
                                    return `<span class="position-badge ${pos} ${isPreferred ? 'preferred' : ''}">${pos}${isPreferred ? ' ⭐' : ''}</span>`;
                                }).join('')}
                            </div>
                            ${player.preferredPosition ? `<div class="preferred-position-indicator">Prefers: ${player.preferredPosition}</div>` : ''}
                        </div>
                        <div class="player-overall">${overallRating}</div>
                    </div>
                    <div class="player-stats">
                        ${statLabels.map((label, index) => `
                            <div class="stat-item">
                                <div class="stat-label">${label}</div>
                                <div class="stat-value">${displayStats[index]}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="player-actions">
                        <div class="player-selection-checkbox">
                            <input type="checkbox" ${isSelected ? 'checked' : ''} 
                                   onchange="teamGenerator.playerManager.togglePlayerSelection(${player.id})" />
                        </div>
                        <button class="edit-player" onclick="teamGenerator.playerManager.editPlayer(${player.id})" title="Edit Player">
                            <span>✏️</span> Edit
                        </button>
                        <button class="delete-player" onclick="teamGenerator.playerManager.removePlayer(${player.id})" title="Delete Player">
                            <span>🗑️</span> Delete
                        </button>
                    </div>
                </div>
            `;
            }
        }).join('');
    }

    // Update the teams display with improved team formation visualization
    updateTeamsDisplay() {
        const teamsDisplay = document.getElementById('teams-display');
        const regenerateBtn = document.getElementById('regenerateBtn');
        
        if (!this.app.teams || this.app.teams.length === 0) {
            teamsDisplay.innerHTML = '<div class="empty-state">Generate teams to see the results here!</div>';
            if (regenerateBtn) regenerateBtn.style.display = 'none';
            this.app.teamGenerator.enableGenerateButton(); // Re-enable generate button when no teams exist
            return;
        }
        
        // Show the regenerate button when teams are displayed
        if (regenerateBtn) regenerateBtn.style.display = 'inline-block';

        const teamsHTML = this.app.teams.map(team => {
            return `
                <div class="team-container">
                    <div class="team-header">
                        <h3>${team.name}</h3>
                        <div class="team-stats">
                            <div class="team-stat">
                                <span class="stat-label">Players:</span>
                                <span class="stat-value">${team.players.length}</span>
                            </div>
                            <div class="team-stat">
                                <span class="stat-label">Total Rating:</span>
                                <span class="stat-value total-rating">${team.totalRating}</span>
                            </div>
                            <div class="team-stat">
                                <span class="stat-label">Average Rating:</span>
                                <span class="stat-value average-rating">${team.averageRating}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="team-formation">
                        <div class="soccer-pitch">
                            <!-- Attack Line (Top) -->
                            ${team.formation.forwards.length > 0 ? `
                                <div class="formation-line attack-line">
                                    <div class="players-row">
                                        ${this.sortPlayersByPosition(team.formation.forwards).map(player => `
                                            <div class="player-position-card att">
                                                <div class="player-name-pitch">${player.name}</div>
                                                <div class="player-rating-pitch">${this.app.playerManager.getPlayerRatingForPosition(player, 'ATT')}</div>
                                                <div class="player-position-pitch">${player.assignedPosition || player.preferredPosition || 'ATT'}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <!-- Midfield Line -->
                            ${team.formation.midfielders.length > 0 ? `
                                <div class="formation-line midfield-line">
                                    <div class="players-row">
                                        ${this.sortPlayersByPosition(team.formation.midfielders).map(player => `
                                            <div class="player-position-card mid">
                                                <div class="player-name-pitch">${player.name}</div>
                                                <div class="player-rating-pitch">${this.app.playerManager.getPlayerRatingForPosition(player, 'MID')}</div>
                                                <div class="player-position-pitch">${player.assignedPosition || player.preferredPosition || 'MID'}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <!-- Defense Line -->
                            ${team.formation.defenders.length > 0 ? `
                                <div class="formation-line defense-line">
                                    <div class="players-row">
                                        ${this.sortPlayersByPosition(team.formation.defenders).map(player => `
                                            <div class="player-position-card def">
                                                <div class="player-name-pitch">${player.name}</div>
                                                <div class="player-rating-pitch">${this.app.playerManager.getPlayerRatingForPosition(player, 'DEF')}</div>
                                                <div class="player-position-pitch">${player.assignedPosition || player.preferredPosition || 'DEF'}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <!-- Goalkeeper (Bottom) -->
                            ${team.formation.goalkeeper ? `
                                <div class="formation-line goalkeeper-line">
                                    <div class="players-row">
                                        <div class="player-position-card gk">
                                            <div class="player-name-pitch">${team.formation.goalkeeper.name}</div>
                                            <div class="player-rating-pitch">${this.app.playerManager.getPlayerRatingForPosition(team.formation.goalkeeper, 'GK')}</div>
                                            <div class="player-position-pitch">GK</div>
                                        </div>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Formation Accuracy Disclaimer -->
                    <div class="formation-disclaimer">
                        <p><em>⚠️ Note: The formation visualization above may not be 100% accurate in terms of exact player positioning.</em></p>
                    </div>
                    
                    <!-- Complete Lineup List -->
                    <div class="team-lineup">
                        <h4>Complete Lineup</h4>
                        <div class="lineup-list">
                            ${team.formation.goalkeeper ? `
                                <div class="lineup-section">
                                    <h5>Goalkeeper (1)</h5>
                                    <div class="lineup-player">
                                        <span class="lineup-name">${team.formation.goalkeeper.name}</span>
                                        <span class="lineup-position">GK</span>
                                        <span class="lineup-rating">${this.app.playerManager.getPlayerRatingForPosition(team.formation.goalkeeper, 'GK')}</span>
                                    </div>
                                </div>
                            ` : ''}
                            
                            ${team.formation.defenders.length > 0 ? `
                                <div class="lineup-section">
                                    <h5>Defenders (${team.formation.defenders.length})</h5>
                                    ${team.formation.defenders.map(player => `
                                        <div class="lineup-player">
                                            <span class="lineup-name">${player.name}</span>
                                            <span class="lineup-position">${player.assignedPosition || player.preferredPosition || 'DEF'}</span>
                                            <span class="lineup-rating">${this.app.playerManager.getPlayerRatingForPosition(player, 'DEF')}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                            
                            ${team.formation.midfielders.length > 0 ? `
                                <div class="lineup-section">
                                    <h5>Midfielders (${team.formation.midfielders.length})</h5>
                                    ${team.formation.midfielders.map(player => `
                                        <div class="lineup-player">
                                            <span class="lineup-name">${player.name}</span>
                                            <span class="lineup-position">${player.assignedPosition || player.preferredPosition || 'MID'}</span>
                                            <span class="lineup-rating">${this.app.playerManager.getPlayerRatingForPosition(player, 'MID')}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                            
                            ${team.formation.forwards.length > 0 ? `
                                <div class="lineup-section">
                                    <h5>Forwards (${team.formation.forwards.length})</h5>
                                    ${team.formation.forwards.map(player => `
                                        <div class="lineup-player">
                                            <span class="lineup-name">${player.name}</span>
                                            <span class="lineup-position">${player.assignedPosition || player.preferredPosition || 'ATT'}</span>
                                            <span class="lineup-rating">${this.app.playerManager.getPlayerRatingForPosition(player, 'ATT')}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    ${team.players.length > 11 ? `
                        <div class="team-substitutes">
                            <h4>Substitutes</h4>
                            <div class="substitute-players">
                                ${team.players.slice(11).map(player => {
                                    // Determine position category for substitute rating
                                    const preferredPos = player.preferredPosition;
                                    let positionCategory = 'ATT'; // default
                                    if (preferredPos === 'GK') positionCategory = 'GK';
                                    else if (['CB', 'LB', 'RB'].includes(preferredPos)) positionCategory = 'DEF';
                                    else if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(preferredPos)) positionCategory = 'MID';
                                    else if (['LW', 'RW', 'ST'].includes(preferredPos)) positionCategory = 'ATT';
                                    
                                    return `
                                        <div class="substitute-player">
                                            <span class="sub-name">${player.name}</span>
                                            <span class="sub-position">${preferredPos}</span>
                                            <span class="sub-rating">${this.app.playerManager.getPlayerRatingForPosition(player, positionCategory)}</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        teamsDisplay.innerHTML = teamsHTML;
    }

    // Sort players by their position to display them in the correct left-right order on the pitch
    sortPlayersByPosition(players) {
        // Define position priority for left-to-right ordering
        const positionOrder = {
            // Left side positions (lowest numbers = leftmost)
            'LW': 1,   // Left Wing
            'LM': 2,   // Left Midfielder  
            'LB': 3,   // Left Back
            
            // Center positions
            'CDM': 4,  // Center Defensive Mid
            'CM': 5,   // Center Mid
            'CAM': 6,  // Center Attacking Mid
            'CB': 7,   // Center Back
            'ST': 8,   // Striker
            
            // Right side positions (highest numbers = rightmost)
            'RB': 9,   // Right Back
            'RM': 10,  // Right Midfielder
            'RW': 11,  // Right Wing
            
            // Goalkeeper (always center)
            'GK': 12   // Goalkeeper
        };
        
        return [...players].sort((a, b) => {
            const posA = a.preferredPosition || a.positions[0];
            const posB = b.preferredPosition || b.positions[0];
            
            const orderA = positionOrder[posA] || 50; // Default to center if position not found
            const orderB = positionOrder[posB] || 50;
            
            return orderA - orderB;
        });
    }

    // Converts a position code to its full name, or returns the code if not found
    formatPosition(position) {
        const positions = {
            'GK': 'Goalkeeper',
            'CB': 'Centre Back',
            'LB': 'Left Back',
            'RB': 'Right Back',
            'CDM': 'Defensive Midfielder',
            'CM': 'Centre Midfielder',
            'CAM': 'Attacking Midfielder',
            'LM': 'Left Midfielder',
            'RM': 'Right Midfielder',
            'LW': 'Left Wing',
            'RW': 'Right Wing',
            'ST': 'Striker'
        };
        return positions[position] || position;
    }

    // Formats into short format (CB, LB, etc.)
    formatPositionShort(position) {
        return position;
    }
}
