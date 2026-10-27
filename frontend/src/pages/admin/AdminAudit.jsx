import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, Search, User, Shield, Clock } from 'lucide-react';
import { getAuditLogs } from '../../api/admin';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { TableSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

export default function AdminAudit() {
  const [search, setSearch] = useState('');

  const { data: logs = [], isLoading, error, refetch } = useQuery({
    queryKey: ['adminAuditLogs'],
    queryFn: async () => {
      const res = await getAuditLogs();
      return res.data?.logs || [];
    },
  });

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase();
    return (
      log.action?.toLowerCase().includes(q) ||
      log.user?.toLowerCase().includes(q) ||
      log.ip_address?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 page-enter">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-border dark:border-dark-border pb-5">
        <div>
          <h2 className="text-xl font-bold font-display text-light-text dark:text-dark-text">
            Security & Audit Activity Logs
          </h2>
          <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
            Immutable tracking record of all administrative operations and database changes
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action or user..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-dark-card border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={8} cols={4} />
      ) : error ? (
        <ErrorState
          title="Failed to load audit logs"
          message={error.response?.data?.detail || error.message}
          onRetry={() => refetch()}
        />
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon={History}
          title="No audit log entries"
          description="Administrative actions (creating teams, recording matches, updating winners) will appear here."
        />
      ) : (
        <div className="rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-card overflow-hidden shadow-sm">
          <div className="table-container">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-light-border dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 text-[11px] font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted">
                  <th className="py-3 px-4">Action Summary</th>
                  <th className="py-3 px-4">Admin User</th>
                  <th className="py-3 px-4">Network IP</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border dark:divide-dark-border">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/80 dark:hover:bg-dark-surface/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-light-text dark:text-dark-text">
                      {log.action}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-accent flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {log.user || 'admin'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-light-muted dark:text-dark-muted font-tabular">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-4 text-right text-light-muted dark:text-dark-muted font-tabular">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Just now'}
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
