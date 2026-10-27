import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  User,
  Mail,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Building,
  Phone,
  Crosshair,
} from 'lucide-react';
import { register, login, registerPlayerProfile } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [step, setStep] = useState(1); // 1: Account, 2: Player Profile
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Profile fields (Step 2)
  const [playerName, setPlayerName] = useState('');
  const [codName, setCodName] = useState('');
  const [department, setDepartment] = useState('');
  const [contact, setContact] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password);
      const loginRes = await login(username, password);
      const { access_token, role } = loginRes.data;
      loginUser(access_token, role, username);

      setStep(2);
      setSuccessMsg('Account created successfully! Set up your competitor profile below.');
    } catch (err) {
      setErrorMsg(
        err.response?.data?.detail || 'Failed to create account. Username or email may already be registered.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setErrorMsg('Operative Name is required.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('player_name', playerName.trim());
      formData.append('cod_name', codName.trim() || playerName.trim());
      formData.append('email', email.trim());
      if (department.trim()) formData.append('department', department.trim());
      if (contact.trim()) formData.append('contact', contact.trim());

      await registerPlayerProfile(formData);
      setSuccessMsg(
        '✅ Profile submitted! Your registration is pending team assignment by an admin. You will be added to the roster once approved.'
      );
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.detail || 'Failed to register player profile. You can update this later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkipProfile = () => {
    navigate('/');
  };

  return (
    <div className="relative min-h-[calc(100vh-14rem)] py-12 sm:py-20 flex flex-col items-center justify-center page-enter overflow-hidden">
      {/* Scoped Background Layer (contained strictly to this component, stopping before the footer) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-0"
        style={{ backgroundImage: "url('/gurukullogo.jpg')" }} 
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-lg space-y-8 my-auto">
        {/* Brand header */}
        <div className="text-center space-y-3">
          <p className="eyebrow-line text-white/90 justify-center font-medium tracking-wide text-xs uppercase">
            {step === 1 ? 'Player Enlistment' : 'Competitor Profile Setup'}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium font-display text-white tracking-[-0.03em]">
            {step === 1 ? (
              <>Register <span className="font-serif italic font-normal text-amber-400">Player</span></>
            ) : (
              <>Competitor <span className="font-serif italic font-normal text-amber-400">Profile</span></>
            )}
          </h1>
          <p className="text-sm sm:text-base text-gray-200 max-w-md mx-auto">
            {step === 1
              ? 'Join the official GKV Call of Duty Tournament network and compete for glory'
              : 'Add your in-game identity and campus details to appear in tournament rosters'}
          </p>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === 1 ? 'w-8 bg-amber-400' : 'w-3 bg-white/40'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === 2 ? 'w-8 bg-amber-400' : 'w-3 bg-white/40'
              }`}
            />
          </div>
        </div>

        {/* Card Form */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white/90 dark:bg-[#1D1C1A]/90 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3 text-sm text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 flex items-center gap-3 text-sm text-orange-700 dark:text-orange-300">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Username
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm sm:text-base bg-white dark:bg-[#151413] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  University / Personal Email
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rollno@gkv.ac.in"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm sm:text-base bg-white dark:bg-[#151413] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm sm:text-base bg-white dark:bg-[#151413] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm sm:text-base bg-white dark:bg-[#151413] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 disabled:opacity-50 text-sm sm:text-base font-bold transition-all duration-200 shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Proceed to Profile Setup</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateProfile} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                   Real Name *
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    required
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm sm:text-base bg-white dark:bg-[#151413] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  In-Game Tactical IGN (Call of Duty)
                </label>
                <div className="relative">
                  <Crosshair className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={codName}
                    onChange={(e) => setCodName(e.target.value)}
                    placeholder="e.g. GHOST_99 or SNIPER_X"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm sm:text-base bg-white dark:bg-[#151413] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Department / Course
                </label>
                <div className="relative">
                  <Building className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. CSE / FET / MCA"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm sm:text-base bg-white dark:bg-[#151413] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Contact / Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="For tournament captain communications"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm sm:text-base bg-white dark:bg-[#151413] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSkipProfile}
                  className="flex-1 py-4 px-6 rounded-full border border-gray-300 dark:border-gray-700 text-sm sm:text-base font-bold text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-center cursor-pointer"
                >
                  Skip for Now
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 px-6 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 disabled:opacity-50 text-sm sm:text-base font-bold transition-all duration-200 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  ) : (
                    <span>Save & Enter</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Login CTA */}
        <p className="text-center text-sm sm:text-base text-gray-200">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-amber-400 hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}