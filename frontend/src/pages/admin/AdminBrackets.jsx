import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trophy, GitBranch, Check, AlertCircle, Shield } from 'lucide-react';
import { getBrackets, createBracketMatch, setBracketWinner } from '../../api/matches';
import { getTeams } from '../../api/teams';
import { useTournament } from '../../context/TournamentContext';
import Card, { CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

export default function AdminBrackets() {
  const { selectedYear } = useTournament();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');

  // Form fields
  const [roundName, setRoundName] = useState('Quarterfinals');
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');
  const [matchIndex, setMatchIndex] = useState(1);
  const [nextMatchId, setNextMatchId] = useState('');
  const [year, setYear] = useState(selectedYear);

  const { data: brackets = [], isLoading, error, refetch } = useQuery({
    queryKey: ['adminBrackets', selectedYear],
    queryFn: async () => {
      const res = await getBrackets(selectedYear);
      return res.data?.brackets || [];
    },
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['adminTeamsForBrackets', selectedYear],
    queryFn: async () => {
      const res = await getTeams(selectedYear);
      return res.data?.teams || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => createBracketMatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBrackets', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['brackets', selectedYear] });
      closeModal();
    },
    onError: (err) => {
      setFormError(err.response?.data?.detail || 'Failed to create bracket match');
    },
  });

  const winnerMutation = useMutation({
    mutationFn: ({ matchId, winnerId }) => setBracketWinner(matchId, winnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBrackets', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['brackets', selectedYear] });
    },
  });

  const openModal = () => {
    setRoundName('Quarterfinals');
    setTeamAId('');
    setTeamBId('');
    setMatchIndex(brackets.length + 1);
    setNextMatchId('');
    setYear(selectedYear);
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    const payload = {
      round_name: roundName,
      team_a_id: teamAId ? parseInt(teamAId, 10) : null,
      team_b_id: teamBId ? parseInt(teamBId, 10) : null,
      match_index: parseInt(matchIndex, 10) || 1,
      next_match_id: nextMatchId ? parseInt(nextMatchId, 10) : null,
      year: parseInt(year, 10),
    };

    createMutation.mutate(payload);
  };

  const handleSetWinner = (matchId, winnerId) => {
    winnerMutation.mutate({ matchId, winnerId });
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-border dark:border-dark-border pb-5">
        <div>
          <h2 className="text-xl font-bold font-display text-light-text dark:text-dark-text">
            Playoff Brackets Controller
          </h2>
          <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
            Configure playoff matches, link progression trees, and declare advancing winners
          </p>
        </div>

        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-md shadow-accent/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Bracket Match
        </button>
      </div>

      {/* Bracket List */}
      {isLoading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : error ? (
        <ErrorState
          title="Failed to load tournament brackets"
          message={error.response?.data?.detail || error.message}
          onRetry={() => refetch()}
        />
      ) : brackets.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title="No bracket matches defined"
          description={`Click "Add Bracket Match" to initialize playoff rounds for Season ${selectedYear}.`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brackets.map((m) => {
            const isTeamAWinner = m.winner_id && m.winner_id === m.team_a_id;
            const isTeamBWinner = m.winner_id && m.winner_id === m.team_b_id;

            return (
              <Card key={m.id} className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-light-border dark:border-dark-border pb-3">
                  <Badge variant="cyan" size="sm">
                    {m.round_name || 'Playoffs'}
                  </Badge>
                  <span className="text-[11px] text-light-muted dark:text-dark-muted font-tabular">
                    Match #{m.match_index || m.id}
                  </span>
                </div>

                {/* Team Alpha Action */}
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    isTeamAWinner
                      ? 'bg-accent/15 border-accent/40 text-orange-600 dark:text-orange-400 font-bold'
                      : 'border-light-border dark:border-dark-border text-light-text dark:text-dark-text'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{m.team_a_name || 'TBD (Seed A)'}</span>
                  </div>

                  {m.team_a_id && (
                    <button
                      onClick={() => handleSetWinner(m.id, m.team_a_id)}
                      disabled={winnerMutation.isPending}
                      className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                        isTeamAWinner
                          ? 'bg-accent text-white'
                          : 'bg-gray-100 dark:bg-dark-surface hover:bg-accent hover:text-white'
                      }`}
                    >
                      {isTeamAWinner ? 'Winner ✓' : 'Set Winner'}
                    </button>
                  )}
                </div>

                {/* Team Bravo Action */}
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    isTeamBWinner
                      ? 'bg-accent/15 border-accent/40 text-orange-600 dark:text-orange-400 font-bold'
                      : 'border-light-border dark:border-dark-border text-light-text dark:text-dark-text'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{m.team_b_name || 'TBD (Seed B)'}</span>
                  </div>

                  {m.team_b_id && (
                    <button
                      onClick={() => handleSetWinner(m.id, m.team_b_id)}
                      disabled={winnerMutation.isPending}
                      className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                        isTeamBWinner
                          ? 'bg-accent text-white'
                          : 'bg-gray-100 dark:bg-dark-surface hover:bg-accent hover:text-white'
                      }`}
                    >
                      {isTeamBWinner ? 'Winner ✓' : 'Set Winner'}
                    </button>
                  )}
                </div>

                {m.next_match_id && (
                  <p className="text-[10px] text-light-muted dark:text-dark-muted text-right font-tabular">
                    Winner advances to Match ID: #{m.next_match_id}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Create Bracket Match */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Create Playoff Bracket Match">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
              Round Name *
            </label>
            <input
              type="text"
              required
              value={roundName}
              onChange={(e) => setRoundName(e.target.value)}
              placeholder="e.g. Quarterfinals, Semifinals, Grand Final"
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Squad Alpha (Team A)
              </label>
              <select
                value={teamAId}
                onChange={(e) => setTeamAId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
              >
                <option value="">-- TBD (Seed A) --</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id.toString()}>
                    {t.team_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Squad Bravo (Team B)
              </label>
              <select
                value={teamBId}
                onChange={(e) => setTeamBId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
              >
                <option value="">-- TBD (Seed B) --</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id.toString()}>
                    {t.team_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Match Index / Order #
              </label>
              <input
                type="number"
                min="1"
                value={matchIndex}
                onChange={(e) => setMatchIndex(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Next Match ID (For Winner Advancement)
              </label>
              <input
                type="number"
                value={nextMatchId}
                onChange={(e) => setNextMatchId(e.target.value)}
                placeholder="Optional ID"
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-light-border dark:border-dark-border">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-xl border border-light-border dark:border-dark-border text-xs font-semibold text-light-muted dark:text-dark-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-accent/20"
            >
              Create Bracket Match
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
