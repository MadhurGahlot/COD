import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Trophy, Crosshair, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Main HeroSection sub-component
 * avatarList: [{ image: string, name?: string }]
 */
export default function HeroSection({ avatarList = [], title, subtitle, year }) {
  return (
    <section className="relative overflow-hidden">
      {/* Tactical grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Ambient glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text content */}
          <div className="space-y-6">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              Season {year} — Live Tournament
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-light-text dark:text-dark-text leading-[1.05]">
              {title || (
                <>
                  GKV{' '}
                  <span className="relative">
                    <span className="text-gradient-accent">Call of Duty</span>
                  </span>
                  <br />
                  Championship
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base text-light-muted dark:text-dark-muted leading-relaxed max-w-lg">
              {subtitle ||
                'Official competitive esports tournament of Gurukula Kangri Vishwavidyalaya. Real-time bracket progression, verified combat statistics, and university squad standings.'}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/brackets"
                className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-xs transition-all duration-200 shadow-lg shadow-accent/30 hover:shadow-accent/50 hover:-translate-y-0.5"
              >
                <Trophy className="w-4 h-4" />
                View Brackets
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/leaderboard"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-light-border dark:border-dark-border hover:border-accent/40 bg-white/50 dark:bg-dark-surface/50 text-light-text dark:text-dark-text font-semibold text-xs transition-all duration-200 hover:-translate-y-0.5"
              >
                <Flame className="w-4 h-4 text-accent" />
                Leaderboard
              </Link>
            </div>

            {/* Top players avatars */}
            {avatarList.length > 0 && (
              <div className="flex items-center gap-3 pt-2">
                <div className="flex -space-x-2.5">
                  {avatarList.map((av, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-9 h-9 rounded-full border-2 border-white dark:border-dark-surface overflow-hidden ring-1 ring-accent/20',
                        'bg-gradient-to-br from-accent/20 to-accent/10'
                      )}
                    >
                      {av.image ? (
                        <img
                          src={av.image}
                          alt={av.name || `Operative ${i + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-accent text-xs font-black">
                          {(av.name || 'OP').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold text-light-text dark:text-dark-text">
                    Top Operatives
                  </p>
                  <p className="text-[11px] text-light-muted dark:text-dark-muted">
                    {avatarList.length}+ active fraggers this season
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Visual panel */}
          <div className="relative hidden lg:block">
            {/* Main card */}
            <div className="relative rounded-2xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-card overflow-hidden shadow-2xl shadow-black/20">
              {/* Header bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-surface">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="ml-2 text-[11px] font-mono text-light-muted dark:text-dark-muted">
                  GKV_ESPORTS — LIVE TOURNAMENT FEED
                </span>
              </div>

              {/* Stats display */}
              <div className="p-5 space-y-3">
                {/* Kill feed lines */}
                {[
                  { player: 'PHANTOM_X', action: 'eliminated', target: 'ZERO_GHOST', kills: 12 },
                  { player: 'REAPER_99', action: 'eliminated', target: 'SHADOW_ACE', kills: 8 },
                  { player: 'TITAN_K', action: 'eliminated', target: 'BLAZE_77', kills: 15 },
                ].map((feed, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-light-bg dark:bg-dark-surface border border-light-border dark:border-dark-border"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
                        <Crosshair className="w-3.5 h-3.5 text-accent" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-light-text dark:text-dark-text font-mono">
                          {feed.player}
                        </span>
                        <span className="text-[10px] text-light-muted dark:text-dark-muted mx-1">
                          {feed.action}
                        </span>
                        <span className="text-[10px] text-light-muted dark:text-dark-muted line-through">
                          {feed.target}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-accent font-tabular">
                      +{feed.kills}K
                    </span>
                  </div>
                ))}

                {/* K/D ratio progress bar */}
                <div className="pt-2 space-y-2">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-light-muted dark:text-dark-muted">Avg K/D This Season</span>
                    <span className="text-accent font-black">2.34</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-light-border dark:bg-dark-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-accent-light transition-all duration-1000"
                      style={{ width: '72%' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 px-3 py-2 rounded-xl bg-accent text-white text-xs font-black shadow-lg shadow-accent/40 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              SEASON ACTIVE
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
