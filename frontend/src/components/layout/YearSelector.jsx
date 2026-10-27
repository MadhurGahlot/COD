import React from 'react';
import { useTournament } from '../../context/TournamentContext';

export default function YearSelector({ className = '' }) {
  const { selectedYear, setSelectedYear, availableYears } = useTournament();

  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-black/15 dark:border-white/15 bg-transparent text-xs text-light-text dark:text-dark-text hover:border-black/30 dark:hover:border-white/30 transition-colors">
        <span className="text-[11px] opacity-60">Season</span>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
          className="bg-transparent border-none text-[12px] font-medium focus:outline-none cursor-pointer pr-0.5 text-light-text dark:text-dark-text"
        >
          {availableYears.map((yr) => (
            <option key={yr} value={yr} className="bg-[#EBE9E5] dark:bg-[#111110] text-light-text dark:text-dark-text">
              {yr}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
