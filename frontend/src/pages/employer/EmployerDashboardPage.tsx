import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { JobCircular } from '@skillverify/shared';
import { PlusCircle, FileQuestion, BookOpen, Trophy, Building2, BarChart3, Pencil } from 'lucide-react';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { DecorativeSparkle } from '../../components/ui/DecorativeSparkle';

export const EmployerDashboardPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobCircular[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployerJobs();
  }, []);

  const fetchEmployerJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs/employer/mine');
      setJobs(res.data.data);
    } catch (err) {
      console.error('Failed to load employer jobs', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <DecorativeSparkle size={32} colorClass="text-yellow-400" className="absolute top-4 right-10 hidden sm:block rotate-12" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b-2 border-dashed border-black dark:border-white/20 pb-6">
        <div>
          <NeoBadge variant="yellow" slanted="-rotate-1" size="sm" className="mb-2">
            Company Portal
          </NeoBadge>
          <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">
            Job Circulars & Skill Pipelines
          </h1>
          <p className="text-xs sm:text-sm font-bold text-black dark:text-white/60 mt-0.5">
            Manage your openings, attach question pools, and inspect verified candidate rankings.
          </p>
        </div>

        <Link to="/employer/jobs/create" className="self-start sm:self-auto">
          <NeoButton variant="primary" size="md">
            <PlusCircle className="w-4 h-4 mr-1.5 stroke-[3px]" />
            <span>Post New Job Circular</span>
          </NeoButton>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-black dark:border-white border-t-main"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-base p-12 border-4 border-black dark:border-white shadow-neo-lg text-center">
          <Building2 className="w-12 h-12 text-black dark:text-white/30 mx-auto mb-3" />
          <h3 className="text-lg font-black text-black dark:text-white">No Job Postings Yet</h3>
          <p className="text-xs font-bold text-black dark:text-white/60 mt-1 mb-6 max-w-md mx-auto">
            Create your first circular, attach a 10–20 question skill quiz, and setup a grooming course for retries.
          </p>
          <Link to="/employer/jobs/create">
            <NeoButton variant="primary" size="md">
              <PlusCircle className="w-4 h-4 mr-1.5 stroke-[3px]" />
              <span>Create Job Listing</span>
            </NeoButton>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white dark:bg-zinc-900 rounded-base p-6 border-3 border-black dark:border-white shadow-neo hover:shadow-neo-lg hover:-translate-y-0.5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-black text-black dark:text-white">{job.title}</h3>
                  <span
                    className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-sm border ${
                      job.status === 'active'
                        ? 'bg-success-mint border-black dark:border-white text-black dark:text-white'
                        : job.status === 'closed'
                        ? 'bg-slate-200 border-black dark:border-white/40 text-black dark:text-white'
                        : 'bg-red-200 border-black dark:border-white text-black dark:text-white'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <p className="text-xs font-bold text-black dark:text-white/70">
                  {job.salaryRange ? `${job.salaryRange.currency} ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()} • ` : ''}
                  {job.location} • Deadline: {new Date(job.deadline).toLocaleDateString()} • Passing Score: <strong className="text-black dark:text-white font-black">{job.passingScore}%</strong>
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.requiredSkills.map((s, idx) => (
                    <span key={idx} className="text-[10px] font-bold bg-yellow-50 text-black dark:text-white border border-black dark:border-white/50 px-2 py-0.5 rounded-sm">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-4 md:pt-0 border-t-2 md:border-t-0 border-dashed border-black dark:border-white/20">
                <Link
                  to={`/employer/jobs/${job._id}/edit`}
                  className="px-3 py-1.5 rounded-base text-xs font-black border-2 border-black dark:border-white bg-white dark:bg-zinc-900 hover:bg-yellow-50 text-black dark:text-white transition flex items-center gap-1.5 shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px]"
                >
                  <Pencil className="w-3.5 h-3.5 stroke-[2.5px]" />
                  <span>Edit</span>
                </Link>

                <Link
                  to={`/employer/jobs/${job._id}/quiz`}
                  className={`px-3 py-1.5 rounded-base text-xs font-black border-2 border-black dark:border-white transition flex items-center gap-1.5 shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] ${
                    job.quizId
                      ? 'bg-success-mint text-black dark:text-white'
                      : 'bg-yellow-200 text-black dark:text-white'
                  }`}
                >
                  <FileQuestion className="w-3.5 h-3.5 stroke-[2.5px]" />
                  <span>{job.quizId ? 'Quiz Attached' : 'Attach Quiz'}</span>
                </Link>

                <Link
                  to={`/employer/jobs/${job._id}/course`}
                  className={`px-3 py-1.5 rounded-base text-xs font-black border-2 border-black dark:border-white transition flex items-center gap-1.5 shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] ${
                    job.courseId
                      ? 'bg-purple-200 text-black dark:text-white'
                      : 'bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-yellow-50'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 stroke-[2.5px]" />
                  <span>{job.courseId ? 'Grooming Course' : 'Attach Course'}</span>
                </Link>

                <Link
                  to={`/employer/jobs/${job._id}/analytics`}
                  className="bg-blue-100 hover:bg-blue-200 text-black dark:text-white border-2 border-black dark:border-white px-3 py-1.5 rounded-base text-xs font-black transition flex items-center gap-1.5 shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px]"
                >
                  <BarChart3 className="w-3.5 h-3.5 stroke-[2.5px]" />
                  <span>Analytics</span>
                </Link>

                <Link to={`/employer/jobs/${job._id}/leaderboard`}>
                  <NeoButton variant="primary" size="sm">
                    <Trophy className="w-3.5 h-3.5 mr-1 stroke-[3px]" />
                    <span>Leaderboard</span>
                  </NeoButton>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
