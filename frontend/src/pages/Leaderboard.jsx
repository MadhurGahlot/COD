import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Trophy,
  Flame,
  Award,
  Search,
  Shield,
  Crosshair,
  Target,
  Skull,
  Swords,
  ChevronRight,
} from 'lucide-react';
import { getLeaderboard } from '../api/players';
import { useTournament } from '../context/TournamentContext';
import Card, { CardBody } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

export default function Leaderboard() {
  const { selectedYear } = useTournament();
  const [search, setSearch] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['leaderboard', selectedYear],
    queryFn: async () => {
      const res = await getLeaderboard(selectedYear);
      return res.data;
    },
  });

  const leaderboard = data?.leaderboard || [];
  const mvp = data?.mvp || null;

  const filteredLeaderboard = leaderboard.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.cod_name?.toLowerCase().includes(q) ||
      p.player_name?.toLowerCase().includes(q) ||
      p.team_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-10 page-enter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/[0.08] dark:border-white/[0.08] pb-8">
        <div>
          <p className="eyebrow-line text-light-text dark:text-dark-text mb-3">
            Combat Efficiency Rankings
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium font-display text-light-text dark:text-dark-text tracking-[-0.03em]">
              Points Table & <span className="font-serif italic font-normal text-accent">Standings</span>
            </h1>
            <Badge variant="accent" size="md">
              Season {selectedYear}
            </Badge>
          </div>
          <p className="text-sm sm:text-base text-light-text/65 dark:text-dark-text/65 mt-2">
            Official combat efficiency standings ranked by Kill/Death ratio and total eliminations
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by operative or squad..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full text-sm bg-white/60 dark:bg-[#1B1A18]/70 border border-black/15 dark:border-white/15 text-light-text dark:text-dark-text placeholder:opacity-40 focus:outline-none focus:border-black/40 dark:focus:border-white/40 backdrop-blur-sm transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : error ? (
        <ErrorState
          title="Could not load leaderboard"
          message={error.response?.data?.detail || error.message}
          onRetry={() => refetch()}
        />
      ) : leaderboard.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title={`No leaderboard entries for ${selectedYear}`}
          description="Standings will generate automatically as match scores and combat stats are recorded."
        />
      ) : (
        <>
          {/* MVP Spotlight Banner if available */}
          {mvp && (
            <div className="relative overflow-hidden rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-[#1B1A18]/70 backdrop-blur-md p-7 sm:p-9 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-accent text-2xl font-semibold font-display shadow-sm flex-shrink-0">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 uppercase tracking-wider">
                        Tournament MVP Leader
                      </span>
                    </div>
                    <Link
                      to={`/players/${mvp.id}`}
                      className="text-2xl sm:text-3xl font-medium font-display text-light-text dark:text-dark-text hover:text-accent transition-colors block tracking-tight"
                    >
                      {mvp.cod_name}
                    </Link>
                    <p className="text-xs sm:text-sm text-light-text/60 dark:text-dark-text/60 flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-accent" />
                      {mvp.team_name || 'Free Agent'} • {mvp.player_name || 'Operative'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 border-t md:border-t-0 md:border-l border-black/[0.08] dark:border-white/[0.08] pt-5 md:pt-0 md:pl-8 text-center">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider font-medium opacity-60">
                      K/D Ratio
                    </span>
                    <span className="text-2xl sm:text-3xl font-semibold text-accent font-tabular">
                      {mvp.kd_ratio?.toFixed ? mvp.kd_ratio.toFixed(2) : (mvp.kd_ratio || '0.00')}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider font-medium opacity-60">
                      Eliminations
                    </span>
                    <span className="text-2xl sm:text-3xl font-semibold text-light-text dark:text-dark-text font-tabular">
                      {mvp.kills || 0}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider font-medium opacity-60">
                      Matches
                    </span>
                    <span className="text-2xl sm:text-3xl font-semibold text-light-text dark:text-dark-text font-tabular">
                      {mvp.total_matches || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Standings Table */}
          <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-[#1B1A18]/70 backdrop-blur-md overflow-hidden shadow-sm">
            <div className="table-container">
              <table className="w-full text-left border-collapse text-sm sm:text-base responsive-table">
                <thead>
                  <tr className="border-b border-black/[0.07] dark:border-white/[0.07] bg-black/[0.02] dark:bg-white/[0.02] text-xs font-medium uppercase tracking-wider opacity-60">
                    <th className="py-4 px-5 w-20 text-center">Rank</th>
                    <th className="py-4 px-5">Operative</th>
                    <th className="py-4 px-5">Squad</th>
                    <th className="py-4 px-5 text-center">Kills</th>
                    <th className="py-4 px-5 text-center">Deaths</th>
                    <th className="py-4 px-5 text-center font-semibold text-accent">K/D</th>
                    <th className="py-4 px-5 text-center">Matches</th>
                    <th className="py-4 px-5 text-right">Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
                  {filteredLeaderboard.map((p, index) => {
                    const rank = index + 1;
                    const isTop3 = rank <= 3;
                    const rankBadgeColors = {
                      1: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
                      2: 'bg-slate-300/30 text-slate-700 dark:text-slate-300 border-slate-400/30',
                      3: 'bg-amber-700/20 text-amber-700 dark:text-amber-400 border-amber-700/30',
                    };

                    return (
                      <tr
                        key={p.id || index}
                        className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <td
                          data-label="Rank"
                          className="py-4 px-5 text-center font-display font-semibold text-base"
                        >
                          {isTop3 ? (
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-semibold text-xs border ${rankBadgeColors[rank]}`}
                            >
                              #{rank}
                            </span>
                          ) : (
                            <span className="opacity-60 text-xs">#{rank}</span>
                          )}
                        </td>

                        <td data-label="Operative" className="py-4 px-5">
                          <Link
                            to={`/players/${p.id}`}
                            className="font-medium text-base text-light-text dark:text-dark-text hover:text-accent font-display transition-colors inline-flex items-center gap-2"
                          >
                            <span>{p.cod_name}</span>
                            {p.is_mvp && <Badge variant="gold" size="sm">MVP</Badge>}
                          </Link>
                          {p.player_name && (
                            <span className="block text-xs opacity-60 mt-0.5">
                              {p.player_name}
                            </span>
                          )}
                        </td>

                        <td data-label="Squad" className="py-4 px-5 opacity-80 text-sm">
                          {p.team_name ? (
                            <span className="flex items-center gap-1.5 text-light-text dark:text-dark-text font-medium">
                              <Shield className="w-3.5 h-3.5 text-accent" />
                              {p.team_name}
                            </span>
                          ) : (
                            'Free Agent'
                          )}
                        </td>

                        <td
                          data-label="Kills"
                          className="py-4 px-5 text-center font-tabular font-medium text-light-text dark:text-dark-text text-base"
                        >
                          {p.kills || 0}
                        </td>

                        <td
                          data-label="Deaths"
                          className="py-4 px-5 text-center font-tabular opacity-60 text-sm"
                        >
                          {p.deaths || 0}
                        </td>

                        <td
                          data-label="K/D Ratio"
                          className="py-4 px-5 text-center font-tabular font-semibold text-base text-accent"
                        >
                          {p.kd_ratio?.toFixed ? p.kd_ratio.toFixed(2) : p.kd_ratio || '0.00'}
                        </td>

                        <td
                          data-label="Matches"
                          className="py-4 px-5 text-center font-tabular text-light-text dark:text-dark-text text-sm"
                        >
                          {p.total_matches || 0}
                        </td>

                        <td data-label="Action" className="py-4 px-5 text-right">
                          <Link
                            to={`/players/${p.id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                          >
                            Stats <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
