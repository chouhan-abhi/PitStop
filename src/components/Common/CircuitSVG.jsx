// src/components/Common/CircuitSVG.jsx

import React from 'react';

// Circuit SVG paths - simplified but recognizable layouts based on actual F1 circuits
const CIRCUIT_PATHS = {
  // Interlagos (São Paulo) - Autódromo José Carlos Pace - Figure-8 style
  'Interlagos': (
    <path
      d="M 50 10 L 80 10 Q 90 10 90 20 L 90 40 Q 90 50 80 50 L 70 50 Q 60 50 60 60 L 60 80 Q 60 90 50 90 L 30 90 Q 20 90 20 80 L 20 60 Q 20 50 30 50 L 40 50 Q 50 50 50 40 L 50 20 Q 50 10 40 10 L 30 10 Q 20 10 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),

  'São Paulo': (
    <path
      d="M 50 10 L 80 10 Q 90 10 90 20 L 90 40 Q 90 50 80 50 L 70 50 Q 60 50 60 60 L 60 80 Q 60 90 50 90 L 30 90 Q 20 90 20 80 L 20 60 Q 20 50 30 50 L 40 50 Q 50 50 50 40 L 50 20 Q 50 10 40 10 L 30 10 Q 20 10 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),

  // Mexico City (Autódromo Hermanos Rodríguez) - Stadium section
  'Mexico City': (
    <path
      d="M 20 20 L 80 20 Q 90 20 90 30 L 90 50 Q 90 60 80 60 L 60 60 Q 50 60 50 70 L 50 80 L 30 80 Q 20 80 20 70 L 20 50 Q 20 40 30 40 L 50 40 Q 60 40 60 30 L 60 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),

  // Circuit of the Americas (Austin) - Signature Turn 1
  'Austin': (
    <path
      d="M 30 20 L 70 20 Q 85 20 85 35 L 85 50 Q 85 65 70 65 L 50 65 Q 40 65 40 75 L 40 80 L 30 80 Q 20 80 20 70 L 20 50 Q 20 35 30 35 L 50 35 Q 60 35 60 25 L 60 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),

  // Marina Bay (Singapore) - Street circuit with tight sections
  'Singapore': (
    <path
      d="M 20 20 L 60 20 Q 80 20 80 40 L 80 60 Q 80 80 60 80 L 40 80 Q 20 80 20 60 L 20 40 Q 20 30 30 30 L 50 30 Q 60 30 60 40 L 60 50 Q 60 60 50 60 L 30 60 Q 20 60 20 50"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),

  // Baku City Circuit - Long straight with tight castle section
  'Baku': (
    <path
      d="M 20 20 L 80 20 Q 90 20 90 30 L 90 50 Q 90 60 80 60 L 70 60 Q 60 60 60 50 L 60 40 Q 60 30 50 30 L 30 30 Q 20 30 20 40 L 20 60 Q 20 70 30 70 L 50 70 Q 60 70 60 60"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),

  // Monza - High speed with chicanes
  'Monza': (
    <path
      d="M 20 30 L 80 30 Q 90 30 90 40 L 90 60 Q 90 70 80 70 L 20 70 Q 10 70 10 60 L 10 40 Q 10 30 20 30 M 30 40 L 70 40 M 30 60 L 70 60"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),

  // Zandvoort - Banked corners
  'Zandvoort': (
    <path
      d="M 20 20 Q 20 10 30 10 L 70 10 Q 80 10 80 20 L 80 40 Q 80 50 70 50 L 50 50 Q 40 50 40 60 L 40 70 Q 40 80 30 80 L 20 80 Q 10 80 10 70 L 10 50 Q 10 40 20 40 L 40 40 Q 50 40 50 30 L 50 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),

  // Hungaroring - Tight and twisty
  'Hungaroring': (
    <path
      d="M 30 20 L 70 20 Q 85 20 85 35 L 85 55 Q 85 70 70 70 L 50 70 Q 40 70 40 60 L 40 50 Q 40 40 30 40 L 20 40 Q 10 40 10 50 L 10 60 Q 10 70 20 70 L 30 70 Q 40 70 40 60"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),

  // Spa-Francorchamps - Eau Rouge and Raidillon
  'Spa-Francorchamps': (
    <path
      d="M 20 20 Q 20 10 30 10 L 50 10 Q 60 10 60 20 L 60 30 Q 60 40 70 40 L 80 40 Q 90 40 90 50 L 90 60 Q 90 70 80 70 L 60 70 Q 50 70 50 60 L 50 50 Q 50 40 40 40 L 30 40 Q 20 40 20 50 L 20 60 Q 20 70 30 70 L 40 70 Q 50 70 50 60"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),

  // Silverstone - Fast flowing
  'Silverstone': (
    <path
      d="M 20 30 L 80 30 Q 90 30 90 40 L 90 60 Q 90 70 80 70 L 60 70 Q 50 70 50 60 L 50 50 Q 50 40 40 40 L 30 40 Q 20 40 20 50 L 20 60 Q 20 70 30 70 L 50 70 Q 60 70 60 60 M 30 35 L 70 35 M 30 65 L 70 65"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),

  // Red Bull Ring (Spielberg) - Short and fast
  'Spielberg': (
    <path
      d="M 30 20 L 70 20 Q 80 20 80 30 L 80 50 Q 80 60 70 60 L 50 60 Q 40 60 40 50 L 40 40 Q 40 30 30 30 L 20 30 Q 10 30 10 40 L 10 50 Q 10 60 20 60 L 30 60 Q 40 60 40 50"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),

  // Circuit Gilles Villeneuve (Montreal) - Wall of Champions
  'Montreal': (
    <path
      d="M 20 20 L 80 20 Q 90 20 90 30 L 90 50 Q 90 60 80 60 L 60 60 Q 50 60 50 70 L 50 80 L 30 80 Q 20 80 20 70 L 20 50 Q 20 40 30 40 L 50 40 Q 60 40 60 30 L 60 20 M 40 30 L 60 30"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),

  // Circuit de Barcelona-Catalunya - Turn 3
  'Catalunya': (
    <path
      d="M 20 20 L 80 20 Q 90 20 90 30 L 90 50 Q 90 60 80 60 L 60 60 Q 50 60 50 50 L 50 40 Q 50 30 40 30 L 30 30 Q 20 30 20 40 L 20 50 Q 20 60 30 60 L 50 60 Q 60 60 60 50"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),

  // Circuit de Monaco - Tightest circuit
  'Monte Carlo': (
    <path
      d="M 20 20 L 60 20 Q 70 20 70 30 L 70 40 Q 70 50 60 50 L 50 50 Q 40 50 40 60 L 40 70 Q 40 80 30 80 L 20 80 Q 10 80 10 70 L 10 50 Q 10 40 20 40 L 40 40 Q 50 40 50 30 L 50 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),

  // Imola - Tamburello and Variante Alta
  'Imola': (
    <path
      d="M 20 30 L 80 30 Q 90 30 90 40 L 90 60 Q 90 70 80 70 L 60 70 Q 50 70 50 60 L 50 50 Q 50 40 40 40 L 30 40 Q 20 40 20 50 L 20 60 Q 20 70 30 70 L 50 70 Q 60 70 60 60 M 30 35 L 70 35"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),

  // Miami International Autodrome - Marina section
  'Miami': (
    <path
      d="M 20 20 L 70 20 Q 85 20 85 35 L 85 50 Q 85 65 70 65 L 50 65 Q 40 65 40 55 L 40 45 Q 40 35 30 35 L 20 35 Q 10 35 10 45 L 10 55 Q 10 65 20 65 L 40 65 Q 50 65 50 55"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),

  // Jeddah Corniche Circuit - Fastest street circuit
  'Jeddah': (
    <path
      d="M 20 20 L 80 20 Q 90 20 90 30 L 90 50 Q 90 60 80 60 L 70 60 Q 60 60 60 50 L 60 40 Q 60 30 50 30 L 40 30 Q 30 30 30 40 L 30 50 Q 30 60 40 60 L 50 60 Q 60 60 60 50 M 20 25 L 80 25"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),

  // Bahrain International Circuit - Endurance layout
  'Sakhir': (
    <path
      d="M 20 30 L 80 30 Q 90 30 90 40 L 90 60 Q 90 70 80 70 L 60 70 Q 50 70 50 60 L 50 50 Q 50 40 40 40 L 30 40 Q 20 40 20 50 L 20 60 Q 20 70 30 70 L 50 70 Q 60 70 60 60 M 30 35 L 70 35 M 30 65 L 70 65"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),

  // Suzuka International Racing Course - Figure-8
  'Suzuka': (
    <path
      d="M 20 20 Q 20 10 30 10 L 50 10 Q 60 10 60 20 L 60 30 Q 60 40 70 40 L 80 40 Q 90 40 90 50 L 90 60 Q 90 70 80 70 L 60 70 Q 50 70 50 60 L 50 50 Q 50 40 40 40 L 30 40 Q 20 40 20 50 L 20 60 Q 20 70 30 70 L 50 70 Q 60 70 60 60"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),

  // Shanghai International Circuit - Chinese character shape
  'Shanghai': (
    <path
      d="M 20 20 L 80 20 Q 90 20 90 30 L 90 50 Q 90 60 80 60 L 60 60 Q 50 60 50 50 L 50 40 Q 50 30 40 30 L 30 30 Q 20 30 20 40 L 20 50 Q 20 60 30 60 L 50 60 Q 60 60 60 50 M 30 25 L 70 25"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),

  // Albert Park Circuit (Melbourne) - Parkland circuit
  'Melbourne': (
    <path
      d="M 20 30 L 80 30 Q 90 30 90 40 L 90 60 Q 90 70 80 70 L 60 70 Q 50 70 50 60 L 50 50 Q 50 40 40 40 L 30 40 Q 20 40 20 50 L 20 60 Q 20 70 30 70 L 50 70 Q 60 70 60 60 M 30 35 L 70 35 M 30 65 L 70 65"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

// Mapping function to get circuit SVG based on circuit name or location
const getCircuitPath = (circuitName, location) => {
  // Normalize the input
  const normalizedName = circuitName?.trim() || '';
  const normalizedLocation = location?.trim() || '';

  // Try exact match first
  if (CIRCUIT_PATHS[normalizedName]) {
    return CIRCUIT_PATHS[normalizedName];
  }

  // Try location match
  if (CIRCUIT_PATHS[normalizedLocation]) {
    return CIRCUIT_PATHS[normalizedLocation];
  }

  // Try partial matches
  const allKeys = Object.keys(CIRCUIT_PATHS);

  // Check if any key is contained in the circuit name
  for (const key of allKeys) {
    if (normalizedName.toLowerCase().includes(key.toLowerCase()) ||
        normalizedLocation.toLowerCase().includes(key.toLowerCase())) {
      return CIRCUIT_PATHS[key];
    }
  }

  // Check reverse - if circuit name is contained in any key
  for (const key of allKeys) {
    if (key.toLowerCase().includes(normalizedName.toLowerCase()) ||
        key.toLowerCase().includes(normalizedLocation.toLowerCase())) {
      return CIRCUIT_PATHS[key];
    }
  }

  // Special cases for common variations
  const specialCases = {
    'interlagos': 'São Paulo',
    'autódromo josé carlos pace': 'São Paulo',
    'hermanos rodríguez': 'Mexico City',
    'circuit of the americas': 'Austin',
    'cota': 'Austin',
    'marina bay': 'Singapore',
    'baku city': 'Baku',
    'autodromo nazionale': 'Monza',
    'circuit zandvoort': 'Zandvoort',
    'hungaroring': 'Hungaroring',
    'circuit de spa': 'Spa-Francorchamps',
    'spa francorchamps': 'Spa-Francorchamps',
    'silverstone': 'Silverstone',
    'red bull ring': 'Spielberg',
    'circuit gilles villeneuve': 'Montreal',
    'barcelona': 'Catalunya',
    'monaco': 'Monte Carlo',
    'autodromo enzo e dino ferrari': 'Imola',
    'miami international': 'Miami',
    'jeddah corniche': 'Jeddah',
    'bahrain international': 'Sakhir',
    'suzuka': 'Suzuka',
    'shanghai international': 'Shanghai',
    'albert park': 'Melbourne',
  };

  const lowerName = normalizedName.toLowerCase();
  const lowerLocation = normalizedLocation.toLowerCase();

  for (const [key, value] of Object.entries(specialCases)) {
    if (lowerName.includes(key) || lowerLocation.includes(key)) {
      return CIRCUIT_PATHS[value];
    }
  }

  // Default: return a generic oval track
  return (
    <path
      d="M 20 30 L 80 30 Q 90 30 90 40 L 90 60 Q 90 70 80 70 L 20 70 Q 10 70 10 60 L 10 40 Q 10 30 20 30"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
};

const CircuitSVG = ({ circuitName, location, className = '', size = 100 }) => {
  const circuitPath = getCircuitPath(circuitName, location);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{
        color: 'var(--primary-color)',
        opacity: 0.8,
      }}
      aria-label={`Circuit layout for ${circuitName || location}`}
    >
      {circuitPath}
    </svg>
  );
};

export default CircuitSVG;

