import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * BrandSlider — infinite auto-scrolling team/sponsor logo strip
 * brandList: [{ image?: string, name: string, lightimg?: string }]
 */
export default function BrandSlider({ brandList = [] }) {
  if (brandList.length === 0) return null;

  // Duplicate list for seamless infinite scroll
  const items = [...brandList, ...brandList, ...brandList];

  return (
    <div className="relative w-full overflow-hidden border-y border-light-border dark:border-dark-border bg-light-bg/60 dark:bg-dark-surface/60 py-5">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-light-bg dark:from-dark-bg to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-light-bg dark:from-dark-bg to-transparent pointer-events-none" />

      {/* Label */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-3 z-20">
        <span className="px-3 py-0.5 rounded-full bg-light-bg dark:bg-dark-surface border border-light-border dark:border-dark-border text-[10px] font-bold uppercase tracking-widest text-light-muted dark:text-dark-muted">
          Competing Teams
        </span>
      </div>

      {/* Scrolling track */}
      <div className="flex brand-scroll-track">
        {items.map((brand, i) => (
          <div
            key={i}
            className={cn(
              'flex items-center gap-2 mx-6 shrink-0',
              'px-4 py-2 rounded-lg border border-transparent hover:border-accent/20 transition-colors'
            )}
          >
            {brand.image ? (
              <>
                {/* Dark mode image */}
                <img
                  src={brand.image}
                  alt={brand.name}
                  className="h-6 w-auto dark:block hidden object-contain opacity-70 hover:opacity-100 transition-opacity"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                {/* Light mode image */}
                <img
                  src={brand.lightimg || brand.image}
                  alt={brand.name}
                  className="h-6 w-auto dark:hidden block object-contain opacity-60 hover:opacity-90 transition-opacity"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </>
            ) : (
              <span className="text-xs font-black font-display text-light-muted dark:text-dark-muted tracking-widest uppercase hover:text-accent transition-colors">
                {brand.name}
              </span>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .brand-scroll-track {
          animation: brand-scroll 30s linear infinite;
          width: max-content;
        }
        .brand-scroll-track:hover {
          animation-play-state: paused;
        }
        @keyframes brand-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
