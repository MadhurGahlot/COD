import React from 'react';
import Card from './Card';

export default function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  trend,
  color = 'accent',
  className = '',
}) {
  const colorStyles = {
    accent: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    red: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  };

  return (
    <Card hover className={`p-6 sm:p-7 rounded-2xl ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted">
            {label}
          </p>
          <p className="text-4xl sm:text-5xl font-black font-display font-tabular mt-3 text-light-text dark:text-dark-text tracking-tight">
            {value ?? '—'}
          </p>
          {subtext && (
            <p className="text-sm font-medium text-light-muted dark:text-dark-muted mt-2 flex items-center gap-1.5">
              {trend && (
                <span className={trend > 0 ? 'text-orange-500 font-bold' : 'text-rose-500 font-bold'}>
                  {trend > 0 ? '↑' : '↓'}
                </span>
              )}
              {subtext}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm ${
              colorStyles[color] || colorStyles.accent
            }`}
          >
            <Icon className="w-7 h-7" />
          </div>
        )}
      </div>
    </Card>
  );
}
