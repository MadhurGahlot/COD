import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import Card from '../components/ui/Card';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 page-enter">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center">
          <Compass className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black font-display text-light-text dark:text-dark-text tracking-tight">
            404 — Sector Uncharted
          </h1>
          <p className="text-xs text-light-muted dark:text-dark-muted max-w-xs mx-auto">
            The tournament sector or operative link you are attempting to access does not exist or has been relocated.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-md shadow-accent/25 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return 
        </Link>
      </div>
    </div>
  );
}
