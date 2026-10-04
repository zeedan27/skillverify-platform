import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { KeyRound, ArrowRight, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { NeoButton } from '../../components/ui/NeoButton';
import { DecorativeSparkle } from '../../components/ui/DecorativeSparkle';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ message: string; resetToken?: string } | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      setSuccessInfo(res.data.data);
      toast.success('Password reset instructions generated.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-grid-pattern relative overflow-hidden">
      <DecorativeSparkle size={36} colorClass="text-yellow-400" className="absolute top-10 left-10 hidden sm:block rotate-12" />

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
              <KeyRound className="w-7 h-7 text-black dark:text-white stroke-[2.5px]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-black dark:text-white">Forgot Password</h2>
            <p className="text-xs sm:text-sm font-bold text-black dark:text-white/60 mt-1">
              Enter your account email to receive a password recovery token.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-100 border-2 border-black dark:border-white text-black dark:text-white text-xs rounded-base font-bold shadow-neo-sm">
              {error}
            </div>
          )}

          {successInfo ? (
            <div className="space-y-4">
              <div className="p-4 bg-success-mint border-2 border-black dark:border-white rounded-base text-black dark:text-white text-xs font-bold shadow-neo-sm">
                <div className="flex items-center gap-2 font-black mb-1">
                  <CheckCircle2 className="w-4 h-4 stroke-[3px]" />
                  <span>Reset Token Generated</span>
                </div>
                <p className="leading-relaxed">{successInfo.message}</p>
              </div>

              {successInfo.resetToken && (
                <div className="p-4 bg-yellow-50 border-2 border-black dark:border-white rounded-base space-y-3 shadow-neo-sm">
                  <NeoBadge variant="black" slanted="-rotate-1" size="sm">
                    ⚡ 1-Click Evaluation Link
                  </NeoBadge>
                  <p className="text-xs font-bold text-black dark:text-white/70">
                    In production dispatched via email. For instant evaluation:
                  </p>
                  <Link
                    to={`/reset-password?token=${encodeURIComponent(successInfo.resetToken)}`}
                  >
                    <NeoButton variant="primary" size="md" fullWidth>
                      <span>Reset Password Now</span>
                      <ArrowRight className="w-4 h-4 ml-1 stroke-[3px]" />
                    </NeoButton>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-black dark:text-white uppercase mb-1.5">
                  Registered Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-black dark:text-white absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-base border-2 border-black dark:border-white text-sm font-bold bg-white dark:bg-zinc-900 focus:bg-yellow-50 focus:outline-none shadow-neo-sm"
                    placeholder="applicant@skillverify.com"
                  />
                </div>
              </div>

              <NeoButton
                type="submit"
                disabled={loading}
                variant="primary"
                size="lg"
                fullWidth
                className="mt-2"
              >
                <span>{loading ? 'Generating Token...' : 'Send Recovery Token'}</span>
                <ArrowRight className="w-4 h-4 ml-1 stroke-[3px]" />
              </NeoButton>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
