import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Calendar, Clock, MapPin, AlertCircle, Shield } from 'lucide-react';
import { getSchedules, createSchedule, deleteSchedule } from '../../api/matches';
import { getTeams } from '../../api/teams';
import { useTournament } from '../../context/TournamentContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

export default function AdminSchedules() {
  const { selectedYear } = useTournament();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');

  // Form fields
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');
  const [matchDate, setMatchDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [matchTime, setMatchTime] = useState('18:00');
  const [description, setDescription] = useState('Group Stage Match');
  const [year, setYear] = useState(selectedYear);

  const { data: schedules = [], isLoading, error, refetch } = useQuery({
    queryKey: ['adminSchedules', selectedYear],
    queryFn: async () => {
      const res = await getSchedules(selectedYear);
      return res.data?.schedules || [];
    },
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['adminTeamsForSchedules', selectedYear],
    queryFn: async () => {
      const res = await getTeams(selectedYear);
      return res.data?.teams || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => createSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSchedules', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['schedules', selectedYear] });
      closeModal();
    },
    onError: (err) => {
      setFormError(err.response?.data?.detail || 'Failed to create match schedule');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSchedules', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['schedules', selectedYear] });
    },
  });

  const openModal = () => {
    setTeamAId('');
    setTeamBId('');
    setMatchDate(new Date().toISOString().split('T')[0]);
    setMatchTime('18:00');
    setDescription('Group Stage Match');
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

    if (!teamAId || !teamBId) {
      setFormError('Please select both Squad A and Squad B');
      return;
    }

    if (teamAId === teamBId) {
      setFormError('Squad A and Squad B must be different');
      return;
    }

    // Construct valid ISO datetime string for FastAPI Pydantic datetime field
    const isoDateTime = `${matchDate}T${matchTime}:00`;

    const payload = {
      team_a: parseInt(teamAId, 10),
      team_b: parseInt(teamBId, 10),
      match_time: isoDateTime,
      description: description.trim() || 'Official Match',
      year: parseInt(year, 10) || selectedYear,
    };

    createMutation.mutate(payload);
  };

  const handleDelete = (id, label) => {
    if (window.confirm(`Delete scheduled match "${label || 'selected match'}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-border dark:border-dark-border pb-5">
        <div>
          <h2 className="text-xl font-bold font-display text-light-text dark:text-dark-text">
            Tournament Match Schedules
          </h2>
          <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
            Configure match timetables, squad matchups, and tournament stage descriptions
          </p>
        </div>

        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-md shadow-accent/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Schedule Match
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : error ? (
        <ErrorState
          title="Failed to load schedules"
          message={error.response?.data?.detail || error.message}
          onRetry={() => refetch()}
        />
      ) : schedules.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No scheduled matches"
          description={`No tournament matches have been scheduled for Season ${selectedYear} yet.`}
        />
      ) : (
        <div className="rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-card overflow-hidden shadow-sm">
          <div className="table-container">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-light-border dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 text-[11px] font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted">
                  <th className="py-3 px-4">Squad Matchup</th>
                  <th className="py-3 px-4">Stage / Description</th>
                  <th className="py-3 px-4">Scheduled Time</th>
                  <th className="py-3 px-4 text-center">Season</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border dark:divide-dark-border">
                {schedules.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-dark-surface/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-light-text dark:text-dark-text font-display flex items-center gap-2">
                      <span className="text-accent">{s.team_a_name || `Squad ${s.team_a_id}`}</span>
                      <span className="text-[10px] text-light-muted dark:text-dark-muted font-normal">vs</span>
                      <span className="text-amber-500">{s.team_b_name || `Squad ${s.team_b_id}`}</span>
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant="outline" size="sm">
                        {s.description || 'Tournament Fixture'}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 font-tabular text-light-text dark:text-dark-text">
                      {s.match_time ? new Date(s.match_time).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }) : '—'}
                    </td>

                    <td className="py-3 px-4 text-center font-tabular font-bold text-accent">
                      {s.year || selectedYear}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(s.id, `${s.team_a_name} vs ${s.team_b_name}`)}
                        className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 transition-colors"
                        title="Delete schedule"
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

      {/* Modal: Schedule Match */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Schedule Competitive Match">
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
                Squad Alpha (Team A) *
              </label>
              <select
                required
                value={teamAId}
                onChange={(e) => setTeamAId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
              >
                <option value="">Select Squad A</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.team_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Squad Bravo (Team B) *
              </label>
              <select
                required
                value={teamBId}
                onChange={(e) => setTeamBId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
              >
                <option value="">Select Squad B</option>
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
                Match Time *
              </label>
              <input
                type="time"
                required
                value={matchTime}
                onChange={(e) => setMatchTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent font-tabular"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
              Stage / Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Group A Match 1, Semifinal 2, Grand Final"
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
              Tournament Season Year
            </label>
            <input
              type="number"
              required
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10) || selectedYear)}
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
              {createMutation.isPending ? 'Scheduling...' : 'Save Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
