import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  User,
  ArrowLeft,
  Shield,
  Award,
  Target,
  Crosshair,
  Swords,
  ChevronRight,
} from 'lucide-react';
import { getTeam } from '../api/teams';
import { useTournament } from '../context/TournamentContext';
import Card, { CardBody } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import Skeleton, { CardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

export default function TeamDetail() {
  const { id } = useParams();
  const { selectedYear } = useTournament();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['team', id, selectedYear],
    queryFn: async () => {
      const res = await getTeam(id, selectedYear);
      return res.data; // { team: {...}, players: [...] }
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 page-enter">
        <Skeleton className="h-40 w-full" rounded="rounded-2xl" />
        <CardSkeleton count={3} />
      </div>
    );
  }

  if (error || !data?.team) {
    return (
      <div className="page-enter py-12">
        <ErrorState
          title="Squad not found"
          message={error?.response?.data?.detail || 'Could not retrieve roster information for this squad.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const team = data.team;
  const players = data.players || [];

  // Calculate real aggregated team stats from player records
  const totalKills = players.reduce((acc, p) => acc + (p.kills || 0), 0);
  const totalDeaths = players.reduce((acc, p) => acc + (p.deaths || 0), 0);
  const totalAssists = players.reduce((acc, p) => acc + (p.assists || 0), 0);
  const teamKd = totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : totalKills.toFixed(2);

  return (
    <div className="space-y-8 page-enter">
      {/* Back link */}
      <div>
        <Link
          to="/teams"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-light-muted dark:text-dark-muted hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all squads
        </Link>
      </div>

      {/* Team Header Banner */}
      <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-[#1B1A18]/70 backdrop-blur-md p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-accent text-2xl font-semibold font-display shadow-sm">
              {team.team_name ? team.team_name.substring(0, 2).toUpperCase() : 'TM'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium font-display text-light-text dark:text-dark-text tracking-[-0.02em]">
                  {team.team_name}
                </h1>
                <Badge variant="accent" size="sm">
                  Season {team.year || selectedYear}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-light-text/60 dark:text-dark-text/60 flex items-center gap-1.5 font-normal">
                <Shield className="w-3.5 h-3.5 text-accent" />
                Gurukula Kangri Vishwavidyalaya Competitive Squad
              </p>
            </div>
          </div>

          {/* Aggregated statistics */}
          <div className="flex flex-wrap sm:flex-nowrap gap-6 border-t sm:border-t-0 sm:border-l border-light-border dark:border-dark-border pt-4 sm:pt-0 sm:pl-6 text-xs">
            <div>
              <span className="block text-[10px] uppercase font-bold text-light-muted dark:text-dark-muted">
                Active Players
              </span>
              <span className="font-extrabold text-light-text dark:text-dark-text text-base font-tabular">
                {players.length} {players.length === 1 ? 'Player' : 'Players'}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-light-muted dark:text-dark-muted">
                Squad K/D Ratio
              </span>
              <span className="font-black text-accent text-base font-tabular">
                {teamKd}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-light-muted dark:text-dark-muted">
                Total Eliminations
              </span>
              <span className="font-extrabold text-light-text dark:text-dark-text text-base font-tabular">
                {totalKills}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Roster Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display text-light-text dark:text-dark-text flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            Active Operatives Roster
          </h2>
          <span className="text-xs text-light-muted dark:text-dark-muted font-medium">
            {players.length} Verified {players.length === 1 ? 'Operative' : 'Operatives'}
          </span>
        </div>

        {players.length === 0 ? (
          <EmptyState
            icon={User}
            title="No players assigned to this squad"
            description="The squad roster is currently open. Operatives can be assigned by tournament administrators."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((p) => {
              const photoUrl = p.photo
                ? p.photo.startsWith('http')
                  ? p.photo
                  : `/static/player_photos/${p.photo}`
                : null;

              const playerId = p.player_id || p.id;

              return (
                <Link key={playerId} to={`/players/${playerId}`} className="group">
                  <Card hover className="p-5 h-full flex flex-col justify-between">
                    <div className="flex items-center gap-4">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={p.cod_name}
                          className="w-14 h-14 rounded-xl object-cover border border-light-border dark:border-dark-border"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-orange-500/10 text-accent border border-orange-500/20 flex items-center justify-center font-bold font-display text-lg">
                          {p.cod_name ? p.cod_name.substring(0, 2).toUpperCase() : 'OP'}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold font-display text-light-text dark:text-dark-text truncate group-hover:text-accent transition-colors">
                          {p.cod_name}
                        </h3>
                        <p className="text-xs text-light-muted dark:text-dark-muted truncate">
                          {p.player_name || 'Operative'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-light-border dark:border-dark-border text-center text-xs">
                      <div>
                        <span className="block text-[10px] text-light-muted dark:text-dark-muted uppercase font-bold">
                          K/D
                        </span>
                        <span className="font-bold text-accent font-tabular">
                          {p.kd_ratio?.toFixed ? p.kd_ratio.toFixed(2) : (p.kd_ratio || '0.00')}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-light-muted dark:text-dark-muted uppercase font-bold">
                          Kills
                        </span>
                        <span className="font-bold text-light-text dark:text-dark-text font-tabular">
                          {p.kills ?? 0}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-light-muted dark:text-dark-muted uppercase font-bold">
                          Deaths
                        </span>
                        <span className="font-bold text-light-muted dark:text-dark-muted font-tabular">
                          {p.deaths ?? 0}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
