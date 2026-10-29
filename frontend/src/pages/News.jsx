import React from 'react';
import { staticUrl } from '../api/client';
import { useQuery } from '@tanstack/react-query';
import { Bell, Calendar, User, ShieldAlert, Sparkles } from 'lucide-react';
import { getNews } from '../api/news';
import { useTournament } from '../context/TournamentContext';
import Card, { CardBody } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { CardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

export default function News() {
  const { selectedYear } = useTournament();

  const { data: news = [], isLoading, error, refetch } = useQuery({
    queryKey: ['news', selectedYear],
    queryFn: async () => {
      const res = await getNews(selectedYear);
      return res.data?.news || [];
    },
  });

  return (
    <div className="space-y-8 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-black/[0.08] dark:border-white/[0.08] pb-8">
        <div>
          <p className="eyebrow-line text-light-text dark:text-dark-text mb-3">
            Official Bulletins
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium font-display text-light-text dark:text-dark-text tracking-[-0.03em]">
              Tournament <span className="font-serif italic font-normal text-accent">Announcements</span>
            </h1>
            <Badge variant="accent" size="md">
              Season {selectedYear}
            </Badge>
          </div>
          <p className="text-sm sm:text-base text-light-text/65 dark:text-dark-text/65 mt-2">
            Official rules, schedule changes, administrative bulletins, and live alerts
          </p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <CardSkeleton count={3} />
      ) : error ? (
        <ErrorState
          title="Could not load tournament announcements"
          message={error.response?.data?.detail || error.message}
          onRetry={() => refetch()}
        />
      ) : news.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={`No announcements posted for ${selectedYear}`}
          description="Tournament directors will post official updates and rules notifications here."
        />
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
          {news.map((item) => (
            <Card key={item.id} hover className="p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-light-border dark:border-dark-border pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="accent" size="sm">
                    Announcement
                  </Badge>
                  <span className="text-xs text-light-muted dark:text-dark-muted flex items-center gap-1 font-medium">
                    <User className="w-3.5 h-3.5 text-accent" />
                    {item.author || 'Tournament Admin'}
                  </span>
                </div>

                {item.created_at && (
                  <span className="text-xs text-light-muted dark:text-dark-muted flex items-center gap-1 font-tabular">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <h2 className="text-lg font-bold font-display text-light-text dark:text-dark-text">
                  {item.title}
                </h2>
                {item.image && (
                  <img
                    src={staticUrl(item.image.startsWith('http') ? item.image : `/static/${item.image}`)}
                    alt={item.title}
                    className="w-full max-h-72 object-cover rounded-xl border border-light-border dark:border-dark-border"
                  />
                )}
                <div className="text-xs sm:text-sm text-light-muted dark:text-dark-muted leading-relaxed whitespace-pre-line">
                  {item.content}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
