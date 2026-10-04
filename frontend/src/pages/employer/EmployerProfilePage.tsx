import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Building2, Globe, Phone, User, CheckCircle2, Key, ExternalLink } from 'lucide-react';
import { resizeImageToBase64 } from '../../utils/image';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoBadge } from '../../components/ui/NeoBadge';

export const EmployerProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/profile');
      setProfile(res.data.data);
    } catch (err) {
      console.error('Failed to load employer profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/users/profile', profile);
      setProfile(res.data.data);
      updateUser(res.data.data);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resized = await resizeImageToBase64(file, 256, 256, 0.85);
        setProfile({ ...profile, logoUrl: resized });
      } catch (err) {
        console.error('Failed to resize logo', err);
      }
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ message: 'New passwords do not match', isError: true });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ message: 'New password must be at least 6 characters long', isError: true });
      return;
    }

    try {
      setChangingPassword(true);
      await api.put('/users/password', { currentPassword, newPassword });
      setPasswordStatus({ message: 'Password successfully updated!', isError: false });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordStatus({
        message: err.response?.data?.message || 'Failed to change password',
        isError: true,
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] bg-grid-pattern flex justify-center items-center">
        <div className="p-8 rounded-2xl border-3 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-neo flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black dark:border-white"></div>
          <span className="text-xs font-black uppercase tracking-wider text-black dark:text-white">
            Loading Company Profile...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] bg-grid-pattern py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Employer Profile Form */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border-3 border-black dark:border-white shadow-neo-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-black dark:border-white">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <NeoBadge variant="yellow" size="sm" className="font-mono">
                  ORGANIZATION
                </NeoBadge>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">
                  VERIFIED EMPLOYER
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">
                Company Profile Settings
              </h1>
              <p className="text-xs font-semibold text-slate-600 mt-1">
                Manage your public company profile, corporate branding logo, and verified hiring identity.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {profile?._id && (
                <Link
                  to={`/companies/${profile._id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-black dark:border-white bg-[#FFFDF5] shadow-neo text-xs font-black uppercase text-black dark:text-white hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition"
                >
                  <span>Public View</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}

              {savedSuccess && (
                <span className="inline-flex items-center gap-1 text-xs font-black text-black dark:text-white bg-neo-mint px-3 py-1.5 rounded-xl border-2 border-black dark:border-white shadow-neo">
                  <CheckCircle2 className="w-4 h-4 text-black dark:text-white" />
                  Saved!
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Logo Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-5 bg-[#FFFDF5] rounded-xl border-2 border-black dark:border-white shadow-neo">
              <div className="relative w-20 h-20 rounded-xl bg-white dark:bg-zinc-900 border-2 border-black dark:border-white overflow-hidden flex items-center justify-center shadow-neo shrink-0">
                {profile?.logoUrl ? (
                  <img
                    src={profile.logoUrl}
                    alt="Company Logo"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-black dark:text-white" />
                )}
              </div>

              <div className="space-y-1.5 flex-1">
                <span className="block text-xs font-black uppercase tracking-wider text-black dark:text-white">
                  Company Branding Logo
                </span>
                <p className="text-xs text-slate-600 font-medium">
                  Displayed across job circular listings, verified scorecards, and public employer profile pages.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <label className="cursor-pointer bg-white dark:bg-zinc-900 border-2 border-black dark:border-white hover:bg-slate-50 text-black dark:text-white text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition inline-flex items-center">
                    <span>Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </label>
                  {profile?.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, logoUrl: '' })}
                      className="text-xs text-red-600 hover:text-red-800 font-black uppercase tracking-wider px-2 py-1.5"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1.5">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={profile?.companyName || ''}
                  onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-[#FFFDF5] text-xs font-bold text-black dark:text-white focus:outline-none focus:bg-white dark:bg-zinc-900 focus:shadow-neo transition"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1.5">
                  Company Website URL
                </label>
                <input
                  type="url"
                  value={profile?.companyWebsite || ''}
                  onChange={(e) => setProfile({ ...profile, companyWebsite: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-[#FFFDF5] text-xs font-bold text-black dark:text-white focus:outline-none focus:bg-white dark:bg-zinc-900 focus:shadow-neo transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1.5">
                  Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={profile?.contactPerson || ''}
                  onChange={(e) => setProfile({ ...profile, contactPerson: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-[#FFFDF5] text-xs font-bold text-black dark:text-white focus:outline-none focus:bg-white dark:bg-zinc-900 focus:shadow-neo transition"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={profile?.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-[#FFFDF5] text-xs font-bold text-black dark:text-white focus:outline-none focus:bg-white dark:bg-zinc-900 focus:shadow-neo transition"
                />
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t-2 border-black dark:border-white">
              <NeoButton
                type="submit"
                variant="primary"
                size="md"
                disabled={saving}
                className="w-full sm:w-auto"
              >
                {saving ? 'Saving...' : 'Save Company Details →'}
              </NeoButton>
            </div>
          </form>
        </div>

        {/* Password Change Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border-3 border-black dark:border-white shadow-neo-lg space-y-6">
          <div className="flex items-center gap-3 pb-6 border-b-2 border-black dark:border-white">
            <div className="w-10 h-10 rounded-xl bg-neo-yellow border-2 border-black dark:border-white flex items-center justify-center shadow-neo">
              <Key className="w-5 h-5 text-black dark:text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-black dark:text-white">Change Password</h2>
              <p className="text-xs font-semibold text-slate-600">
                Update account authentication credentials securely
              </p>
            </div>
          </div>

          {passwordStatus && (
            <div
              className={`p-3.5 rounded-xl border-2 border-black dark:border-white shadow-neo text-xs font-black ${
                passwordStatus.isError
                  ? 'bg-red-50 text-red-900'
                  : 'bg-neo-mint text-black dark:text-white'
              }`}
            >
              {passwordStatus.message}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black dark:border-white bg-[#FFFDF5] text-xs font-bold text-black dark:text-white focus:outline-none focus:bg-white dark:bg-zinc-900 focus:shadow-neo transition"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1">
                New Password (Min 6 Characters)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black dark:border-white bg-[#FFFDF5] text-xs font-bold text-black dark:text-white focus:outline-none focus:bg-white dark:bg-zinc-900 focus:shadow-neo transition"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black dark:border-white bg-[#FFFDF5] text-xs font-bold text-black dark:text-white focus:outline-none focus:bg-white dark:bg-zinc-900 focus:shadow-neo transition"
              />
            </div>

            <NeoButton
              type="submit"
              variant="black"
              size="sm"
              disabled={changingPassword}
              className="mt-2"
            >
              {changingPassword ? 'Updating Password...' : 'Update Password'}
            </NeoButton>
          </form>
        </div>
      </div>
    </div>
  );
};
