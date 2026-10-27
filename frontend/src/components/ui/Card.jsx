import React from 'react';

export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        hover ? 'hover:-translate-y-0.5 hover:shadow-md hover:border-black/20 dark:hover:border-white/20' : ''
      } bg-white/60 dark:bg-[#1B1A18]/70 backdrop-blur-md border-black/[0.08] dark:border-white/[0.08] text-light-text dark:text-dark-text shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-6 border-b border-black/[0.07] dark:border-white/[0.07] ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '', ...props }) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`p-5 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.07] dark:border-white/[0.07] rounded-b-2xl ${className}`} {...props}>
      {children}
    </div>
  );
}
