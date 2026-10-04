import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Role } from '@skillverify/shared';
import api from '../../api/client';
import { ShieldCheck, UserCheck, Building2, ArrowRight } from 'lucide-react';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { DecorativeSparkle } from '../../components/ui/DecorativeSparkle';

export const RegisterPage: React.FC = () => {
  const [role, setRole] = useState<Role.APPLICANT | Role.EMPLOYER>(Role.APPLICANT);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (role === Role.APPLICANT) {
        await api.post('/auth/register/applicant', { email, password, fullName, phone });
      } else {
        await api.post('/auth/register/employer', {
          email,
          password,
          companyName,
          contactPerson,
          companyWebsite,
          phone,
        });
      }
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-8 bg-grid-pattern relative overflow-hidden">
      <DecorativeSparkle size={40} colorClass="text-main" className="absolute top-8 right-8 hidden sm:block rotate-12" />
      <DecorativeSparkle size={32} colorClass="text-success-mint" className="absolute bottom-8 left-8 hidden sm:block -rotate-12" />

      <div className="relative max-w-lg w-full">
        {/* Offset Backing */}
        <div className="absolute inset-0 bg-green-200 rounded-base border-4 border-black dark:border-white translate-x-2.5 translate-y-2.5 -z-10" />

        {/* Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-base border-4 border-black dark:border-white p-6 sm:p-8 shadow-neo text-black dark:text-white">
          <div className="text-center mb-6">
            <div className="inline-flex bg-success-mint border-2 border-black dark:border-white p-2.5 rounded-base shadow-neo-sm mb-3 -rotate-2">
              <ShieldCheck className="w-7 h-7 text-black dark:text-white stroke-[2.5px]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">Create Account</h2>
            <p className="text-xs sm:text-sm font-bold text-black dark:text-white/60 mt-1">Join the verified hiring ecosystem</p>
          </div>

          {/* Role Switcher */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1.5 bg-yellow-50 border-2 border-black dark:border-white rounded-base shadow-neo-sm">
            <button
              type="button"
              onClick={() => setRole(Role.APPLICANT)}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-black rounded-sm border-2 transition ${
                role === Role.APPLICANT
                  ? 'bg-main text-black dark:text-white border-black dark:border-white shadow-neo-sm -translate-y-0.5'
                  : 'bg-transparent text-black dark:text-white/70 border-transparent hover:text-black dark:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4 stroke-[2.5px]" />
              <span>Job Applicant</span>
            </button>
            <button
              type="button"
              onClick={() => setRole(Role.EMPLOYER)}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-black rounded-sm border-2 transition ${
                role === Role.EMPLOYER
                  ? 'bg-main text-black dark:text-white border-black dark:border-white shadow-neo-sm -translate-y-0.5'
                  : 'bg-transparent text-black dark:text-white/70 border-transparent hover:text-black dark:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 stroke-[2.5px]" />
              <span>Employer</span>
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-100 border-2 border-black dark:border-white text-black dark:text-white text-xs rounded-base font-bold shadow-neo-sm flex items-start gap-2">
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
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black dark:text-white">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-base border-2 border-black dark:border-white font-bold text-sm bg-white dark:bg-zinc-900 focus:bg-yellow-50 focus:outline-none shadow-neo-sm"
                placeholder="Minimum 6 characters"
              />
            </div>

            {role === Role.APPLICANT ? (
              <>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black dark:text-white">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-base border-2 border-black dark:border-white font-bold text-sm bg-white dark:bg-zinc-900 focus:bg-yellow-50 focus:outline-none shadow-neo-sm"
                    placeholder="e.g. Sarah Connor"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black dark:text-white">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-base border-2 border-black dark:border-white font-bold text-sm bg-white dark:bg-zinc-900 focus:bg-yellow-50 focus:outline-none shadow-neo-sm"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black dark:text-white">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-base border-2 border-black dark:border-white font-bold text-sm bg-white dark:bg-zinc-900 focus:bg-yellow-50 focus:outline-none shadow-neo-sm"
                    placeholder="e.g. Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black dark:text-white">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-base border-2 border-black dark:border-white font-bold text-sm bg-white dark:bg-zinc-900 focus:bg-yellow-50 focus:outline-none shadow-neo-sm"
                    placeholder="e.g. Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black dark:text-white">
                    Company Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-base border-2 border-black dark:border-white font-bold text-sm bg-white dark:bg-zinc-900 focus:bg-yellow-50 focus:outline-none shadow-neo-sm"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black dark:text-white">
                    Company Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-base border-2 border-black dark:border-white font-bold text-sm bg-white dark:bg-zinc-900 focus:bg-yellow-50 focus:outline-none shadow-neo-sm"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </>
            )}

            <NeoButton
              type="submit"
              disabled={loading}
              variant="primary"
              size="lg"
              fullWidth
              className="mt-4"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4 ml-1 stroke-[3px]" />
            </NeoButton>
          </form>

          <div className="mt-6 text-center text-xs font-bold text-black dark:text-white/70 border-t-2 border-dashed border-black dark:border-white/20 pt-4">
            Already have an account?{' '}
            <Link to="/login" className="font-black text-black dark:text-white underline hover:text-black dark:text-white/80">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
