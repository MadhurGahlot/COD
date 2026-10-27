import React, { createContext, useContext, useState, useEffect } from 'react';

const TournamentContext = createContext();

const AVAILABLE_YEARS = [2026, 2025, 2024, 2023];

export function TournamentProvider({ children }) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(() => {
    const saved = localStorage.getItem('tournament_year');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed)) return parsed;
    }
    return currentYear; // 2026
  });

  useEffect(() => {
    localStorage.setItem('tournament_year', selectedYear.toString());
  }, [selectedYear]);

  return (
    <TournamentContext.Provider
      value={{
        selectedYear,
        setSelectedYear,
        availableYears: AVAILABLE_YEARS,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  const ctx = useContext(TournamentContext);
  if (!ctx) {
    throw new Error('useTournament must be used within TournamentProvider');
  }
  return ctx;
}
