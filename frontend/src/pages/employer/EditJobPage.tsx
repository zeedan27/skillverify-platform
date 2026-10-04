import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { JobCircular, UpdateJobDto, JobStatus } from '@skillverify/shared';
import { ArrowLeft, Save, AlertCircle, Lock, Edit3 } from 'lucide-react';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoBadge } from '../../components/ui/NeoBadge';

export const EditJobPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobCircular | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<JobStatus>(JobStatus.ACTIVE);
  const [passingScore, setPassingScore] = useState(70);
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [currency, setCurrency] = useState('BDT');

  const [hasAttempts, setHasAttempts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/jobs/${jobId}`);
      const j: JobCircular = res.data.data;
      setJob(j);
      setTitle(j.title);
      setDescription(j.description);
      setLocation(j.location);
      setSkillsInput(j.requiredSkills.join(', '));
      setDeadline(j.deadline.slice(0, 10));
      setStatus(j.status);
      setPassingScore(j.passingScore);
      if (j.salaryRange) {
        setMinSalary(j.salaryRange.min ? String(j.salaryRange.min) : '');
        setMaxSalary(j.salaryRange.max ? String(j.salaryRange.max) : '');
        setCurrency(j.salaryRange.currency || 'BDT');
      }

      // Check if candidates have already attempted this job
      try {
        const lbRes = await api.get(`/leaderboard/${jobId}`);
        if (lbRes.data.data?.totalCandidates > 0) {
          setHasAttempts(true);
        }
      } catch {
        // Leaderboard check non-blocking
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (minSalary && maxSalary && Number(minSalary) > Number(maxSalary)) {
      setError('Minimum salary cannot exceed maximum salary');
      return;
    }

    if (passingScore < 50 || passingScore > 100) {
      setError('RULE-009: Passing score must be between 50% and 100%');
      return;
    }

    setSaving(true);

    try {
      const skills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const salaryRange =
        minSalary || maxSalary
          ? {
              min: minSalary ? Number(minSalary) : 0,
              max: maxSalary ? Number(maxSalary) : Number(minSalary || 0),
              currency,
            }
          : undefined;

      const dto: UpdateJobDto = {
        title,
        description,
        location,
        requiredSkills: skills,
        salaryRange,
        deadline: new Date(deadline).toISOString(),
        passingScore: Number(passingScore),
        status,
      };

      await api.put(`/jobs/${jobId}`, dto);
      navigate('/employer/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update job circular');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] bg-grid-pattern flex justify-center items-center">
        <div className="p-8 rounded-2xl border-3 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-neo flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black dark:border-white"></div>
          <span className="text-xs font-black uppercase tracking-wider text-black dark:text-white">Loading Job Settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] bg-grid-pattern py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/employer/dashboard')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-neo text-xs font-black uppercase tracking-wider hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border-3 border-black dark:border-white shadow-neo-lg space-y-6">
          <div className="pb-6 border-b-2 border-black dark:border-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <NeoBadge variant="purple" size="sm" className="font-mono">
                  EDIT CIRCULAR
                </NeoBadge>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">
                  ID: {jobId?.slice(-6)}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">
                Update Circular Details
              </h1>
              <p className="text-xs font-semibold text-slate-600 mt-1">
                Refine requirements, compensation parameters, and live recruitment status.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-black dark:text-white">Status:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                className="px-3 py-1.5 rounded-xl border-2 border-black dark:border-white text-xs font-black bg-[#FFFDF5] shadow-neo focus:outline-none"
              >
                <option value={JobStatus.ACTIVE}>ACTIVE</option>
                <option value={JobStatus.CLOSED}>CLOSED</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-2 border-black dark:border-white shadow-neo text-red-900 text-xs font-bold rounded-xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1.5">
                Job Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-[#FFFDF5] text-xs font-bold text-black dark:text-white focus:outline-none focus:bg-white dark:bg-zinc-900 focus:shadow-neo transition"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1.5">
                Job Description & Scope *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-[#FFFDF5] text-xs font-medium text-black dark:text-white focus:outline-none focus:bg-white dark:bg-zinc-900 focus:shadow-neo transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1.5">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-[#FFFDF5] text-xs font-bold text-black dark:text-white focus:outline-none focus:bg-white dark:bg-zinc-900 focus:shadow-neo transition"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1.5">
                  Application Deadline *
                </label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-[#FFFDF5] text-xs font-bold text-black dark:text-white focus:outline-none focus:bg-white dark:bg-zinc-900 focus:shadow-neo transition"
                />
              </div>
            </div>

            {/* Compensation */}
            <div className="p-4 rounded-xl border-2 border-black dark:border-white bg-[#FFFDF5] shadow-neo space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-black dark:text-white block">
                Compensation Range (Optional)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Min Salary
                  </label>
                  <input
                    type="number"
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-xs font-bold text-black dark:text-white focus:outline-none focus:shadow-neo transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Max Salary
                  </label>
                  <input
                    type="number"
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-xs font-bold text-black dark:text-white focus:outline-none focus:shadow-neo transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-xs font-bold text-black dark:text-white focus:outline-none focus:shadow-neo transition"
                  >
                    <option value="BDT">BDT (৳)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1.5">
                  Required Skills (Comma separated) *
                </label>
                <input
                  type="text"
                  required
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-[#FFFDF5] text-xs font-bold text-black dark:text-white focus:outline-none focus:bg-white dark:bg-zinc-900 focus:shadow-neo transition"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white">
                    Passing Threshold (% Score) *
                  </label>
                  {hasAttempts && (
                    <span className="text-[10px] bg-amber-100 text-amber-900 border border-black dark:border-white font-black px-2 py-0.5 rounded flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Locked (Attempts Exist)
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min={50}
                  max={100}
                  disabled={hasAttempts}
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-[#FFFDF5] text-xs font-bold text-black dark:text-white focus:outline-none focus:bg-white dark:bg-zinc-900 focus:shadow-neo transition disabled:bg-slate-200 disabled:text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t-2 border-black dark:border-white">
              <button
                type="button"
                onClick={() => navigate('/employer/dashboard')}
                className="text-xs font-black uppercase text-slate-500 hover:text-black dark:text-white transition"
              >
                Cancel Changes
              </button>
              <NeoButton
                type="submit"
                variant="primary"
                size="md"
                disabled={saving}
                className="w-full sm:w-auto"
              >
                {saving ? 'Updating...' : 'Save Job Changes →'}
              </NeoButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
