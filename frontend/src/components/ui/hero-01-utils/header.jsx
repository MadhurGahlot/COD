import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Header sub-component for HeroSection
 * Replaces shadcn Sheet with a simple mobile drawer using project's existing patterns
 */
export default function Header({ navigationData = [] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-light-border dark:border-dark-border bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shadow-md shadow-accent/30 group-hover:scale-105 transition-transform">
              <Swords className="w-4 h-4 text-white" />
            </div>
            <span className="font-black font-display text-base text-light-text dark:text-dark-text tracking-tight">
              GKV<span className="text-accent">Esports</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navigationData.map((item) => {
              const isActive = item.isActive || location.pathname === item.href;
              return (
                <Link
                  key={item.title}
                  to={item.href}
                  className={cn(
                    'px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-accent text-white shadow-sm shadow-accent/30'
                      : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-border dark:hover:bg-dark-border'
                  )}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-accent hover:border-accent/40 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-light-border dark:border-dark-border bg-white dark:bg-dark-surface px-4 py-3 space-y-1">
          {navigationData.map((item) => {
            const isActive = item.isActive || location.pathname === item.href;
            return (
              <Link
                key={item.title}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors',
                  isActive
                    ? 'bg-accent text-white'
                    : 'text-light-muted dark:text-dark-muted hover:bg-light-border dark:hover:bg-dark-border'
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
