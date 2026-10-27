import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  User,
  Swords,
  Calendar,
  GitBranch,
  Award,
  Bell,
  Sliders,
  History,
  ArrowRight,
  Shield,
  Activity,
} from 'lucide-react';
import { getHome } from '../../api/home';
import { getAuditLogs } from '../../api/admin';
import { useTournament } from '../../context/TournamentContext';
import Card, { CardBody } from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import { StatCardSkeleton } from '../../components/ui/Skeleton';

export default function AdminDashboard() {
  const { selectedYear } = useTournament();

  const { data: homeData, isLoading: homeLoading } = useQuery({
    queryKey: ['adminHomeStats', selectedYear],
    queryFn: async () => {
      const res = await getHome(selectedYear);
      return res.data;
    },
  });

  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ['adminRecentAudit'],
    queryFn: async () => {
      const res = await getAuditLogs();
      return res.data?.logs || [];
    },
  });

  const stats = homeData?.stats || { teams: 0, players: 0, matches: 0 };
  const recentLogs = (auditData || []).slice(0, 5);

  const adminModules = [
    { to: '/admin/teams', title: 'Squads & Teams', desc: 'Create, edit, and delete tournament teams', icon: Users, color: 'accent' },
    { to: '/admin/players', title: 'Players & Rosters', desc: 'Manage players, upload photos, set MVPs, assign teams', icon: User, color: 'cyan' },
    { to: '/admin/results', title: 'Match Results', desc: 'Record final scores, assign winners, and update points', icon: Swords, color: 'amber' },
    { to: '/admin/schedules', title: 'Match Schedules', desc: 'Configure match dates, times, venues, and stages', icon: Calendar, color: 'accent' },
    { to: '/admin/brackets', title: 'Playoff Brackets', desc: 'Setup playoff trees and advance winners to next round', icon: GitBranch, color: 'cyan' },
    { to: '/admin/winners', title: 'Winners & HoF', desc: 'Add champions, runners-up, and legacy records', icon: Award, color: 'amber' },
    { to: '/admin/news', title: 'Announcements', desc: 'Publish tournament alerts, rule updates, and notices', icon: Bell, color: 'accent' },
    { to: '/admin/home', title: 'Home CMS', desc: 'Edit hero titles, banners, highlights, and featured media', icon: Sliders, color: 'cyan' },
  ];

  return (
    <div className="space-y-8 page-enter">
      {/* Overview Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-light-text dark:text-dark-text">
          Console Overview
        </h2>
        <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted mt-1">
          Active season operations for Gurukula Kangri Vishwavidyalaya Esports Season {selectedYear}
        </p>
      </div>

      {/* Metrics Row */}
      {homeLoading ? (
        <StatCardSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            icon={Users}
            label="Total Squads"
            value={stats.teams}
            subtext={`Season ${selectedYear}`}
            color="accent"
          />
          <StatCard
            icon={User}
            label="Active Operatives"
            value={stats.players}
            subtext="Registered players"
            color="cyan"
          />
          <StatCard
            icon={Swords}
            label="Official Matches"
            value={stats.matches}
            subtext="Recorded matches"
            color="amber"
          />
        </div>
      )}

      {/* Management Modules Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold font-display text-light-text dark:text-dark-text">
          Management Controls
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminModules.map((mod) => (
            <Link key={mod.to} to={mod.to} className="group">
              <Card hover className="p-5 h-full flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
                    <mod.icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold font-display text-light-text dark:text-dark-text group-hover:text-accent transition-colors">
                    {mod.title}
                  </h4>
                  <p className="text-xs text-light-muted dark:text-dark-muted leading-relaxed line-clamp-2">
                    {mod.desc}
                  </p>
                </div>
                <div className="pt-3 flex items-center text-xs font-semibold text-accent gap-1">
                  Manage <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Audit Logs snippet */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-display text-light-text dark:text-dark-text flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" />
            Recent Administrative Actions
          </h3>
          <Link
            to="/admin/audit"
            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
          >
            All Audit Logs <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <Card className="p-6 text-center text-xs text-light-muted dark:text-dark-muted">
            No administrative audit actions recorded yet.
          </Card>
        ) : (
          <div className="rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-card overflow-hidden">
            <div className="divide-y divide-light-border dark:divide-dark-border">
              {recentLogs.map((log, idx) => (
                <div key={log.id || idx} className="p-3.5 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-light-text dark:text-dark-text">
                      {log.action}
                    </p>
                    <p className="text-[11px] text-light-muted dark:text-dark-muted">
                      Admin: <span className="font-medium text-accent">{log.user || 'admin'}</span> • IP: {log.ip_address || '127.0.0.1'}
                    </p>
                  </div>
                  <span className="text-[10px] text-light-muted dark:text-dark-muted font-tabular">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Just now'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
