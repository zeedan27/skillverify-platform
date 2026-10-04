import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { PublicPortfolio, SkillBadge, BadgeTier } from '@skillverify/shared';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  Lock,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { NeoCard } from '../../components/ui/NeoCard';
import { DecorativeSparkle } from '../../components/ui/DecorativeSparkle';

export const PublicPortfolioPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [portfolio, setPortfolio] = useState<PublicPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    loadPortfolio();
  }, [slug]);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/public/portfolio/${slug}`);
      setPortfolio(res.data.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'This public portfolio is either private or does not exist.'
      );
    } finally {
      setLoading(false);
    }
  };

  const copyVerifyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const getTierStyles = (tier: BadgeTier) => {
    switch (tier) {
      case BadgeTier.GOLD:
        return {
          bg: 'bg-yellow-100',
          badgeBg: 'bg-black dark:bg-white text-white dark:text-black',
          accent: 'text-amber-700',
        };
      case BadgeTier.SILVER:
        return {
          bg: 'bg-slate-100',
          badgeBg: 'bg-slate-800 text-white dark:text-black',
          accent: 'text-slate-700',
        };
      case BadgeTier.BRONZE:
      default:
        return {
          bg: 'bg-amber-50',
          badgeBg: 'bg-amber-800 text-white dark:text-black',
          accent: 'text-amber-800',
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas dark:bg-zinc-950 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-black dark:border-white border-t-main rounded-full animate-spin"></div>
          <p className="text-sm font-black text-black dark:text-white">Verifying cryptographic credentials...</p>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-canvas dark:bg-zinc-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-base p-8 border-4 border-black dark:border-white shadow-neo-lg text-center space-y-4">
          <div className="size-16 bg-red-100 text-alert-red rounded-base border-2 border-black dark:border-white flex items-center justify-center mx-auto shadow-neo-sm">
            <AlertCircle className="w-8 h-8 stroke-[2.5px]" />
          </div>
          <h2 className="text-xl font-black text-black dark:text-white">Portfolio Unavailable</h2>
          <p className="text-xs font-bold text-black dark:text-white/60">
            {error || 'The requested candidate profile is private or does not exist.'}
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-base bg-main border-2 border-black dark:border-white text-black dark:text-white font-black text-xs shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] transition"
            >
              Return to SkillVerify Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas dark:bg-zinc-950 bg-grid-pattern py-12 px-4 sm:px-6 lg:px-8 relative">
      <DecorativeSparkle size={40} colorClass="text-main" className="absolute top-8 left-8 hidden sm:block rotate-12" />
      <DecorativeSparkle size={36} colorClass="text-purple-400" className="absolute top-8 right-8 hidden sm:block -rotate-12" />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Verification Banner */}
        <div className="bg-white dark:bg-zinc-900 rounded-base border-4 border-black dark:border-white shadow-neo-lg p-6 sm:p-10 relative overflow-hidden text-black dark:text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <NeoBadge variant="green" size="sm">
                <ShieldCheck className="w-4 h-4 stroke-[3px]" />
                <span>SkillVerify Authenticated</span>
              </NeoBadge>
              <h1 className="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight">
                {portfolio.fullName}
              </h1>
              {portfolio.headline && (
                <p className="text-base text-black dark:text-white/80 font-bold">{portfolio.headline}</p>
              )}
            </div>

            <div className="flex flex-col items-start sm:items-end gap-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-black dark:text-white/50">
                Integrity Standard
              </span>
              <div className="flex items-center gap-1.5 text-xs font-black text-black dark:text-white bg-yellow-100 px-3 py-1.5 rounded-base border-2 border-black dark:border-white shadow-neo-sm">
                <Sparkles className="w-3.5 h-3.5 text-black dark:text-white" />
                <span>Anti-Cheat Validated</span>
              </div>
            </div>
          </div>

          {/* Privacy Notice RULE-023 */}
          <div className="mt-8 pt-6 border-t-2 border-dashed border-black dark:border-white/20 flex items-start gap-3 bg-yellow-50 p-4 rounded-base border-2 border-black dark:border-white shadow-neo-sm">
            <Lock className="w-5 h-5 text-black dark:text-white shrink-0 mt-0.5 stroke-[2.5px]" />
            <p className="text-xs font-bold text-black dark:text-white/80 leading-relaxed">
              <strong className="text-black dark:text-white font-black">Privacy Protected (RULE-023):</strong> In strict compliance with SkillVerify Constitutional Mandate <code>RULE-023</code>, private applicant contact details (email, phone number) are hidden. All skill scores and badges shown are verified server-side.
            </p>
          </div>
        </div>

        {/* Verified Skill Badges */}
        <div className="bg-white dark:bg-zinc-900 rounded-base border-4 border-black dark:border-white shadow-neo-lg p-6 sm:p-8 space-y-6 text-black dark:text-white">
          <div className="flex items-center justify-between pb-4 border-b-2 border-dashed border-black dark:border-white/20">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-black dark:text-white stroke-[2.5px]" />
              <h2 className="text-xl font-black text-black dark:text-white">Cryptographic Skill Badges</h2>
            </div>
            <NeoBadge variant="yellow" size="sm">
              {portfolio.badges.length} Issued
            </NeoBadge>
          </div>

          {portfolio.badges.length === 0 ? (
            <p className="text-sm font-bold text-black dark:text-white/50 italic py-4">
              No skill badges issued yet. Badges are cryptographically generated upon passing rigorous assessments.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.badges.map((b) => {
                const style = getTierStyles(b.tier);
                return (
                  <div
                    key={b._id}
                    className={`rounded-base border-3 border-black dark:border-white p-5 ${style.bg} shadow-neo flex flex-col justify-between space-y-4`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-wide border border-black dark:border-white ${style.badgeBg}`}
                        >
                          {b.tier} Tier
                        </span>
                        <h3 className="text-lg font-black text-black dark:text-white">{b.skill}</h3>
                        <p className="text-xs font-bold text-black dark:text-white/70">
                          {b.jobTitle} • {b.companyName}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black text-black dark:text-white">{b.score}%</span>
                        <span className="block text-[10px] text-black dark:text-white/60 uppercase font-black">
                          Score
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t-2 border-black dark:border-white/20 flex items-center justify-between gap-2">
                      <div className="font-mono text-xs font-black text-black dark:text-white truncate">
                        Code: {b.verifyCode}
                      </div>
                      <button
                        type="button"
                        onClick={() => copyVerifyCode(b.verifyCode)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-black bg-white dark:bg-zinc-900 border-2 border-black dark:border-white text-black dark:text-white shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] transition"
                      >
                        {copiedCode === b.verifyCode ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-700 stroke-[3px]" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 stroke-[2.5px]" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Verified Assessment Scores */}
        <div className="bg-white dark:bg-zinc-900 rounded-base border-4 border-black dark:border-white shadow-neo-lg p-6 sm:p-8 space-y-6 text-black dark:text-white">
          <div className="flex items-center justify-between pb-4 border-b-2 border-dashed border-black dark:border-white/20">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-black dark:text-white stroke-[2.5px]" />
              <h2 className="text-xl font-black text-black dark:text-white">Passed Assessment Records</h2>
            </div>
            <NeoBadge variant="green" size="sm">
              {portfolio.verifiedScores.length} Passed
            </NeoBadge>
          </div>

          {portfolio.verifiedScores.length === 0 ? (
            <p className="text-sm font-bold text-black dark:text-white/50 italic py-4">No passed assessment records yet.</p>
          ) : (
            <div className="space-y-3">
              {portfolio.verifiedScores.map((score, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-base bg-yellow-50/60 border-2 border-black dark:border-white shadow-neo-sm hover:translate-x-0.5 transition"
                >
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-black text-black dark:text-white">{score.jobTitle}</h4>
                    <p className="text-xs font-bold text-black dark:text-white/60">
                      {score.companyName} • Certified on {new Date(score.passedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-sm bg-success-mint text-black dark:text-white border border-black dark:border-white text-xs font-black shadow-neo-sm">
                      {score.score}% Passed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Skills List */}
        {portfolio.skills && portfolio.skills.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-base border-4 border-black dark:border-white shadow-neo-lg p-6 sm:p-8 space-y-4 text-black dark:text-white">
            <h2 className="text-xl font-black text-black dark:text-white">Candidate Expertise & Skills</h2>
            <div className="flex flex-wrap gap-2 pt-2">
              {portfolio.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-sm bg-yellow-200 border-2 border-black dark:border-white text-black dark:text-white text-xs font-black shadow-neo-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs font-black text-black dark:text-white/50 py-6">
          SkillVerify Verified Portfolio • Governed by Cryptographic Integrity Engine
        </div>
      </div>
    </div>
  );
};
