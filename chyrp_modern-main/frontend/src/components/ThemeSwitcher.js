import React from 'react';
import { useTheme } from './ThemeContext'; // Correct import path

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme} 
      className="theme-switcher-btn"
      aria-label="Switch theme"
      title={`Current theme: ${theme}. Click to change.`}
    >
      {theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '🔵'}
    </button>
  );
};

export default ThemeSwitcher;