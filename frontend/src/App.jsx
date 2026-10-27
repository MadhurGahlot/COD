import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts (static since they wrap all routes)
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Public Pages (Lazy Loaded for fast mobile initial bundle)
const Home = lazy(() => import('./pages/Home'));
const Teams = lazy(() => import('./pages/Teams'));
const TeamDetail = lazy(() => import('./pages/TeamDetail'));
const Players = lazy(() => import('./pages/Players'));
const PlayerDetail = lazy(() => import('./pages/PlayerDetail'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Fixtures = lazy(() => import('./pages/Fixtures'));
const Brackets = lazy(() => import('./pages/Brackets'));
const ComparePlayers = lazy(() => import('./pages/ComparePlayers'));
const Winners = lazy(() => import('./pages/Winners'));
const News = lazy(() => import('./pages/News'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin Pages (Lazy Loaded so mobile users never download admin code)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminTeams = lazy(() => import('./pages/admin/AdminTeams'));
const AdminPlayers = lazy(() => import('./pages/admin/AdminPlayers'));
const AdminResults = lazy(() => import('./pages/admin/AdminResults'));
const AdminSchedules = lazy(() => import('./pages/admin/AdminSchedules'));
const AdminBrackets = lazy(() => import('./pages/admin/AdminBrackets'));
const AdminWinners = lazy(() => import('./pages/admin/AdminWinners'));
const AdminNews = lazy(() => import('./pages/admin/AdminNews'));
const AdminHome = lazy(() => import('./pages/admin/AdminHome'));
const AdminAudit = lazy(() => import('./pages/admin/AdminAudit'));

// Lightweight page loading fallback
function PageLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 p-8">
      <div className="w-8 h-8 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
      <span className="text-xs uppercase tracking-widest text-light-text/40 dark:text-dark-text/40 font-mono">
        Loading...
      </span>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes with standard Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Suspense fallback={<PageLoader />}><Home /></Suspense>} />
        <Route path="/teams" element={<Suspense fallback={<PageLoader />}><Teams /></Suspense>} />
        <Route path="/teams/:id" element={<Suspense fallback={<PageLoader />}><TeamDetail /></Suspense>} />
        <Route path="/players" element={<Suspense fallback={<PageLoader />}><Players /></Suspense>} />
        <Route path="/players/:id" element={<Suspense fallback={<PageLoader />}><PlayerDetail /></Suspense>} />
        <Route path="/leaderboard" element={<Suspense fallback={<PageLoader />}><Leaderboard /></Suspense>} />
        <Route path="/fixtures" element={<Suspense fallback={<PageLoader />}><Fixtures /></Suspense>} />
        <Route path="/brackets" element={<Suspense fallback={<PageLoader />}><Brackets /></Suspense>} />
        <Route path="/compare" element={<Suspense fallback={<PageLoader />}><ComparePlayers /></Suspense>} />
        <Route path="/winners" element={<Suspense fallback={<PageLoader />}><Winners /></Suspense>} />
        <Route path="/news" element={<Suspense fallback={<PageLoader />}><News /></Suspense>} />
        <Route path="/login" element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
        <Route path="/register" element={<Suspense fallback={<PageLoader />}><Register /></Suspense>} />
        <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
      </Route>

      {/* Protected Admin Routes — requires authentication + admin role */}
      <Route element={<ProtectedRoute requireAdmin />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
          <Route path="teams" element={<Suspense fallback={<PageLoader />}><AdminTeams /></Suspense>} />
          <Route path="players" element={<Suspense fallback={<PageLoader />}><AdminPlayers /></Suspense>} />
          <Route path="results" element={<Suspense fallback={<PageLoader />}><AdminResults /></Suspense>} />
          <Route path="schedules" element={<Suspense fallback={<PageLoader />}><AdminSchedules /></Suspense>} />
          <Route path="brackets" element={<Suspense fallback={<PageLoader />}><AdminBrackets /></Suspense>} />
          <Route path="winners" element={<Suspense fallback={<PageLoader />}><AdminWinners /></Suspense>} />
          <Route path="news" element={<Suspense fallback={<PageLoader />}><AdminNews /></Suspense>} />
          <Route path="home" element={<Suspense fallback={<PageLoader />}><AdminHome /></Suspense>} />
          <Route path="audit" element={<Suspense fallback={<PageLoader />}><AdminAudit /></Suspense>} />
          <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
        </Route>
      </Route>
    </Routes>
  );
}
