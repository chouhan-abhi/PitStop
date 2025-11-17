/**
 * Color utilities using CSS variables from index.css
 * Provides consistent color scheme across the application
 */

export const colors = {
  // Primary colors
  primary: 'var(--primary-color)',
  primaryRed: 'var(--primary-red)',
  primaryBlue: 'var(--primary-blue)',
  primaryGreen: 'var(--primary-green)',
  primaryPurple: 'var(--primary-purple)',
  primaryOrange: 'var(--primary-orange)',
  primaryPink: 'var(--primary-pink)',
  primaryCyan: 'var(--primary-cyan)',
  primaryYellow: 'var(--primary-yellow)',

  // Layout colors
  bg: 'var(--bg-color)',
  text: 'var(--text-color)',
  panel: 'var(--panel-color)',
  border: 'var(--border-color)',

  // Header/Sidebar
  headerBg: 'var(--header-bg)',
  headerText: 'var(--header-text)',
  sidebarBg: 'var(--sidebar-bg)',
  sidebarText: 'var(--sidebar-text)',
};

/**
 * Tailwind-compatible color classes using CSS variables
 */
export const colorClasses = {
  bgPrimary: 'bg-[var(--primary-color)]',
  textPrimary: 'text-[var(--primary-color)]',
  borderPrimary: 'border-[var(--primary-color)]',
  
  bgPanel: 'bg-[var(--panel-color)]',
  bgHeader: 'bg-[var(--header-bg)]',
  bgSidebar: 'bg-[var(--sidebar-bg)]',
  
  textMain: 'text-[var(--text-color)]',
  textHeader: 'text-[var(--header-text)]',
  textSidebar: 'text-[var(--sidebar-text)]',
  
  borderMain: 'border-[var(--border-color)]',
};

/**
 * Get team color with opacity
 */
export const getTeamColorWithOpacity = (teamColor, opacity = '20') => {
  return `#${teamColor}${opacity}`;
};

/**
 * Get team color border
 */
export const getTeamColorBorder = (teamColor) => {
  return `#${teamColor}`;
};

