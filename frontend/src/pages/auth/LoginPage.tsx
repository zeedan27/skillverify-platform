import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { NeoButton } from '../../components/ui/NeoButton';

import { DecorativeSparkle } from '../../components/ui/DecorativeSparkle';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (targetEmail: string, targetPass: string) => {
    setError(null);
    setLoading(true);
    try {
      const cleanEmail = targetEmail.trim();
      const cleanPass = targetPass.trim();
      const user = await login(cleanEmail, cleanPass);
      if (user.role === 'employer') navigate('/employer/dashboard');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/jobs');
    } catch (err: any) {
      if (err.message === 'Network Error' || !err.response) {
        setError('Cannot connect to backend server at http://localhost:3001. Please ensure backend is running.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please check your email and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLoginSubmit(email, password);
  };


  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-grid-pattern relative overflow-hidden">
      <DecorativeSparkle size={36} colorClass="text-main" className="absolute top-10 left-10 hidden sm:block rotate-12" />
      <DecorativeSparkle size={32} colorClass="text-purple-400" className="absolute bottom-10 right-10 hidden sm:block -rotate-12" />

      <div className="relative max-w-md w-full">
        {/* Offset background backing */}
        <div className="absolute inset-0 bg-yellow-200 rounded-base border-4 border-black dark:border-white translate-x-2.5 translate-y-2.5 -z-10" />

        {/* Main Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-base border-4 border-black dark:border-white p-6 sm:p-8 shadow-neo text-black dark:text-white">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex bg-main border-2 border-black dark:border-white p-3 rounded-base shadow-neo-sm mb-3 -rotate-2">
              <ShieldCheck className="w-7 h-7 text-black dark:text-white stroke-[2.5px]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">Welcome Back</h2>
            <p className="text-xs sm:text-sm font-bold text-black dark:text-white/60 mt-1">Sign in to your SkillVerify account</p>
          </div>



          {error && (
            <div className="mb-5 p-3.5 bg-red-100 border-2 border-black dark:border-white text-black dark:text-white text-xs rounded-base font-bold leading-relaxed shadow-neo-sm flex items-start gap-2">
              <span className="text-alert-red font-black">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black dark:text-white">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-base border-2 border-black dark:border-white font-bold text-sm bg-white dark:bg-zinc-900 focus:bg-yellow-50 focus:outline-none shadow-neo-sm"
                placeholder="candidate@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-black text-black dark:text-white hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-base border-2 border-black dark:border-white font-bold text-sm bg-white dark:bg-zinc-900 focus:bg-yellow-50 focus:outline-none shadow-neo-sm"
                placeholder="••••••••"
              />
            </div>

            <NeoButton
              type="submit"
              disabled={loading}
              variant="primary"
              size="lg"
              fullWidth
              className="mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4 ml-1 stroke-[3px]" />
            </NeoButton>
          </form>

          <div className="mt-6 text-center text-xs font-bold text-black dark:text-white/70 border-t-2 border-dashed border-black dark:border-white/20 pt-4">
            Don't have an account?{' '}
            <Link to="/register" className="font-black text-black dark:text-white underline hover:text-black dark:text-white/80">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
