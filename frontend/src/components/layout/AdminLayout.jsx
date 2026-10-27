import React from 'react';
import { NavLink, Outlet, Navigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  User,
  Swords,
  Calendar,
  GitBranch,
  Award,
  Bell,
  Sliders,
  History,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';

export default function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 border border-amber-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-display text-light-text dark:text-dark-text mb-2">
            Admin Access Required
          </h2>
          <p className="text-sm text-light-muted dark:text-dark-muted mb-6">
            You must be signed in with an administrator account to access the tournament management console.
          </p>
          <div className="flex gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-colors"
            >
              Sign In as Admin
            </Link>
            <Link
              to="/"
              className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border text-xs font-semibold text-light-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const adminNav = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/teams', label: 'Teams', icon: Users },
    { to: '/admin/players', label: 'Players', icon: User },
    { to: '/admin/results', label: 'Match Results', icon: Swords },
    { to: '/admin/schedules', label: 'Schedules', icon: Calendar },
    { to: '/admin/brackets', label: 'Brackets', icon: GitBranch },
    { to: '/admin/winners', label: 'Winners & HoF', icon: Award },
    { to: '/admin/news', label: 'News Updates', icon: Bell },
    { to: '/admin/home', label: 'Home CMS', icon: Sliders },
    { to: '/admin/audit', label: 'Audit Logs', icon: History },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text antialiased">
      <Navbar />

      {/* Admin Top Header Banner */}
      <div className="border-b border-light-border dark:border-dark-border bg-white dark:bg-dark-surface/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 uppercase tracking-wider">
              Control Panel
            </span>
            <h1 className="text-sm font-bold font-display text-light-text dark:text-dark-text">
              Tournament Administration
            </h1>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-medium text-light-muted dark:text-dark-muted hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Public Site
          </Link>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Admin Navigation Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-card p-3 shadow-sm space-y-1">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted">
                Management
              </p>
              {adminNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-accent/10 text-accent font-semibold border border-accent/20'
                        : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </aside>

          {/* Admin Content Area */}
          <main className="lg:col-span-4 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
