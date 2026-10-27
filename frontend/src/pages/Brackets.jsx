import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GitBranch, Trophy, Shield, Check, Swords } from 'lucide-react';
import { getBrackets } from '../api/matches';
import { useTournament } from '../context/TournamentContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { CardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

export default function Brackets() {
  const { selectedYear } = useTournament();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['brackets', selectedYear],
    queryFn: async () => {
      const res = await getBrackets(selectedYear);
      return res.data?.brackets || [];
    },
  });

  const brackets = data || [];

  // Group bracket matches by round_name
  const rounds = useMemo(() => {
    const map = {};
    brackets.forEach((match) => {
      const rName = match.round_name || 'Playoffs';
      if (!map[rName]) map[rName] = [];
      map[rName].push(match);
    });

    // Sort rounds logically if standard names
    const order = ['Round of 16', 'Quarterfinals', 'Quarter Finals', 'Semifinals', 'Semi Finals', 'Finals', 'Grand Final'];
    const keys = Object.keys(map).sort((a, b) => {
      const idxA = order.indexOf(a);
      const idxB = order.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    return keys.map((key) => ({
      roundName: key,
      matches: map[key],
    }));
  }, [brackets]);

  return (
    <div className="space-y-8 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-black/[0.08] dark:border-white/[0.08] pb-8">
        <div>
          <p className="eyebrow-line text-light-text dark:text-dark-text mb-3">
            Championship Ladder
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium font-display text-light-text dark:text-dark-text tracking-[-0.03em]">
              Playoff <span className="font-serif italic font-normal text-accent">Brackets</span>
            </h1>
            <Badge variant="accent" size="md">
              Season {selectedYear}
            </Badge>
          </div>
          <p className="text-sm sm:text-base text-light-text/65 dark:text-dark-text/65 mt-2">
            Visual tournament progression from group qualifiers to the Grand Final
          </p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <CardSkeleton count={4} />
      ) : error ? (
        <ErrorState
          title="Could not load tournament bracket"
          message={error.response?.data?.detail || error.message}
          onRetry={() => refetch()}
        />
      ) : brackets.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title={`No playoff bracket generated for ${selectedYear}`}
          description="Tournament brackets will be configured and populated by administrators once qualifiers conclude."
        />
      ) : (
        <div className="overflow-x-auto pb-8">
          <div className="flex gap-8 min-w-[700px] items-stretch">
            {rounds.map((round, rIdx) => (
              <div key={round.roundName} className="flex-1 min-w-[240px] space-y-4">
                {/* Round Header */}
                <div className="text-center p-3 rounded-xl bg-gray-100 dark:bg-dark-surface border border-light-border dark:border-dark-border">
                  <h3 className="font-bold text-sm font-display text-light-text dark:text-dark-text">
                    {round.roundName}
                  </h3>
                  <span className="text-[10px] text-light-muted dark:text-dark-muted uppercase tracking-wider font-semibold">
                    {round.matches.length} {round.matches.length === 1 ? 'Match' : 'Matches'}
                  </span>
                </div>

                {/* Match Cards in this round */}
                <div className="space-y-6">
                  {round.matches.map((m) => {
                    const winnerId = m.winner_team_id || m.winner_id;
                    const hasWinner = !!winnerId;
                    const isTeamAWinner = winnerId && winnerId === m.team_a_id;
                    const isTeamBWinner = winnerId && winnerId === m.team_b_id;

                    return (
                      <Card
                        key={m.id}
                        className={`p-4 transition-all duration-200 ${
                          hasWinner ? 'border-accent/40 shadow-sm' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-light-muted dark:text-dark-muted mb-2 pb-2 border-b border-light-border dark:border-dark-border">
                          <span>Match #{m.match_index || m.id}</span>
                          {hasWinner ? (
                            <Badge variant="accent" size="sm">
                              Winner: {m.winner_name || (isTeamAWinner ? m.team_a_name : m.team_b_name) || 'Advanced'}
                            </Badge>
                          ) : (
                            <Badge variant="outline" size="sm">
                              Pending
                            </Badge>
                          )}
                        </div>

                        {/* Team A */}
                        <div
                          className={`flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition-colors ${
                            isTeamAWinner
                              ? 'bg-accent/15 text-orange-600 dark:text-orange-400 font-bold border border-accent/30'
                              : 'text-light-text dark:text-dark-text'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{m.team_a_name || 'TBD'}</span>
                          </div>
                          {isTeamAWinner && <Check className="w-4 h-4 text-accent flex-shrink-0" />}
                        </div>

                        {/* Divider */}
                        <div className="py-1 text-center">
                          <span className="text-[9px] uppercase font-black text-light-muted dark:text-dark-muted">
                            VS
                          </span>
                        </div>

                        {/* Team B */}
                        <div
                          className={`flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition-colors ${
                            isTeamBWinner
                              ? 'bg-accent/15 text-orange-600 dark:text-orange-400 font-bold border border-accent/30'
                              : 'text-light-text dark:text-dark-text'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{m.team_b_name || 'TBD'}</span>
                          </div>
                          {isTeamBWinner && <Check className="w-4 h-4 text-accent flex-shrink-0" />}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
