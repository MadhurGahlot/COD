import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, User, LogIn, AlertCircle } from 'lucide-react';
import { login } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await login(username, password);
      const { access_token, role, username: returnedUsername } = res.data;
      loginUser(access_token, role, returnedUsername || username);

      const destination = location.state?.from || (role === 'admin' ? '/admin' : '/');
      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMsg(
        err.response?.data?.detail || 'Invalid username or password. Please verify your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-14rem)] py-12 sm:py-20 flex flex-col items-center justify-center page-enter overflow-hidden">
      {/* Background Image Container - Changed -z-10 to z-0 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/gurukullogo.jpg')" }} 
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-[2px]" />
      </div>

      {/* Content Container (z-10 sits on top of z-0) */}
      <div className="relative z-10 w-full max-w-md space-y-8 px-4">
        {/* Brand header */}
        <div className="text-center space-y-3">
          <p className="eyebrow-line text-white/90 justify-center">
            Competitive Access
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium font-display text-white tracking-[-0.03em]">
            Sign In to <span className="font-serif italic font-normal text-accent">Tournament</span>
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-sm mx-auto">
            Access your player profile, squad profile, or tournament controls
          </p>
        </div>

        {/* Card Form */}
        <div className="p-8 sm:p-10 rounded-2xl bg-white/70 dark:bg-[#1B1A18]/80 backdrop-blur-md border border-white/20 dark:border-white/[0.08] shadow-lg space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider font-medium opacity-65">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-11 pr-4 py-2.5 rounded-full text-sm bg-white/60 dark:bg-[#151413]/60 border border-black/15 dark:border-white/15 text-light-text dark:text-dark-text placeholder:opacity-40 focus:outline-none focus:border-black/40 dark:focus:border-white/40 backdrop-blur-sm transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider font-medium opacity-65">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 rounded-full text-sm bg-white/60 dark:bg-[#151413]/60 border border-black/15 dark:border-white/15 text-light-text dark:text-dark-text placeholder:opacity-40 focus:outline-none focus:border-black/40 dark:focus:border-white/40 backdrop-blur-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-85 disabled:opacity-50 text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Register CTA */}
        <p className="text-center text-sm text-white/80">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-accent hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}