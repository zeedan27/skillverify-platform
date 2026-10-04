import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { LeaderboardResponse } from '@skillverify/shared';
import { Trophy, ArrowLeft } from 'lucide-react';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { NeoCard } from '../../components/ui/NeoCard';
import { DecorativeSparkle } from '../../components/ui/DecorativeSparkle';

export const ApplicantLeaderboardPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [jobId]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/leaderboard/${jobId}`);
      setData(res.data.data);
    } catch (err) {
      console.error('Error loading leaderboard', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-black dark:border-white border-t-main"></div>
        <p className="mt-4 font-black text-black dark:text-white text-sm">Loading Leaderboard Standing...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 relative">
      <DecorativeSparkle size={36} colorClass="text-yellow-400" className="absolute top-6 right-6 hidden sm:block rotate-12" />

      <Link
        to={`/jobs/${jobId}`}
        className="inline-flex items-center gap-1.5 text-xs font-black text-black dark:text-white mb-6 px-3.5 py-1.5 rounded-base border-2 border-black dark:border-white bg-white dark:bg-zinc-900 shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] transition"
      >
        <ArrowLeft className="w-4 h-4 stroke-[2.5px]" />
        <span>Back to Job Circular</span>
      </Link>

      <NeoCard variant="stacked-yellow" borderWidth="4" shadowSize="lg" padding="lg" className="text-center text-black dark:text-white">
        <div className="size-16 rounded-base bg-main border-3 border-black dark:border-white text-black dark:text-white flex items-center justify-center mx-auto shadow-neo-sm mb-4 -rotate-3">
          <Trophy className="w-8 h-8 stroke-[2.5px]" />
        </div>

        <NeoBadge variant="black" slanted="-rotate-1" size="sm" className="mb-2">
          RULE-006 Private Placement
        </NeoBadge>
        <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white mt-1">{data?.jobTitle}</h1>
        <p className="text-xs sm:text-sm font-bold text-black dark:text-white/60 mt-0.5">{data?.companyName}</p>

        {/* RULE-006: Applicant sees ONLY their own rank & score */}
        {data?.selfEntry ? (
          <div className="mt-8 p-6 bg-yellow-100 rounded-base border-3 border-black dark:border-white shadow-neo space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-black dark:text-white/70">
              Your Current Verification Rank
            </div>
            <div className="text-6xl font-black text-black dark:text-white tracking-tight">#{data.selfEntry.rank}</div>
            <div className="text-xs font-black text-black dark:text-white">
              Assessment Score: <span className="bg-success-mint border border-black dark:border-white px-2 py-0.5 rounded-sm">{data.selfEntry.score}%</span> • Attempt #{data.selfEntry.attemptNumber}
            </div>
            {data.selfEntry.applicationStatus && (
              <div className="pt-2">
                <span className="inline-block bg-white dark:bg-zinc-900 border-2 border-black dark:border-white px-3 py-1 rounded-sm text-xs font-black text-black dark:text-white shadow-neo-sm">
                  Stage: {data.selfEntry.applicationStatus.toUpperCase()}
                </span>
              </div>
            )}
            <div className="pt-4 border-t-2 border-dashed border-black dark:border-white/20 text-xs font-bold text-black dark:text-white/60">
              Total verified candidates in circular pool: <strong className="text-black dark:text-white font-black">{data.totalCandidates}</strong>
            </div>
          </div>
        ) : (
          <div className="mt-8 p-6 bg-yellow-50 rounded-base border-2 border-black dark:border-white text-xs font-bold text-black dark:text-white/70 shadow-neo-sm">
            You have not yet passed the skill gate for this position. Complete the assessment quiz to earn your verified ranking.
          </div>
        )}
      </NeoCard>
    </div>
  );
};
