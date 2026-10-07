import { useState, useEffect, useCallback } from "react";
import { getBucket } from "./index";

export const F1_TEAMS = [
  {
    id: "mclaren",
    name: "McLaren Formula 1 Team",
    shortName: "McLaren",
    code: "MCL",
    color: "#FF8000",
    drivers: [
      { number: 4, name: "Lando Norris", acronym: "NOR" },
      { number: 81, name: "Oscar Piastri", acronym: "PIA" },
    ],
  },
  {
    id: "ferrari",
    name: "Scuderia Ferrari",
    shortName: "Ferrari",
    code: "FER",
    color: "#E80020",
    drivers: [
      { number: 16, name: "Charles Leclerc", acronym: "LEC" },
      { number: 55, name: "Carlos Sainz", acronym: "SAI" },
    ],
  },
  {
    id: "red_bull",
    name: "Red Bull Racing",
    shortName: "Red Bull",
    code: "RBR",
    color: "#3671C6",
    drivers: [
      { number: 1, name: "Max Verstappen", acronym: "VER" },
      { number: 11, name: "Sergio Perez", acronym: "PER" },
    ],
  },
  {
    id: "mercedes",
    name: "Mercedes-AMG PETRONAS F1 Team",
    shortName: "Mercedes",
    code: "MER",
    color: "#27F4D2",
    drivers: [
      { number: 44, name: "Lewis Hamilton", acronym: "HAM" },
      { number: 63, name: "George Russell", acronym: "RUS" },
    ],
  },
  {
    id: "aston_martin",
    name: "Aston Martin Aramco F1 Team",
    shortName: "Aston Martin",
    code: "AMR",
    color: "#229971",
    drivers: [
      { number: 14, name: "Fernando Alonso", acronym: "ALO" },
      { number: 18, name: "Lance Stroll", acronym: "STR" },
    ],
  },
  {
    id: "alpine",
    name: "BWT Alpine F1 Team",
    shortName: "Alpine",
    code: "ALP",
    color: "#FF87BC",
    drivers: [
      { number: 10, name: "Pierre Gasly", acronym: "GAS" },
      { number: 31, name: "Esteban Ocon", acronym: "OCO" },
    ],
  },
  {
    id: "williams",
    name: "Williams Racing",
    shortName: "Williams",
    code: "WIL",
    color: "#64C4FF",
    drivers: [
      { number: 23, name: "Alexander Albon", acronym: "ALB" },
      { number: 43, name: "Franco Colapinto", acronym: "COL" },
    ],
  },
  {
    id: "racing_bulls",
    name: "Visa Cash App RB F1 Team",
    shortName: "Racing Bulls",
    code: "RB",
    color: "#6692FF",
    drivers: [
      { number: 22, name: "Yuki Tsunoda", acronym: "TSU" },
      { number: 30, name: "Liam Lawson", acronym: "LAW" },
    ],
  },
  {
    id: "haas",
    name: "MoneyGram Haas F1 Team",
    shortName: "Haas",
    code: "HAA",
    color: "#B6BABD",
    drivers: [
      { number: 27, name: "Nico Hülkenberg", acronym: "HUL" },
      { number: 20, name: "Kevin Magnussen", acronym: "MAG" },
    ],
  },
  {
    id: "sauber",
    name: "Stake F1 Team Kick Sauber",
    shortName: "Kick Sauber",
    code: "SAU",
    color: "#52E252",
    drivers: [
      { number: 77, name: "Valtteri Bottas", acronym: "BOT" },
      { number: 24, name: "Zhou Guanyu", acronym: "ZHO" },
    ],
  },
];

const personalizationBucket = getBucket("app", "prefs", "personalization");

const DEFAULT_PREFS = {
  favoriteTeam: null,
  favoriteDrivers: [],
  spoilerMode: false,
  onboardingDismissed: false,
};

// Global event target for cross-component re-renders
const listeners = new Set();
const notifyListeners = () => {
  listeners.forEach((fn) => fn());
};

const getStoredPrefs = () => {
  try {
    const raw = personalizationBucket.getRecord("data");
    if (raw && typeof raw === "object") {
      return { ...DEFAULT_PREFS, ...raw };
    }
  } catch {
    // fallback
  }
  return DEFAULT_PREFS;
};

export const savePrefs = (updates) => {
  const current = getStoredPrefs();
  const next = { ...current, ...updates };
  personalizationBucket.setRecord("data", next);

  // Apply favorite team accent glow to documentElement
  if (next.favoriteTeam) {
    const team = F1_TEAMS.find((t) => t.id === next.favoriteTeam);
    if (team) {
      document.documentElement.style.setProperty("--fav-team-color", team.color);
      document.documentElement.style.setProperty("--fav-team-color-alpha", `${team.color}22`);
    }
  } else {
    document.documentElement.style.removeProperty("--fav-team-color");
    document.documentElement.style.removeProperty("--fav-team-color-alpha");
  }

  notifyListeners();
  return next;
};

export const usePersonalization = () => {
  const [prefs, setPrefs] = useState(getStoredPrefs);

  useEffect(() => {
    const handleUpdate = () => {
      setPrefs(getStoredPrefs());
    };
    listeners.add(handleUpdate);
    return () => listeners.delete(handleUpdate);
  }, []);

  // Initial tint check
  useEffect(() => {
    if (prefs.favoriteTeam) {
      const team = F1_TEAMS.find((t) => t.id === prefs.favoriteTeam);
      if (team) {
        document.documentElement.style.setProperty("--fav-team-color", team.color);
        document.documentElement.style.setProperty("--fav-team-color-alpha", `${team.color}22`);
      }
    }
  }, [prefs.favoriteTeam]);

  const setFavoriteTeam = useCallback((teamId) => {
    const team = F1_TEAMS.find((t) => t.id === teamId);
    savePrefs({
      favoriteTeam: teamId,
      favoriteDrivers: team ? team.drivers.map((d) => d.number) : [],
      onboardingDismissed: true,
    });
  }, []);

  const clearFavoriteTeam = useCallback(() => {
    savePrefs({
      favoriteTeam: null,
      favoriteDrivers: [],
    });
  }, []);

  const toggleFavoriteDriver = useCallback((driverNumber) => {
    const current = getStoredPrefs().favoriteDrivers || [];
    const exists = current.includes(driverNumber);
    const nextDrivers = exists
      ? current.filter((num) => num !== driverNumber)
      : [...current, driverNumber];
    savePrefs({ favoriteDrivers: nextDrivers });
  }, []);

  const setSpoilerMode = useCallback((enabled) => {
    savePrefs({ spoilerMode: Boolean(enabled) });
  }, []);

  const dismissOnboarding = useCallback(() => {
    savePrefs({ onboardingDismissed: true });
  }, []);

  const activeTeamObj = F1_TEAMS.find((t) => t.id === prefs.favoriteTeam) || null;

  return {
    favoriteTeam: prefs.favoriteTeam,
    favoriteTeamObj: activeTeamObj,
    favoriteDrivers: prefs.favoriteDrivers,
    spoilerMode: prefs.spoilerMode,
    onboardingDismissed: prefs.onboardingDismissed,
    setFavoriteTeam,
    clearFavoriteTeam,
    toggleFavoriteDriver,
    setSpoilerMode,
    dismissOnboarding,
    allTeams: F1_TEAMS,
  };
};
