import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Edit2,
  Trash2,
  User,
  Search,
  Award,
  Shield,
  Upload,
  AlertCircle,
  Link as LinkIcon,
  Crown,
  Mail,
} from 'lucide-react';
import {
  getPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
  setMVP,
  assignPlayer,
} from '../../api/players';
import { getTeams } from '../../api/teams';
import { useTournament } from '../../context/TournamentContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

export default function AdminPlayers() {
  const { selectedYear } = useTournament();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  // Modals
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [assigningPlayer, setAssigningPlayer] = useState(null);
  const [formError, setFormError] = useState('');

  // Player Form Fields (aligned with Player model)
  const [playerName, setPlayerName] = useState('');
  const [codName, setCodName] = useState('');
  const [email, setEmail] = useState('');
  const [teamId, setTeamId] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [year, setYear] = useState(selectedYear);

  // Assign Form Field
  const [selectedTeamId, setSelectedTeamId] = useState('');

  // Queries
  const { data: players = [], isLoading: playersLoading, error: playersError, refetch } = useQuery({
    queryKey: ['adminPlayers', selectedYear],
    queryFn: async () => {
      const res = await getPlayers(selectedYear);
      return res.data?.players || [];
    },
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['adminTeamsForAssign', selectedYear],
    queryFn: async () => {
      const res = await getTeams(selectedYear);
      return res.data?.teams || [];
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (formData) => createPlayer(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlayers', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['players', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['teams', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['home', selectedYear] });
      closePlayerModal();
    },
    onError: (err) => {
      setFormError(err.response?.data?.detail || 'Failed to create player');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) => updatePlayer(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlayers', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['players', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['teams', selectedYear] });
      closePlayerModal();
    },
    onError: (err) => {
      setFormError(err.response?.data?.detail || 'Failed to update player');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deletePlayer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlayers', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['players', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['teams', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['home', selectedYear] });
    },
  });

  const mvpMutation = useMutation({
    mutationFn: (id) => setMVP(id, selectedYear),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlayers', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['players', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard', selectedYear] });
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ playerId, teamId }) => assignPlayer(playerId, teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlayers', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['players', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['teams', selectedYear] });
      closeAssignModal();
    },
    onError: (err) => {
      setFormError(err.response?.data?.detail || 'Failed to assign squad');
    },
  });

  const openCreateModal = () => {
    setEditingPlayer(null);
    setPlayerName('');
    setCodName('');
    setEmail('');
    setTeamId('');
    setPhotoFile(null);
    setYear(selectedYear);
    setFormError('');
    setIsPlayerModalOpen(true);
  };

  const openEditModal = (player) => {
    setEditingPlayer(player);
    setPlayerName(player.player_name || '');
    setCodName(player.cod_name || '');
    setEmail(player.email || '');
    setTeamId(player.team_id ? player.team_id.toString() : '');
    setPhotoFile(null);
    setYear(player.year || selectedYear);
    setFormError('');
    setIsPlayerModalOpen(true);
  };

  const closePlayerModal = () => {
    setIsPlayerModalOpen(false);
    setEditingPlayer(null);
    setFormError('');
  };

  const openAssignModal = (player) => {
    setAssigningPlayer(player);
    setSelectedTeamId(player.team_id ? player.team_id.toString() : '');
    setFormError('');
    setIsAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setIsAssignModalOpen(false);
    setAssigningPlayer(null);
    setFormError('');
  };

  const handlePlayerSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    const fd = new FormData();
    fd.append('player_name', playerName.trim());
    fd.append('cod_name', codName.trim());
    if (editingPlayer) {
      if (teamId) fd.append('team_id', teamId);
      if (photoFile) fd.append('photo', photoFile);
      updateMutation.mutate({ id: editingPlayer.id, formData: fd });
    } else {
      fd.append('email', email.trim());
      if (teamId) fd.append('team_id', teamId);
      fd.append('year', year.toString());
      if (photoFile) fd.append('photo', photoFile);
      createMutation.mutate(fd);
    }
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!selectedTeamId) {
      setFormError('Please select a squad');
      return;
    }
    assignMutation.mutate({
      playerId: assigningPlayer.id,
      teamId: selectedTeamId,
    });
  };

  const handleDelete = (id, codName) => {
    if (window.confirm(`Are you sure you want to delete operative "${codName || 'selected player'}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const filteredPlayers = players.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.cod_name?.toLowerCase().includes(q) ||
      p.player_name?.toLowerCase().includes(q) ||
      p.team_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 page-enter">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-border dark:border-dark-border pb-5">
        <div>
          <h2 className="text-xl font-bold font-display text-light-text dark:text-dark-text">
            Players & Operatives Directory
          </h2>
          <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
            Manage player rosters, assign university squads, upload photo identification, and award MVPs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search operatives..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-dark-card border border-light-border dark:border-dark-border text-light-text dark:text-dark-text placeholder-light-muted dark:placeholder-dark-muted focus:outline-none focus:border-accent"
            />
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-md shadow-accent/20 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Operative
          </button>
        </div>
      </div>

      {/* Table */}
      {playersLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : playersError ? (
        <ErrorState
          title="Failed to load players"
          message={playersError.response?.data?.detail || playersError.message}
          onRetry={() => refetch()}
        />
      ) : filteredPlayers.length === 0 ? (
        <EmptyState
          icon={User}
          title={search ? 'No players found matching query' : `No players registered for ${selectedYear}`}
          description="Operatives can register their own accounts or be manually created by tournament administrators."
        />
      ) : (
        <div className="rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-card overflow-hidden shadow-sm">
          <div className="table-container">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-light-border dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 text-[11px] font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted">
                  <th className="py-3 px-4">Operative</th>
                  <th className="py-3 px-4">Assigned Squad</th>
                  <th className="py-3 px-4 text-center">Kills</th>
                  <th className="py-3 px-4 text-center">Deaths</th>
                  <th className="py-3 px-4 text-center font-bold text-accent">K/D</th>
                  <th className="py-3 px-4 text-center">Matches</th>
                  <th className="py-3 px-4 text-center">MVP</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border dark:divide-dark-border">
                {filteredPlayers.map((p) => {
                  const photoUrl = p.photo
                    ? p.photo.startsWith('http')
                      ? p.photo
                      : `/static/player_photos/${p.photo}`
                    : null;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-dark-surface/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={p.cod_name}
                              className="w-8 h-8 rounded-lg object-cover border border-light-border dark:border-dark-border"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-accent border border-orange-500/20 flex items-center justify-center font-bold text-xs">
                              {p.cod_name ? p.cod_name[0].toUpperCase() : 'P'}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-light-text dark:text-dark-text font-display block">
                              {p.cod_name}
                            </span>
                            <span className="text-[11px] text-light-muted dark:text-dark-muted block">
                              {p.player_name || 'Operative'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {p.team_name ? (
                          <span className="flex items-center gap-1.5 text-light-text dark:text-dark-text font-semibold">
                            <Shield className="w-3.5 h-3.5 text-accent" />
                            {p.team_name}
                          </span>
                        ) : (
                          <button
                            onClick={() => openAssignModal(p)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                          >
                            <LinkIcon className="w-3 h-3" /> Assign Squad
                          </button>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center font-tabular font-semibold text-light-text dark:text-dark-text">
                        {p.kills ?? 0}
                      </td>

                      <td className="py-3 px-4 text-center font-tabular text-light-muted dark:text-dark-muted">
                        {p.deaths ?? 0}
                      </td>

                      <td className="py-3 px-4 text-center font-tabular font-black text-sm text-accent">
                        {p.kd_ratio?.toFixed ? p.kd_ratio.toFixed(2) : (p.kd_ratio || '0.00')}
                      </td>

                      <td className="py-3 px-4 text-center font-tabular text-light-text dark:text-dark-text">
                        {p.total_matches ?? 0}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => mvpMutation.mutate(p.id)}
                          title={p.is_mvp ? 'Current MVP' : 'Designate as MVP'}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            p.is_mvp
                              ? 'bg-amber-500/20 border-amber-500/40 text-amber-500'
                              : 'border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-amber-500 hover:border-amber-500/40'
                          }`}
                        >
                          <Crown className="w-3.5 h-3.5" />
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openAssignModal(p)}
                            title="Assign to Squad"
                            className="p-1.5 rounded-lg border border-light-border dark:border-dark-border hover:border-accent/40 text-light-muted dark:text-dark-muted hover:text-accent transition-colors"
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(p)}
                            title="Edit operative"
                            className="p-1.5 rounded-lg border border-light-border dark:border-dark-border hover:border-accent/40 text-light-muted dark:text-dark-muted hover:text-accent transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.cod_name)}
                            title="Delete operative"
                            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create/Edit Player */}
      <Modal
        isOpen={isPlayerModalOpen}
        onClose={closePlayerModal}
        title={editingPlayer ? `Edit Operative: ${editingPlayer.cod_name}` : 'Register New Operative'}
      >
        <form onSubmit={handlePlayerSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Full Student Name *
              </label>
              <input
                type="text"
                required
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="e.g. Madhur Gahlot"
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Call of Duty In-Game Name (IGN) *
              </label>
              <input
                type="text"
                required
                value={codName}
                onChange={(e) => setCodName(e.target.value)}
                placeholder="e.g. GHOST_99"
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {!editingPlayer && (
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                University Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. 236301126@gkv.ac.in"
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
              Assign to Squad (Optional)
            </label>
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
            >
              <option value="">Unassigned (Free Agent)</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.team_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
              Operative Profile Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file && file.size > 5 * 1024 * 1024) {
                  alert("File size exceeds 5 MB limit. Please select a smaller image.");
                  e.target.value = "";
                  setPhotoFile(null);
                  return;
                }
                setPhotoFile(file || null);
              }}
              className="w-full text-xs text-light-muted dark:text-dark-muted file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-500/10 file:text-accent"
            />
          </div>

          {!editingPlayer && (
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
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-light-border dark:border-dark-border">
            <button
              type="button"
              onClick={closePlayerModal}
              className="px-4 py-2 rounded-xl border border-light-border dark:border-dark-border text-xs font-semibold text-light-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-md shadow-accent/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingPlayer ? 'Update Operative' : 'Create Operative'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Assign Squad */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={closeAssignModal}
        title={`Assign Squad: ${assigningPlayer?.cod_name || ''}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
              Select Tournament Squad *
            </label>
            <select
              required
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
            >
              <option value="">Select Team</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.team_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-light-border dark:border-dark-border">
            <button
              type="button"
              onClick={closeAssignModal}
              className="px-4 py-2 rounded-xl border border-light-border dark:border-dark-border text-xs font-semibold text-light-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assignMutation.isPending}
              className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-md shadow-accent/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {assignMutation.isPending ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
