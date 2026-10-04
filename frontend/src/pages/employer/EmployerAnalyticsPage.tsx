import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import {
  BarChart3,
  Users,
  CheckCircle2,
  BookOpen,
  Trophy,
  ArrowLeft,
  Percent,
  TrendingUp,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { NeoCard } from '../../components/ui/NeoCard';

interface AnalyticsData {
  jobId: string;
  jobTitle: string;
  passingScore: number;
  totalApplicants: number;
  totalVerified: number;
  passRate: number;
  averageScore: number;
  funnel: {
    stage1Attempts: number;
    stage1Passed: number;
    stage1Failed: number;
    stage2GroomingEnrolled: number;
    stage2GroomingCompleted: number;
    stage3FinalPassed: number;
    stage3FinalFailed: number;
  };
  distribution: {
    '0-49': number;
    '50-69': number;
    '70-79': number;
    '80-89': number;
    '90-100': number;
  };
}

export const EmployerAnalyticsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [jobId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/analytics/job/${jobId}`);
      setData(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load hiring analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] bg-grid-pattern py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        <div className="p-8 rounded-2xl border-3 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-neo flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black dark:border-white"></div>
          <span className="text-xs font-black uppercase tracking-wider text-black dark:text-white">
            Loading Assessment Analytics...
          </span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] bg-grid-pattern py-16 px-4 flex justify-center items-center">
        <div className="max-w-md w-full p-8 bg-white dark:bg-zinc-900 rounded-2xl border-3 border-black dark:border-white shadow-neo-lg text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
          <h3 className="text-lg font-black text-black dark:text-white">Analytics Unavailable</h3>
          <p className="text-xs text-slate-600 font-medium">{error || 'Could not retrieve data'}</p>
          <Link
            to="/employer/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-black dark:border-white bg-neo-yellow text-black dark:text-white text-xs font-black uppercase tracking-wider shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition"
          >
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const maxDistribution = Math.max(...Object.values(data.distribution), 1);

  return (
    <div className="min-h-screen bg-[#FFFDF5] bg-grid-pattern py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/employer/dashboard"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-neo text-xs font-black uppercase tracking-wider hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <Link
            to={`/employer/jobs/${jobId}/leaderboard`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-black dark:border-white bg-neo-yellow text-black dark:text-white text-xs font-black uppercase tracking-wider shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition"
          >
            <Trophy className="w-4 h-4 text-black dark:text-white" />
            <span>Candidate Leaderboard →</span>
          </Link>
        </div>

        {/* Hero Header Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border-3 border-black dark:border-white shadow-neo-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <NeoBadge variant="yellow" size="sm" className="font-mono">
                HIRING METRICS
              </NeoBadge>
              <NeoBadge variant="purple" size="sm" className="font-mono">
                CIRCULAR ANALYTICS
              </NeoBadge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">
              {data.jobTitle}
            </h1>
            <p className="text-xs font-semibold text-slate-600">
              End-to-end telemetry on assessment conversion, grooming completion, and score distribution.
            </p>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-black dark:border-white bg-[#FFFDF5] shadow-neo shrink-0">
            <span className="text-xs font-black uppercase text-slate-600">Passing Threshold:</span>
            <span className="text-lg font-black text-black dark:text-white bg-neo-mint px-2.5 py-0.5 rounded border-2 border-black dark:border-white font-mono">
              {data.passingScore}%
            </span>
          </div>
        </div>

        {/* Top-Level KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border-2 border-black dark:border-white shadow-neo space-y-2">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-[11px] font-black uppercase tracking-wider">Total Candidates</span>
              <Users className="w-4 h-4 text-black dark:text-white" />
            </div>
            <div className="text-3xl font-black text-black dark:text-white font-mono">{data.totalApplicants}</div>
            <span className="text-[10px] font-bold text-slate-500 block uppercase">
              Initiated Verification
            </span>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border-2 border-black dark:border-white shadow-neo space-y-2">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-[11px] font-black uppercase tracking-wider">Certified Passed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-600 font-mono">{data.totalVerified}</div>
            <span className="text-[10px] font-bold text-slate-500 block uppercase">
              Leaderboard Qualified
            </span>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border-2 border-black dark:border-white shadow-neo space-y-2">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-[11px] font-black uppercase tracking-wider">Pass Rate</span>
              <Percent className="w-4 h-4 text-black dark:text-white" />
            </div>
            <div className="text-3xl font-black text-black dark:text-white font-mono">{data.passRate}%</div>
            <span className="text-[10px] font-bold text-slate-500 block uppercase">
              Overall Conversion
            </span>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border-2 border-black dark:border-white shadow-neo space-y-2">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-[11px] font-black uppercase tracking-wider">Average Score</span>
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-black text-amber-600 font-mono">{data.averageScore}%</div>
            <span className="text-[10px] font-bold text-slate-500 block uppercase">
              Submission Benchmark
            </span>
          </div>
        </div>

        {/* Visual Pipeline Funnel */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border-3 border-black dark:border-white shadow-neo-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b-2 border-black dark:border-white">
            <div>
              <h2 className="text-lg font-black text-black dark:text-white">Hiring Pipeline Funnel</h2>
              <p className="text-xs font-semibold text-slate-600">
                Stage progression: Initial attempt → Grooming curriculum remediation → Final attempt
              </p>
            </div>
            <NeoBadge variant="yellow" size="sm" className="font-mono">
              3-STAGE ENGINE
            </NeoBadge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stage 1: Initial Attempt */}
            <div className="p-5 rounded-2xl border-2 border-black dark:border-white bg-[#FFFDF5] shadow-neo space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded border border-black dark:border-white bg-neo-yellow text-black dark:text-white font-mono">
                  STAGE 1
                </span>
                <span className="text-xs font-black text-black dark:text-white font-mono">
                  {data.funnel.stage1Attempts} Attempts
                </span>
              </div>
              <h3 className="text-sm font-black text-black dark:text-white">Initial Assessment</h3>

              <div className="space-y-2 pt-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-neo-mint/40 border border-black dark:border-white font-bold">
                  <span className="text-black dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-black dark:text-white" />
                    Passed Direct
                  </span>
                  <span className="font-mono font-black text-black dark:text-white">{data.funnel.stage1Passed}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-100 border border-black dark:border-white font-bold">
                  <span className="text-amber-900 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-900" />
                    Grooming Req.
                  </span>
                  <span className="font-mono font-black text-amber-900">{data.funnel.stage1Failed}</span>
                </div>
              </div>
            </div>

            {/* Stage 2: Grooming Course */}
            <div className="p-5 rounded-2xl border-2 border-black dark:border-white bg-[#FFFDF5] shadow-neo space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded border border-black dark:border-white bg-amber-200 text-amber-950 font-mono">
                  STAGE 2
                </span>
                <span className="text-xs font-black text-black dark:text-white font-mono">
                  {data.funnel.stage2GroomingEnrolled} Enrolled
                </span>
              </div>
              <h3 className="text-sm font-black text-black dark:text-white">Grooming Modules</h3>

              <div className="space-y-2 pt-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-neo-mint/40 border border-black dark:border-white font-bold">
                  <span className="text-black dark:text-white">100% Completed</span>
                  <span className="font-mono font-black text-black dark:text-white">{data.funnel.stage2GroomingCompleted}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-900 border border-black dark:border-white font-bold">
                  <span className="text-slate-600">In Progress</span>
                  <span className="font-mono font-black text-amber-700">
                    {Math.max(0, data.funnel.stage2GroomingEnrolled - data.funnel.stage2GroomingCompleted)}
                  </span>
                </div>
              </div>
            </div>

            {/* Stage 3: Final Re-Attempt */}
            <div className="p-5 rounded-2xl border-2 border-black dark:border-white bg-[#FFFDF5] shadow-neo space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded border border-black dark:border-white bg-neo-mint text-black dark:text-white font-mono">
                  STAGE 3
                </span>
                <span className="text-xs font-black text-black dark:text-white font-mono">
                  {data.funnel.stage3FinalPassed + data.funnel.stage3FinalFailed} Attempts
                </span>
              </div>
              <h3 className="text-sm font-black text-black dark:text-white">Final Re-Attempt</h3>

              <div className="space-y-2 pt-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-neo-mint/60 border border-black dark:border-white font-bold">
                  <span className="text-black dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-black dark:text-white" />
                    Final Passed
                  </span>
                  <span className="font-mono font-black text-black dark:text-white">{data.funnel.stage3FinalPassed}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-red-100 border border-black dark:border-white font-bold">
                  <span className="text-red-900 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-900" />
                    Locked Out
                  </span>
                  <span className="font-mono font-black text-red-900">{data.funnel.stage3FinalFailed}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Score Distribution Histogram */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border-3 border-black dark:border-white shadow-neo-lg space-y-6">
          <div className="pb-4 border-b-2 border-black dark:border-white">
            <h2 className="text-lg font-black text-black dark:text-white">Score Distribution</h2>
            <p className="text-xs font-semibold text-slate-600">
              Histogram of candidate performance scores across all quiz submissions
            </p>
          </div>

          <div className="grid grid-cols-5 gap-3 sm:gap-6 pt-4">
            {Object.entries(data.distribution).map(([range, count]) => {
              const heightPercent = Math.max(12, Math.round((count / maxDistribution) * 100));
              const isHigh = range === '90-100' || range === '80-89';
              const isPassing = range === '70-79';

              return (
                <div key={range} className="flex flex-col items-center gap-2">
                  <span className="text-xs font-black text-black dark:text-white font-mono">{count}</span>
                  <div className="w-full bg-[#FFFDF5] h-40 rounded-xl border-2 border-black dark:border-white flex items-end p-2 shadow-inner">
                    <div
                      className={`w-full rounded-lg border-2 border-black dark:border-white transition-all duration-700 ${
                        isHigh
                          ? 'bg-neo-mint shadow-neo'
                          : isPassing
                          ? 'bg-neo-yellow shadow-neo'
                          : 'bg-amber-300'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-black uppercase text-black dark:text-white font-mono">
                    {range}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
