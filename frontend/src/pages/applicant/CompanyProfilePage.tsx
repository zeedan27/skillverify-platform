import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { JobCircular } from '@skillverify/shared';
import { Building2, Globe, Mail, MapPin, ArrowRight, ArrowLeft, ShieldCheck, Briefcase } from 'lucide-react';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { NeoButton } from '../../components/ui/NeoButton';
import { DecorativeSparkle } from '../../components/ui/DecorativeSparkle';

interface CompanyData {
  employerId: string;
  companyName: string;
  companyWebsite?: string;
  contactPerson?: string;
  logoUrl?: string;
  activeJobsCount: number;
  jobs: JobCircular[];
}

export const CompanyProfilePage: React.FC = () => {
  const { employerId } = useParams<{ employerId: string }>();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/jobs/company/${employerId}`);
        setCompany(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load company profile');
      } finally {
        setLoading(false);
      }
    };
    if (employerId) {
      fetchCompany();
    }
  }, [employerId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-black dark:border-white border-t-main"></div>
        <p className="mt-4 font-black text-black dark:text-white text-sm">Loading Verified Partner Profile...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-zinc-900 rounded-base border-4 border-black dark:border-white shadow-neo text-center">
        <Building2 className="w-12 h-12 text-black dark:text-white/40 mx-auto mb-3" />
        <h2 className="text-xl font-black text-black dark:text-white">Company Not Found</h2>
        <p className="text-xs font-bold text-black dark:text-white/60 mt-1">{error || 'Could not retrieve company profile information.'}</p>
        <div className="mt-4">
          <Link to="/jobs">
            <NeoButton variant="primary" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1 stroke-[3px]" />
              <span>Back to Jobs</span>
            </NeoButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
      <DecorativeSparkle size={32} colorClass="text-yellow-400" className="absolute top-4 right-8 hidden sm:block rotate-12" />

      <Link
        to="/jobs"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-base border-2 border-black dark:border-white bg-white dark:bg-zinc-900 text-xs font-black text-black dark:text-white shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] transition"
      >
        <ArrowLeft className="w-4 h-4 stroke-[2.5px]" />
        <span>Back to All Circulars</span>
      </Link>

      {/* Header Banner */}
      <div className="bg-grid-pattern-yellow rounded-base p-6 sm:p-10 border-4 border-black dark:border-white shadow-neo-lg text-black dark:text-white relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
          <div className="size-20 rounded-base bg-main border-3 border-black dark:border-white flex items-center justify-center text-black dark:text-white text-3xl font-black shadow-neo-sm shrink-0 overflow-hidden">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.companyName} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-10 h-10 text-black dark:text-white stroke-[2.5px]" />
            )}
          </div>
          <div className="space-y-2 flex-1">
            <NeoBadge variant="black" slanted="-rotate-1" size="sm">
              <ShieldCheck className="w-3.5 h-3.5 text-yellow-300 stroke-[3px]" />
              <span>SkillVerify Verified Partner</span>
            </NeoBadge>
            <h1 className="text-2xl sm:text-4xl font-black text-black dark:text-white tracking-tight">{company.companyName}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-black dark:text-white/75 pt-1">
              {company.companyWebsite && (
                <a
                  href={company.companyWebsite.startsWith('http') ? company.companyWebsite : `https://${company.companyWebsite}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-black dark:border-white px-2.5 py-1 rounded-sm shadow-neo-sm hover:bg-yellow-100 transition"
                >
                  <Globe className="w-3.5 h-3.5 text-black dark:text-white" />
                  <span>{company.companyWebsite.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
              {company.contactPerson && (
                <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-black dark:border-white px-2.5 py-1 rounded-sm shadow-neo-sm">
                  <Mail className="w-3.5 h-3.5 text-black dark:text-white" />
                  <span>Contact: {company.contactPerson}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-success-mint border border-black dark:border-white px-2.5 py-1 rounded-sm shadow-neo-sm text-black dark:text-white font-black">
                <Briefcase className="w-3.5 h-3.5 text-black dark:text-white stroke-[2.5px]" />
                <span>{company.activeJobsCount} Active Circular{company.activeJobsCount === 1 ? '' : 's'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Circulars Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-dashed border-black dark:border-white/20 pb-3">
          <h2 className="text-xl font-black text-black dark:text-white">Current Verified Openings</h2>
          <span className="text-xs font-bold text-black dark:text-white/60">
            Requires SkillVerify quiz assessment
          </span>
        </div>

        {company.jobs.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-base p-10 text-center border-4 border-black dark:border-white shadow-neo">
            <p className="text-black dark:text-white/60 font-bold text-sm">No active job listings currently open at {company.companyName}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {company.jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white dark:bg-zinc-900 rounded-base p-6 border-3 border-black dark:border-white shadow-neo hover:shadow-neo-lg hover:-translate-y-0.5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-black uppercase text-black dark:text-white bg-yellow-200 border border-black dark:border-white px-2 py-0.5 rounded-sm">
                      {job.location}
                    </span>
                    <span className="text-xs font-black text-black dark:text-white bg-success-mint border border-black dark:border-white px-2 py-0.5 rounded-sm shadow-neo-sm">
                      Pass: {job.passingScore}%
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-black dark:text-white">{job.title}</h3>
                  <p className="text-xs font-medium text-black dark:text-white/75 mt-2 line-clamp-2">{job.description}</p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {job.requiredSkills.map((sk, idx) => (
                      <span key={idx} className="text-[10px] font-bold bg-slate-100 border border-black dark:border-white px-2 py-0.5 rounded-sm">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t-2 border-dashed border-black dark:border-white/20 flex items-center justify-between">
                  <span className="text-xs font-bold text-black dark:text-white/60">
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </span>
                  <Link to={`/jobs/${job._id}`}>
                    <NeoButton variant="primary" size="sm">
                      <span>View & Assess</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1 stroke-[3px]" />
                    </NeoButton>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
