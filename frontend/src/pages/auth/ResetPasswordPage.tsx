import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { Lock, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { NeoButton } from '../../components/ui/NeoButton';
import { DecorativeSparkle } from '../../components/ui/DecorativeSparkle';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError('Please provide a valid password reset token.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token: token.trim(),
        newPassword: newPassword.trim(),
      });
      setSuccess(true);
      toast.success('Password successfully reset! Please sign in.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Password reset failed. The token may be expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-grid-pattern relative overflow-hidden">
      <DecorativeSparkle size={36} colorClass="text-yellow-400" className="absolute top-10 right-10 hidden sm:block rotate-12" />

      <div className="relative max-w-md w-full">
        {/* Offset background backing */}
        <div className="absolute inset-0 bg-yellow-200 rounded-base border-4 border-black dark:border-white translate-x-2.5 translate-y-2.5 -z-10" />

        {/* Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-base border-4 border-black dark:border-white p-6 sm:p-8 shadow-neo text-black dark:text-white">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-black text-black dark:text-white mb-6 px-3 py-1.5 rounded-base border-2 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] transition"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5px]" />
            <span>Back to Sign In</span>
          </Link>

          <div className="text-center mb-6">
            <div className="inline-flex bg-main border-2 border-black dark:border-white p-3 rounded-base shadow-neo-sm mb-3 -rotate-2">
              <Lock className="w-7 h-7 text-black dark:text-white stroke-[2.5px]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-black dark:text-white">Set New Password</h2>
            <p className="text-xs sm:text-sm font-bold text-black dark:text-white/60 mt-1">
              Enter your recovery token and new credentials.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-100 border-2 border-black dark:border-white text-black dark:text-white text-xs rounded-base font-bold shadow-neo-sm">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-success-mint border-2 border-black dark:border-white rounded-base text-black dark:text-white text-xs font-bold shadow-neo-sm">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 stroke-[3px]" />
                <h3 className="font-black text-base text-black dark:text-white">Password Reset Completed</h3>
                <p className="mt-1">Your account password has been updated. You can now log in.</p>
              </div>

              <Link to="/login">
                <NeoButton variant="primary" size="lg" fullWidth>
                  <span>Sign In with New Password</span>
                  <ArrowRight className="w-4 h-4 ml-1 stroke-[3px]" />
                </NeoButton>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-black dark:text-white uppercase mb-1.5">
                  Recovery Token
                </label>
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-base border-2 border-black dark:border-white text-xs font-mono font-bold bg-white dark:bg-zinc-900 focus:bg-yellow-50 focus:outline-none shadow-neo-sm"
                  placeholder="Paste token or enter from link"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black dark:text-white uppercase mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-base border-2 border-black dark:border-white text-sm font-bold bg-white dark:bg-zinc-900 focus:bg-yellow-50 focus:outline-none shadow-neo-sm"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black dark:text-white uppercase mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-base border-2 border-black dark:border-white text-sm font-bold bg-white dark:bg-zinc-900 focus:bg-yellow-50 focus:outline-none shadow-neo-sm"
                  placeholder="Re-type new password"
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
                <span>{loading ? 'Updating Password...' : 'Reset Password'}</span>
                <ArrowRight className="w-4 h-4 ml-1 stroke-[3px]" />
              </NeoButton>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
