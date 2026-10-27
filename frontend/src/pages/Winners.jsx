import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Award, Crown, Sparkles, Shield, Medal, Star, Swords } from 'lucide-react';
import { getWinners, getHallOfFame } from '../api/winners';
import { useTournament } from '../context/TournamentContext';
import Card, { CardBody } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { CardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

export default function Winners() {
  const { selectedYear } = useTournament();

  const {
    data: winners = [],
    isLoading: winnersLoading,
    error: winnersError,
    refetch,
  } = useQuery({
    queryKey: ['winners', selectedYear],
    queryFn: async () => {
      const res = await getWinners(selectedYear);
      return res.data?.winners || [];
    },
  });

  const { data: hallOfFame = [] } = useQuery({
    queryKey: ['hallOfFame', selectedYear],
    queryFn: async () => {
      const res = await getHallOfFame(selectedYear);
      return res.data?.hall_of_fame || [];
    },
  });

  const records = winners.length > 0 ? winners : hallOfFame;

  return (
    <div className="space-y-8 page-enter">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-black/[0.08] dark:border-white/[0.08] pb-8">
        <div>
          <p className="eyebrow-line text-light-text dark:text-dark-text mb-3">
            University Esports Legacy
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium font-display text-light-text dark:text-dark-text tracking-[-0.03em]">
              Hall of Fame & <span className="font-serif italic font-normal text-accent">Champions</span>
            </h1>
            <Badge variant="accent" size="md">
              Season {selectedYear}
            </Badge>
          </div>
          <p className="text-sm sm:text-base text-light-text/65 dark:text-dark-text/65 mt-2 max-w-2xl">
            Honoring the undisputed university champions, tournament victors, and legacy squads of Gurukula Kangri Vishwavidyalaya.
          </p>
        </div>
      </div>

      {/* Content */}
      {winnersLoading ? (
        <CardSkeleton count={3} />
      ) : winnersError ? (
        <ErrorState
          title="Could not load Hall of Fame"
          message={winnersError.response?.data?.detail || winnersError.message}
          onRetry={() => refetch()}
        />
      ) : records.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title={`No Hall of Fame records for Season ${selectedYear}`}
          description="Championship trophies and season title records will be enshrined here at the conclusion of the tournament."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((w, index) => {
            const winnerImg = w.winner_photo
              ? w.winner_photo.startsWith('http')
                ? w.winner_photo
                : `/static/player_photos/${w.winner_photo}`
              : null;

            const mvpImg = w.mvp_photo
              ? w.mvp_photo.startsWith('http')
                ? w.mvp_photo
                : `/static/player_photos/${w.mvp_photo}`
              : null;

            return (
              <Card
                key={w.id || index}
                hover
                className="overflow-hidden border border-orange-500/30 dark:border-orange-500/20 shadow-sm flex flex-col justify-between"
              >
                <div>
                  {winnerImg ? (
                    <div className="relative h-48 w-full bg-black/40 overflow-hidden border-b border-light-border dark:border-dark-border">
                      <img
                        src={winnerImg}
                        alt={w.winner_team || 'Champions'}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge variant="accent" size="sm">
                          <Crown className="w-3 h-3" /> Champion
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-black/75 text-orange-400 border border-orange-500/40 font-tabular backdrop-blur-sm">
                          Season {w.year || selectedYear}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-36 bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-transparent flex items-center justify-between px-6 border-b border-orange-500/20">
                      <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-accent border border-orange-500/30 flex items-center justify-center shadow-md">
                        <Trophy className="w-7 h-7" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white dark:bg-dark-surface text-accent border border-orange-500/30 font-tabular shadow-sm">
                        Season {w.year || selectedYear}
                      </span>
                    </div>
                  )}

                  <CardBody className="p-6 space-y-4">
                    {/* Champion Squad */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider">
                        <Crown className="w-3.5 h-3.5" />
                        Championship Winner
                      </div>
                      <h3 className="text-xl font-black font-display text-light-text dark:text-dark-text flex items-center gap-2">
                        <Shield className="w-5 h-5 text-accent" />
                        {w.winner_team || 'Grand Champions'}
                      </h3>
                    </div>

                    {/* Match Score & Runner-up */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-light-border dark:border-dark-border text-xs">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-light-muted dark:text-dark-muted">
                          Runner-Up Squad
                        </span>
                        <span className="font-semibold text-light-text dark:text-dark-text flex items-center gap-1 mt-0.5">
                          <Medal className="w-3.5 h-3.5 text-slate-400" />
                          {w.runnerup_team || '—'}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] uppercase font-bold text-light-muted dark:text-dark-muted">
                          Grand Final Score
                        </span>
                        <span className="font-bold text-accent font-tabular text-sm mt-0.5 block">
                          {w.final_score || 'Final Victory'}
                        </span>
                      </div>
                    </div>

                    {/* MVP Details */}
                    {w.mvp_name && (
                      <div className="pt-3 border-t border-light-border dark:border-dark-border flex items-center gap-3">
                        {mvpImg ? (
                          <img
                            src={mvpImg}
                            alt={w.mvp_name}
                            className="w-10 h-10 rounded-xl object-cover border border-amber-500/30 shadow-sm"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center font-bold font-display text-xs">
                            <Star className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
                            Tournament MVP
                          </span>
                          <span className="font-bold text-xs text-light-text dark:text-dark-text font-display">
                            {w.mvp_name}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardBody>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
