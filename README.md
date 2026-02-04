# 🏎️ PitStop — Formula 1 Analytics Dashboard

🔗 **Live:** https://quickstop.surge.sh

**PitStop** is a high-performance real-time dashboard that brings **Formula 1 telemetry, race analytics, driver insights, and session monitoring** onto a sleek, data-rich interface inspired by real F1 pitwall systems.
---

## 📸 Screenshots

### Dashboard Overview
![Dashboard Overview](https://raw.githubusercontent.com/chouhan-abhi/PitStop/refs/heads/main/public/ScreenShots/Quickstop_f1_screenshot4.png)
*Comprehensive view of events, standings, and session data*

### Driver Standings & Analytics
![Driver Standings](https://raw.githubusercontent.com/chouhan-abhi/PitStop/refs/heads/main/public/ScreenShots/Quickstop_f1_screenshot3.png)
*Interactive driver standings with expandable table view and pace analytics*

### Session Analytics & Stints
![Session Analytics](https://raw.githubusercontent.com/chouhan-abhi/PitStop/refs/heads/main/public/ScreenShots/Quickstop_f1_screenshot2.png)
*Detailed pace analysis with sector breakdowns, lap comparisons, and tyre stint visualization*

### Event Details & Results
![Event Details](https://raw.githubusercontent.com/chouhan-abhi/PitStop/refs/heads/main/public/ScreenShots/Quickstop_f1_screenshot.png)
*Complete event breakdown with session results, driver positions, and detailed statistics*

---

## 🚀 Features

### 📊 Dashboard & Navigation
- **Countdown Hero** - Live countdown to the next session (from `calendar.ics`)
- **Latest Event Card** - Quick access to the most recent race weekend (hidden if season hasn’t started)
- **Archives Page** - Latest + older events in a dedicated archive view
- **Drivers Page** - Dedicated driver grid view
- **Score Card Page** - Standings + progression charts with tabbed Drivers/Constructors
- **Season Selector** - Top-level year selection synced across pages
- **Grid Background** - Subtle dotted grid pattern for visual depth
- **File Tab Headings** - Modern tab-style section headers throughout
- **Theme Support** - Light, Dark, and System theme modes with smooth transitions

### 🏁 Standings & Championships
- **Score Card Standings**
  - Driver standings from Ergast/Jolpica API
  - Constructor standings from Ergast/Jolpica API
  - Side-by-side tables with progression charts
  - Year selector to swap seasons instantly

### 📈 Session Analytics
- **Pace Analysis**
  - Sector-by-sector time breakdown (S1, S2, S3)
  - Overall lap pace visualization
  - Driver comparison with delta graphs
  - Team color-coded graphs
  - Dotted lines for same-team drivers
  
- **Driver Sector Stats**
  - Graphical pipe representation of lap time
  - Proportional sector visualization (100% of lap time)
  - Color-coded sectors using team colors
  - Time display in minutes:seconds.milliseconds format
  - Best sector times and fastest lap tracking

- **Interactive Driver Selection**
  - Slide-out drawer for driver selection
  - Default selection of top 2 drivers
  - Per-driver statistics cards
  - Average and best sector times

### 🏎️ Stints & Tyre Strategy
- **Stints Graph**
  - Visual representation of tyre compounds
  - Color-coded by compound type (Soft, Medium, Hard, Intermediate, Wet)
  - Lap count per stint
  - Driver avatars with fallback initials
  - Team color borders and backgrounds

### 📋 Event Details
- **Session Breakdown**
  - Latest session full-width display
  - Collapsible older sessions
  - Position tables with team colors
  - Starting positions and final results
  - Points allocation for race sessions

### 🧭 Circuit Models
- **3D Circuit Models**
  - STL-based circuit rendering in Event Cards and Event Details
  - Auto-mapped to circuit names/locations

### 🎨 UI Components
- **Premium Driver Cards**
  - Circular headshot with team accent ring
  - Detailed info panels
  - Smooth responsive layout
  
- **Winner Card Layout**
  - Hero-style card for P1
  - P2 & P3 runner-ups
  - Auto-stacks on mobile

- **Grid Enhancements**
  - Full-width cards on mobile
  - Deduplicated and sorted by driver number
  - Fixed-height scrollable cards for small screens

---

## 💻 Usage Guide

### Getting Started

1. **Launch the Application**
   ```bash
   bun dev
   ```
   Navigate to `http://localhost:5173`

2. **Navigate the Dashboard**
   - View latest event details in the main card
   - Browse older events in the right sidebar
   - Click "View Details" to see full event breakdown

3. **Explore Standings**
   - Switch between Drivers and Constructors tabs
   - Click "Show All" to expand tables
   - View complete statistics for each driver/team

4. **Analyze Session Data**
   - Select drivers using the "Select drivers" button
   - Default shows top 2 drivers
   - Toggle between compact and enlarged layouts
   - Compare sector times and lap pace
   - View delta graph when exactly 2 drivers are selected

5. **View Stints**
   - Check tyre strategy visualization
   - Hover over segments to see lap counts
   - Identify compound types by color

### Keyboard Shortcuts
- `Escape` - Close driver selection drawer

### Theme Switching
- Click the theme icon in the header to cycle through:
  - System (follows OS preference)
  - Dark
  - Light
  - Saint (special theme)

---

## 🎨 UI & Experience

- **React + TailwindCSS** - Modern component architecture
- **Inter & JetBrains Mono fonts** - Clean, readable typography
- **Glass panels & shadows** - Depth and visual hierarchy
- **Team-color accents** - Dynamic theming based on F1 teams
- **Fully responsive** - Optimized for all screen sizes
- **Smooth animations** - Transitions and hover effects
- **Accessible** - ARIA labels and keyboard navigation

---

## 🧠 Smart Data Layer

- **React Query** - Intelligent data fetching and caching
- **Automatic retries** - Resilient API communication
- **Background refetching** - Always up-to-date data
- **Optimistic updates** - Instant UI feedback
- **Local storage** - Persistent theme and cache preferences
- **OpenF1 API** - Real-time Formula 1 data

---

## 🧩 Project Structure

```
src/
├── components/
│   ├── Common/
│   │   ├── SessionPaceAnalytics.jsx    # Pace analysis with charts
│   │   ├── StintsGraph.jsx              # Tyre stint visualization
│   │   ├── WinnerDriverCard.jsx        # Premium driver cards
│   │   ├── CircuitModel.jsx            # 3D circuit STL renderer
│   │   └── useLaps.js                   # Laps data hook
│   ├── Drivers/
│   │   ├── DriversGrid.jsx              # Driver grid layout
│   │   └── useLatestSessionDrivers.js   # Driver data hook
│   ├── Events/
│   │   ├── EventCard.jsx                # Event card component
│   │   └── TopDriversCard.jsx           # Top drivers display
│   ├── ScoreCard/
│   │   ├── ProgressionChart.jsx         # Standings progression chart
│   │   ├── StandingsTable.jsx           # Standings table
│   │   ├── ScoreCardPage.jsx            # Score Card page
│   │   ├── useDriverStandings.js        # Driver standings hook
│   │   ├── useConstructorStandings.js   # Constructor standings hook
│   │   └── useRaceResults.js            # Race results hook
│   ├── Dashboard.jsx                    # Main dashboard
│   ├── EventDashboard.jsx               # Event overview
│   └── EventDetails.jsx                 # Detailed event view
├── common/
│   ├── utils/
│   │   ├── colors.js                    # Team color utilities
│   │   ├── dataProcessing.js            # Data transformation
│   │   └── LocalStorageManager.js      # Storage management
│   └── AppConfig.js                     # App configuration
├── data/
│   ├── driversStandings2025.json        # Legacy driver standings data
│   └── constructorsStandings2025.json  # Legacy constructor standings data
├── assets/
│   ├── calendar.ics                     # Season calendar for countdown hero
│   └── circuits/                        # STL circuit models
├── App.jsx                              # Root component
└── main.jsx                             # Entry point
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, Vite |
| **Styling** | TailwindCSS, CSS Variables |
| **Charts** | Chart.js, react-chartjs-2 |
| **3D** | Three.js (STL rendering) |
| **Icons** | Lucide React |
| **Data Layer** | @tanstack/react-query |
| **API** | OpenF1 API, Ergast/Jolpica API |
| **Routing** | React Router v7 |
| **State** | React Hooks (useState, useMemo, useCallback) |
| **Build Tool** | Vite |

---

## 📦 Installation

### Prerequisites
- Node.js 18+ or Bun
- npm, pnpm, or Bun package manager

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/<your-username>/pitstop.git
cd pitstop
```

### 2️⃣ Install Dependencies

**Using Bun (Recommended):**
```bash
bun install
```

**Using npm:**
```bash
npm install
```

**Using pnpm:**
```bash
pnpm install
```

### 3️⃣ Start Development Server

**With Bun:**
```bash
bun dev
```

**With npm:**
```bash
npm run dev
```

**With pnpm:**
```bash
pnpm dev
```

The application will be available at **http://localhost:5173**

### 4️⃣ Build for Production
```bash
bun build
# or
npm run build
```

---

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=https://api.openf1.org/v1
```

### Theme Customization
Edit `src/index.css` to customize theme colors and CSS variables.

---

## 📝 Data Sources

- **OpenF1 API** - Real-time F1 data
  - Driver information
  - Session data
  - Lap times and sectors
  - Positions and standings
  - Tyre stints
- **Ergast/Jolpica API** - Standings and results
  - Driver standings
  - Constructor standings
  - Race results (progression graphs)
- **RacingNews365 Calendar** - Session schedule (`calendar.ics`)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **OpenF1** for providing the API
- **Formula 1** for the data
- All contributors and the F1 community

---

## 📧 Contact & Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Made with ❤️ for F1 fans**
