import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  LogIn,
  LogOut,
  UserPlus,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import YearSelector from './YearSelector';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { to: '/teams', label: 'Teams' },
    { to: '/players', label: 'Players' },
    { to: '/leaderboard', label: 'Standings' },
    { to: '/fixtures', label: 'Fixtures' },
    { to: '/brackets', label: 'Brackets' },
    { to: '/winners', label: 'Hall of Fame' },
  ];

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/[0.06] dark:border-white/[0.06] bg-[#EBE9E5]/85 dark:bg-[#111110]/85 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">
          {/* Brand Logo - SculptureHero Style */}
          <Link
            to="/"
            className="font-display font-medium text-[16px] sm:text-[17px] tracking-[-0.02em] text-light-text dark:text-dark-text hover:opacity-75 transition-opacity"
          >
            GKV COD Tournament
          </Link>

          {/* Desktop Nav Links - SculptureHero sh-links style */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-[13.5px] tracking-[-0.01em] transition-all duration-200 relative py-1 ${
                    isActive
                      ? 'text-light-text dark:text-dark-text font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-current after:rounded-full'
                      : 'text-light-text/65 dark:text-dark-text/65 hover:text-light-text dark:hover:text-dark-text font-normal'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions: Year, Theme, Auth, Mobile Toggle */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <YearSelector />
            <ThemeToggle />

            {/* Auth Dropdown or Pill Buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/15 dark:border-white/15 bg-white/40 dark:bg-neutral-900/40 text-xs font-medium text-light-text dark:text-dark-text hover:border-black/30 dark:hover:border-white/30 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center text-[10px] font-bold uppercase">
                    {user?.username?.[0] || 'U'}
                  </div>
                  <span className="max-w-[80px] sm:max-w-[110px] truncate text-xs font-medium">
                    {user?.username}
                  </span>
                  {isAdmin && (
                    <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-accent/15 text-accent uppercase font-bold tracking-wider">
                      Admin
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 py-2 rounded-2xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-[#1D1C1A]/95 backdrop-blur-md shadow-2xl z-50 page-enter">
                    <div className="px-4 py-2.5 border-b border-black/8 dark:border-white/8">
                      <p className="text-xs font-semibold text-light-text dark:text-dark-text">
                        {user?.username}
                      </p>
                      <p className="text-[11px] text-light-muted dark:text-dark-muted capitalize">
                        Role: {user?.role || 'player'}
                      </p>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-light-text dark:text-dark-text hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-accent" />
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-1.5 rounded-full border border-black/20 dark:border-white/20 text-[13px] font-medium text-light-text dark:text-dark-text hover:bg-neutral-950 hover:text-white dark:hover:bg-white dark:hover:text-neutral-950 transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex px-4 py-1.5 rounded-full text-[13px] font-medium bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-85 transition-opacity items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-full border border-black/15 dark:border-white/15 text-light-text dark:text-dark-text hover:opacity-80"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-black/8 dark:border-white/8 bg-[#EBE9E5]/98 dark:bg-[#111110]/98 backdrop-blur-xl px-5 pt-4 pb-6 space-y-2 shadow-2xl page-enter">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                    : 'text-light-text dark:text-dark-text hover:bg-black/5 dark:hover:bg-white/5'
                }`
              }
            >
              <span>{item.label}</span>
              <ChevronDown className="w-3.5 h-3.5 -rotate-90 opacity-60" />
            </NavLink>
          ))}

          {!isAuthenticated && (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-full text-center text-xs font-semibold bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
              >
                Create Account
              </Link>
            </div>
          )}

          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-semibold transition-colors ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    : 'text-amber-500/90 hover:bg-amber-500/10'
                }`
              }
            >
              <Settings className="w-4 h-4" />
              Admin Portal
            </NavLink>
          )}
        </div>
      )}
    </header>
  );
}
