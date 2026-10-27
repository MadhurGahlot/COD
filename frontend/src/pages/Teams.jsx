import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, ChevronRight, Shield, ArrowRight } from 'lucide-react';
import { getTeams } from '../api/teams';
import { useTournament } from '../context/TournamentContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { CardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

export default function Teams() {
  const { selectedYear } = useTournament();
  const [search, setSearch] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['teams', selectedYear],
    queryFn: async () => {
      const res = await getTeams(selectedYear);
      return res.data?.teams || [];
    },
  });

  const teams = data || [];
  const filteredTeams = teams.filter((t) => {
    const q = search.toLowerCase();
    return t.team_name?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-10 page-enter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/[0.08] dark:border-white/[0.08] pb-8">
        <div>
          <p className="eyebrow-line text-light-text dark:text-dark-text mb-3">
            Squad Directory
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium font-display text-light-text dark:text-dark-text tracking-[-0.03em]">
              Tournament <span className="font-serif italic font-normal text-accent">Squads</span>
            </h1>
            <Badge variant="accent" size="md">
              Season {selectedYear}
            </Badge>
          </div>
          <p className="text-sm sm:text-base text-light-text/65 dark:text-dark-text/65 mt-2">
            Official university combat squads and verified tactical rosters
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search squads by name..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full text-sm bg-white/60 dark:bg-[#1B1A18]/70 border border-black/15 dark:border-white/15 text-light-text dark:text-dark-text placeholder:opacity-40 focus:outline-none focus:border-black/40 dark:focus:border-white/40 backdrop-blur-sm transition-all"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <CardSkeleton count={6} />
      ) : error ? (
        <ErrorState
          title="Failed to load squads"
          message={error.response?.data?.detail || error.message}
          onRetry={() => refetch()}
        />
      ) : filteredTeams.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? 'No squads match your search' : `No teams registered in Season ${selectedYear}`}
          description={
            search
              ? 'Try adjusting your search terms to find the squad you are looking for.'
              : `Squad registrations for Season ${selectedYear} will appear here once created.`
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredTeams.map((team) => {
            const count = team.player_count ?? (team.players?.length || 0);

            return (
              <Link key={team.id} to={`/teams/${team.id}`} className="group">
                <Card hover className="h-full flex flex-col justify-between p-7 space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-13 h-13 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-accent font-semibold font-display text-lg group-hover:scale-105 transition-transform shadow-sm">
                        {team.team_name ? team.team_name.substring(0, 2).toUpperCase() : 'TM'}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg sm:text-xl font-display text-light-text dark:text-dark-text group-hover:text-accent transition-colors">
                          {team.team_name}
                        </h3>
                        <p className="text-xs sm:text-sm text-light-text/60 dark:text-dark-text/60 flex items-center gap-1.5 font-normal mt-1">
                          <Shield className="w-3.5 h-3.5 text-accent" />
                          GKV Competitive Team
                        </p>
                      </div>
                    </div>

                    <Badge variant="outline" size="sm">
                      {team.year || selectedYear}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/[0.07] dark:border-white/[0.07] text-sm">
                    <div>
                      <span className="block text-[11px] uppercase tracking-wider font-medium opacity-60">
                        Active Roster
                      </span>
                      <span className="font-semibold text-light-text dark:text-dark-text text-base font-tabular">
                        {count} {count === 1 ? 'Operative' : 'Operatives'}
                      </span>
                    </div>

                    <div className="text-right flex items-center justify-end text-sm font-medium text-accent gap-1.5 group-hover:translate-x-1 transition-transform">
                      View Squad <ArrowRight className="w-4 h-4" />
                    </div>
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
