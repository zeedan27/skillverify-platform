import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { CreateJobDto } from '@skillverify/shared';
import { PlusCircle, ArrowLeft, Briefcase, DollarSign, Calendar, Sparkles, AlertCircle } from 'lucide-react';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoBadge } from '../../components/ui/NeoBadge';

export const CreateJobPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [deadline, setDeadline] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [currency, setCurrency] = useState('BDT');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (new Date(deadline).getTime() <= Date.now()) {
      setError('Deadline must be a future date');
      return;
    }

    if (passingScore < 50 || passingScore > 100) {
      setError('RULE-009: Passing score must be between 50% and 100%');
      return;
    }

    if (minSalary && maxSalary && Number(minSalary) > Number(maxSalary)) {
      setError('Minimum salary cannot exceed maximum salary');
      return;
    }

    setSubmitting(true);

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

      const dto: CreateJobDto = {
        title,
        description,
        location,
        requiredSkills: skills,
        salaryRange,
        deadline: new Date(deadline).toISOString(),
        passingScore: Number(passingScore),
      };

      const res = await api.post('/jobs', dto);
      navigate(`/employer/jobs/${res.data.data._id}/quiz`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create job circular');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] bg-grid-pattern py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-neo text-xs font-black uppercase tracking-wider hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portal</span>
        </button>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border-3 border-black dark:border-white shadow-neo-lg space-y-6">
          <div className="pb-6 border-b-2 border-black dark:border-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <NeoBadge variant="yellow" size="sm" className="font-mono">
                  NEW CIRCULAR
                </NeoBadge>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Step 1 of 3: Role Parameters
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">
                Create Job Circular
              </h1>
              <p className="text-xs font-semibold text-slate-600 mt-1">
                Define position parameters. In subsequent steps, configure your randomized question pool and grooming materials.
              </p>
            </div>
            <div className="hidden sm:flex w-12 h-12 rounded-xl bg-neo-yellow border-2 border-black dark:border-white items-center justify-center shadow-neo">
              <Briefcase className="w-6 h-6 text-black dark:text-white" />
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
                placeholder="e.g. Lead Full-Stack TypeScript Engineer"
                className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-[#FFFDF5] text-xs font-bold text-black dark:text-white focus:outline-none focus:bg-white dark:bg-zinc-900 focus:shadow-neo transition placeholder:text-slate-400"
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
                placeholder="Detailed team responsibilities, technical requirements, and core engineering expectations..."
                className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-[#FFFDF5] text-xs font-medium text-black dark:text-white focus:outline-none focus:bg-white dark:bg-zinc-900 focus:shadow-neo transition placeholder:text-slate-400"
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
                  placeholder="e.g. Remote / Dhaka, Bangladesh"
                  className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-[#FFFDF5] text-xs font-bold text-black dark:text-white focus:outline-none focus:bg-white dark:bg-zinc-900 focus:shadow-neo transition placeholder:text-slate-400"
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
                    placeholder="e.g. 60000"
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
                    placeholder="e.g. 100000"
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
                  placeholder="React, TypeScript, NestJS, MongoDB"
                  className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-[#FFFDF5] text-xs font-bold text-black dark:text-white focus:outline-none focus:bg-white dark:bg-zinc-900 focus:shadow-neo transition placeholder:text-slate-400"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white">
                    Passing Threshold (% Score) *
                  </label>
                  <span className="text-[10px] font-mono font-bold text-slate-500">RULE-009 (50-100%)</span>
                </div>
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-white bg-[#FFFDF5] text-xs font-bold text-black dark:text-white focus:outline-none focus:bg-white dark:bg-zinc-900 focus:shadow-neo transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t-2 border-black dark:border-white">
              <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                Next: Build Randomized Question Pool
              </span>
              <NeoButton
                type="submit"
                variant="primary"
                size="md"
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                {submitting ? 'Creating Circular...' : 'Save & Attach Skill Quiz →'}
              </NeoButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
