import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Education, WorkExperience } from '@skillverify/shared';
import { Plus, Trash2, CheckCircle2, Briefcase, GraduationCap, Key, User, Sparkles, Globe, Copy, Check } from 'lucide-react';
import { resizeImageToBase64 } from '../../utils/image';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { NeoButton } from '../../components/ui/NeoButton';
import { DecorativeSparkle } from '../../components/ui/DecorativeSparkle';

export const ApplicantProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [badges, setBadges] = useState<any[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  const copyPublicLink = () => {
    if (!profile?.publicSlug) return;
    const url = `${window.location.origin}/verify/${profile.publicSlug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

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
      const [profileRes, badgesRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/badges/me').catch(() => ({ data: { data: [] } })),
      ]);
      setProfile(profileRes.data.data);
      setBadges(badgesRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load profile', err);
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resized = await resizeImageToBase64(file, 256, 256, 0.85);
        setProfile({ ...profile, profilePhotoUrl: resized });
      } catch (err) {
        console.error('Failed to resize image', err);
      }
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !profile.skills?.includes(skillInput.trim())) {
      setProfile({ ...profile, skills: [...(profile.skills || []), skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills.filter((s: string) => s !== skill) });
  };

  const addEducation = () => {
    const newEdu: Education = {
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startYear: new Date().getFullYear() - 4,
      endYear: new Date().getFullYear(),
      isCurrent: false,
    };
    setProfile({
      ...profile,
      education: [...(profile.education || []), newEdu],
    });
  };

  const updateEducation = (index: number, field: keyof Education, value: any) => {
    const updated = [...(profile.education || [])];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, education: updated });
  };

  const removeEducation = (index: number) => {
    setProfile({
      ...profile,
      education: (profile.education || []).filter((_: any, i: number) => i !== index),
    });
  };

  const addExperience = () => {
    const newExp: WorkExperience = {
      company: '',
      title: '',
      description: '',
      startDate: new Date().toISOString().slice(0, 7),
      endDate: '',
      isCurrent: true,
    };
    setProfile({
      ...profile,
      experience: [...(profile.experience || []), newExp],
    });
  };

  const updateExperience = (index: number, field: keyof WorkExperience, value: any) => {
    const updated = [...(profile.experience || [])];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, experience: updated });
  };

  const removeExperience = (index: number) => {
    setProfile({
      ...profile,
      experience: (profile.experience || []).filter((_: any, i: number) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-black dark:border-white border-t-main"></div>
        <p className="mt-4 font-black text-black dark:text-white text-sm">Loading Candidate Identity...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 relative">
      <DecorativeSparkle size={32} colorClass="text-yellow-400" className="absolute top-4 right-8 hidden sm:block rotate-12" />

      {/* Profile Details Form */}
      <div className="bg-white dark:bg-zinc-900 rounded-base p-6 sm:p-10 border-4 border-black dark:border-white shadow-neo-lg text-black dark:text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-dashed border-black dark:border-white/20">
          <div>
            <NeoBadge variant="yellow" slanted="-rotate-1" size="sm" className="mb-2">
              Candidate Identity
            </NeoBadge>
            <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight mt-1">Applicant Profile</h1>
            <p className="text-xs sm:text-sm font-bold text-black dark:text-white/60 mt-0.5">
              This information automatically generates your verified digital CV.
            </p>
          </div>
          {savedSuccess && (
            <NeoBadge variant="green" size="md">
              <CheckCircle2 className="w-4 h-4 stroke-[3px]" />
              <span>Saved Successfully</span>
            </NeoBadge>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-8 mt-6">
          {/* Avatar Upload Section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-5 bg-yellow-50/50 rounded-base border-2 border-black dark:border-white shadow-neo-sm">
            <div className="size-20 rounded-base bg-main border-3 border-black dark:border-white overflow-hidden flex items-center justify-center shadow-neo-sm shrink-0">
              {profile?.profilePhotoUrl ? (
                <img
                  src={profile.profilePhotoUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-black text-black dark:text-white">
                  {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
            </div>

            <div className="space-y-1.5 flex-1">
              <span className="block text-xs font-black uppercase text-black dark:text-white">Profile Photo</span>
              <p className="text-[11px] font-bold text-black dark:text-white/60">
                Upload a professional headshot. Image is optimized and displayed on your verified digital CV.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <label className="cursor-pointer bg-white dark:bg-zinc-900 border-2 border-black dark:border-white text-black dark:text-white text-xs font-black px-3.5 py-1.5 rounded-base shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] transition">
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
                {profile?.profilePhotoUrl && (
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, profilePhotoUrl: '' })}
                    className="text-xs text-alert-red font-black px-2 py-1.5 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Basic Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={profile?.fullName || ''}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-base border-2 border-black dark:border-white text-sm font-bold bg-white dark:bg-zinc-900 focus:bg-yellow-50 focus:outline-none shadow-neo-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Phone Number</label>
              <input
                type="text"
                value={profile?.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-base border-2 border-black dark:border-white text-sm font-bold bg-white dark:bg-zinc-900 focus:bg-yellow-50 focus:outline-none shadow-neo-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Professional Headline</label>
            <input
              type="text"
              value={profile?.headline || ''}
              onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
              placeholder="e.g. Full-Stack Developer | React & NestJS Specialist"
              className="w-full px-4 py-2.5 rounded-base border-2 border-black dark:border-white text-sm font-bold bg-white dark:bg-zinc-900 focus:bg-yellow-50 focus:outline-none shadow-neo-sm"
            />
          </div>

          {/* Public Portfolio Settings RULE-023 */}
          <div className="p-5 bg-yellow-50 rounded-base border-2 border-black dark:border-white space-y-4 shadow-neo-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Globe className="w-5 h-5 text-black dark:text-white stroke-[2.5px] shrink-0" />
                <div>
                  <h3 className="text-xs font-black text-black dark:text-white uppercase">Public Verified Portfolio (RULE-023)</h3>
                  <p className="text-[11px] font-bold text-black dark:text-white/60">Allow employers and peers to verify your skill badges and assessment scores.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!profile?.isPublic}
                  onChange={(e) => setProfile({ ...profile, isPublic: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full border-2 border-black dark:border-white peer peer-checked:after:translate-x-full peer-checked:after:border-black dark:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-zinc-900 after:border-2 after:border-black dark:border-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-main"></div>
              </label>
            </div>

            {profile?.isPublic && (
              <div className="pt-3 space-y-3 border-t-2 border-dashed border-black dark:border-white/20">
                <div>
                  <label className="block text-[11px] font-black text-black dark:text-white uppercase mb-1.5">
                    Custom Portfolio URL Slug
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-black dark:text-white/60 font-mono font-bold select-none hidden sm:inline">
                      {window.location.origin}/verify/
                    </span>
                    <input
                      type="text"
                      placeholder="your-handle"
                      value={profile?.publicSlug || ''}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          publicSlug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
                        })
                      }
                      className="flex-1 px-3 py-1.5 rounded-base border-2 border-black dark:border-white text-xs font-mono font-bold bg-white dark:bg-zinc-900 focus:outline-none shadow-neo-sm"
                    />
                    {profile?.publicSlug && (
                      <button
                        type="button"
                        onClick={copyPublicLink}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-base bg-white dark:bg-zinc-900 border-2 border-black dark:border-white text-xs font-black text-black dark:text-white shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] transition shrink-0"
                      >
                        {copiedLink ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-700 stroke-[3px]" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 stroke-[2.5px]" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[11px] font-bold text-black dark:text-white/60 italic">
                  🔒 RULE-023: Your contact details (email and phone) are NEVER revealed on your public portfolio page. Only verified skill badges and quiz scores are showcased.
                </p>
              </div>
            )}
          </div>

          {/* Skills Management */}
          <div>
            <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Skills & Competencies</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Add a skill (e.g. TypeScript, React, Docker)..."
                className="flex-1 px-4 py-2.5 rounded-base border-2 border-black dark:border-white font-bold text-xs bg-white dark:bg-zinc-900 focus:bg-yellow-50 focus:outline-none shadow-neo-sm"
              />
              <NeoButton
                type="button"
                onClick={addSkill}
                variant="primary"
                size="sm"
              >
                <Plus className="w-3.5 h-3.5 mr-1 stroke-[3px]" />
                Add Skill
              </NeoButton>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile?.skills?.map((skill: string, i: number) => (
                <span key={i} className="inline-flex items-center gap-1.5 text-xs font-black bg-yellow-200 text-black dark:text-white border-2 border-black dark:border-white px-3 py-1 rounded-sm shadow-neo-sm">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="text-black dark:text-white/60 hover:text-alert-red ml-1">
                    <Trash2 className="w-3.5 h-3.5 stroke-[2.5px]" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Verified Skill Badges (RULE-020) */}
          <div className="pt-4 border-t-2 border-dashed border-black dark:border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-black dark:text-white stroke-[2.5px]" />
                <span className="text-xs font-black uppercase text-black dark:text-white">Verified Skill Badges ({badges.length})</span>
              </div>
              <NeoBadge variant="yellow" size="sm">
                Cryptographically Verified
              </NeoBadge>
            </div>

            {badges.length === 0 ? (
              <div className="p-4 rounded-base bg-yellow-50 border-2 border-black dark:border-white border-dashed text-center text-xs font-bold text-black dark:text-white/60">
                Pass job circular assessments to earn certified Gold, Silver, and Bronze skill badges.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {badges.map((b, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-base border-3 border-black dark:border-white shadow-neo-sm flex flex-col justify-between ${
                      b.tier === 'gold'
                        ? 'bg-yellow-200 text-black dark:text-white'
                        : b.tier === 'silver'
                        ? 'bg-slate-100 text-black dark:text-white'
                        : 'bg-amber-100 text-black dark:text-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-sm bg-black dark:bg-white text-white dark:text-black">
                          {b.tier} tier
                        </span>
                        <span className="text-sm font-black">{b.score}%</span>
                      </div>
                      <h4 className="text-xs font-black truncate">{b.skill}</h4>
                      <p className="text-[10px] font-bold text-black dark:text-white/60 truncate">{b.jobTitle} • {b.companyName}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-black dark:border-white/20 flex items-center justify-between text-[10px]">
                      <span className="text-black dark:text-white font-mono font-black tracking-wider">{b.verifyCode}</span>
                      <span className="text-[10px] text-green-800 font-black">✓ Valid</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Work Experience Section */}
          <div className="space-y-4 pt-4 border-t-2 border-dashed border-black dark:border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-black dark:text-white stroke-[2.5px]" />
                <span className="text-xs font-black uppercase text-black dark:text-white">Work Experience</span>
              </div>
              <NeoButton
                type="button"
                onClick={addExperience}
                variant="secondary"
                size="sm"
              >
                <Plus className="w-3.5 h-3.5 mr-1 stroke-[3px]" />
                <span>Add Position</span>
              </NeoButton>
            </div>

            {(!profile?.experience || profile.experience.length === 0) ? (
              <p className="text-xs font-bold text-black dark:text-white/60 italic bg-yellow-50 p-4 rounded-base border-2 border-black dark:border-white text-center">
                No work experience added yet. Add past employment to enrich your verified CV.
              </p>
            ) : (
              profile.experience.map((exp: WorkExperience, idx: number) => (
                <div key={idx} className="p-4 rounded-base border-2 border-black dark:border-white bg-slate-50 space-y-3 shadow-neo-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-black dark:text-white">Role #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeExperience(idx)}
                      className="text-black dark:text-white/60 hover:text-alert-red p-1"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2.5px]" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={exp.company}
                      onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                      className="px-3.5 py-2 rounded-base border-2 border-black dark:border-white text-xs font-bold bg-white dark:bg-zinc-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={exp.title}
                      onChange={(e) => updateExperience(idx, 'title', e.target.value)}
                      className="px-3.5 py-2 rounded-base border-2 border-black dark:border-white text-xs font-bold bg-white dark:bg-zinc-900 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    <input
                      type="text"
                      placeholder="Start (e.g. Jan 2022)"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(idx, 'startDate', e.target.value)}
                      className="px-3.5 py-2 rounded-base border-2 border-black dark:border-white text-xs font-bold bg-white dark:bg-zinc-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="End (e.g. Present)"
                      disabled={exp.isCurrent}
                      value={exp.isCurrent ? 'Present' : exp.endDate || ''}
                      onChange={(e) => updateExperience(idx, 'endDate', e.target.value)}
                      className="px-3.5 py-2 rounded-base border-2 border-black dark:border-white text-xs font-bold bg-white dark:bg-zinc-900 disabled:bg-slate-200 focus:outline-none"
                    />
                    <label className="flex items-center gap-2 text-xs text-black dark:text-white font-black cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exp.isCurrent}
                        onChange={(e) => updateExperience(idx, 'isCurrent', e.target.checked)}
                        className="rounded border-2 border-black dark:border-white text-black dark:text-white"
                      />
                      <span>Current Job</span>
                    </label>
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Key responsibilities and achievements..."
                    value={exp.description || ''}
                    onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-base border-2 border-black dark:border-white text-xs font-medium bg-white dark:bg-zinc-900 focus:outline-none"
                  />
                </div>
              ))
            )}
          </div>

          {/* Education Section */}
          <div className="space-y-4 pt-4 border-t-2 border-dashed border-black dark:border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-black dark:text-white stroke-[2.5px]" />
                <span className="text-xs font-black uppercase text-black dark:text-white">Education & Credentials</span>
              </div>
              <NeoButton
                type="button"
                onClick={addEducation}
                variant="secondary"
                size="sm"
              >
                <Plus className="w-3.5 h-3.5 mr-1 stroke-[3px]" />
                <span>Add Education</span>
              </NeoButton>
            </div>

            {(!profile?.education || profile.education.length === 0) ? (
              <p className="text-xs font-bold text-black dark:text-white/60 italic bg-yellow-50 p-4 rounded-base border-2 border-black dark:border-white text-center">
                No education added yet. Add your university or certifications.
              </p>
            ) : (
              profile.education.map((edu: Education, idx: number) => (
                <div key={idx} className="p-4 rounded-base border-2 border-black dark:border-white bg-slate-50 space-y-3 shadow-neo-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-black dark:text-white">Credential #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeEducation(idx)}
                      className="text-black dark:text-white/60 hover:text-alert-red p-1"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2.5px]" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Institution (e.g. BUET)"
                      value={edu.institution}
                      onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                      className="px-3.5 py-2 rounded-base border-2 border-black dark:border-white text-xs font-bold bg-white dark:bg-zinc-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Degree (e.g. BSc)"
                      value={edu.degree}
                      onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                      className="px-3.5 py-2 rounded-base border-2 border-black dark:border-white text-xs font-bold bg-white dark:bg-zinc-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Field of Study (e.g. CSE)"
                      value={edu.fieldOfStudy}
                      onChange={(e) => updateEducation(idx, 'fieldOfStudy', e.target.value)}
                      className="px-3.5 py-2 rounded-base border-2 border-black dark:border-white text-xs font-bold bg-white dark:bg-zinc-900 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    <input
                      type="number"
                      placeholder="Start Year"
                      value={edu.startYear}
                      onChange={(e) => updateEducation(idx, 'startYear', Number(e.target.value))}
                      className="px-3.5 py-2 rounded-base border-2 border-black dark:border-white text-xs font-bold bg-white dark:bg-zinc-900 focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="End Year"
                      disabled={edu.isCurrent}
                      value={edu.isCurrent ? '' : edu.endYear || ''}
                      onChange={(e) => updateEducation(idx, 'endYear', Number(e.target.value))}
                      className="px-3.5 py-2 rounded-base border-2 border-black dark:border-white text-xs font-bold bg-white dark:bg-zinc-900 disabled:bg-slate-200 focus:outline-none"
                    />
                    <label className="flex items-center gap-2 text-xs text-black dark:text-white font-black cursor-pointer">
                      <input
                        type="checkbox"
                        checked={edu.isCurrent}
                        onChange={(e) => updateEducation(idx, 'isCurrent', e.target.checked)}
                        className="rounded border-2 border-black dark:border-white text-black dark:text-white"
                      />
                      <span>Currently Studying</span>
                    </label>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end pt-4 border-t-2 border-black dark:border-white">
            <NeoButton
              type="submit"
              disabled={saving}
              variant="primary"
              size="lg"
            >
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </NeoButton>
          </div>
        </form>
      </div>

      {/* Security & Password Change */}
      <div className="bg-white dark:bg-zinc-900 rounded-base p-6 sm:p-10 border-4 border-black dark:border-white shadow-neo-lg text-black dark:text-white">
        <div className="flex items-center gap-3 pb-6 border-b-2 border-dashed border-black dark:border-white/20">
          <Key className="w-5 h-5 text-black dark:text-white stroke-[2.5px]" />
          <div>
            <h2 className="text-lg font-black text-black dark:text-white">Change Password</h2>
            <p className="text-xs font-bold text-black dark:text-white/60">Update your account authentication credentials</p>
          </div>
        </div>

        {passwordStatus && (
          <div
            className={`mt-4 p-3.5 rounded-base text-xs font-black border-2 border-black dark:border-white shadow-neo-sm ${
              passwordStatus.isError ? 'bg-red-100 text-black dark:text-white' : 'bg-success-mint text-black dark:text-white'
            }`}
          >
            {passwordStatus.message}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 mt-6 max-w-md">
          <div>
            <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-base border-2 border-black dark:border-white text-sm font-bold bg-white dark:bg-zinc-900 focus:outline-none shadow-neo-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-base border-2 border-black dark:border-white text-sm font-bold bg-white dark:bg-zinc-900 focus:outline-none shadow-neo-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-black dark:text-white mb-1.5">Confirm New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-base border-2 border-black dark:border-white text-sm font-bold bg-white dark:bg-zinc-900 focus:outline-none shadow-neo-sm"
            />
          </div>

          <NeoButton
            type="submit"
            disabled={changingPassword}
            variant="black"
            size="md"
          >
            {changingPassword ? 'Updating Password...' : 'Update Password'}
          </NeoButton>
        </form>
      </div>
    </div>
  );
};
