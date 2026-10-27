import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-[11px]',
    lg: 'px-3 py-1 text-xs',
  };

  const variantClasses = {
    default: 'bg-black/[0.05] text-light-text dark:bg-white/[0.08] dark:text-dark-text border border-black/10 dark:border-white/10',
    accent: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
    primary: 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-medium',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    outline: 'border border-black/15 dark:border-white/15 text-light-text/80 dark:text-dark-text/80',
    cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20',
    gold: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full uppercase tracking-wider ${sizeClasses[size] || sizeClasses.md} ${
        variantClasses[variant] || variantClasses.default
      } ${className}`}
    >
      {children}
    </span>
  );
}
