import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Trophy, Award, Crown, AlertCircle, Shield, Upload } from 'lucide-react';
import { getWinners, createWinner, deleteWinner } from '../../api/winners';
import { getTeams } from '../../api/teams';
import { useTournament } from '../../context/TournamentContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

export default function AdminWinners() {
  const { selectedYear } = useTournament();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');

  // Real backend fields for POST /winners/
  const [winnerTeamId, setWinnerTeamId] = useState('');
  const [runnerupTeamId, setRunnerupTeamId] = useState('');
  const [finalScore, setFinalScore] = useState('');
  const [mvpName, setMvpName] = useState('');
  const [winnerPhoto, setWinnerPhoto] = useState(null);
  const [mvpPhoto, setMvpPhoto] = useState(null);
  const [year, setYear] = useState(selectedYear);

  const { data: winners = [], isLoading, error, refetch } = useQuery({
    queryKey: ['adminWinners', selectedYear],
    queryFn: async () => {
      const res = await getWinners(selectedYear);
      return res.data?.winners || [];
    },
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['adminTeamsForWinners', selectedYear],
    queryFn: async () => {
      const res = await getTeams(selectedYear);
      return res.data?.teams || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (formData) => createWinner(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminWinners', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['winners', selectedYear] });
      closeModal();
    },
    onError: (err) => {
      setFormError(err.response?.data?.detail || 'Failed to add champion record');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteWinner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminWinners', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['winners', selectedYear] });
    },
  });

  const openModal = () => {
    setWinnerTeamId('');
    setRunnerupTeamId('');
    setFinalScore('');
    setMvpName('');
    setWinnerPhoto(null);
    setMvpPhoto(null);
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

    if (!winnerTeamId || !runnerupTeamId) {
      setFormError('Please select both the Championship Winner squad and the Runner-up squad.');
      return;
    }

    if (winnerTeamId === runnerupTeamId) {
      setFormError('Champion squad and Runner-up squad must be different squads.');
      return;
    }

    const fd = new FormData();
    fd.append('year', year.toString());
    fd.append('winner_team_id', winnerTeamId.toString());
    fd.append('runnerup_team_id', runnerupTeamId.toString());
    if (finalScore.trim()) fd.append('final_score', finalScore.trim());
    if (mvpName.trim()) fd.append('mvp_name', mvpName.trim());
    if (winnerPhoto) fd.append('winner_photo', winnerPhoto);
    if (mvpPhoto) fd.append('mvp_photo', mvpPhoto);

    createMutation.mutate(fd);
  };

  const handleDelete = (id, team) => {
    if (window.confirm(`Delete champion record for "${team || 'selected record'}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-border dark:border-dark-border pb-5">
        <div>
          <h2 className="text-xl font-bold font-display text-light-text dark:text-dark-text">
            Winners & Hall of Fame Records
          </h2>
          <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
            Add tournament champions, runners-up, final scorelines, and season legacy MVPs
          </p>
        </div>

        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-md shadow-accent/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Champion Record
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : error ? (
        <ErrorState
          title="Failed to load Hall of Fame"
          message={error.response?.data?.detail || error.message}
          onRetry={() => refetch()}
        />
      ) : winners.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No winners recorded"
          description={`No tournament champions have been enshrined for Season ${selectedYear} yet.`}
        />
      ) : (
        <div className="rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-card overflow-hidden shadow-sm">
          <div className="table-container">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-light-border dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 text-[11px] font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted">
                  <th className="py-3 px-4">Season</th>
                  <th className="py-3 px-4">Champion Squad</th>
                  <th className="py-3 px-4">Runner-up Squad</th>
                  <th className="py-3 px-4 text-center">Final Score</th>
                  <th className="py-3 px-4">Tournament MVP</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border dark:divide-dark-border">
                {winners.map((w) => (
                  <tr
                    key={w.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-dark-surface/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-tabular font-bold text-accent">
                      {w.year || selectedYear}
                    </td>

                    <td className="py-3 px-4 font-bold text-light-text dark:text-dark-text font-display flex items-center gap-2">
                      <Crown className="w-3.5 h-3.5 text-accent" />
                      {w.winner_team || `Team ID ${w.winner_team_id}`}
                    </td>

                    <td className="py-3 px-4 text-light-muted dark:text-dark-muted font-medium">
                      {w.runnerup_team || `Team ID ${w.runnerup_team_id}` || '—'}
                    </td>

                    <td className="py-3 px-4 text-center font-tabular font-bold text-light-text dark:text-dark-text">
                      {w.final_score || '—'}
                    </td>

                    <td className="py-3 px-4 text-light-text dark:text-dark-text">
                      {w.mvp_name ? (
                        <Badge variant="accent" size="sm">
                          {w.mvp_name}
                        </Badge>
                      ) : (
                        <span className="text-light-muted dark:text-dark-muted text-xs">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(w.id, w.winner_team)}
                        className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 transition-colors"
                        title="Delete champion record"
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

      {/* Modal: Create Winner */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Record Season Champion & Hall of Fame">
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
                Champion Squad (Winner) *
              </label>
              <select
                required
                value={winnerTeamId}
                onChange={(e) => setWinnerTeamId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
              >
                <option value="">Select Champion Team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.team_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Runner-Up Squad *
              </label>
              <select
                required
                value={runnerupTeamId}
                onChange={(e) => setRunnerupTeamId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
              >
                <option value="">Select Runner-Up Team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.team_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Final Match Score
              </label>
              <input
                type="text"
                value={finalScore}
                onChange={(e) => setFinalScore(e.target.value)}
                placeholder="e.g. 3 - 1 or 250 - 180"
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
              >
              </input>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Tournament MVP Operative
              </label>
              <input
                type="text"
                value={mvpName}
                onChange={(e) => setMvpName(e.target.value)}
                placeholder="e.g. GHOST_99 or Madhur"
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Champion Squad Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file && file.size > 5 * 1024 * 1024) {
                    alert("File size exceeds 5 MB limit. Please select a smaller image.");
                    e.target.value = "";
                    setWinnerPhoto(null);
                    return;
                  }
                  setWinnerPhoto(file || null);
                }}
                className="w-full text-xs text-light-muted dark:text-dark-muted file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-500/10 file:text-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Tournament MVP Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file && file.size > 5 * 1024 * 1024) {
                    alert("File size exceeds 5 MB limit. Please select a smaller image.");
                    e.target.value = "";
                    setMvpPhoto(null);
                    return;
                  }
                  setMvpPhoto(file || null);
                }}
                className="w-full text-xs text-light-muted dark:text-dark-muted file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-500/10 file:text-accent"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
              Tournament Season Year
            </label>
            <input
              type="number"
              required
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent font-tabular"
            />
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
              {createMutation.isPending ? 'Enshrining...' : 'Record Winner'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
