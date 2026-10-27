import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Bell, AlertCircle, User } from 'lucide-react';
import { getNews, createNews, deleteNews } from '../../api/news';
import { useTournament } from '../../context/TournamentContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

export default function AdminNews() {
  const { selectedYear } = useTournament();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');

  // Form fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState(user?.username || 'Tournament Director');
  const [year, setYear] = useState(selectedYear);
  const [imageFile, setImageFile] = useState(null);

  const { data: news = [], isLoading, error, refetch } = useQuery({
    queryKey: ['adminNews', selectedYear],
    queryFn: async () => {
      const res = await getNews(selectedYear);
      return res.data?.news || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (formData) => createNews(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNews', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['news', selectedYear] });
      closeModal();
    },
    onError: (err) => {
      setFormError(err.response?.data?.detail || 'Failed to post announcement');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteNews(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNews', selectedYear] });
      queryClient.invalidateQueries({ queryKey: ['news', selectedYear] });
    },
  });

  const openModal = () => {
    setTitle('');
    setContent('');
    setAuthor(user?.username || 'Tournament Director');
    setYear(selectedYear);
    setImageFile(null);
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

    const fd = new FormData();
    fd.append('title', title.trim());
    fd.append('content', content.trim());
    fd.append('year', year.toString());
    if (imageFile) {
      fd.append('image', imageFile);
    }

    createMutation.mutate(fd);
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete announcement "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-border dark:border-dark-border pb-5">
        <div>
          <h2 className="text-xl font-bold font-display text-light-text dark:text-dark-text">
            Announcements & Bulletins
          </h2>
          <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
            Publish tournament updates, rule notifications, and official directives
          </p>
        </div>

        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-md shadow-accent/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Post Announcement
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : error ? (
        <ErrorState
          title="Failed to load announcements"
          message={error.response?.data?.detail || error.message}
          onRetry={() => refetch()}
        />
      ) : news.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No announcements published"
          description={`No news updates exist for Season ${selectedYear}.`}
        />
      ) : (
        <div className="rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-card overflow-hidden shadow-sm">
          <div className="table-container">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-light-border dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 text-[11px] font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Published Date</th>
                  <th className="py-3 px-4">Preview</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border dark:divide-dark-border">
                {news.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 dark:hover:bg-dark-surface/40 transition-colors">
                    <td className="py-3 px-4 font-bold font-display text-light-text dark:text-dark-text">
                      {item.title}
                    </td>
                    <td className="py-3 px-4 text-light-muted dark:text-dark-muted">
                      {item.author || 'Admin'}
                    </td>
                    <td className="py-3 px-4 text-light-muted dark:text-dark-muted font-tabular">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-light-muted dark:text-dark-muted text-xs max-w-sm truncate">
                      {item.content}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 transition-colors"
                        title="Delete announcement"
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

      {/* Modal: Post Announcement */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Post Tournament Announcement">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
              Announcement Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Schedule Revision for Quarterfinals"
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Author / Department
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Tournament Director"
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
                Season Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
              Announcement Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file && file.size > 5 * 1024 * 1024) {
                  alert("File size exceeds 5 MB limit. Please select a smaller image.");
                  e.target.value = "";
                  setImageFile(null);
                  return;
                }
                setImageFile(file || null);
              }}
              className="w-full text-xs text-light-muted dark:text-dark-muted file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-500/10 file:text-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-light-text dark:text-dark-text">
              Announcement Body *
            </label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide complete tournament bulletin details..."
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
            />
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
              Publish Update
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
