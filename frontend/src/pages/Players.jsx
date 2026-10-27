import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  User,
  Search,
  Filter,
  Shield,
  Award,
  ChevronRight,
  Flame,
  ArrowUpDown,
  Crown,
} from 'lucide-react';
import { getPlayers } from '../api/players';
import { useTournament } from '../context/TournamentContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { CardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

export default function Players() {
  const { selectedYear } = useTournament();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('kd'); // 'kd' | 'kills' | 'matches' | 'name'

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['players', selectedYear],
    queryFn: async () => {
      const res = await getPlayers(selectedYear);
      return res.data?.players || [];
    },
  });

  const players = data || [];

  const filteredAndSortedPlayers = useMemo(() => {
    let list = players.filter((p) => {
      const q = search.toLowerCase();
      return (
        p.cod_name?.toLowerCase().includes(q) ||
        p.player_name?.toLowerCase().includes(q) ||
        p.team_name?.toLowerCase().includes(q)
      );
    });

    return list.sort((a, b) => {
      if (sortBy === 'kd') return (b.kd_ratio || 0) - (a.kd_ratio || 0);
      if (sortBy === 'kills') return (b.kills || 0) - (a.kills || 0);
      if (sortBy === 'matches') return (b.total_matches || 0) - (a.total_matches || 0);
      if (sortBy === 'name') return (a.cod_name || '').localeCompare(b.cod_name || '');
      return 0;
    });
  }, [players, search, sortBy]);

  return (
    <div className="space-y-10 page-enter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/[0.08] dark:border-white/[0.08] pb-8">
        <div>
          <p className="eyebrow-line text-light-text dark:text-dark-text mb-3">
            Operative Database
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium font-display text-light-text dark:text-dark-text tracking-[-0.03em]">
              Player <span className="font-serif italic font-normal text-accent">Directory</span>
            </h1>
            <Badge variant="accent" size="md">
              Season {selectedYear}
            </Badge>
          </div>
          <p className="text-sm sm:text-base text-light-text/65 dark:text-dark-text/65 mt-2">
            Registered university operatives and verified competitive combat statistics
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search IGN, name, or squad..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full text-sm bg-white/60 dark:bg-[#1B1A18]/70 border border-black/15 dark:border-white/15 text-light-text dark:text-dark-text placeholder:opacity-40 focus:outline-none focus:border-black/40 dark:focus:border-white/40 backdrop-blur-sm transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-full text-xs font-medium bg-white/60 dark:bg-[#1B1A18]/70 border border-black/15 dark:border-white/15 text-light-text dark:text-dark-text focus:outline-none cursor-pointer backdrop-blur-sm"
            >
              <option value="kd" className="bg-[#EBE9E5] dark:bg-[#111110]">Sort: Highest K/D</option>
              <option value="kills" className="bg-[#EBE9E5] dark:bg-[#111110]">Sort: Most Kills</option>
              <option value="matches" className="bg-[#EBE9E5] dark:bg-[#111110]">Sort: Most Matches</option>
              <option value="name" className="bg-[#EBE9E5] dark:bg-[#111110]">Sort: Alphabetical IGN</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <CardSkeleton count={8} />
      ) : error ? (
        <ErrorState
          title="Failed to load players"
          message={error.response?.data?.detail || error.message}
          onRetry={() => refetch()}
        />
      ) : filteredAndSortedPlayers.length === 0 ? (
        <EmptyState
          icon={User}
          title={search ? 'No players match your search' : `No players registered for Season ${selectedYear}`}
          description={
            search
              ? 'Try modifying your search query or clear the filter.'
              : `Players will appear once added to the Season ${selectedYear} roster.`
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedPlayers.map((p) => {
            const photoUrl = p.photo
              ? p.photo.startsWith('http')
                ? p.photo
                : `/static/player_photos/${p.photo}`
              : null;

            return (
              <Link key={p.id} to={`/players/${p.id}`} className="group">
                <Card hover className="h-full flex flex-col justify-between">
                  <div className="p-6 space-y-5">
                    <div className="flex items-center gap-4">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={p.cod_name}
                          loading="lazy"
                          decoding="async"
                          className="w-13 h-13 rounded-2xl object-cover border border-black/10 dark:border-white/10 shadow-sm"
                        />
                      ) : (
                        <div className="w-13 h-13 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-accent font-semibold font-display text-base shadow-sm">
                          {p.cod_name ? p.cod_name.substring(0, 2).toUpperCase() : 'OP'}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base sm:text-lg font-medium font-display text-light-text dark:text-dark-text truncate group-hover:text-accent transition-colors">
                            {p.cod_name}
                          </h3>
                          {p.is_mvp ? (
                            <Badge variant="accent" size="sm">
                              <Crown className="w-3 h-3" /> MVP
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-xs text-light-text/60 dark:text-dark-text/60 truncate mt-0.5">
                          {p.team_name || 'Free Agent'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-black/[0.07] dark:border-white/[0.07] text-center">
                      <div>
                        <span className="block text-[10px] uppercase font-medium opacity-60">
                          K/D
                        </span>
                        <span className="text-base font-semibold text-accent font-tabular">
                          {p.kd_ratio?.toFixed ? p.kd_ratio.toFixed(2) : (p.kd_ratio || '0.00')}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-medium opacity-60">
                          Kills
                        </span>
                        <span className="text-base font-semibold font-tabular text-light-text dark:text-dark-text">
                          {p.kills || 0}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-medium opacity-60">
                          Matches
                        </span>
                        <span className="text-base font-semibold font-tabular text-light-text dark:text-dark-text">
                          {p.total_matches || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-3.5 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.07] dark:border-white/[0.07] rounded-b-2xl flex items-center justify-between text-xs font-medium text-accent">
                    <span>Combat Stats</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
