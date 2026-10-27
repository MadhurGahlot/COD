import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  User,
  ArrowLeft,
  Shield,
  Award,
  Target,
  Crosshair,
  Skull,
  Swords,
  Crown,
  Medal,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { getPlayer, getPlayerStats } from '../api/players';
import { useTournament } from '../context/TournamentContext';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import Skeleton, { StatCardSkeleton } from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';

export default function PlayerDetail() {
  const { id } = useParams();
  const { selectedYear } = useTournament();

  const {
    data,
    isLoading: playerLoading,
    error: playerError,
    refetch,
  } = useQuery({
    queryKey: ['player', id, selectedYear],
    queryFn: async () => {
      const res = await getPlayer(id, selectedYear);
      return res.data; // { player, mvp, opponent_stats, team_wins, mvp_awards }
    },
  });

  const { data: statsHistory = [] } = useQuery({
    queryKey: ['player-stats', id],
    queryFn: async () => {
      const res = await getPlayerStats(id);
      return res.data?.stats || [];
    },
    enabled: !!id,
  });

  if (playerLoading) {
    return (
      <div className="space-y-6 page-enter">
        <Skeleton className="h-44 w-full" rounded="rounded-2xl" />
        <StatCardSkeleton count={4} />
      </div>
    );
  }

  if (playerError || !data?.player) {
    return (
      <div className="page-enter py-12">
        <ErrorState
          title="Operative record not found"
          message={playerError?.response?.data?.detail || 'Could not find player record for this season.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const player = data.player;
  const opponentStats = data.opponent_stats || [];
  const teamWins = data.team_wins || 0;
  const mvpAwards = data.mvp_awards || 0;

  const photoUrl = player.photo
    ? player.photo.startsWith('http')
      ? player.photo
      : `/static/player_photos/${player.photo}`
    : null;

  const kills = player.kills ?? 0;
  const deaths = player.deaths ?? 0;
  const assists = player.assists ?? 0;
  const kd = player.kd_ratio ?? (deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2));
  const matches = player.total_matches ?? 0;

  return (
    <div className="space-y-8 page-enter">
      {/* Back button */}
      <div>
        <Link
          to="/players"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-light-muted dark:text-dark-muted hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to player directory
        </Link>
      </div>

      {/* Player Header Banner */}
      <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-[#1B1A18]/70 backdrop-blur-md p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={player.cod_name}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border border-black/10 dark:border-white/10 shadow-sm"
              />
            ) : (
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-accent text-2xl font-semibold font-display shadow-sm">
                {player.cod_name ? player.cod_name.substring(0, 2).toUpperCase() : 'OP'}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium font-display text-light-text dark:text-dark-text tracking-[-0.02em]">
                  {player.cod_name}
                </h1>
                {player.is_mvp ? (
                  <Badge variant="accent" size="sm">
                    <Crown className="w-3 h-3" /> MVP
                  </Badge>
                ) : null}
                <Badge variant="outline" size="sm">
                  Season {player.year || selectedYear}
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-light-text/60 dark:text-dark-text/60 font-normal">
                {player.player_name || 'Operative'} {player.email ? `• ${player.email}` : ''}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                {player.team_name ? (
                  <span className="flex items-center gap-1 font-semibold text-accent">
                    <Shield className="w-3.5 h-3.5" />
                    {player.team_name}
                  </span>
                ) : (
                  <span className="text-light-muted dark:text-dark-muted">Unassigned Free Agent</span>
                )}
                <span className="text-light-muted dark:text-dark-muted">•</span>
                <span className="text-light-muted dark:text-dark-muted capitalize font-medium">
                  Status: {player.status || 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Accolades */}
          <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-light-border dark:border-dark-border pt-4 sm:pt-0 sm:pl-6">
            <div className="text-center px-3">
              <span className="block text-[10px] uppercase font-bold text-light-muted dark:text-dark-muted">
                Championships
              </span>
              <span className="text-xl font-black text-light-text dark:text-dark-text font-tabular flex items-center justify-center gap-1 mt-0.5">
                <Trophy className="w-4 h-4 text-accent" /> {teamWins}
              </span>
            </div>
            <div className="text-center px-3 border-l border-light-border dark:border-dark-border">
              <span className="block text-[10px] uppercase font-bold text-light-muted dark:text-dark-muted">
                MVP Awards
              </span>
              <span className="text-xl font-black text-amber-500 font-tabular flex items-center justify-center gap-1 mt-0.5">
                <Crown className="w-4 h-4" /> {mvpAwards}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Combat Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Crosshair}
          label="Kill / Death Ratio"
          value={typeof kd === 'number' ? kd.toFixed(2) : kd}
          subtext="Efficiency metric"
          color="accent"
        />
        <StatCard
          icon={Target}
          label="Confirmed Eliminations"
          value={kills}
          subtext="Total kills"
          color="accent"
        />
        <StatCard
          icon={Skull}
          label="Casualties (Deaths)"
          value={deaths}
          subtext="Total deaths"
          color="red"
        />
        <StatCard
          icon={Swords}
          label="Matches Deployed"
          value={matches}
          subtext={`With ${assists} total assists`}
          color="amber"
        />
      </div>

      {/* Real Opponent Breakdown & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance by Opponent Squad */}
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-light-border dark:border-dark-border pb-3">
            <div>
              <h2 className="text-base font-bold font-display text-light-text dark:text-dark-text flex items-center gap-2">
                <Swords className="w-4 h-4 text-accent" />
                Performance Against Opponent Squads
              </h2>
              <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                Verified combat encounters logged in tournament matches
              </p>
            </div>
          </div>

          {opponentStats.length === 0 ? (
            <div className="py-8 text-center text-xs text-light-muted dark:text-dark-muted">
              No head-to-head match encounters recorded against specific opponent squads yet.
            </div>
          ) : (
            <div className="table-container">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-light-border dark:border-dark-border text-[11px] font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted">
                    <th className="py-2.5 px-3">Opponent Squad</th>
                    <th className="py-2.5 px-3 text-center">Matches</th>
                    <th className="py-2.5 px-3 text-center">Kills</th>
                    <th className="py-2.5 px-3 text-center">Deaths</th>
                    <th className="py-2.5 px-3 text-center">Assists</th>
                    <th className="py-2.5 px-3 text-center font-bold text-accent">K/D</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border dark:divide-dark-border">
                  {opponentStats.map((row, idx) => {
                    const rKd = row.total_deaths > 0
                      ? (row.total_kills / row.total_deaths).toFixed(2)
                      : (row.total_kills || 0).toFixed(2);

                    return (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-dark-surface/40">
                        <td className="py-2.5 px-3 font-semibold text-light-text dark:text-dark-text flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-accent" />
                          {row.team_name}
                        </td>
                        <td className="py-2.5 px-3 text-center font-tabular text-light-text dark:text-dark-text">
                          {row.match_count}
                        </td>
                        <td className="py-2.5 px-3 text-center font-tabular font-bold text-light-text dark:text-dark-text">
                          {row.total_kills}
                        </td>
                        <td className="py-2.5 px-3 text-center font-tabular text-light-muted dark:text-dark-muted">
                          {row.total_deaths}
                        </td>
                        <td className="py-2.5 px-3 text-center font-tabular text-light-muted dark:text-dark-muted">
                          {row.total_assists}
                        </td>
                        <td className="py-2.5 px-3 text-center font-tabular font-extrabold text-accent">
                          {rKd}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Head-to-Head Compare Callout */}
        <Card className="p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-accent flex items-center justify-center border border-orange-500/20">
              <Crosshair className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-display text-light-text dark:text-dark-text">
              Head-to-Head Comparison
            </h3>
            <p className="text-xs text-light-muted dark:text-dark-muted leading-relaxed">
              Pit {player.cod_name} against another university operative to analyze K/D divergence, eliminations, and deployment volume.
            </p>
          </div>

          <Link
            to={`/compare?p1=${player.id}`}
            className="w-full py-2.5 px-4 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold text-center transition-colors shadow-md shadow-accent/20 flex items-center justify-center gap-2"
          >
            <Crosshair className="w-4 h-4" />
            Compare with Another Operative
          </Link>
        </Card>
      </div>

      {/* Match History Timeline */}
      {statsHistory.length > 0 && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-light-border dark:border-dark-border pb-3">
            <div>
              <h2 className="text-base font-bold font-display text-light-text dark:text-dark-text flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" />
                Match Combat History Timeline
              </h2>
              <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                K/D efficiency evolution across logged tournament encounters
              </p>
            </div>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={statsHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="match_date"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#10151E',
                    borderColor: '#232C3B',
                    borderRadius: '8px',
                    color: '#F1F5F9',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="kd_ratio"
                  stroke="#F97316"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#F97316' }}
                  activeDot={{ r: 6 }}
                  name="K/D Ratio"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
