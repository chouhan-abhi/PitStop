# 🏎️ F1 QuickStop — Formula 1 Analytics Dashboard
🔗 **Live:** https://quickstop.surge.sh

**F1 QuickStop** is a high-performance realtime dashboard that brings **Formula 1 telemetry, race analytics, driver insights, and session monitoring** onto a sleek, data-rich interface inspired by real F1 pitwall systems.

---

## 🚀 Features

### 🎯 Driver Analytics
- Full **Driver Profile** with historical + real-time stats  
- **Lap times**, **sector analysis**, **tyre stints**, **pit stop timeline**  
- **Speed / throttle / gear telemetry snapshot**  
- **Position trend chart** to visualize race evolution  
- **Race control messages** (FIA → Driver)  
- Dynamic **team-color-themed UI** components  

### ➕ Newly Added
- **Premium Driver Cards**  
  - Circular headshot with **conic team accent ring**  
  - Detailed right-side info panel  
  - Smooth responsive layout  
- **Winner Card Layout**  
  - Big hero-style card for P1  
  - P2 & P3 runner-ups beside it  
  - Auto-stacks on mobile  
- **Grid Enhancements**  
  - Full-width cards on mobile  
  - Deduped + sorted by driver number  
  - Fixed-height scrollable cards for small screens  

---

## 🎨 UI & Experience
- **React + TailwindCSS**  
- **Rajdhani font** for motorsport UI  
- Glass panels, shadows, team-color accents  
- **Light / Dark / System theme support**  
- Fully responsive across all breakpoints  

---

## 🧠 Smart Data Layer
- Powered by **React Query (@tanstack/react-query)**  
- Intelligent caching + retry logic  
- Modular hook-based architecture  
- Integrated with **OpenF1 API**

---

## 🧩 Architecture
```
src/
├── common/
│   └── utils/
│       ├── colors.js
│       └── formatters.js
├── helperComponents/
│   ├── AppLoader.jsx
│   ├── AppError.jsx
│   └── ...
├── views/
│   ├── driver/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── DriverProfile.jsx
│   └── session/
│       ├── SessionDriversGrid.jsx
│       └── TopDriversCard.jsx
├── PageSwitcher.jsx
├── App.jsx
└── main.jsx
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 18, Vite / Bun |
| Styling | TailwindCSS, Lucide Icons |
| Data Layer | @tanstack/react-query |
| API | OpenF1 |
| Routing | React Router |
| Build | Bun |

---

## 📦 Installation

### 1️⃣ Clone the Repo
```bash
git clone https://github.com/<your-username>/f1-pitstop.git
cd f1-pitstop
```

### 2️⃣ Install Dependencies
Using Bun:
```bash
bun install
```
Or npm/pnpm:
```bash
npm install
# or
pnpm install
```

### 3️⃣ Start Dev Server
```bash
bun dev
```

Runs on → **http://localhost:5173**
