import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { QuizAttemptState } from '@skillverify/shared';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  BookOpen,
  Trophy,
  ArrowRight,
  AlertCircle,
  FileCheck,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  MessageSquare,
  ExternalLink,
  Video,
} from 'lucide-react';
import { MessageThreadModal } from '../../components/pipeline/MessageThreadModal';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { NeoButton } from '../../components/ui/NeoButton';
import { DecorativeSparkle } from '../../components/ui/DecorativeSparkle';

interface ApplicationItem {
  attemptId: string;
  jobId: string;
  employerId?: string;
  jobTitle: string;
  companyName: string;
  location: string;
  deadline: string;
  passingScore: number;
  state: QuizAttemptState;
  attempts: {
    attemptNumber: 1 | 2;
    score: number;
    submittedAt: string;
    answers: number[];
  }[];
  latestScore: number | null;
  courseProgress: {
    completed: boolean;
    completedCount: number;
    totalCount: number;
    percent: number;
  } | null;
  updatedAt: string;
}

export const MyApplicationsPage: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [pipelineDetails, setPipelineDetails] = useState<
    Record<string, { interview?: any; offer?: any }>
  >({});
  const [activeMessageApp, setActiveMessageApp] = useState<{
    jobId: string;
    partnerId: string;
    partnerName: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/quiz/my-applications');
      const apps: ApplicationItem[] = res.data.data;
      setApplications(apps);

      const details: Record<string, { interview?: any; offer?: any }> = {};
      await Promise.all(
        apps
          .filter(
            (a) =>
              a.state === QuizAttemptState.PASSED || a.state === QuizAttemptState.FINAL_PASSED,
          )
          .map(async (a) => {
            const [interviewRes, offerRes] = await Promise.all([
              api.get(`/leaderboard/${a.jobId}/candidate/${user?._id || (user as any)?.sub}/interview`).catch(() => null),
              api.get(`/leaderboard/${a.jobId}/candidate/${user?._id || (user as any)?.sub}/offer`).catch(() => null),
            ]);
            details[a.jobId] = {
              interview: interviewRes?.data?.data || null,
              offer: offerRes?.data?.data || null,
            };
          }),
      );
      setPipelineDetails(details);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load your applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (app: ApplicationItem) => {
    switch (app.state) {
      case QuizAttemptState.PASSED:
      case QuizAttemptState.FINAL_PASSED:
        return (
          <NeoBadge variant="green" size="sm">
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[3px]" />
            <span>Skill Verified ({app.state === QuizAttemptState.FINAL_PASSED ? 'Final Pass' : 'Passed'})</span>
          </NeoBadge>
        );
      case QuizAttemptState.GROOMING_REQUIRED:
        return (
          <NeoBadge variant="amber" size="sm">
            <BookOpen className="w-3.5 h-3.5 stroke-[2.5px]" />
            <span>Grooming Required</span>
          </NeoBadge>
        );
      case QuizAttemptState.GROOMING_COMPLETE:
        return (
          <NeoBadge variant="yellow" size="sm">
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[3px]" />
            <span>Ready for Final Attempt</span>
          </NeoBadge>
        );
      case QuizAttemptState.FINAL_FAILED:
      case QuizAttemptState.LOCKED:
        return (
          <NeoBadge variant="red" size="sm">
            <AlertCircle className="w-3.5 h-3.5 stroke-[3px]" />
            <span>Assessment Locked</span>
          </NeoBadge>
        );
      default:
        return (
          <NeoBadge variant="white" size="sm">
            <Clock className="w-3.5 h-3.5 stroke-[2.5px]" />
            <span>In Progress</span>
          </NeoBadge>
        );
    }
  };

  const passedCount = applications.filter(
    (a) => a.state === QuizAttemptState.PASSED || a.state === QuizAttemptState.FINAL_PASSED
  ).length;

  const groomingCount = applications.filter(
    (a) => a.state === QuizAttemptState.GROOMING_REQUIRED
  ).length;

  const readyForFinalCount = applications.filter(
    (a) => a.state === QuizAttemptState.GROOMING_COMPLETE
  ).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-black dark:border-white border-t-main"></div>
        <p className="mt-4 font-black text-black dark:text-white text-sm">Loading Applications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
      <DecorativeSparkle size={32} colorClass="text-yellow-400" className="absolute top-4 right-10 hidden sm:block rotate-12" />

      {/* Header */}
      <div className="border-b-2 border-dashed border-black dark:border-white/20 pb-6">
        <NeoBadge variant="yellow" slanted="-rotate-1" size="sm" className="mb-2">
          Applicant Dashboard
        </NeoBadge>
        <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight mt-1">
          My Applications & Skill Pipeline
        </h1>
        <p className="text-xs sm:text-sm font-bold text-black dark:text-white/60 mt-1">
          Monitor your skill verification assessments, grooming progress, and candidate leaderboard rankings.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-base p-5 border-2 border-black dark:border-white shadow-neo">
          <div className="flex items-center justify-between text-black dark:text-white/60 mb-1 font-black text-xs uppercase">
            <span>Total Applied</span>
            <Briefcase className="w-4 h-4 text-black dark:text-white stroke-[2.5px]" />
          </div>
          <div className="text-2xl font-black text-black dark:text-white">{applications.length}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-base p-5 border-2 border-black dark:border-white shadow-neo">
          <div className="flex items-center justify-between text-black dark:text-white/60 mb-1 font-black text-xs uppercase">
            <span>Skill Verified</span>
            <CheckCircle2 className="w-4 h-4 text-green-700 stroke-[2.5px]" />
          </div>
          <div className="text-2xl font-black text-green-700">{passedCount}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-base p-5 border-2 border-black dark:border-white shadow-neo">
          <div className="flex items-center justify-between text-black dark:text-white/60 mb-1 font-black text-xs uppercase">
            <span>In Grooming</span>
            <BookOpen className="w-4 h-4 text-amber-600 stroke-[2.5px]" />
          </div>
          <div className="text-2xl font-black text-amber-600">{groomingCount}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-base p-5 border-2 border-black dark:border-white shadow-neo">
          <div className="flex items-center justify-between text-black dark:text-white/60 mb-1 font-black text-xs uppercase">
            <span>Final Ready</span>
            <Trophy className="w-4 h-4 text-black dark:text-white stroke-[2.5px]" />
          </div>
          <div className="text-2xl font-black text-black dark:text-white">{readyForFinalCount}</div>
        </div>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-base p-12 text-center border-4 border-black dark:border-white shadow-neo">
          <Building2 className="w-12 h-12 text-black dark:text-white/30 mx-auto mb-3" />
          <h3 className="text-base font-black text-black dark:text-white">No applications initiated yet</h3>
          <p className="text-xs font-bold text-black dark:text-white/60 mt-1 mb-6">
            Browse open circulars and take role assessments to certify your skills.
          </p>
          <Link to="/jobs">
            <NeoButton variant="primary" size="md">
              <span>Explore Open Jobs</span>
              <ArrowRight className="w-4 h-4 ml-1.5 stroke-[3px]" />
            </NeoButton>
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {applications.map((app) => (
            <div
              key={app.attemptId}
              className="bg-white dark:bg-zinc-900 rounded-base p-6 border-3 border-black dark:border-white shadow-neo hover:shadow-neo-lg hover:-translate-y-0.5 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-dashed border-black dark:border-white/20">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-black text-black dark:text-white uppercase tracking-wider bg-yellow-200 border border-black dark:border-white px-2.5 py-0.5 rounded-sm">
                      {app.companyName}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-black dark:text-white/60">
                      <MapPin className="w-3 h-3 text-black dark:text-white" />
                      <span>{app.location}</span>
                    </div>
                  </div>
                  <h2 className="text-lg font-black text-black dark:text-white">{app.jobTitle}</h2>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(app)}
                </div>
              </div>

              {/* Progress & Scores Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
                <div className="bg-yellow-50/60 rounded-base p-3.5 border-2 border-black dark:border-white shadow-neo-sm">
                  <span className="text-black dark:text-white/60 font-black block mb-1 uppercase text-[10px]">Assessment Performance</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-black dark:text-white text-sm">
                      Attempts: {app.attempts.length}/2
                    </span>
                    {app.latestScore !== null && (
                      <span className="font-black text-black dark:text-white bg-main border border-black dark:border-white px-2 py-0.5 rounded-sm">
                        Latest: {app.latestScore}% (Pass: {app.passingScore}%)
                      </span>
                    )}
                  </div>
                </div>

                {app.courseProgress && (
                  <div className="bg-yellow-50/60 rounded-base p-3.5 border-2 border-black dark:border-white shadow-neo-sm sm:col-span-2">
                    <div className="flex items-center justify-between mb-1.5 font-black text-xs">
                      <span className="text-black dark:text-white/70">
                        Grooming Course Progress ({app.courseProgress.completedCount}/{app.courseProgress.totalCount} Modules)
                      </span>
                      <span className="text-black dark:text-white">{app.courseProgress.percent}%</span>
                    </div>
                    <div className="w-full bg-white dark:bg-zinc-900 border border-black dark:border-white h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          app.courseProgress.completed ? 'bg-success-mint' : 'bg-main'
                        }`}
                        style={{ width: `${app.courseProgress.percent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Interview Invitation Banner */}
              {pipelineDetails[app.jobId]?.interview && (
                <div className="bg-green-100 border-2 border-black dark:border-white rounded-base p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-neo-sm">
                  <div className="flex items-start gap-3">
                    <div className="size-9 rounded-base bg-white dark:bg-zinc-900 border-2 border-black dark:border-white text-black dark:text-white flex items-center justify-center shrink-0 shadow-neo-sm">
                      <Calendar className="w-5 h-5 stroke-[2.5px]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-black dark:text-white uppercase">Interview Scheduled!</h4>
                      <p className="text-xs text-black dark:text-white font-bold mt-0.5">
                        {new Date(pipelineDetails[app.jobId].interview.scheduledAt).toLocaleString()} ({pipelineDetails[app.jobId].interview.durationMins} mins)
                      </p>
                      {pipelineDetails[app.jobId].interview.notes && (
                        <p className="text-[11px] text-black dark:text-white/70 mt-1 italic">
                          "{pipelineDetails[app.jobId].interview.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                  <a
                    href={pipelineDetails[app.jobId].interview.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-main border-2 border-black dark:border-white text-black dark:text-white font-black rounded-base text-xs shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] transition shrink-0"
                  >
                    <Video className="w-4 h-4 stroke-[2.5px]" />
                    <span>Join Meeting</span>
                    <ExternalLink className="w-3.5 h-3.5 stroke-[2.5px]" />
                  </a>
                </div>
              )}

              {/* Offer Letter Banner */}
              {pipelineDetails[app.jobId]?.offer && (
                <div className="bg-yellow-200 border-2 border-black dark:border-white rounded-base p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-neo-sm">
                  <div className="flex items-start gap-3">
                    <div className="size-9 rounded-base bg-white dark:bg-zinc-900 border-2 border-black dark:border-white text-black dark:text-white flex items-center justify-center shrink-0 shadow-neo-sm">
                      <DollarSign className="w-5 h-5 stroke-[2.5px]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-black dark:text-white uppercase">Official Offer Extended! 🎉</h4>
                      <p className="text-xs text-black dark:text-white font-bold mt-0.5">
                        Compensation: {pipelineDetails[app.jobId].offer.salary.amount.toLocaleString()} {pipelineDetails[app.jobId].offer.salary.currency} • Start Date: {new Date(pipelineDetails[app.jobId].offer.startDate).toLocaleDateString()}
                      </p>
                      {pipelineDetails[app.jobId].offer.terms && (
                        <p className="text-[11px] text-black dark:text-white/70 mt-1 font-medium">
                          Terms: {pipelineDetails[app.jobId].offer.terms}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-[11px] text-black dark:text-white/50 font-bold">
                  Last activity: {new Date(app.updatedAt).toLocaleDateString()}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  {(app.state === QuizAttemptState.PASSED || app.state === QuizAttemptState.FINAL_PASSED) && (
                    <>
                      {app.employerId && (
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMessageApp({
                              jobId: app.jobId,
                              partnerId: app.employerId!,
                              partnerName: app.companyName,
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white text-black dark:text-white font-black rounded-base text-xs shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5 stroke-[2.5px]" />
                          <span>Message Employer</span>
                        </button>
                      )}
                      <Link
                        to={`/leaderboard/${app.jobId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-200 border-2 border-black dark:border-white text-black dark:text-white font-black rounded-base text-xs shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] transition"
                      >
                        <Trophy className="w-3.5 h-3.5 text-black dark:text-white stroke-[2.5px]" />
                        <span>My Rank</span>
                      </Link>
                      <Link to="/cv-preview">
                        <NeoButton variant="secondary" size="sm">
                          <FileCheck className="w-3.5 h-3.5 mr-1 stroke-[2.5px]" />
                          <span>Verified CV</span>
                        </NeoButton>
                      </Link>
                    </>
                  )}

                  {app.state === QuizAttemptState.GROOMING_REQUIRED && (
                    <Link to={`/grooming/${app.jobId}`}>
                      <NeoButton variant="primary" size="sm">
                        <BookOpen className="w-3.5 h-3.5 mr-1 stroke-[2.5px]" />
                        <span>Resume Grooming</span>
                      </NeoButton>
                    </Link>
                  )}

                  {app.state === QuizAttemptState.GROOMING_COMPLETE && (
                    <Link to={`/quiz/${app.jobId}`}>
                      <NeoButton variant="success" size="sm">
                        <span>Take Final Assessment</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1 stroke-[3px]" />
                      </NeoButton>
                    </Link>
                  )}

                  <Link
                    to={`/jobs/${app.jobId}`}
                    className="inline-flex items-center gap-1 text-black dark:text-white font-bold text-xs px-2 py-1.5 hover:underline"
                  >
                    <span>View Circular</span>
                    <ArrowRight className="w-3 h-3 stroke-[2.5px]" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Direct Messaging Modal */}
      {activeMessageApp && (
        <MessageThreadModal
          jobId={activeMessageApp.jobId}
          partnerId={activeMessageApp.partnerId}
          partnerName={activeMessageApp.partnerName}
          onClose={() => setActiveMessageApp(null)}
        />
      )}
    </div>
  );
};
