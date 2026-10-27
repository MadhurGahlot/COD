import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Swords, Search, AlertCircle, Shield, User, Crosshair } from 'lucide-react';
import { getMatchResults, addMatchResult, deleteMatchResult } from '../../api/matches';
import { getPlayers } from '../../api/players';
import { getTeams } from '../../api/teams';
import { useTournament } from '../../context/TournamentContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

export default function AdminResults() {
  const { selectedYear } = useTournament();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');

  // Real backend fields for MatchResultCreate
  const [playerId, setPlayerId] = useState('');
  const [opponentId, setOpponentId] = useState('');
  const [kills, setKills] = useState(0);
  const [deaths, setDeaths] = useState(0);
  const [assists, setAssists] = useState(0);
  const [matchDate, setMatchDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [year, setYear] = useState(selectedYear);

  const { data: results = [], isLoading, error, refetch } = useQuery({
    queryKey: ['adminMatchResults', selectedYear],
    queryFn: async () => {
      const res = await getMatchResults(selectedYear);
      return res.data?.matches || [];
    },
  });

  const { data: players = [] } = useQuery({
    queryKey: ['adminPlayersForResults', selectedYear],
    queryFn: async () => {
      const res = await getPlayers(selectedYear);
      return res.data?.players || [];
    },
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['adminTeamsForResults', selectedYear],
    queryFn: async () => {
      const res = await getTeams(selectedYear);
      return res.data?.teams || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => addMatchResult(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMatchResults', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['matchResults', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['adminPlayers', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['players', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['home', selectedYear] });
      closeModal();
    },
    onError: (err) => {
      setFormError(err.response?.data?.detail || 'Failed to record match result');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteMatchResult(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMatchResults', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['matchResults', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['adminPlayers', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['players', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['home', selectedYear] });
    },
  });

  const openModal = () => {
    setPlayerId('');
    setOpponentId('');
    setKills(0);
    setDeaths(0);
    setAssists(0);
    setMatchDate(new Date().toISOString().split('T')[0]);
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

    if (!playerId) {
      setFormError('Please select a player');
      return;
    }

    const payload = {
      player_id: parseInt(playerId, 10),
      opponent_id: opponentId ? parseInt(opponentId, 10) : null,
      kills: parseInt(kills, 10) || 0,
      deaths: parseInt(deaths, 10) || 0,
      assists: parseInt(assists, 10) || 0,
      match_date: matchDate,
      year: parseInt(year, 10) || selectedYear,
    };

    createMutation.mutate(payload);
  };

  const handleDelete = (id, playerName) => {
    if (window.confirm(`Delete match record for "${playerName || 'selected match'}"? Player cumulative stats will be automatically adjusted.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-border dark:border-dark-border pb-5">
        <div>
          <h2 className="text-xl font-bold font-display text-light-text dark:text-dark-text">
            Official Match Combat Results
          </h2>
          <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
            Log official match kills, deaths, and assists. Updating results automatically recalibrates player leaderboards and K/D ratios.
          </p>
        </div>

        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-md shadow-accent/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Record Match Stats
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : error ? (
        <ErrorState
          title="Failed to load results"
          message={error.response?.data?.detail || error.message}
          onRetry={() => refetch()}
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon={Swords}
          title="No recorded results"
          description={`No match combat stats have been recorded for Season ${selectedYear} yet.`}
        />
      ) : (
        <div className="rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-card overflow-hidden shadow-sm">
          <div className="table-container">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-light-border dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 text-[11px] font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted">
                  <th className="py-3 px-4">Operative</th>
                  <th className="py-3 px-4">Opponent Squad</th>
                  <th className="py-3 px-4 text-center">Kills</th>
                  <th className="py-3 px-4 text-center">Deaths</th>
                  <th className="py-3 px-4 text-center">Assists</th>
                  <th className="py-3 px-4 text-center font-bold text-accent">K/D</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border dark:divide-dark-border">
                {results.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-dark-surface/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-light-text dark:text-dark-text font-display flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-orange-500/10 text-accent flex items-center justify-center text-[10px] font-bold">
                        {m.player_name ? m.player_name[0].toUpperCase() : 'P'}
                      </div>
                      <span>{m.player_name || `Player ID ${m.player_id}`}</span>
                    </td>

                    <td className="py-3 px-4 text-light-muted dark:text-dark-muted font-medium">
                      {m.opponent_name ? (
                        <span className="flex items-center gap-1.5 text-light-text dark:text-dark-text font-semibold">
                          <Shield className="w-3.5 h-3.5 text-accent" />
                          {m.opponent_name}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-3 px-4 text-center font-tabular font-bold text-light-text dark:text-dark-text">
                      {m.kills ?? 0}
                    </td>

                    <td className="py-3 px-4 text-center font-tabular text-light-muted dark:text-dark-muted">
                      {m.deaths ?? 0}
                    </td>

                    <td className="py-3 px-4 text-center font-tabular text-light-muted dark:text-dark-muted">
                      {m.assists ?? 0}
                    </td>

                    <td className="py-3 px-4 text-center font-tabular font-black text-sm text-accent">
                      {typeof m.kd_ratio === 'number' ? m.kd_ratio.toFixed(2) : (m.kd_ratio || '0.00')}
                    </td>

                    <td className="py-3 px-4 font-tabular text-light-muted dark:text-dark-muted">
                      {m.match_date ? new Date(m.match_date).toLocaleDateString() : '—'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(m.id, m.player_name)}
                        className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 transition-colors"
                        title="Delete result and adjust player stats"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Record Match Result */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Record Player Combat Stats">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Operative (Player) *
              </label>
              <select
                required
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
              >
                <option value="">Select Player</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.cod_name || p.player_name} {p.team_name ? `(${p.team_name})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Opponent Squad
              </label>
              <select
                value={opponentId}
                onChange={(e) => setOpponentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
              >
                <option value="">Select Opponent (Optional)</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.team_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Eliminations (Kills) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={kills}
                onChange={(e) => setKills(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent font-tabular"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Deaths *
              </label>
              <input
                type="number"
                min="0"
                required
                value={deaths}
                onChange={(e) => setDeaths(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent font-tabular"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Assists
              </label>
              <input
                type="number"
                min="0"
                value={assists}
                onChange={(e) => setAssists(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent font-tabular"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Match Date *
              </label>
              <input
                type="date"
                required
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Tournament Year *
              </label>
              <input
                type="number"
                required
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10) || selectedYear)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent font-tabular"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-light-border dark:border-dark-border">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-xl border border-light-border dark:border-dark-border text-xs font-semibold text-light-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-md shadow-accent/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {createMutation.isPending ? 'Recording...' : 'Record Result'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
