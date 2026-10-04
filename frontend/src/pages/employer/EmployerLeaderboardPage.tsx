import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { LeaderboardResponse, ApplicationStatus } from '@skillverify/shared';
import {
  Trophy,
  Download,
  ArrowLeft,
  Users,
  Loader2,
  ShieldAlert,
  Calendar,
  DollarSign,
  MessageCircle,
} from 'lucide-react';
import { downloadBlob } from '../../utils/download';
import { useToast } from '../../context/ToastContext';
import { ScheduleInterviewModal } from '../../components/pipeline/ScheduleInterviewModal';
import { SendOfferModal } from '../../components/pipeline/SendOfferModal';
import { MessageThreadModal } from '../../components/pipeline/MessageThreadModal';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { NeoButton } from '../../components/ui/NeoButton';
import { DecorativeSparkle } from '../../components/ui/DecorativeSparkle';

export const EmployerLeaderboardPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const toast = useToast();

  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [expandedIntegrityId, setExpandedIntegrityId] = useState<string | null>(null);

  // Pipeline Modal states
  const [activeInterviewCandidate, setActiveInterviewCandidate] = useState<{ applicantId: string; fullName: string } | null>(null);
  const [activeOfferCandidate, setActiveOfferCandidate] = useState<{ applicantId: string; fullName: string } | null>(null);
  const [activeMessageCandidate, setActiveMessageCandidate] = useState<{ applicantId: string; fullName: string } | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [jobId]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/leaderboard/${jobId}`);
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load leaderboard', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCV = async (applicantId: string, fullName: string) => {
    try {
      setDownloadingId(applicantId);
      const safeName = (fullName || 'Candidate').replace(/[^a-zA-Z0-9_-]/g, '_');
      await downloadBlob(`/cv/candidate/${applicantId}/download`, `${safeName}_SkillVerify_CV.pdf`);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          'Could not download candidate CV. Candidate must be verified for this job.',
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const handleStatusChange = async (applicantId: string, newStatus: ApplicationStatus) => {
    try {
      setUpdatingId(applicantId);
      await api.put(`/leaderboard/${jobId}/candidate/${applicantId}/status`, {
        status: newStatus,
      });

      if (data) {
        const updatedEntries = data.entries.map((entry) =>
          entry.applicantId === applicantId
            ? { ...entry, applicationStatus: newStatus }
            : entry,
        );
        setData({ ...data, entries: updatedEntries });
      }
      toast.success(`Candidate status changed to ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update candidate status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-black dark:border-white border-t-main"></div>
        <p className="mt-4 font-black text-black dark:text-white text-sm">Evaluating Verified Leaderboard...</p>
      </div>
    );
  }

  const filteredEntries =
    data?.entries.filter((entry) => {
      if (statusFilter === 'ALL') return true;
      return (entry.applicationStatus || ApplicationStatus.NEW) === statusFilter;
    }) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <DecorativeSparkle size={32} colorClass="text-yellow-400" className="absolute top-4 right-8 hidden sm:block rotate-12" />

      <Link
        to="/employer/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-black text-black dark:text-white mb-6 px-3 py-1.5 rounded-base border-2 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] transition"
      >
        <ArrowLeft className="w-4 h-4 stroke-[2.5px]" />
        <span>Back to Job Listings</span>
      </Link>

      <div className="bg-white dark:bg-zinc-900 rounded-base p-6 sm:p-8 border-4 border-black dark:border-white shadow-neo-lg text-black dark:text-white space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-dashed border-black dark:border-white/20">
          <div>
            <NeoBadge variant="yellow" slanted="-rotate-1" size="sm" className="mb-2">
              Verified Pipeline & Hiring Board
            </NeoBadge>
            <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white mt-1">
              {data?.jobTitle} — Candidate Leaderboard
            </h1>
            <p className="text-xs sm:text-sm font-bold text-black dark:text-white/60 mt-0.5">
              Ranked strictly by verified scores and submission timestamps (RULE-005). Manage hiring status.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-yellow-100 text-black dark:text-white px-4 py-2 rounded-base border-2 border-black dark:border-white shadow-neo-sm shrink-0">
            <Users className="w-4 h-4 text-black dark:text-white stroke-[2.5px]" />
            <span className="text-xs font-black">{data?.totalCandidates} Verified Candidates</span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-black dark:text-white/70 mr-1 uppercase">Filter Pipeline:</span>
          {['ALL', 'new', 'reviewed', 'shortlisted', 'interview', 'offered', 'rejected'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-base text-xs font-black uppercase tracking-wider border-2 border-black dark:border-white transition shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] ${
                statusFilter === st
                  ? 'bg-main text-black dark:text-white shadow-none translate-x-[2px] translate-y-[2px]'
                  : 'bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-yellow-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {filteredEntries.length === 0 ? (
          <div className="text-center py-16 bg-yellow-50 rounded-base border-2 border-black dark:border-white border-dashed">
            <Trophy className="w-12 h-12 text-black dark:text-white/30 mx-auto mb-3" />
            <h3 className="text-base font-black text-black dark:text-white">No candidates match current filter</h3>
            <p className="text-xs font-bold text-black dark:text-white/60 mt-1">
              {statusFilter === 'ALL'
                ? 'As applicants pass the assessment, they will appear here in real-time.'
                : 'No candidates currently found in this stage.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border-3 border-black dark:border-white rounded-base shadow-neo bg-white dark:bg-zinc-900">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-black dark:border-white bg-yellow-50 text-black dark:text-white font-black uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Applicant Name</th>
                  <th className="py-3 px-4">Skill Score</th>
                  <th className="py-3 px-4">Attempt</th>
                  <th className="py-3 px-4">Integrity / Grooming</th>
                  <th className="py-3 px-4">Hiring Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 border-black dark:border-white/10">
                {filteredEntries.map((entry) => (
                  <tr key={entry.applicantId} className="hover:bg-yellow-50/50 transition">
                    <td className="py-3.5 px-4 font-black text-sm">
                      <span className="inline-block bg-main border-2 border-black dark:border-white px-2 py-0.5 rounded-sm shadow-neo-sm">
                        #{entry.rank}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-black dark:text-white">
                      <div className="text-sm">{entry.fullName}</div>
                      <div className="text-[10px] font-bold text-black dark:text-white/50">
                        Passed {new Date(entry.passedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-black text-black dark:text-white bg-success-mint px-2.5 py-1 rounded-sm border border-black dark:border-white shadow-neo-sm">
                        {entry.score}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-black dark:text-white font-bold">
                      Attempt #{entry.attemptNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        {entry.completedGrooming ? (
                          <span className="text-[10px] font-black text-black dark:text-white bg-amber-200 px-2 py-0.5 rounded border border-black dark:border-white">
                            Groomed
                          </span>
                        ) : (
                          <span className="text-[10px] text-black dark:text-white/60 font-bold">Direct Pass</span>
                        )}
                        {entry.integrityFlags && entry.integrityFlags > 0 ? (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedIntegrityId(
                                  expandedIntegrityId === entry.applicantId ? null : entry.applicantId,
                                )
                              }
                              className="inline-flex items-center gap-1 text-[10px] font-black text-black dark:text-white bg-red-100 hover:bg-red-200 px-2 py-0.5 rounded border border-black dark:border-white transition shadow-neo-sm"
                              title="Click to view integrity events timeline"
                            >
                              <ShieldAlert className="w-3 h-3 text-alert-red stroke-[2.5px]" />
                              <span>{entry.integrityFlags} Flags</span>
                            </button>

                            {expandedIntegrityId === entry.applicantId && (
                              <div className="absolute left-0 mt-1 w-64 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white rounded-base shadow-neo z-30 p-3 text-left">
                                <div className="text-[10px] font-black uppercase tracking-wider text-alert-red mb-2 flex items-center justify-between border-b border-black dark:border-white/20 pb-1">
                                  <span>Integrity Timeline</span>
                                  <span>{entry.integrityFlags} logged</span>
                                </div>
                                <div className="max-h-40 overflow-y-auto space-y-1.5 divide-y divide-black/10">
                                  {entry.integrityEvents && entry.integrityEvents.length > 0 ? (
                                    entry.integrityEvents.map((evt, idx) => (
                                      <div key={idx} className="pt-1.5 first:pt-0 flex items-center justify-between text-[11px] font-bold">
                                        <span className="capitalize">
                                          {evt.type.replace('_', ' ')}
                                        </span>
                                        <span className="text-[9px] text-black dark:text-white/50">
                                          {evt.at ? new Date(evt.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
                                        </span>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-[11px] text-black dark:text-white/60 py-1 font-bold">
                                      Flag count: {entry.integrityFlags} events
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={entry.applicationStatus || ApplicationStatus.NEW}
                        disabled={updatingId === entry.applicantId}
                        onChange={(e) =>
                          handleStatusChange(entry.applicantId, e.target.value as ApplicationStatus)
                        }
                        className={`text-xs font-black rounded-base px-2.5 py-1 border-2 border-black dark:border-white shadow-neo-sm cursor-pointer focus:outline-none ${
                          entry.applicationStatus === 'offered'
                            ? 'bg-success-mint text-black dark:text-white'
                            : entry.applicationStatus === 'shortlisted'
                            ? 'bg-purple-200 text-black dark:text-white'
                            : entry.applicationStatus === 'interview'
                            ? 'bg-yellow-200 text-black dark:text-white'
                            : entry.applicationStatus === 'rejected'
                            ? 'bg-red-200 text-black dark:text-white'
                            : entry.applicationStatus === 'reviewed'
                            ? 'bg-blue-200 text-black dark:text-white'
                            : 'bg-white dark:bg-zinc-900 text-black dark:text-white'
                        }`}
                      >
                        <option value="new">New</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interview">Interview</option>
                        <option value="offered">Offered</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMessageCandidate({
                              applicantId: entry.applicantId,
                              fullName: entry.fullName,
                            })
                          }
                          title="Message Candidate (RULE-021)"
                          className="p-1.5 rounded-base border-2 border-black dark:border-white bg-white dark:bg-zinc-900 hover:bg-yellow-100 text-black dark:text-white shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5 stroke-[2.5px]" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setActiveInterviewCandidate({
                              applicantId: entry.applicantId,
                              fullName: entry.fullName,
                            })
                          }
                          title="Schedule Interview"
                          className="p-1.5 rounded-base border-2 border-black dark:border-white bg-yellow-100 hover:bg-yellow-200 text-black dark:text-white shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] transition"
                        >
                          <Calendar className="w-3.5 h-3.5 stroke-[2.5px]" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setActiveOfferCandidate({
                              applicantId: entry.applicantId,
                              fullName: entry.fullName,
                            })
                          }
                          title="Extend Official Offer"
                          className="p-1.5 rounded-base border-2 border-black dark:border-white bg-success-mint hover:bg-green-300 text-black dark:text-white shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] transition"
                        >
                          <DollarSign className="w-3.5 h-3.5 stroke-[2.5px]" />
                        </button>

                        <button
                          type="button"
                          disabled={downloadingId === entry.applicantId}
                          onClick={() => handleDownloadCV(entry.applicantId, entry.fullName)}
                          className="bg-main border-2 border-black dark:border-white text-black dark:text-white font-black px-2.5 py-1.5 rounded-base text-xs shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] transition inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {downloadingId === entry.applicantId ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5 stroke-[2.5px]" />
                          )}
                          <span>CV</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pipeline Modals */}
      {activeInterviewCandidate && jobId && (
        <ScheduleInterviewModal
          jobId={jobId}
          candidate={activeInterviewCandidate}
          onClose={() => setActiveInterviewCandidate(null)}
          onScheduled={() => loadLeaderboard()}
        />
      )}

      {activeOfferCandidate && jobId && (
        <SendOfferModal
          jobId={jobId}
          candidate={activeOfferCandidate}
          onClose={() => setActiveOfferCandidate(null)}
          onOfferSent={() => loadLeaderboard()}
        />
      )}

      {activeMessageCandidate && jobId && (
        <MessageThreadModal
          jobId={jobId}
          partnerId={activeMessageCandidate.applicantId}
          partnerName={activeMessageCandidate.fullName}
          onClose={() => setActiveMessageCandidate(null)}
        />
      )}
    </div>
  );
};
