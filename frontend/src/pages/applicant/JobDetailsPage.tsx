import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { JobCircular, QuizAttempt, QuizAttemptState, Role } from '@skillverify/shared';
import { ShieldCheck, MapPin, Calendar, CheckCircle, AlertCircle, PlayCircle, BookOpen, Trophy, Sparkles } from 'lucide-react';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoCard } from '../../components/ui/NeoCard';
import { DecorativeSparkle } from '../../components/ui/DecorativeSparkle';

export const JobDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobCircular | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobAndAttempt();
  }, [id]);

  const loadJobAndAttempt = async () => {
    try {
      setLoading(true);
      const jobRes = await api.get(`/jobs/${id}`);
      setJob(jobRes.data.data);

      if (user) {
        try {
          const attemptRes = await api.get(`/quiz/attempt/${id}`);
          setAttempt(attemptRes.data.data);
        } catch {
          // No attempt yet
        }
      }
    } catch (err) {
      console.error('Error fetching job details', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-black dark:border-white border-t-main"></div>
        <p className="mt-4 font-black text-black dark:text-white text-sm">Loading Circular Specifications...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-zinc-900 rounded-base border-4 border-black dark:border-white shadow-neo text-center">
        <AlertCircle className="w-10 h-10 text-alert-red mx-auto mb-3" />
        <h2 className="text-xl font-black text-black dark:text-white">Job Circular Not Found</h2>
        <div className="mt-4">
          <NeoButton variant="primary" size="sm" onClick={() => navigate('/jobs')}>
            Browse Jobs
          </NeoButton>
        </div>
      </div>
    );
  }

  const isPassed =
    attempt?.state === QuizAttemptState.PASSED ||
    attempt?.state === QuizAttemptState.FINAL_PASSED;

  const isGroomingRequired = attempt?.state === QuizAttemptState.GROOMING_REQUIRED;
  const isFinalFailed = attempt?.state === QuizAttemptState.FINAL_FAILED || attempt?.state === QuizAttemptState.LOCKED;

  const userApplicantSkills: string[] = ((user as any)?.skills || []).map((s: string) => s.toLowerCase().trim());
  const matchedSkills = (job.requiredSkills || []).filter((s) => userApplicantSkills.includes(s.toLowerCase().trim()));
  const matchScore = job.requiredSkills?.length ? Math.round((matchedSkills.length / job.requiredSkills.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      <DecorativeSparkle size={32} colorClass="text-yellow-400" className="absolute top-4 right-10 hidden sm:block rotate-12" />

      <div className="bg-white dark:bg-zinc-900 rounded-base p-6 sm:p-10 border-4 border-black dark:border-white shadow-neo-lg space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-dashed border-black dark:border-white/20">
          <div>
            <NeoBadge variant="yellow" slanted="-rotate-1" size="sm" className="mb-2">
              {job.companyName}
            </NeoBadge>
            <h1 className="text-2xl sm:text-4xl font-black text-black dark:text-white mt-2">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-black dark:text-white/70 mt-2">
              <span className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 border border-black dark:border-white rounded-sm">
                <MapPin className="w-3.5 h-3.5 text-black dark:text-white stroke-[2.5px]" />
                {job.location}
              </span>
              <span className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 border border-black dark:border-white rounded-sm">
                <Calendar className="w-3.5 h-3.5 text-black dark:text-white stroke-[2.5px]" />
                Deadline: {new Date(job.deadline).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="bg-main p-4 rounded-base border-2 border-black dark:border-white shadow-neo-sm text-center sm:text-right shrink-0">
            <div className="text-[10px] text-black dark:text-white font-black uppercase tracking-wider">Required Passing Score</div>
            <div className="text-3xl font-black text-black dark:text-white">{job.passingScore}%</div>
          </div>
        </div>

        {/* Description */}
        <div className="py-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-black dark:text-white mb-2">Job Description</h3>
          <p className="text-sm font-medium text-black dark:text-white/80 leading-relaxed whitespace-pre-line bg-yellow-50/40 p-4 rounded-base border-2 border-black dark:border-white">
            {job.description}
          </p>
        </div>

        {/* Required Skills & Career Intelligence */}
        <div className="py-4 border-t-2 border-dashed border-black dark:border-white/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-black dark:text-white">Required Skills</h3>
            {user && user.role === Role.APPLICANT && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-black bg-yellow-100 border-2 border-black dark:border-white">
                <Sparkles className="w-3.5 h-3.5 text-black dark:text-white" />
                <span>{matchScore}% Profile Match</span>
                <span className="text-[10px] text-black dark:text-white/60 font-bold">({matchedSkills.length}/{job.requiredSkills.length} skills)</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.map((skill, i) => {
              const isMatch = userApplicantSkills.includes(skill.toLowerCase().trim());
              return (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-base border-2 border-black dark:border-white shadow-neo-sm ${
                    isMatch
                      ? 'bg-success-mint text-black dark:text-white'
                      : 'bg-white dark:bg-zinc-900 text-black dark:text-white'
                  }`}
                >
                  {isMatch ? (
                    <CheckCircle className="w-3.5 h-3.5 stroke-[3px]" />
                  ) : null}
                  <span>{skill}</span>
                  {!isMatch && user && user.role === Role.APPLICANT ? (
                    <span className="text-[10px] text-black dark:text-white font-black bg-yellow-200 px-1 rounded border border-black dark:border-white ml-1">
                      Missing
                    </span>
                  ) : null}
                </span>
              );
            })}
          </div>
        </div>

        {/* Skill Gate Banner / Action Section */}
        <div className="mt-8 pt-6 border-t-2 border-black dark:border-white">
          {/* RULE-001 Enforcement Banner */}
          {!user ? (
            <div className="bg-yellow-50 rounded-base p-6 border-2 border-black dark:border-white shadow-neo text-center">
              <ShieldCheck className="w-8 h-8 text-black dark:text-white mx-auto mb-2 stroke-[2.5px]" />
              <h4 className="text-base font-black text-black dark:text-white">Login to unlock skill verification</h4>
              <p className="text-xs font-bold text-black dark:text-white/70 mt-1 mb-4">
                You must complete the role assessment quiz before submitting your application.
              </p>
              <Link to="/login">
                <NeoButton variant="primary" size="md">
                  Sign In to Take Quiz
                </NeoButton>
              </Link>
            </div>
          ) : isPassed ? (
            <NeoCard variant="stacked-green" borderWidth="2" shadowSize="md" padding="md">
              <div className="flex items-start gap-4">
                <div className="bg-success-mint text-black dark:text-white p-2.5 rounded-base border-2 border-black dark:border-white shadow-neo-sm shrink-0">
                  <CheckCircle className="w-6 h-6 stroke-[3px]" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="text-base font-black text-black dark:text-white">Skill Gate: Verified & Passed!</h4>
                    <Link
                      to={`/leaderboard/${job._id}`}
                      className="text-xs font-black text-black dark:text-white hover:underline flex items-center gap-1"
                    >
                      <Trophy className="w-3.5 h-3.5 stroke-[2.5px]" />
                      View Role Leaderboard
                    </Link>
                  </div>
                  <p className="text-xs font-bold text-black dark:text-white/70 mt-1">
                    Your digital verified CV is automatically certified and visible to the employer on the leaderboard.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      disabled
                      className="bg-black dark:bg-white text-white dark:text-black font-black px-5 py-2.5 rounded-base text-xs border-2 border-black dark:border-white shadow-neo-sm cursor-default flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4 text-success-mint stroke-[3px]" />
                      <span>Application Active (Verified)</span>
                    </button>
                    <Link to="/cv-preview">
                      <NeoButton variant="secondary" size="sm">
                        View Generated CV
                      </NeoButton>
                    </Link>
                  </div>
                </div>
              </div>
            </NeoCard>
          ) : isGroomingRequired ? (
            <NeoCard variant="stacked-yellow" borderWidth="2" shadowSize="md" padding="md">
              <div className="flex items-start gap-4">
                <div className="bg-amber-300 text-black dark:text-white p-2.5 rounded-base border-2 border-black dark:border-white shadow-neo-sm shrink-0">
                  <BookOpen className="w-6 h-6 stroke-[2.5px]" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-black text-black dark:text-white">Grooming Course Required</h4>
                  <p className="text-xs font-bold text-black dark:text-white/70 mt-1">
                    You did not pass attempt 1. Complete the employer's structured course modules to unlock your final attempt.
                  </p>
                  <div className="mt-4">
                    <Link to={`/grooming/${job._id}`}>
                      <NeoButton variant="primary" size="md">
                        <PlayCircle className="w-4 h-4 mr-1.5 stroke-[3px]" />
                        <span>Open Grooming Course</span>
                      </NeoButton>
                    </Link>
                  </div>
                </div>
              </div>
            </NeoCard>
          ) : isFinalFailed ? (
            <div className="bg-red-50 rounded-base p-6 border-3 border-black dark:border-white shadow-neo text-center">
              <AlertCircle className="w-8 h-8 text-alert-red mx-auto mb-2 stroke-[2.5px]" />
              <h4 className="text-base font-black text-black dark:text-white">Assessment Limit Reached</h4>
              <p className="text-xs font-bold text-black dark:text-white/70 mt-1">
                You have utilized both quiz attempts for this circular. Applications for this role are currently locked.
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 rounded-base p-6 border-3 border-black dark:border-white shadow-neo flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-black dark:text-white stroke-[2.5px]" />
                  <h4 className="text-sm font-black text-black dark:text-white">Skill Gate Locked (RULE-001)</h4>
                </div>
                <p className="text-xs font-bold text-black dark:text-white/70 mt-1">
                  Pass the role-specific quiz ({job.passingScore}% minimum) to unlock application submission.
                </p>
              </div>
              <Link to={`/quiz/${job._id}`}>
                <NeoButton variant="primary" size="md">
                  Start Quiz Assessment
                </NeoButton>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
