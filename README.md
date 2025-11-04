# 🏎️ [F1 PitStop](https://f1-pitstop.surge.sh/) — Real-Time Formula 1 Analytics Dashboard

**F1 PitStop** is a high-performance, data-driven dashboard that brings **Formula 1 telemetry, race control, and driver insights** together into a single modern web experience.  
Built for speed, precision, and clarity — inspired by the spirit of the paddock.

---

## 🚀 Features

### 🎯 Driver Analytics
- Detailed **Driver Profile** view showing real-time and historical data  
- **Lap performance**, **tyre stints**, and **pit stop summaries**
- **Telemetry overview** for speed, throttle, and gear traces
- **Position trend graph** showing driver’s evolution throughout the race
- **Race control messages** — structured communication from FIA to driver
- Dynamic **team color theming** across all UI components

### 🧠 Smart Data Layer
- Modular hooks built with **React Query (`@tanstack/react-query`)**
- Intelligent caching, refetch control, and fallback handling
- API integration with [`api.openf1.org`](https://api.openf1.org) for live race data

### 💎 UI & Design
- Built with **React + TailwindCSS**
- Professional, **minimalist racing-inspired design**
- Responsive and adaptive — optimized for desktop and mobile
- **Team-color border cues** and subtle animations
- **Rajdhani** font for a sleek motorsport feel

### 🧩 Architecture
- Fully modularized components (`DriverHeader`, `DriverTelemetryOverview`, etc.)
- Separation of logic via hooks (`useDriverLaps`, `useDriverStints`, `useDriverExtras`, …)
- Scalable layout grid supporting expansion (e.g., future comparison mode)

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React 18, Vite/Bun |
| **Styling** | TailwindCSS, Lucide Icons |
| **Data Fetching** | @tanstack/react-query |
| **API** | [OpenF1 API](https://api.openf1.org) |
| **Routing** | React Router |
| **Build Tool** | [Bun](https://bun.sh) |

---

## 📦 Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/<your-username>/f1-pitstop.git
cd f1-pitstop

2️⃣ Install dependencies

We recommend using Bun for ultra-fast installation:

bun install

If you prefer npm or pnpm:

npm install
# or
pnpm install

3️⃣ Start development server

bun dev

Your app will run at 👉 http://localhost:5173
🔧 Environment Setup

No API keys required — all data is publicly accessible from OpenF1.
If needed, you can set a fallback API URL via an .env file:

VITE_API_BASE=https://api.openf1.org/v1

🧱 Project Structure

src/
├── helperComponents/
│   ├── AppLoader.jsx
│   ├── AppError.jsx
│   └── ...
├── views/
│   ├── driver/
│   │   ├── components/
│   │   │   ├── DriverHeader.jsx
│   │   │   ├── DriverInfoCard.jsx
│   │   │   ├── DriverTelemetryOverview.jsx
│   │   │   ├── DriverPositionTrend.jsx
│   │   │   ├── DriverPitStopSummary.jsx
│   │   │   ├── DriverRaceControl.jsx
│   │   │   └── DriverTyreStints.jsx
│   │   ├── hooks/
│   │   │   ├── useDriverLaps.js
│   │   │   ├── useDriverStints.js
│   │   │   ├── useDriverExtras.js
│   │   │   └── useDrivers.js
│   │   └── DriverProfile.jsx
│   └── ...
├── PageSwitcher.jsx
├── App.jsx
└── main.jsx

🧠 Future Roadmap

Driver Comparison Mode (side-by-side analysis)

Session replay & lap overlay graphs

Race prediction insights using ML models

Persistent data caching for offline mode

Export charts & reports (PDF/CSV)
