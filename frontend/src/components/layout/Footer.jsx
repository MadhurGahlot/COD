import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-black/[0.08] dark:border-white/[0.08] bg-transparent text-light-text dark:text-dark-text mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link
              to="/"
              className="font-display font-medium text-[16px] tracking-[-0.02em] text-light-text dark:text-dark-text hover:opacity-75 transition-opacity inline-block"
            >
              GKV COD Tournament
            </Link>
            <p className="text-[13px] leading-relaxed text-light-text/65 dark:text-dark-text/65 max-w-xs">
              Official Call of Duty competitive esports platform of Gurukula Kangri Vishwavidyalaya, Haridwar.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-black/10 dark:border-white/10 text-[11px] font-medium text-light-text/75 dark:text-dark-text/75">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live API Active
              </span>
            </div>
          </div>

          {/* Col 2: Tournament */}
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.14em] font-medium opacity-50">
              Tournament
            </p>
            <ul className="space-y-2 text-[13px]">
              <li><Link to="/" className="text-light-text/70 dark:text-dark-text/70 hover:text-light-text dark:hover:text-dark-text transition-colors">Home</Link></li>
              <li><Link to="/leaderboard" className="text-light-text/70 dark:text-dark-text/70 hover:text-light-text dark:hover:text-dark-text transition-colors">Points Table</Link></li>
              <li><Link to="/fixtures" className="text-light-text/70 dark:text-dark-text/70 hover:text-light-text dark:hover:text-dark-text transition-colors">Fixtures &amp; Results</Link></li>
              <li><Link to="/brackets" className="text-light-text/70 dark:text-dark-text/70 hover:text-light-text dark:hover:text-dark-text transition-colors">Playoff Details</Link></li>
              <li><Link to="/winners" className="text-light-text/70 dark:text-dark-text/70 hover:text-light-text dark:hover:text-dark-text transition-colors">Hall of Fame</Link></li>
            </ul>
          </div>

          {/* Col 3: Players & Teams */}
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.14em] font-medium opacity-50">
              Roster
            </p>
            <ul className="space-y-2 text-[13px]">
              <li><Link to="/teams" className="text-light-text/70 dark:text-dark-text/70 hover:text-light-text dark:hover:text-dark-text transition-colors">Registered Squads</Link></li>
              <li><Link to="/players" className="text-light-text/70 dark:text-dark-text/70 hover:text-light-text dark:hover:text-dark-text transition-colors">Players </Link></li>
              <li><Link to="/compare" className="text-light-text/70 dark:text-dark-text/70 hover:text-light-text dark:hover:text-dark-text transition-colors">Compare </Link></li>
              <li><Link to="/news" className="text-light-text/70 dark:text-dark-text/70 hover:text-light-text dark:hover:text-dark-text transition-colors">Bulletins</Link></li>
            </ul>
          </div>

          {/* Col 4: Account */}
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.14em] font-medium opacity-50">
              Portal
            </p>
            <ul className="space-y-2 text-[13px]">
              <li><Link to="/login" className="text-light-text/70 dark:text-dark-text/70 hover:text-light-text dark:hover:text-dark-text transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="text-light-text/70 dark:text-dark-text/70 hover:text-light-text dark:hover:text-dark-text transition-colors">Register </Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-black/[0.06] dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-light-text/60 dark:text-dark-text/60">
          <p>© {new Date().getFullYear()} Gurukula Kangri Vishwavidyalaya Esports. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Engineered  for GKV Esports </p>
            <p>
            Contact:{' '}
              <a 
                href="mailto:236301126@gkv.ac.in" 
                className="hover:underline text-light-text/80 dark:text-dark-text/80 transition-colors"
              >
                236301126@gkv.ac.in
              </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
