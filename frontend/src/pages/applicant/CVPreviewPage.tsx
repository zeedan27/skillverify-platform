import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { CVTemplateData } from '@skillverify/shared';
import { Award, Download, Briefcase, GraduationCap, CheckCircle2, ShieldCheck } from 'lucide-react';
import { downloadBlob } from '../../utils/download';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { DecorativeSparkle } from '../../components/ui/DecorativeSparkle';

export const CVPreviewPage: React.FC = () => {
  const [cvData, setCvData] = useState<CVTemplateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchCV();
  }, []);

  const fetchCV = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cv/preview');
      setCvData(res.data.data);
    } catch (err) {
      console.error('Failed to load CV preview', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setGenerating(true);
      const safeName = (cvData?.fullName || 'Candidate').replace(/[^a-zA-Z0-9_-]/g, '_');
      await downloadBlob('/cv/download', `${safeName}_SkillVerify_CV.pdf`);
    } catch (err) {
      console.error('Failed to generate CV PDF', err);
      alert('Could not download CV PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-black dark:border-white border-t-main"></div>
        <p className="mt-4 font-black text-black dark:text-white text-sm">Synthesizing Verified CV...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      <DecorativeSparkle size={36} colorClass="text-yellow-400" className="absolute top-4 right-8 hidden sm:block rotate-12" />

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b-2 border-dashed border-black dark:border-white/20 pb-4">
        <div>
          <NeoBadge variant="yellow" slanted="-rotate-1" size="sm" className="mb-1.5">
            RULE-004 Certified Document
          </NeoBadge>
          <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">
            Auto-Generated Verified Resume
          </h1>
          <p className="text-xs sm:text-sm font-bold text-black dark:text-white/60">
            Never manually uploaded. Dynamically compiled from authentic quiz performance & profile data.
          </p>
        </div>

        <NeoButton
          type="button"
          disabled={generating}
          onClick={handleDownloadPDF}
          variant="primary"
          size="md"
        >
          <Download className="w-4 h-4 mr-2 stroke-[3px]" />
          <span>{generating ? 'Downloading...' : 'Download Certified PDF'}</span>
        </NeoButton>
      </div>

      {/* CV Paper Preview */}
      <div className="bg-white dark:bg-zinc-900 rounded-base p-6 sm:p-12 border-4 border-black dark:border-white shadow-neo-lg space-y-8 text-black dark:text-white relative">
        {/* Top Profile Header */}
        <div className="border-b-3 border-black dark:border-white pb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {cvData?.profilePhotoUrl ? (
            <img
              src={cvData.profilePhotoUrl}
              alt="Avatar"
              className="size-20 rounded-base object-cover border-3 border-black dark:border-white shadow-neo-sm shrink-0"
            />
          ) : (
            <div className="size-20 rounded-base bg-main border-3 border-black dark:border-white shadow-neo-sm flex items-center justify-center font-black text-2xl text-black dark:text-white shrink-0">
              {cvData?.fullName ? cvData.fullName.charAt(0) : 'U'}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">{cvData?.fullName}</h2>
              <span className="bg-success-mint text-black dark:text-white border border-black dark:border-white font-black text-[10px] uppercase px-2 py-0.5 rounded-sm">
                Verified
              </span>
            </div>
            <p className="text-sm font-black text-black dark:text-white/80 mt-1">{cvData?.headline || 'Verified Full-Stack Professional'}</p>
            <p className="text-xs font-bold text-black dark:text-white/60 mt-1">
              Email: {cvData?.email} | Phone: {cvData?.phone}
            </p>
          </div>
        </div>

        {/* Verified Skill Gates */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-black dark:text-white border-b-2 border-black dark:border-white pb-2 mb-4 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-black dark:text-white stroke-[2.5px]" />
            <span>Skill Gate Certifications (RULE-001)</span>
          </h3>
          {cvData?.quizScores && cvData.quizScores.length > 0 ? (
            <div className="space-y-3">
              {cvData.quizScores.map((score, i) => (
                <div key={i} className="bg-green-50 p-4 rounded-base border-2 border-black dark:border-white shadow-neo-sm flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-black dark:text-white">{score.jobTitle} — {score.companyName}</h4>
                    <p className="text-[11px] font-bold text-black dark:text-white/60 mt-0.5">Verified on: {new Date(score.passedAt).toLocaleDateString()}</p>
                  </div>
                  <NeoBadge variant="green" size="sm">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[3px]" />
                    <span>{score.score}% PASSED</span>
                  </NeoBadge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-bold text-black dark:text-white/50 italic bg-yellow-50 p-3 rounded-base border border-black dark:border-white">
              No passed skill gates yet. Pass circular assessments to earn certified badges.
            </p>
          )}
        </div>

        {/* Skills */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-black dark:text-white border-b-2 border-black dark:border-white pb-2 mb-4">
            Key Competencies & Technical Stack
          </h3>
          <div className="flex flex-wrap gap-2">
            {cvData?.skills && cvData.skills.length > 0 ? (
              cvData.skills.map((skill, i) => (
                <span key={i} className="text-xs font-black bg-yellow-200 text-black dark:text-white border-2 border-black dark:border-white px-3 py-1 rounded-sm shadow-neo-sm">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs font-bold text-black dark:text-white/50 italic">No skills listed yet.</span>
            )}
          </div>
        </div>

        {/* Experience Section */}
        {cvData?.experience && cvData.experience.length > 0 && (
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-black dark:text-white border-b-2 border-black dark:border-white pb-2 mb-4 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-black dark:text-white stroke-[2.5px]" />
              <span>Professional Experience</span>
            </h3>
            <div className="space-y-3">
              {cvData.experience.map((exp, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-base border-2 border-black dark:border-white shadow-neo-sm">
                  <div className="flex justify-between items-baseline">
                    <span className="font-black text-sm text-black dark:text-white">{exp.title}</span>
                    <span className="text-[11px] font-bold text-black dark:text-white/60 bg-white dark:bg-zinc-900 border border-black dark:border-white px-2 py-0.5 rounded-sm">
                      {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate || 'Present'}
                    </span>
                  </div>
                  <div className="text-xs font-black text-black dark:text-white/80 mt-1">{exp.company}</div>
                  {exp.description && <p className="text-xs font-medium text-black dark:text-white/70 mt-2">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education Section */}
        {cvData?.education && cvData.education.length > 0 && (
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-black dark:text-white border-b-2 border-black dark:border-white pb-2 mb-4 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-black dark:text-white stroke-[2.5px]" />
              <span>Education & Credentials</span>
            </h3>
            <div className="space-y-3">
              {cvData.education.map((edu, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-base border-2 border-black dark:border-white shadow-neo-sm">
                  <div className="flex justify-between items-baseline">
                    <span className="font-black text-sm text-black dark:text-white">
                      {edu.degree} in {edu.fieldOfStudy}
                    </span>
                    <span className="text-[11px] font-bold text-black dark:text-white/60 bg-white dark:bg-zinc-900 border border-black dark:border-white px-2 py-0.5 rounded-sm">
                      {edu.startYear} — {edu.isCurrent ? 'Present' : edu.endYear || 'Present'}
                    </span>
                  </div>
                  <div className="text-xs font-black text-black dark:text-white/80 mt-1">{edu.institution}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-6 border-t-2 border-dashed border-black dark:border-white/20 text-center text-xs font-bold text-black dark:text-white/50">
          Generated automatically by SkillVerify Engine • Cryptographically Audited
        </div>
      </div>
    </div>
  );
};
