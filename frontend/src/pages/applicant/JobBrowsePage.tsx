import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { JobCircular, Role } from '@skillverify/shared';
import {
  Search,
  MapPin,
  Building2,
  ShieldCheck,
  ArrowRight,
  Bookmark,
  Sparkles,
  SlidersHorizontal,
  X,
  DollarSign
} from 'lucide-react';
import { NeoBadge } from '../../components/ui/NeoBadge';
import { NeoButton } from '../../components/ui/NeoButton';
import { DecorativeSparkle } from '../../components/ui/DecorativeSparkle';

export const JobBrowsePage: React.FC = () => {
  const { user } = useAuth();
  const { success, error, info } = useToast();
  const [jobs, setJobs] = useState<JobCircular[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [minSalary, setMinSalary] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'match' | 'deadline' | 'passingScore'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // User skills for match calculation
  const userSkills: string[] = useMemo(() => {
    return ((user as any)?.skills || []).map((s: string) => s.toLowerCase().trim());
  }, [user]);

  useEffect(() => {
    fetchJobs();
    if (user && user.role === Role.APPLICANT) {
      fetchBookmarks();
    }
  }, [search, location, minSalary]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (location) params.location = location;
      if (minSalary) params.minSalary = Number(minSalary);

      const res = await api.get('/jobs', { params });
      setJobs(res.data.data);
    } catch (err) {
      console.error('Failed to load jobs', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const res = await api.get('/users/bookmarks');
      setBookmarks(res.data.data || []);
    } catch (err) {
      console.error('Failed to load bookmarks', err);
    }
  };

  const toggleBookmark = async (e: React.MouseEvent, jobId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      info('Please sign in as an applicant to bookmark jobs');
      return;
    }

    const isBookmarked = bookmarks.includes(jobId);
    const updated = isBookmarked ? bookmarks.filter((id) => id !== jobId) : [...bookmarks, jobId];
    setBookmarks(updated);

    try {
      await api.post(`/users/bookmarks/${jobId}`);
      if (isBookmarked) {
        info('Job removed from bookmarks');
      } else {
        success('Job bookmarked successfully');
      }
    } catch (err) {
      setBookmarks(bookmarks); // Revert on failure
      error('Failed to update bookmark');
    }
  };

  const calculateMatch = (requiredSkills: string[]): { score: number; matchedCount: number } => {
    if (!userSkills.length || !requiredSkills?.length) return { score: 0, matchedCount: 0 };
    const matched = requiredSkills.filter((s) => userSkills.includes(s.toLowerCase().trim()));
    const score = Math.round((matched.length / requiredSkills.length) * 100);
    return { score, matchedCount: matched.length };
  };

  const filteredAndSortedJobs = useMemo(() => {
    let result = [...jobs];

    if (activeTab === 'saved') {
      result = result.filter((j) => bookmarks.includes(j._id));
    }

    result.sort((a, b) => {
      if (sortBy === 'match') {
        const matchA = calculateMatch(a.requiredSkills).score;
        const matchB = calculateMatch(b.requiredSkills).score;
        return matchB - matchA;
      }
      if (sortBy === 'deadline') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === 'passingScore') {
        return a.passingScore - b.passingScore;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [jobs, activeTab, bookmarks, sortBy, userSkills]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Neo-Brutalist Hero Banner */}
      <div className="bg-grid-pattern-yellow rounded-base p-6 sm:p-10 border-4 border-black dark:border-white shadow-neo-lg mb-8 relative overflow-hidden text-black dark:text-white">
        <DecorativeSparkle size={36} colorClass="text-yellow-400" className="absolute top-4 right-4 hidden sm:block rotate-12" />
        <div className="max-w-2xl relative z-10">
          <div className="mb-3">
            <NeoBadge variant="black" slanted="-rotate-1" size="sm">
              <ShieldCheck className="w-3.5 h-3.5 text-yellow-300 stroke-[3px]" />
              <span>Skill Gate Protected Hiring</span>
            </NeoBadge>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-2">
            Prove your skills before you apply.
          </h1>
          <p className="text-black dark:text-white/80 font-bold text-xs sm:text-base leading-relaxed">
            Every application is verified through a role-specific assessment. No spam CVs, zero fluff.
            Didn't pass attempt 1? Complete the employer's grooming course for your final attempt.
          </p>
        </div>
      </div>

      {/* Controls Bar: Search, Tabs & Filters */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-black dark:text-white" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title, company, or skills..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 rounded-base border-2 border-black dark:border-white font-bold text-sm shadow-neo-sm focus:bg-yellow-50 focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-3.5 text-black dark:text-white/60 hover:text-black dark:text-white"
              >
                <X className="w-4 h-4 stroke-[3px]" />
              </button>
            )}
          </div>

          {/* Filter & Sort Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-3 rounded-base text-xs font-black border-2 border-black dark:border-white transition shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] ${
                showFilters || location || minSalary
                  ? 'bg-main text-black dark:text-white'
                  : 'bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-yellow-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 stroke-[2.5px]" />
              <span>Filters {(location || minSalary) ? '(Active)' : ''}</span>
            </button>

            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-3 bg-white dark:bg-zinc-900 rounded-base border-2 border-black dark:border-white text-xs font-black text-black dark:text-white shadow-neo-sm focus:outline-none cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              {user && user.role === Role.APPLICANT && (
                <option value="match">Sort: Skill Match</option>
              )}
              <option value="deadline">Sort: Deadline (Soonest)</option>
              <option value="passingScore">Sort: Passing Score</option>
            </select>
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-base border-2 border-black dark:border-white shadow-neo grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-black text-black dark:text-white uppercase mb-1">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-black dark:text-white" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote, New York"
                  className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-base border-2 border-black dark:border-white focus:outline-none focus:bg-yellow-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-black dark:text-white uppercase mb-1">Minimum Salary ($/yr)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-black dark:text-white" />
                <input
                  type="number"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-base border-2 border-black dark:border-white focus:outline-none focus:bg-yellow-50"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setLocation('');
                  setMinSalary('');
                }}
                className="text-xs font-black text-black dark:text-white hover:underline px-3 py-2 border-2 border-black dark:border-white rounded-base bg-slate-100 hover:bg-slate-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Tabs: All Jobs vs Saved */}
        {user && user.role === Role.APPLICANT && (
          <div className="flex items-center gap-2 border-b-2 border-dashed border-black dark:border-white/20 pb-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-base text-xs font-black border-2 border-black dark:border-white transition shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] ${
                activeTab === 'all'
                  ? 'bg-main text-black dark:text-white shadow-none translate-x-[2px] translate-y-[2px]'
                  : 'bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-yellow-50'
              }`}
            >
              All Openings ({jobs.length})
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-base text-xs font-black border-2 border-black dark:border-white transition shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] ${
                activeTab === 'saved'
                  ? 'bg-main text-black dark:text-white shadow-none translate-x-[2px] translate-y-[2px]'
                  : 'bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-yellow-50'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 stroke-[2.5px]" />
              <span>Saved Jobs ({bookmarks.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* Job Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white dark:bg-zinc-900 rounded-base p-6 border-2 border-black dark:border-white shadow-neo space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedJobs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-base border-4 border-black dark:border-white shadow-neo">
          <Building2 className="w-12 h-12 text-black dark:text-white/40 mx-auto mb-3" />
          <h3 className="text-lg font-black text-black dark:text-white">
            {activeTab === 'saved' ? 'No bookmarked jobs yet' : 'No active circulars found'}
          </h3>
          <p className="text-xs font-bold text-black dark:text-white/60 mt-1">
            {activeTab === 'saved'
              ? 'Click the bookmark icon on any job to save it for later.'
              : 'Try clearing your search query or relaxing your filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedJobs.map((job) => {
            const isBookmarked = bookmarks.includes(job._id);
            const { score: matchScore, matchedCount } = calculateMatch(job.requiredSkills);

            return (
              <div
                key={job._id}
                className="bg-white dark:bg-zinc-900 rounded-base p-6 border-3 border-black dark:border-white shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all flex flex-col justify-between group relative"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Link
                      to={`/companies/${job.employerId}`}
                      className="text-xs font-black text-black dark:text-white uppercase tracking-wider bg-yellow-200 border border-black dark:border-white px-2.5 py-0.5 rounded-sm hover:bg-yellow-300 transition"
                      title="View Company Profile"
                    >
                      {job.companyName}
                    </Link>

                    <div className="flex items-center gap-1.5">
                      {user && user.role === Role.APPLICANT && (
                        <button
                          onClick={(e) => toggleBookmark(e, job._id)}
                          className={`p-1.5 rounded-base border-2 border-black dark:border-white transition shadow-neo-sm ${
                            isBookmarked
                              ? 'bg-amber-300 text-black dark:text-white'
                              : 'bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-yellow-100'
                          }`}
                          title={isBookmarked ? 'Remove bookmark' : 'Bookmark job'}
                        >
                          <Bookmark className={`w-3.5 h-3.5 stroke-[2.5px] ${isBookmarked ? 'fill-black' : ''}`} />
                        </button>
                      )}
                      <span className="text-xs font-black text-black dark:text-white bg-success-mint border border-black dark:border-white px-2 py-0.5 rounded-sm shadow-neo-sm">
                        Pass: {job.passingScore}%
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-black dark:text-white group-hover:text-neutral-800 transition">
                    {job.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-black dark:text-white/70 mt-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-black dark:text-white" />
                      <span>{job.location}</span>
                    </div>
                    {job.salaryRange && (
                      <div className="flex items-center gap-0.5 text-black dark:text-white font-black">
                        <span>
                          ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Skill Match Badge */}
                  {user && user.role === Role.APPLICANT && userSkills.length > 0 && (
                    <div className="mt-3">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-black border-2 border-black dark:border-white ${
                          matchScore >= 70
                            ? 'bg-green-100 text-green-900'
                            : matchScore >= 40
                            ? 'bg-yellow-100 text-yellow-900'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-black dark:text-white" />
                        <span>{matchScore}% Skill Match</span>
                        <span className="text-[10px] opacity-75">
                          ({matchedCount}/{job.requiredSkills.length})
                        </span>
                      </div>
                    </div>
                  )}

                  <p className="text-xs font-medium text-black dark:text-white/80 mt-3 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Required Skills Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {job.requiredSkills.slice(0, 4).map((skill, i) => {
                      const isMatched = userSkills.includes(skill.toLowerCase().trim());
                      return (
                        <span
                          key={i}
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-sm border ${
                            isMatched
                              ? 'bg-success-mint border-black dark:border-white text-black dark:text-white'
                              : 'bg-slate-100 border-black dark:border-white/40 text-black dark:text-white'
                          }`}
                        >
                          {skill}
                        </span>
                      );
                    })}
                    {job.requiredSkills.length > 4 && (
                      <span className="text-[11px] font-black text-black dark:text-white/60 px-1 py-0.5">
                        +{job.requiredSkills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t-2 border-dashed border-black dark:border-white/20 flex items-center justify-between">
                  <span className="text-xs font-bold text-black dark:text-white/60">
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </span>
                  <Link to={`/jobs/${job._id}`}>
                    <NeoButton variant="primary" size="sm">
                      <span>Assess Skills</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1 stroke-[3px]" />
                    </NeoButton>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
