import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Trophy, Sparkles, Flame, Shield, Crosshair } from 'lucide-react';
import { cn } from '@/lib/utils';

// High-resolution tactical, esports, and gradient artwork for the tilted streaming grid
const DEFAULT_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    alt: 'Esports arena neon championship setup',
    tag: 'ARENA',
  },
  {
    src: 'https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/gradients/hero_gradient/hero-gradients-01.png',
    alt: 'Tactical orange and amber gradient wash',
    tag: 'WARZONE',
  },
  {
    src: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
    alt: 'Competitive gaming operative with headset',
    tag: 'PRO SQUAD',
  },
  {
    src: 'https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/gradients/moon/moon-grade-03.png',
    alt: 'Deep night tactical atmosphere',
    tag: 'STEALTH',
  },
  {
    src: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop',
    alt: 'Cyber tactical battle station',
    tag: 'COMBAT',
  },
  {
    src: 'https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/gradients/mesh/mesh-grade-02.png',
    alt: 'Orange fiery mesh gradient',
    tag: 'IGNITE',
  },
  {
    src: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
    alt: 'Retro-futuristic tactical technology display',
    tag: 'INTEL',
  },
  {
    src: 'https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/gradients/sunset/sunset-grade-04.png',
    alt: 'Vibrant sunset tactical glow',
    tag: 'VALOR',
  },
  {
    src: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop',
    alt: 'Neon combat lighting and geometric depth',
    tag: 'FINALS',
  },
];

/**
 * TiltedGridHero Component
 * Inspired by Ruixen UI / 21st.dev
 * Features a 3D perspective tilted curved row of moving photos with endless streaming marquee
 */
export default function TiltedGridHero({
  badgeText = 'Season 2026 Live Championship',
  badgeLink = '/fixtures',
  title = 'Every frame, brought into focus.',
  highlightText = 'brought into focus.',
  description = 'Official competitive esports tournament of Gurukula Kangri Vishwavidyalaya. Real-time bracket progression, verified combat statistics, and university squad standings.',
  primaryCta = {
    text: 'View Brackets',
    href: '/brackets',
    icon: Trophy,
  },
  secondaryCta = {
    text: 'Leaderboard',
    href: '/leaderboard',
    icon: Flame,
  },
  images = DEFAULT_IMAGES,
  className,
}) {
  const PrimaryIcon = primaryCta?.icon || Trophy;
  const SecondaryIcon = secondaryCta?.icon || Flame;

  // Duplicate image list to guarantee smooth continuous loop
  const streamImages = useMemo(() => {
    const list = images && images.length > 0 ? images : DEFAULT_IMAGES;
    return [...list, ...list, ...list];
  }, [images]);

  return (
    <section
      className={cn(
        'relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-32',
        className
      )}
    >
      {/* Background ambient tactical glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-accent/10 via-accent/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-20 -left-20 w-80 h-80 bg-accent/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-20 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Header Content */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 z-20 mb-12 sm:mb-16">
        {/* Announce Badge */}
        {badgeText && (
          <div className="inline-flex items-center">
            <Link
              to={badgeLink}
              className="group inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-accent/10 hover:bg-accent/20 border border-accent/25 hover:border-accent/40 text-accent text-xs font-bold transition-all duration-200 hover:scale-105 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              <span>{badgeText}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight text-light-text dark:text-dark-text leading-[1.08] max-w-4xl mx-auto">
          {title.includes(highlightText) ? (
            <>
              {title.replace(highlightText, '')}
              <span className="text-gradient-accent">{highlightText}</span>
            </>
          ) : (
            title
          )}
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg text-light-muted dark:text-dark-muted max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {primaryCta && (
            <Link
              to={primaryCta.href}
              className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-sm transition-all duration-200 shadow-xl shadow-accent/25 hover:shadow-accent/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              <PrimaryIcon className="w-4 h-4" />
              <span>{primaryCta.text}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}

          {secondaryCta && (
            <Link
              to={secondaryCta.href}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl border border-light-border dark:border-dark-border hover:border-accent/40 bg-white/70 dark:bg-dark-surface/70 hover:bg-white dark:hover:bg-dark-surface text-light-text dark:text-dark-text font-semibold text-sm transition-all duration-200 shadow-sm hover:-translate-y-0.5"
            >
              <SecondaryIcon className="w-4 h-4 text-accent" />
              <span>{secondaryCta.text}</span>
            </Link>
          )}
        </div>
      </div>

      {/* 3D Tilted Curved Streaming Photos Section */}
      <div className="relative w-full max-w-[100vw] overflow-hidden py-4 select-none">
        {/* Left & Right Edge Fade Gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-44 md:w-64 z-30 bg-gradient-to-r from-light-bg dark:from-dark-bg via-light-bg/80 dark:via-dark-bg/80 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-44 md:w-64 z-30 bg-gradient-to-l from-light-bg dark:from-dark-bg via-light-bg/80 dark:via-dark-bg/80 to-transparent pointer-events-none" />

        {/* 3D Perspective Stage */}
        <div
          className="tilted-stage w-full transform-gpu"
          style={{
            perspective: '1200px',
            perspectiveOrigin: 'center center',
          }}
        >
          {/* Tilted & Curved Rotating Plane */}
          <div
            className="tilted-plane flex w-full"
            style={{
              transform: 'rotateX(18deg) rotateZ(-1.5deg) scale(1.02)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Endlessly Streaming Row */}
            <div className="tilted-stream-track flex items-center gap-5 sm:gap-7 hover:[animation-play-state:paused]">
              {streamImages.map((img, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'group relative shrink-0 w-48 sm:w-60 md:w-72 aspect-[3/4] rounded-2xl overflow-hidden',
                    'border border-white/20 dark:border-white/10 shadow-xl dark:shadow-2xl dark:shadow-black/60',
                    'bg-dark-surface transition-all duration-500 hover:scale-[1.04] hover:border-accent/50 hover:shadow-accent/20 cursor-pointer'
                  )}
                  style={{
                    transform: 'translateZ(0)',
                  }}
                >
                  {/* Photo or Gradient Asset */}
                  <img
                    src={img.src}
                    alt={img.alt || `Combat Media ${idx + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      // Fallback gradient if external asset fails to load
                      e.target.style.display = 'none';
                    }}
                  />

                  {/* Gradient Overlay & Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                  {/* Top Badge / Tag */}
                  {img.tag && (
                    <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono font-black text-accent tracking-wider uppercase">
                      {img.tag}
                    </div>
                  )}

                  {/* Bottom Caption */}
                  <div className="absolute bottom-3 left-3 right-3 text-left">
                    <p className="text-xs font-bold text-white drop-shadow truncate">
                      {img.alt || 'Combat Action Still'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      <span className="text-[10px] font-mono text-gray-300">
                        OP_{((idx % 12) + 1).toString().padStart(2, '0')} // GKV
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Hardware-Accelerated CSS Marquee Animation */}
      <style>{`
        .tilted-stream-track {
          display: flex;
          width: max-content;
          animation: tiltedMarquee 42s linear infinite;
        }

        @keyframes tiltedMarquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-33.333333%, 0, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tilted-stream-track {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
