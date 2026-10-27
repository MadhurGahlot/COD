import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  GitCompare,
  Crosshair,
  Target,
  Skull,
  Swords,
  Shield,
  ArrowRightLeft,
  Crown,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import { getComparePlayers, getCompareData } from '../api/players';
import Card, { CardBody } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Skeleton, { CardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

export default function ComparePlayers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialP1 = searchParams.get('p1') || '';
  const initialP2 = searchParams.get('p2') || '';

  const [player1Id, setPlayer1Id] = useState(initialP1);
  const [player2Id, setPlayer2Id] = useState(initialP2);

  // Fetch all players for selection dropdowns
  const { data: playersList = [], isLoading: listLoading } = useQuery({
    queryKey: ['comparePlayersList'],
    queryFn: async () => {
      const res = await getComparePlayers();
      return res.data?.players || [];
    },
  });

  // Set default selections if available and not yet set
  useEffect(() => {
    if (playersList.length >= 2 && !player1Id && !player2Id) {
      setPlayer1Id(playersList[0].id.toString());
      setPlayer2Id(playersList[1].id.toString());
    } else if (playersList.length >= 1 && !player1Id) {
      setPlayer1Id(playersList[0].id.toString());
    }
  }, [playersList]);

  // Update URL params
  useEffect(() => {
    const params = {};
    if (player1Id) params.p1 = player1Id;
    if (player2Id) params.p2 = player2Id;
    setSearchParams(params, { replace: true });
  }, [player1Id, player2Id, setSearchParams]);

  // Fetch comparison data
  const {
    data: compareData,
    isLoading: compareLoading,
    error: compareError,
  } = useQuery({
    queryKey: ['compareData', player1Id, player2Id],
    queryFn: async () => {
      const res = await getCompareData(player1Id, player2Id);
      return res.data;
    },
    enabled: !!player1Id && !!player2Id && player1Id !== player2Id,
  });

  const p1 = compareData?.p1;
  const p2 = compareData?.p2;

  const p1Name = p1?.cod_name || 'Operative 1';
  const p2Name = p2?.cod_name || 'Operative 2';

  const volumeChartData = p1 && p2 ? [
    {
      metric: 'Eliminations',
      [p1Name]: p1.kills || 0,
      [p2Name]: p2.kills || 0,
    },
    {
      metric: 'Casualties',
      [p1Name]: p1.deaths || 0,
      [p2Name]: p2.deaths || 0,
    },
    {
      metric: 'Assists',
      [p1Name]: p1.assists || 0,
      [p2Name]: p2.assists || 0,
    },
    {
      metric: 'Matches',
      [p1Name]: p1.total_matches || 0,
      [p2Name]: p2.total_matches || 0,
    },
  ] : [];

  return (
    <div className="space-y-8 page-enter">
      {/* Header */}
      <div className="border-b border-black/[0.08] dark:border-white/[0.08] pb-8">
        <p className="eyebrow-line text-light-text dark:text-dark-text mb-3">
          Tactical Analytics
        </p>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium font-display text-light-text dark:text-dark-text tracking-[-0.03em]">
            Head-to-Head <span className="font-serif italic font-normal text-accent">Comparison</span>
          </h1>
          <Badge variant="accent" size="md">
            Analytics
          </Badge>
        </div>
        <p className="text-sm sm:text-base text-light-text/65 dark:text-dark-text/65 mt-2">
          Select any two players to analyze comparative combat efficiency and verified tournament stats
        </p>
      </div>

      {/* Selectors Bar */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          {/* Player 1 Dropdown */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted">
              Select Operative Alpha
            </label>
            <select
              value={player1Id}
              onChange={(e) => setPlayer1Id(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="">-- Choose Operative --</option>
              {playersList.map((p) => (
                <option key={p.id} value={p.id.toString()}>
                  {p.cod_name} ({p.player_name || 'Operative'})
                </option>
              ))}
            </select>
          </div>

          {/* VS Divider */}
          <div className="md:col-span-1 flex justify-center py-2">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 text-accent border border-orange-500/20 flex items-center justify-center font-bold text-xs shadow-sm">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>

          {/* Player 2 Dropdown */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted">
              Select Operative Bravo
            </label>
            <select
              value={player2Id}
              onChange={(e) => setPlayer2Id(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-xs bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="">-- Choose Operative --</option>
              {playersList.map((p) => (
                <option key={p.id} value={p.id.toString()}>
                  {p.cod_name} ({p.player_name || 'Operative'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Comparison View */}
      {player1Id === player2Id && player1Id !== '' ? (
        <Card className="p-8 text-center border border-dashed border-light-border dark:border-dark-border">
          <p className="text-xs text-light-muted dark:text-dark-muted">
            Please select two different operatives to perform a head-to-head comparison.
          </p>
        </Card>
      ) : compareLoading ? (
        <CardSkeleton count={2} />
      ) : compareError ? (
        <ErrorState
          title="Could not load player comparison data"
          message={compareError.response?.data?.detail || compareError.message}
        />
      ) : !p1 || !p2 ? (
        <EmptyState
          icon={GitCompare}
          title="Select operatives to begin"
          description="Pick two players from the dropdowns above to generate direct combat metrics."
        />
      ) : (
        <div className="space-y-8">
          {/* Side by side player cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Player 1 Card */}
            <Card className="p-6 space-y-4 border-l-4 border-l-orange-500 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-accent font-black font-display text-xl flex items-center justify-center">
                  {p1.cod_name ? p1.cod_name.substring(0, 2).toUpperCase() : 'P1'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold font-display text-light-text dark:text-dark-text">
                      {p1.cod_name}
                    </h3>
                    {p1.is_mvp ? <Badge variant="accent" size="sm">MVP</Badge> : null}
                  </div>
                  <p className="text-xs text-light-muted dark:text-dark-muted">{p1.player_name}</p>
                  <p className="text-xs text-accent font-semibold mt-1 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    {p1.team_name || 'Free Agent'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-light-border dark:border-dark-border text-center text-xs">
                <div className="p-2.5 rounded-xl bg-gray-50/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border">
                  <span className="block text-[10px] text-light-muted dark:text-dark-muted uppercase font-bold">
                    K/D
                  </span>
                  <span className="text-base font-black text-accent font-tabular">
                    {p1.kd_ratio?.toFixed ? p1.kd_ratio.toFixed(2) : (p1.kd_ratio || '0.00')}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border">
                  <span className="block text-[10px] text-light-muted dark:text-dark-muted uppercase font-bold">
                    Kills
                  </span>
                  <span className="text-base font-bold text-light-text dark:text-dark-text font-tabular">
                    {p1.kills || 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border">
                  <span className="block text-[10px] text-light-muted dark:text-dark-muted uppercase font-bold">
                    Deaths
                  </span>
                  <span className="text-base font-bold text-light-muted dark:text-dark-muted font-tabular">
                    {p1.deaths || 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border">
                  <span className="block text-[10px] text-light-muted dark:text-dark-muted uppercase font-bold">
                    Matches
                  </span>
                  <span className="text-base font-bold text-light-text dark:text-dark-text font-tabular">
                    {p1.total_matches || 0}
                  </span>
                </div>
              </div>
            </Card>

            {/* Player 2 Card */}
            <Card className="p-6 space-y-4 border-l-4 border-l-amber-500 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-black font-display text-xl flex items-center justify-center">
                  {p2.cod_name ? p2.cod_name.substring(0, 2).toUpperCase() : 'P2'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold font-display text-light-text dark:text-dark-text">
                      {p2.cod_name}
                    </h3>
                    {p2.is_mvp ? <Badge variant="accent" size="sm">MVP</Badge> : null}
                  </div>
                  <p className="text-xs text-light-muted dark:text-dark-muted">{p2.player_name}</p>
                  <p className="text-xs text-amber-500 font-semibold mt-1 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    {p2.team_name || 'Free Agent'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-light-border dark:border-dark-border text-center text-xs">
                <div className="p-2.5 rounded-xl bg-gray-50/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border">
                  <span className="block text-[10px] text-light-muted dark:text-dark-muted uppercase font-bold">
                    K/D
                  </span>
                  <span className="text-base font-black text-amber-500 font-tabular">
                    {p2.kd_ratio?.toFixed ? p2.kd_ratio.toFixed(2) : (p2.kd_ratio || '0.00')}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border">
                  <span className="block text-[10px] text-light-muted dark:text-dark-muted uppercase font-bold">
                    Kills
                  </span>
                  <span className="text-base font-bold text-light-text dark:text-dark-text font-tabular">
                    {p2.kills || 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border">
                  <span className="block text-[10px] text-light-muted dark:text-dark-muted uppercase font-bold">
                    Deaths
                  </span>
                  <span className="text-base font-bold text-light-muted dark:text-dark-muted font-tabular">
                    {p2.deaths || 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50/50 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border">
                  <span className="block text-[10px] text-light-muted dark:text-dark-muted uppercase font-bold">
                    Matches
                  </span>
                  <span className="text-base font-bold text-light-text dark:text-dark-text font-tabular">
                    {p2.total_matches || 0}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Visual Comparison Chart */}
          <Card className="p-6 space-y-4">
            <div className="border-b border-light-border dark:border-dark-border pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold font-display text-light-text dark:text-dark-text">
                  Direct Volume Metrics Comparison
                </h2>
                <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                  Side-by-side volume across kills, deaths, assists, and matches deployed
                </p>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="metric" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#10151E',
                      borderColor: '#232C3B',
                      borderRadius: '8px',
                      color: '#F1F5F9',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey={p1Name} fill="#F97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={p2Name} fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
