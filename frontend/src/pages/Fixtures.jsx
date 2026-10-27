import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Swords,
  Clock,
  Shield,
  CheckCircle2,
  CalendarCheck,
  Target,
  Crosshair,
  User,
} from 'lucide-react';
import { getSchedules, getMatchResults } from '../api/matches';
import { useTournament } from '../context/TournamentContext';
import Card, { CardBody } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { CardSkeleton, TableSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

export default function Fixtures() {
  const { selectedYear } = useTournament();
  const [activeTab, setActiveTab] = useState('schedules'); // 'schedules' | 'results'

  const {
    data: schedules = [],
    isLoading: schedulesLoading,
    error: schedulesError,
    refetch: refetchSchedules,
  } = useQuery({
    queryKey: ['schedules', selectedYear],
    queryFn: async () => {
      const res = await getSchedules(selectedYear);
      return res.data?.schedules || [];
    },
  });

  const {
    data: results = [],
    isLoading: resultsLoading,
    error: resultsError,
    refetch: refetchResults,
  } = useQuery({
    queryKey: ['matchResults', selectedYear],
    queryFn: async () => {
      const res = await getMatchResults(selectedYear);
      return res.data?.matches || [];
    },
  });

  const isLoading = activeTab === 'schedules' ? schedulesLoading : resultsLoading;
  const currentError = activeTab === 'schedules' ? schedulesError : resultsError;
  const onRetry = activeTab === 'schedules' ? refetchSchedules : refetchResults;

  return (
    <div className="space-y-8 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-black/[0.08] dark:border-white/[0.08] pb-8">
        <div>
          <p className="eyebrow-line text-light-text dark:text-dark-text mb-3">
            Match Operations
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium font-display text-light-text dark:text-dark-text tracking-[-0.03em]">
              Tournament <span className="font-serif italic font-normal text-accent">Fixtures</span>
            </h1>
            <Badge variant="accent" size="md">
              Season {selectedYear}
            </Badge>
          </div>
          <p className="text-sm sm:text-base text-light-text/65 dark:text-dark-text/65 mt-2">
            Official match timetables, room schedules, and recorded combat results
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center p-1 bg-white/40 dark:bg-white/[0.05] rounded-full border border-black/10 dark:border-white/10 backdrop-blur-sm self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('schedules')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
              activeTab === 'schedules'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                : 'text-light-text/60 dark:text-dark-text/60 hover:text-light-text dark:hover:text-dark-text'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Scheduled Matches ({schedules.length})
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
              activeTab === 'results'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                : 'text-light-text/60 dark:text-dark-text/60 hover:text-light-text dark:hover:text-dark-text'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Recorded Results ({results.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        activeTab === 'schedules' ? <CardSkeleton count={4} /> : <TableSkeleton rows={6} cols={6} />
      ) : currentError ? (
        <ErrorState
          title="Could not load fixtures"
          message={currentError.response?.data?.detail || currentError.message}
          onRetry={onRetry}
        />
      ) : activeTab === 'schedules' ? (
        schedules.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={`No match schedules for Season ${selectedYear}`}
            description="Tournament administrators will post upcoming squad match schedules and server times here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schedules.map((item) => (
              <Card key={item.id} hover className="p-6 space-y-4 border border-light-border dark:border-dark-border">
                <div className="flex items-center justify-between border-b border-light-border dark:border-dark-border pb-3">
                  <Badge variant="accent" size="sm">
                    {item.description || 'Official Match'}
                  </Badge>
                  <span className="text-xs text-light-muted dark:text-dark-muted flex items-center gap-1.5 font-tabular font-medium">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    {item.match_time ? new Date(item.match_time).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }) : 'Time TBD'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  {/* Team A */}
                  <div className="flex-1 text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-accent font-bold font-display text-sm">
                      {item.team_a_name ? item.team_a_name.substring(0, 2).toUpperCase() : 'A'}
                    </div>
                    <p className="font-bold text-sm text-light-text dark:text-dark-text font-display truncate">
                      {item.team_a_name || `Squad ${item.team_a_id}`}
                    </p>
                  </div>

                  {/* VS Emblem */}
                  <div className="px-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-black font-display bg-gray-100 dark:bg-dark-surface text-accent border border-orange-500/30">
                      VS
                    </span>
                  </div>

                  {/* Team B */}
                  <div className="flex-1 text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold font-display text-sm">
                      {item.team_b_name ? item.team_b_name.substring(0, 2).toUpperCase() : 'B'}
                    </div>
                    <p className="font-bold text-sm text-light-text dark:text-dark-text font-display truncate">
                      {item.team_b_name || `Squad ${item.team_b_id}`}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-light-border dark:border-dark-border flex items-center justify-between text-xs text-light-muted dark:text-dark-muted">
                  <span className="flex items-center gap-1 font-medium">
                    <Shield className="w-3.5 h-3.5 text-accent" /> GKV Esports Arena
                  </span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">Scheduled Match</span>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : results.length === 0 ? (
        <EmptyState
          icon={Swords}
          title={`No match results recorded for Season ${selectedYear}`}
          description="Combat match scores and player statistics will be recorded here as matches finish."
        />
      ) : (
        <div className="rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-card overflow-hidden shadow-sm">
          <div className="table-container">
            <table className="w-full text-left border-collapse text-xs responsive-table">
              <thead>
                <tr className="border-b border-light-border dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 text-[11px] font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted">
                  <th className="py-3.5 px-4">Operative</th>
                  <th className="py-3.5 px-4">Opponent Squad</th>
                  <th className="py-3.5 px-4 text-center">Kills</th>
                  <th className="py-3.5 px-4 text-center">Deaths</th>
                  <th className="py-3.5 px-4 text-center">Assists</th>
                  <th className="py-3.5 px-4 text-center font-bold text-accent">K/D</th>
                  <th className="py-3.5 px-4 text-right">Match Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border dark:divide-dark-border">
                {results.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-dark-surface/40 transition-colors"
                  >
                    <td data-label="Operative" className="py-3.5 px-4 font-bold text-light-text dark:text-dark-text font-display flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-orange-500/10 text-accent flex items-center justify-center text-[10px] font-bold">
                        {m.player_name ? m.player_name[0].toUpperCase() : 'P'}
                      </div>
                      <span>{m.player_name || `Player ID ${m.player_id}`}</span>
                    </td>

                    <td data-label="Opponent" className="py-3.5 px-4 text-light-muted dark:text-dark-muted font-medium">
                      {m.opponent_name ? (
                        <span className="flex items-center gap-1.5 text-light-text dark:text-dark-text font-semibold">
                          <Shield className="w-3.5 h-3.5 text-accent" />
                          {m.opponent_name}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td
                      data-label="Kills"
                      className="py-3.5 px-4 text-center font-tabular font-bold text-light-text dark:text-dark-text"
                    >
                      {m.kills ?? 0}
                    </td>

                    <td
                      data-label="Deaths"
                      className="py-3.5 px-4 text-center font-tabular text-light-muted dark:text-dark-muted"
                    >
                      {m.deaths ?? 0}
                    </td>

                    <td
                      data-label="Assists"
                      className="py-3.5 px-4 text-center font-tabular text-light-muted dark:text-dark-muted"
                    >
                      {m.assists ?? 0}
                    </td>

                    <td
                      data-label="K/D"
                      className="py-3.5 px-4 text-center font-tabular font-black text-sm text-accent"
                    >
                      {typeof m.kd_ratio === 'number' ? m.kd_ratio.toFixed(2) : (m.kd_ratio || '0.00')}
                    </td>

                    <td data-label="Date" className="py-3.5 px-4 text-right font-tabular text-light-muted dark:text-dark-muted">
                      {m.match_date ? new Date(m.match_date).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
