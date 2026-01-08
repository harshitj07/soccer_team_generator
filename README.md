# ⚽ Soccer Team Generator

A sophisticated web application that generates balanced soccer teams using advanced algorithms and realistic player statistics.

## 🎯 Purpose

This application solves the common challenge of creating fair and balanced soccer teams from a pool of players. It uses a combination of **Snake Draft Algorithm** and **Position-Based Team Generation** to ensure competitive balance while maintaining realistic soccer formations. The program enables you to create player cards for your friends, in order to generate the teams accurately, and continue generating if you have any concerns.

## ✨ Main Features

### 🧑‍⚽ Player Management
- **FIFA-style Player Statistics** - Comprehensive rating system (1-99) for both outfield and goalkeeper stats
- **Multi-Position Support** - Players can be assigned multiple positions (e.g., CB/CDM)
- **Dual-Role Players** - Special support for goalkeeper/outfield combinations
- **Edit & Selection** - Full CRUD operations with player selection for team generation

### ⚖️ Advanced Team Generation
- **Snake Draft Algorithm** - Ensures fair distribution of high-rated players across teams
- **Formation-Aware Generation** - Creates realistic soccer formations
- **Balanced Team Sizes** - Handles uneven player counts with mathematical fairness
- **Position-Based Allocation** - Prioritizes proper formation coverage before rating balance

### 💾 Data Management
- **Local Storage Persistence** - Automatically saves player data between sessions
- **Import/Export Functionality** - JSON-based data portability for sharing and backup
- **Sample Player Database** - 22 professional players with realistic FIFA ratings
- **Data Validation** - Comprehensive error handling and data integrity checks

### 🎨 User Experience
- **Progressive Disclosure** - Context-aware forms that show relevant sections
- **Real-time Feedback** - Immediate validation and visual updates
- **Formation Visualization** - Interactive soccer pitch display with player positions

## 🛠️ Technologies Used

### **Languages**
- **HTML5** - Basic framework for the website
- **CSS3** - Modern styling with Grid, Flexbox, and custom properties
- **JavaScript** - Modern features including classes and modules to create the logic for the program

### **Libraries & APIs**
- **Web Storage API** - localStorage for client-side data persistence
- **File API** - Client-side file import/export functionality with Blob creation
- **JSON Processing** - Advanced serialization/deserialization with validation (essentially converting objects/data strctures into a JSON String or vice versa)
- **Google Fonts** - Inter font family for professional typography

### **Algorithms Implemented**
- **Snake Draft Algorithm** - O(n log n) complexity for fair team distribution
- **Fisher-Yates Shuffle** - Cryptographically secure randomization
- **Position-Based Allocation** - Soccer-specific formation logic

## 🚀 How to Use

1. **Open `index.html`** in a modern web browser
2. **Add players** using the FIFA-style stat system
3. **Generate balanced teams** with the advanced algorithm
4. **Export/Import** your player data as needed

## 📊 Technical Highlights

- **Client-Side Only** - No server required, runs entirely in browser
- **Performance Optimized** - Efficient and accurate algorithms and logic applied

---

*Perfect for soccer coaches, team organizers, or anyone needing fair team distribution with realistic soccer formations.*
