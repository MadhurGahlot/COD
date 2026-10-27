import React from 'react';
import { FolderOpen } from 'lucide-react';

export default function EmptyState({
  icon: Icon = FolderOpen,
  title = 'No data found',
  description = 'There are no records available for this tournament year yet.',
  action,
  className = '',
}) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-black/15 dark:border-white/15 bg-white/40 dark:bg-[#1B1A18]/40 p-12 text-center flex flex-col items-center justify-center backdrop-blur-sm ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-black/[0.04] dark:bg-white/[0.04] flex items-center justify-center text-light-text/60 dark:text-dark-text/60 mb-4 border border-black/10 dark:border-white/10">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-base font-medium text-light-text dark:text-dark-text font-display tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-light-text/60 dark:text-dark-text/60 max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
