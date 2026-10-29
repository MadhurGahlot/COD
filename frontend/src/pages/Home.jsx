import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Shield,
  Users,
  User,
  Swords,
  Trophy,
  ArrowRight,
  Flame,
  Calendar,
  Sparkles,
  Award,
  ChevronRight,
  Target,
  GitBranch,
  Bell,
  Crosshair,
  Crown,
} from 'lucide-react';
import { getHome } from '../api/home';
import { staticUrl } from '../api/client';
import { useTournament } from '../context/TournamentContext';
import Card, { CardBody } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import { StatCardSkeleton, CardSkeleton } from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import SculptureHero from '../components/ui/liquid-sculpture-hero';

export default function Home() {
  const { selectedYear } = useTournament();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['home', selectedYear],
    queryFn: async () => {
      const res = await getHome(selectedYear);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-8 page-enter">
        <div className="h-64 rounded-2xl bg-gray-200 dark:bg-dark-card skeleton" />
        <StatCardSkeleton count={3} />
        <CardSkeleton count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-enter py-12">
        <ErrorState
          title="Could not load tournament home"
          message={error.response?.data?.detail || error.message}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const stats = data?.stats || { teams: 0, players: 0, matches: 0 };
  const settings = data?.settings || {};
  const topPlayers = data?.top_players || [];
  const highlights = data?.highlights || [];
  const heroImages = data?.hero_images || [];

  const heroBrand = settings.brand || 'GKV COD Tournament';
  const heroEyebrow = settings.eyebrow || `COMPETITIVE GAMING · GKV · SEASON ${selectedYear}`;
  const heroTitle = settings.hero_title || 'The competition\nstarts here.';
  const headlineAccent = settings.headline_accent || 'starts here.';
  const heroSubtitle =
    settings.hero_subtitle ||
    'Follow your teams, explore upcoming matches, track tournament standings, and celebrate the players shaping the competition.';

  const primaryCta = {
    label: settings.primary_cta_text || 'Explore Tournament',
    href: settings.primary_cta_link || '/brackets',
  };
  const secondaryCta = {
    label: settings.secondary_cta_text || 'View Leaderboard',
    href: settings.secondary_cta_link || '/leaderboard',
  };

  const lightArtwork = settings.hero_background
    ? staticUrl(settings.hero_background.startsWith('http') ? settings.hero_background : `/static/${settings.hero_background}`)
    : undefined;

  const darkArtwork = settings.hero_dark_image
    ? staticUrl(settings.hero_dark_image.startsWith('http') ? settings.hero_dark_image : `/static/${settings.hero_dark_image}`)
    : undefined;

  return (
    <div className="w-full page-enter">
      {/* Liquid Sculpture Hero (100svh full-screen viewport) */}
      <SculptureHero
        brand={heroBrand}
        eyebrow={heroEyebrow}
        headline={heroTitle}
        headlineAccent={headlineAccent}
        body={heroSubtitle}
        primaryCta={primaryCta}
        secondaryCta={secondaryCta}
        backdropText={settings.backdrop_text || 'forma'}
        showNav={false}
        height="calc(100svh - 68px)"
        src={lightArtwork}
        darkSrc={darkArtwork}
        autoAnimate={true}
        speed={1.2}
        liquid={1.5}
        turbulence={1.2}
        particleSpread={1.2}
        particleDensity={1.2}
        ambient={true}
        ambientIntensity={1.3}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-16">
        {/* Verified Real-time Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          icon={Users}
          label="Registered Squads"
          value={stats.teams}
          subtext={`Competing in Season ${selectedYear}`}
          color="accent"
        />
        <StatCard
          icon={User}
          label="Active Operatives"
          value={stats.players}
          subtext="Verified combatants"
          color="accent"
        />
        <StatCard
          icon={Swords}
          label="Matches Recorded"
          value={stats.matches}
          subtext="Logged encounters"
          color="amber"
        />
      </section>

      {/* Top Fraggers Spotlight */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-black/[0.08] dark:border-white/[0.08] pb-6">
          <div>
            <p className="eyebrow-line text-light-text dark:text-dark-text mb-2">
              Leaderboard Spotlight
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium font-display text-light-text dark:text-dark-text tracking-[-0.03em] flex items-center gap-3">
              <Flame className="w-6 h-6 text-accent" />
              Featured Top <span className="font-serif italic font-normal text-accent">Players</span>
            </h2>
            <p className="text-sm sm:text-base text-light-text/65 dark:text-dark-text/65 mt-2 max-w-2xl leading-relaxed">
              Ranked by verified combat efficiency, frag counts, and tournament K/D ratio in Season {selectedYear}
            </p>
          </div>
          <Link
            to="/leaderboard"
            className="text-sm font-medium text-accent hover:opacity-80 flex items-center gap-1.5 transition-opacity self-start sm:self-auto"
          >
            <span>Full Standings</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {topPlayers.length === 0 ? (
          <Card className="p-12 text-center rounded-2xl border border-dashed border-light-border dark:border-dark-border">
            <p className="text-base text-light-muted dark:text-dark-muted">
              No player match results recorded yet for Season {selectedYear}. Standings update automatically as match stats are entered.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topPlayers.slice(0, 4).map((p, idx) => (
              <Card key={p.id || idx} hover className="p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-accent font-black font-display flex items-center justify-center text-base">
                      #{idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-base sm:text-lg font-bold text-light-text dark:text-dark-text truncate font-display">
                        {p.cod_name || p.player_name}
                      </p>
                      <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted truncate mt-0.5">
                        {p.player_name || 'Operative'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-light-border dark:border-dark-border text-center">
                    <div>
                      <span className="block text-xs text-light-muted dark:text-dark-muted uppercase font-bold tracking-wider">
                        K/D Ratio
                      </span>
                      <span className="text-lg sm:text-xl font-black text-accent font-tabular block mt-1">
                        {p.kd_ratio?.toFixed ? p.kd_ratio.toFixed(2) : (p.kd_ratio || '0.00')}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-light-muted dark:text-dark-muted uppercase font-bold tracking-wider">
                        Eliminations
                      </span>
                      <span className="text-lg sm:text-xl font-black font-tabular text-light-text dark:text-dark-text block mt-1">
                        {p.kills || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Tournament Highlights */}
      {highlights.length > 0 && (
        <section className="space-y-6">
          <div className="border-b border-black/[0.08] dark:border-white/[0.08] pb-6">
            <p className="eyebrow-line text-light-text dark:text-dark-text mb-2">
              Media & Moments
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium font-display text-light-text dark:text-dark-text tracking-[-0.03em] flex items-center gap-3">
              <Award className="w-6 h-6 text-accent" />
              Tournament <span className="font-serif italic font-normal text-accent">Highlights</span>
            </h2>
            <p className="text-sm sm:text-base text-light-text/65 dark:text-dark-text/65 mt-2 leading-relaxed">
              Memorable plays, tournament announcements, and victory milestones
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((h, i) => {
              const img = h.image || h.image_url;
              const imgSrc = img ? staticUrl(img.startsWith('http') ? img : `/static/${img}`) : null;
              const rotateClass = i % 2 === 0 ? 'group-hover:rotate-2' : 'group-hover:-rotate-2';

              return (
                <Card
                  key={h.id || i}
                  hover
                  className="overflow-hidden rounded-2xl group cursor-pointer transition-all duration-500 hover:shadow-xl hover:shadow-accent/5 hover:border-accent/30"
                >
                  {imgSrc && (
                    <div className="overflow-hidden relative h-56 bg-black/10">
                      <img
                        src={imgSrc}
                        alt={h.title || 'Highlight'}
                        loading="lazy"
                        decoding="async"
                        className={`w-full h-full object-cover transition-all duration-700 ease-out transform group-hover:scale-110 ${rotateClass}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  )}
                  <CardBody className="p-6 space-y-3">
                    <h3 className="font-bold text-lg sm:text-xl font-display text-light-text dark:text-dark-text tracking-tight group-hover:text-accent transition-colors">
                      {h.title}
                    </h3>
                    <p className="text-sm sm:text-base text-light-muted dark:text-dark-muted line-clamp-3 leading-relaxed">
                      {h.description}
                    </p>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Primary Feature Hub */}
      <section className="space-y-6">
        <div className="border-b border-black/[0.08] dark:border-white/[0.08] pb-6">
          <p className="eyebrow-line text-light-text dark:text-dark-text mb-2">
            Tournament Directory
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium font-display text-light-text dark:text-dark-text tracking-[-0.03em]">
            Explore Championship <span className="font-serif italic font-normal text-accent">Features</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/teams" className="group">
            <Card hover className="p-7 rounded-2xl h-full flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-accent flex items-center justify-center border border-orange-500/20">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-display text-light-text dark:text-dark-text group-hover:text-accent transition-colors">
                  Squads 
                </h3>
                <p className="text-sm sm:text-base text-light-muted dark:text-dark-muted leading-relaxed">
                  View all registered university teams and official player lineups.
                </p>
              </div>
              <span className="text-sm font-bold text-accent flex items-center gap-1.5">
                Browse Teams <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Card>
          </Link>

          <Link to="/compare" className="group">
            <Card hover className="p-7 rounded-2xl h-full flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-accent flex items-center justify-center border border-orange-500/20">
                  <Crosshair className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-display text-light-text dark:text-dark-text group-hover:text-accent transition-colors">
                  Head-to-Head Compare
                </h3>
                <p className="text-sm sm:text-base text-light-muted dark:text-dark-muted leading-relaxed">
                  Direct side-by-side comparison between any two tournament players.
                </p>
              </div>
              <span className="text-sm font-bold text-accent flex items-center gap-1.5">
                Compare Stats <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Card>
          </Link>

          <Link to="/winners" className="group">
            <Card hover className="p-7 rounded-2xl h-full flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                  <Crown className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-display text-light-text dark:text-dark-text group-hover:text-accent transition-colors">
                  Hall of Fame
                </h3>
                <p className="text-sm sm:text-base text-light-muted dark:text-dark-muted leading-relaxed">
                  Celebrate past champions, tournament victors, and GKV esports legends.
                </p>
              </div>
              <span className="text-sm font-bold text-accent flex items-center gap-1.5">
                View Champions <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Card>
          </Link>

          <Link to="/news" className="group">
            <Card hover className="p-7 rounded-2xl h-full flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-accent flex items-center justify-center border border-orange-500/20">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-display text-light-text dark:text-dark-text group-hover:text-accent transition-colors">
                  Announcements
                </h3>
                <p className="text-sm sm:text-base text-light-muted dark:text-dark-muted leading-relaxed">
                  Stay updated with official bulletins, rule updates, and match alerts.
                </p>
              </div>
              <span className="text-sm font-bold text-accent flex items-center gap-1.5">
                Read Updates <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Card>
          </Link>
        </div>
      </section>
      </div>
    </div>
  );
}
