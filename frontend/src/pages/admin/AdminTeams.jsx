import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Users, Search, AlertCircle } from 'lucide-react';
import { getTeams, createTeam, updateTeam, deleteTeam } from '../../api/teams';
import { useTournament } from '../../context/TournamentContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

export default function AdminTeams() {
  const { selectedYear } = useTournament();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formError, setFormError] = useState('');

  // Form fields
  const [teamName, setTeamName] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [department, setDepartment] = useState('');
  const [contact, setContact] = useState('');
  const [year, setYear] = useState(selectedYear);

  const { data: teams = [], isLoading, error, refetch } = useQuery({
    queryKey: ['adminTeams', selectedYear],
    queryFn: async () => {
      const res = await getTeams(selectedYear);
      return res.data?.teams || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTeams', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['teams', selectedYear] });
      closeModal();
    },
    onError: (err) => {
      setFormError(err.response?.data?.detail || 'Failed to create team');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTeams', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['teams', selectedYear] });
      closeModal();
    },
    onError: (err) => {
      setFormError(err.response?.data?.detail || 'Failed to update team');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTeams', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['teams', selectedYear] });
    },
  });

  const openCreateModal = () => {
    setEditingTeam(null);
    setTeamName('');
    setCaptainName('');
    setDepartment('');
    setContact('');
    setYear(selectedYear);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (team) => {
    setEditingTeam(team);
    setTeamName(team.team_name || '');
    setCaptainName(team.captain_name || '');
    setDepartment(team.department || '');
    setContact(team.contact || '');
    setYear(team.year || selectedYear);
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTeam(null);
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    const payload = {
      team_name: teamName,
      captain_name: captainName,
      department: department,
      contact: contact,
      year: parseInt(year, 10),
    };

    if (editingTeam) {
      updateMutation.mutate({ id: editingTeam.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete squad "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const filteredTeams = teams.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.team_name?.toLowerCase().includes(q) ||
      t.captain_name?.toLowerCase().includes(q) ||
      t.department?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 page-enter">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-border dark:border-dark-border pb-5">
        <div>
          <h2 className="text-xl font-bold font-display text-light-text dark:text-dark-text">
            Squads & Teams Management
          </h2>
          <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
            Registered squads participating in Season {selectedYear}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-md shadow-accent/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add New Squad
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search squads..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-dark-card border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
          />
        </div>
        <span className="text-xs text-light-muted dark:text-dark-muted">
          Total: <strong className="text-light-text dark:text-dark-text">{filteredTeams.length}</strong> squads
        </span>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : error ? (
        <ErrorState
          title="Failed to load teams"
          message={error.response?.data?.detail || error.message}
          onRetry={() => refetch()}
        />
      ) : filteredTeams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No squads found"
          description={`No squads registered for ${selectedYear}. Click "Add New Squad" to create one.`}
        />
      ) : (
        <div className="rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-card overflow-hidden shadow-sm">
          <div className="table-container">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-light-border dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 text-[11px] font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted">
                  <th className="py-3 px-4">Squad Name</th>
                  <th className="py-3 px-4">Captain</th>
                  <th className="py-3 px-4">Department / Branch</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 text-center">Roster Size</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border dark:divide-dark-border">
                {filteredTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-gray-50/80 dark:hover:bg-dark-surface/40 transition-colors">
                    <td className="py-3 px-4 font-bold font-display text-light-text dark:text-dark-text">
                      {team.team_name}
                    </td>
                    <td className="py-3 px-4 text-light-text dark:text-dark-text">
                      {team.captain_name || '—'}
                    </td>
                    <td className="py-3 px-4 text-light-muted dark:text-dark-muted">
                      {team.department || '—'}
                    </td>
                    <td className="py-3 px-4 text-light-muted dark:text-dark-muted font-tabular">
                      {team.contact || '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="outline" size="sm">
                        {team.players?.length || 0}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(team)}
                          className="p-1.5 rounded-lg border border-light-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-surface text-light-muted dark:text-dark-muted hover:text-accent transition-colors"
                          title="Edit squad"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(team.id, team.team_name)}
                          className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 transition-colors"
                          title="Delete squad"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Create / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTeam ? 'Edit Squad Details' : 'Register New Squad'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
              Squad / Team Name *
            </label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Task Force 141"
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
              Team Captain Name
            </label>
            <input
              type="text"
              value={captainName}
              onChange={(e) => setCaptainName(e.target.value)}
              placeholder="e.g. Captain Price"
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
              Department / Faculty / Branch
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. CSE / FET GKV"
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
              Contact / Mobile
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="e.g. +91 9876543210"
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
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-light-border dark:border-dark-border">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-xl border border-light-border dark:border-dark-border text-xs font-semibold text-light-muted dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-accent/20"
            >
              {editingTeam ? 'Save Changes' : 'Create Squad'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
