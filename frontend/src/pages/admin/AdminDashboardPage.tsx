import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { UserStatus, JobStatus, QuizAttemptState, Role, ApplicationStatus } from '@skillverify/shared';
import {
  ShieldCheck,
  UserX,
  UserCheck,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Briefcase,
  Layers,
  RotateCcw,
  Ban,
  Unlock,
  ShieldAlert,
  PlusCircle,
  Pencil,
  Trash2,
  BarChart3,
  Users,
  KeyRound,
  BookOpen,
  HelpCircle,
  X,
  Search,
  Award,
  TrendingUp,
  Download,
  CheckSquare,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminDashboardPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'users' | 'jobs' | 'quizzes' | 'courses' | 'attempts' | 'audit'
  >('analytics');

  const toast = useToast();

  // Modals state
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [newUserModal, setNewUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: 'Password123!',
    fullName: '',
    role: Role.APPLICANT,
    companyName: '',
    phone: '',
  });

  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [inspectQuiz, setInspectQuiz] = useState<any | null>(null);
  const [inspectCourse, setInspectCourse] = useState<any | null>(null);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [
        analyticsRes,
        usersRes,
        jobsRes,
        quizzesRes,
        coursesRes,
        attemptsRes,
        auditRes,
      ] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/users'),
        api.get('/admin/jobs'),
        api.get('/admin/quizzes'),
        api.get('/admin/courses'),
        api.get('/admin/quiz-attempts'),
        api.get('/admin/audit-logs'),
      ]);

      setAnalytics(analyticsRes.data.data);
      setUsers(usersRes.data.data || []);
      setJobs(jobsRes.data.data || []);
      setQuizzes(quizzesRes.data.data || []);
      setCourses(coursesRes.data.data || []);
      setAttempts(attemptsRes.data.data || []);
      setAuditLogs(auditRes.data.data || []);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  // ==================== USER HANDLERS ====================

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', newUserData);
      toast.success(`User ${newUserData.email} created successfully`);
      setNewUserModal(false);
      setNewUserData({
        email: '',
        password: 'Password123!',
        fullName: '',
        role: Role.APPLICANT,
        companyName: '',
        phone: '',
      });
      loadAllAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await api.put(`/admin/users/${editingUser._id}`, {
        fullName: editingUser.fullName,
        email: editingUser.email,
        phone: editingUser.phone,
        headline: editingUser.headline,
        companyName: editingUser.companyName,
        companyWebsite: editingUser.companyWebsite,
        contactPerson: editingUser.contactPerson,
        role: editingUser.role,
        status: editingUser.status,
      });
      toast.success('User updated successfully');
      setEditingUser(null);
      loadAllAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleResetPassword = async (userId: string, email: string) => {
    const customPass = prompt(`Enter new password for ${email} (leave blank for 'Password123!'):`);
    if (customPass === null) return;
    try {
      const res = await api.post(`/admin/users/${userId}/reset-password`, {
        newPassword: customPass || 'Password123!',
      });
      toast.success(`Password reset to: ${res.data.data.newPassword}`);
      loadAllAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to permanently revoke access for ${email}? (RULE-007)`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User account deactivated and audit log created.');
      loadAllAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleSuspendUser = async (userId: string) => {
    const reason = prompt('Reason for account suspension:');
    if (reason === null) return;
    try {
      await api.post(`/admin/users/${userId}/suspend`, { reason: reason || 'Admin violation action' });
      toast.success('User suspended. Audit log created (RULE-007).');
      loadAllAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to suspend user');
    }
  };

  const handleRestoreUser = async (userId: string) => {
    try {
      await api.post(`/admin/users/${userId}/restore`);
      toast.success('User restored. Audit log created (RULE-007).');
      loadAllAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to restore user');
    }
  };

  // ==================== JOB HANDLERS ====================

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    try {
      await api.put(`/admin/jobs/${editingJob._id}`, {
        title: editingJob.title,
        description: editingJob.description,
        location: editingJob.location,
        passingScore: Number(editingJob.passingScore),
        status: editingJob.status,
      });
      toast.success('Job circular updated successfully');
      setEditingJob(null);
      loadAllAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update job');
    }
  };

  const handleDeleteJob = async (jobId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete job '${title}'? This will remove all associated submissions (RULE-007).`))
      return;
    try {
      await api.delete(`/admin/jobs/${jobId}`);
      toast.success('Job circular deleted.');
      loadAllAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete job');
    }
  };

  const handleSuspendJob = async (jobId: string) => {
    const reason = prompt('Reason for circular suspension:');
    if (reason === null) return;
    try {
      await api.post(`/admin/jobs/${jobId}/suspend`, { reason: reason || 'Policy violation' });
      toast.success('Job circular suspended. Audit log created (RULE-007).');
      loadAllAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to suspend job');
    }
  };

  const handleRestoreJob = async (jobId: string) => {
    try {
      await api.post(`/admin/jobs/${jobId}/restore`);
      toast.success('Job circular restored. Audit log created (RULE-007).');
      loadAllAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to restore job');
    }
  };

  // ==================== QUIZ & COURSE HANDLERS ====================

  const handleViewQuiz = async (quizId: string) => {
    try {
      const res = await api.get(`/admin/quizzes/${quizId}`);
      setInspectQuiz(res.data.data);
    } catch (err: any) {
      toast.error('Failed to load quiz details');
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz? It will be detached from the circular (RULE-007).'))
      return;
    try {
      await api.delete(`/admin/quizzes/${quizId}`);
      toast.success('Quiz deleted and detached.');
      loadAllAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete quiz');
    }
  };

  const handleViewCourse = async (courseId: string) => {
    try {
      const res = await api.get(`/admin/courses/${courseId}`);
      setInspectCourse(res.data.data);
    } catch (err: any) {
      toast.error('Failed to load course details');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this grooming course? (RULE-007)')) return;
    try {
      await api.delete(`/admin/courses/${courseId}`);
      toast.success('Grooming course deleted.');
      loadAllAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete course');
    }
  };

  // ==================== ATTEMPTS OVERRIDE HANDLERS ====================

  const handleOverrideQuizState = async (attemptId: string, state: QuizAttemptState) => {
    const confirmMsg =
      state === QuizAttemptState.NOT_STARTED
        ? 'Reopening this assessment will reset attempts count to 0 and archive previous attempts into AuditLog (RULE-014). Proceed?'
        : `Override assessment state to ${state}?`;
    if (!confirm(confirmMsg)) return;

    try {
      await api.post(`/admin/quiz-attempt/${attemptId}/override-state`, { state });
      toast.success(`Assessment state overridden to ${state.toUpperCase()} (RULE-010).`);
      loadAllAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to override attempt state');
    }
  };

  const handleDeleteAttempt = async (attemptId: string) => {
    if (!confirm('Are you sure you want to delete this assessment record?')) return;
    try {
      await api.delete(`/admin/quiz-attempt/${attemptId}`);
      toast.success('Attempt record removed.');
      loadAllAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete attempt');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const kpis = analytics?.kpis || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 border-b-2 border-dashed border-black dark:border-white/20 pb-6">
        <div>
          <div className="inline-block bg-main border-2 border-black dark:border-white px-2.5 py-0.5 rounded-sm shadow-neo-sm -rotate-1 font-black text-[11px] uppercase tracking-wider text-black dark:text-white mb-2">
            Supreme Authority Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white mt-1">
            SkillVerify Platform Administration
          </h1>
          <p className="text-xs sm:text-sm font-bold text-black dark:text-white/60 mt-0.5">
            Full governance across Users, Jobs, Quizzes, Courses, Overrides, and Intelligence Analytics.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap bg-yellow-50/80 p-2 rounded-base gap-2 border-2 border-black dark:border-white shadow-neo-sm">
          {[
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'users', label: `Users (${users.length})`, icon: Users },
            { id: 'jobs', label: `Jobs (${jobs.length})`, icon: Briefcase },
            { id: 'quizzes', label: `Quizzes (${quizzes.length})`, icon: HelpCircle },
            { id: 'courses', label: `Courses (${courses.length})`, icon: BookOpen },
            { id: 'attempts', label: `Attempts (${attempts.length})`, icon: Layers },
            { id: 'audit', label: 'Audit Logs', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-black rounded-sm border-2 transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-main text-black dark:text-white border-black dark:border-white shadow-neo-sm -translate-y-0.5'
                    : 'bg-white dark:bg-zinc-900 text-black dark:text-white/80 border-black dark:border-white/40 hover:bg-yellow-100 hover:text-black dark:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5 stroke-[2.5px]" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================== TAB 1: ANALYTICS DASHBOARD ==================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-base border-2 border-black dark:border-white shadow-neo">
              <span className="text-[10px] font-black uppercase text-black dark:text-white/60">Total Users</span>
              <div className="text-2xl font-black text-black dark:text-white mt-1">{kpis.totalUsers || 0}</div>
              <div className="text-[10px] text-black dark:text-white/70 font-bold mt-0.5">
                {kpis.totalApplicants} Applicants • {kpis.totalEmployers} Employers
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded-base border-2 border-black dark:border-white shadow-neo">
              <span className="text-[10px] font-black uppercase text-black dark:text-white/60">Job Circulars</span>
              <div className="text-2xl font-black text-black dark:text-white mt-1">{kpis.totalJobs || 0}</div>
              <div className="text-[10px] text-green-700 font-black mt-0.5">
                {kpis.activeJobs} Active • {kpis.suspendedJobs} Suspended
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded-base border-2 border-black dark:border-white shadow-neo">
              <span className="text-[10px] font-black uppercase text-black dark:text-white/60">Assessments Taken</span>
              <div className="text-2xl font-black text-black dark:text-white mt-1">{kpis.totalAssessmentsTaken || 0}</div>
              <div className="text-[10px] text-black dark:text-white/70 font-bold mt-0.5">
                {kpis.totalAttemptsRecorded} Total submissions
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded-base border-2 border-black dark:border-white shadow-neo">
              <span className="text-[10px] font-black uppercase text-black dark:text-white/60">Pass Rate</span>
              <div className="text-2xl font-black text-green-700 mt-1">{kpis.passRate || 0}%</div>
              <div className="text-[10px] text-black dark:text-white/70 font-bold mt-0.5">
                {kpis.passedCount} Certified • {kpis.failedCount} Failed
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded-base border-2 border-black dark:border-white shadow-neo">
              <span className="text-[10px] font-black uppercase text-black dark:text-white/60">Grooming Pipeline</span>
              <div className="text-2xl font-black text-amber-600 mt-1">{kpis.groomingCompleted || 0}</div>
              <div className="text-[10px] text-black dark:text-white/70 font-bold mt-0.5">
                {kpis.groomingEnrolled} Enrolled redemption
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded-base border-2 border-black dark:border-white shadow-neo">
              <span className="text-[10px] font-black uppercase text-black dark:text-white/60">Integrity Flags</span>
              <div className="text-2xl font-black text-alert-red mt-1">{kpis.totalIntegrityFlags || 0}</div>
              <div className="text-[10px] text-black dark:text-white/70 font-bold mt-0.5">Tab-switch/blur logged</div>
            </div>
          </div>

          {/* Pipeline & Skills Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hiring Pipeline Funnel */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span>Platform-Wide Candidate Pipeline</span>
                </h3>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                {[
                  { label: 'New', count: analytics?.pipeline?.new || 0, color: 'bg-slate-100 text-slate-800' },
                  { label: 'Reviewed', count: analytics?.pipeline?.reviewed || 0, color: 'bg-blue-50 text-blue-800' },
                  { label: 'Shortlisted', count: analytics?.pipeline?.shortlisted || 0, color: 'bg-purple-50 text-purple-800' },
                  { label: 'Interview', count: analytics?.pipeline?.interview || 0, color: 'bg-amber-50 text-amber-800' },
                  { label: 'Offered', count: analytics?.pipeline?.offered || 0, color: 'bg-emerald-50 text-emerald-800' },
                  { label: 'Rejected', count: analytics?.pipeline?.rejected || 0, color: 'bg-rose-50 text-rose-800' },
                ].map((st, i) => (
                  <div key={i} className={`p-3 rounded-2xl ${st.color} border border-slate-200/50`}>
                    <div className="text-xl font-black">{st.count}</div>
                    <div className="text-[10px] uppercase font-bold mt-1 tracking-wider">{st.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* In-Demand Skills */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>Top In-Demand Skills Required by Employers</span>
              </h3>

              <div className="flex flex-wrap gap-2">
                {analytics?.topSkills && analytics.topSkills.length > 0 ? (
                  analytics.topSkills.map((sk: any, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <span>{sk.name}</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-indigo-200 text-indigo-900 text-[10px]">
                        {sk.count}
                      </span>
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No skill data available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Employers Activity Table */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Employer Activity Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Company</th>
                    <th className="py-2.5 px-3">Contact Email</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Circulars Posted</th>
                    <th className="py-2.5 px-3">Applicants Evaluated</th>
                    <th className="py-2.5 px-3">Certified Candidates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics?.employers && analytics.employers.length > 0 ? (
                    analytics.employers.map((emp: any) => (
                      <tr key={emp.employerId} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 font-bold text-slate-900">{emp.companyName}</td>
                        <td className="py-3 px-3 text-slate-500">{emp.email}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                              emp.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {emp.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-indigo-600">{emp.jobsCount}</td>
                        <td className="py-3 px-3">{emp.applicantsCount}</td>
                        <td className="py-3 px-3 font-bold text-emerald-700">{emp.certifiedCandidates}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        No employers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: USER ACCOUNTS ==================== */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">User Account Administration</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Create accounts, edit profile details, reset passwords, or revoke access.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setNewUserModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white dark:text-black font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New User</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{u.fullName || u.companyName || '—'}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          u.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : u.status === 'suspended'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingUser({ ...u })}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                          title="Edit User Details"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResetPassword(u._id, u.email)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-indigo-50 text-indigo-600 transition"
                          title="Direct Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        {u.role !== 'admin' && (
                          <>
                            {u.status === 'active' ? (
                              <button
                                type="button"
                                onClick={() => handleSuspendUser(u._id)}
                                className="p-1.5 rounded-lg border border-amber-200 hover:bg-amber-100 text-amber-700 transition"
                                title="Suspend Account"
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRestoreUser(u._id)}
                                className="p-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 text-emerald-700 transition"
                                title="Restore Account"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u._id, u.email)}
                              className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-100 text-rose-700 transition"
                              title="Delete Account (RULE-007)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: JOB CIRCULARS ==================== */}
      {activeTab === 'jobs' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Platform Job Circulars</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review, modify, suspend, or delete any job circular across all employers.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Title & Company</th>
                  <th className="py-3 px-4">Pass Score</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation & Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{job.title}</div>
                      <div className="text-[11px] text-slate-500">
                        {job.companyName} • {job.location}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-indigo-600">{job.passingScore || 70}%</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(job.deadline).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          job.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : job.status === 'closed'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingJob({ ...job })}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                          title="Edit Job Details"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {job.status === 'suspended' ? (
                          <button
                            type="button"
                            onClick={() => handleRestoreJob(job._id)}
                            className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                            title="Restore Circular"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSuspendJob(job._id)}
                            className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                            title="Suspend Circular"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteJob(job._id, job.title)}
                          className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-100 text-rose-700 transition"
                          title="Delete Circular (RULE-007)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 4: QUIZZES & QUESTIONS ==================== */}
      {activeTab === 'quizzes' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Skill Gate Quizzes</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect question banks, modify pass thresholds, and remove invalid quizzes.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Attached Circular</th>
                  <th className="py-3 px-4">Questions</th>
                  <th className="py-3 px-4">Threshold</th>
                  <th className="py-3 px-4">Time Limit</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quizzes.map((quiz) => (
                  <tr key={quiz._id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{quiz.jobTitle}</div>
                      <div className="text-[10px] text-slate-400">{quiz.companyName}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-indigo-600">
                      {quiz.questionsCount} Questions
                    </td>
                    <td className="py-3.5 px-4">{quiz.passingScore}%</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {quiz.timeLimit ? `${quiz.timeLimit} mins` : 'No limit'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleViewQuiz(quiz._id)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          Inspect / Edit Questions
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuiz(quiz._id)}
                          className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-100 text-rose-700 transition"
                          title="Delete Quiz (RULE-007)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 5: GROOMING COURSES ==================== */}
      {activeTab === 'courses' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Grooming Curriculums</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect second-chance redemption modules, video links, files, and text materials.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Course Title & Job</th>
                  <th className="py-3 px-4">Modules Count</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((course) => (
                  <tr key={course._id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{course.title}</div>
                      <div className="text-[10px] text-slate-400">
                        {course.jobTitle} • {course.companyName}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-amber-700">
                      {course.modulesCount} Learning Modules
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleViewCourse(course._id)}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          Inspect Modules
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCourse(course._id)}
                          className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-100 text-rose-700 transition"
                          title="Delete Course (RULE-007)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 6: QUIZ ATTEMPTS & OVERRIDES ==================== */}
      {activeTab === 'attempts' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Quiz Attempts & State Overrides</h2>
            <p className="text-xs text-slate-500">
              Admins can reverse LOCKED attempts or grant second-chance reopens (RULE-010 & RULE-014).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Job Target</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4">Score / Attempts</th>
                  <th className="py-3 px-4">Integrity Flags</th>
                  <th className="py-3 px-4 text-right">Admin Overrides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempts.map((att) => (
                  <tr key={att._id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{att.applicantName}</td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div>{att.jobTitle}</div>
                      <div className="text-[10px] text-slate-400">{att.companyName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          att.state === 'passed' || att.state === 'final_passed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : att.state === 'locked'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : att.state === 'grooming_required'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {att.state}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {att.latestScore !== null ? `${att.latestScore}%` : '—'} ({att.attemptsCount}/2)
                    </td>
                    <td className="py-3.5 px-4">
                      {att.integrityFlags > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <ShieldAlert className="w-3 h-3 text-rose-600" />
                          <span>{att.integrityFlags} Flags</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Clean</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOverrideQuizState(att._id, QuizAttemptState.NOT_STARTED)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] px-2.5 py-1 rounded-lg transition inline-flex items-center gap-1"
                          title="Reopens quiz attempt, resets attempt counter, and archives old attempts into AuditLog per RULE-014"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset & Reopen</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOverrideQuizState(att._id, QuizAttemptState.PASSED)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] px-2.5 py-1 rounded-lg transition inline-flex items-center gap-1"
                          title="Forces status to PASSED"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Grant Pass</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAttempt(att._id)}
                          className="p-1 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Attempt Record"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 7: AUDIT LOGS ==================== */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
          <h2 className="text-base font-bold text-slate-900 mb-4">Immutable Audit Trail (RULE-007)</h2>
          <div className="space-y-3">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No destructive actions recorded yet.</p>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log._id}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <span className="font-extrabold text-indigo-700 uppercase bg-indigo-50 px-2 py-0.5 rounded mr-2">
                      {log.action}
                    </span>
                    <span className="text-slate-600 font-medium">
                      Target: {log.targetType} #{log.targetId}
                    </span>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <span className="block sm:inline sm:ml-2 text-[11px] text-slate-500 font-mono">
                        {JSON.stringify(log.metadata)}
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400 text-[11px] shrink-0">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ==================== MODALS ==================== */}

      {/* 1. Create User Modal */}
      {newUserModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Create New Platform User</h3>
              <button onClick={() => setNewUserModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Password</label>
                <input
                  type="text"
                  required
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Role</label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                >
                  <option value={Role.APPLICANT}>Applicant</option>
                  <option value={Role.EMPLOYER}>Employer</option>
                  <option value={Role.ADMIN}>Admin</option>
                </select>
              </div>

              {newUserData.role === Role.EMPLOYER ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={newUserData.companyName}
                    onChange={(e) => setNewUserData({ ...newUserData, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUserData.fullName}
                    onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setNewUserModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white dark:text-black font-bold hover:bg-indigo-700 shadow"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Edit User: {editingUser.email}</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              {editingUser.role === Role.EMPLOYER ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={editingUser.companyName || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingUser.fullName || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value={Role.APPLICANT}>Applicant</option>
                    <option value={Role.EMPLOYER}>Employer</option>
                    <option value={Role.ADMIN}>Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value={UserStatus.ACTIVE}>Active</option>
                    <option value={UserStatus.SUSPENDED}>Suspended</option>
                    <option value={UserStatus.DELETED}>Deleted</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white dark:text-black font-bold hover:bg-indigo-700 shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Edit Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Edit Job Circular</h3>
              <button onClick={() => setEditingJob(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateJob} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={editingJob.title}
                  onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={editingJob.location}
                  onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Passing Score (%)</label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    required
                    value={editingJob.passingScore}
                    onChange={(e) => setEditingJob({ ...editingJob, passingScore: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingJob.status}
                    onChange={(e) => setEditingJob({ ...editingJob, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    <option value={JobStatus.ACTIVE}>Active</option>
                    <option value={JobStatus.SUSPENDED}>Suspended</option>
                    <option value={JobStatus.CLOSED}>Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Job Description</label>
                <textarea
                  rows={4}
                  value={editingJob.description}
                  onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white dark:text-black font-bold hover:bg-indigo-700 shadow"
                >
                  Update Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Inspect / View Quiz Modal */}
      {inspectQuiz && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Quiz Questions for: {inspectQuiz.jobTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  Threshold: {inspectQuiz.passingScore}% • Total: {inspectQuiz.questions?.length} Questions
                </p>
              </div>
              <button onClick={() => setInspectQuiz(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {inspectQuiz.questions?.map((q: any, i: number) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-600 uppercase text-[11px]">
                      Question #{i + 1} {q.isMultiple && '(Multi-Select)'}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900">{q.text}</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {q.options?.map((opt: string, optIdx: number) => {
                      const isCorrect = q.isMultiple
                        ? q.correctIndices?.includes(optIdx)
                        : q.correctIndex === optIdx;
                      return (
                        <div
                          key={optIdx}
                          className={`p-2 rounded-xl border text-[11px] flex items-center justify-between ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                              : 'bg-white dark:bg-zinc-900 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span>
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </span>
                          {isCorrect && (
                            <span className="text-[9px] uppercase font-black text-emerald-700">Correct</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <div className="text-[11px] text-slate-500 bg-white dark:bg-zinc-900 p-2 rounded-lg border border-slate-200 mt-1">
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Inspect Course Modal */}
      {inspectCourse && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Course: {inspectCourse.title}</h3>
                <p className="text-xs text-slate-500">{inspectCourse.jobTitle}</p>
              </div>
              <button onClick={() => setInspectCourse(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                {inspectCourse.description}
              </p>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 uppercase text-[11px]">Curriculum Modules:</h4>
                {inspectCourse.modules?.map((m: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-white dark:bg-zinc-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{m.title}</span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-800">
                        {m.type}
                      </span>
                    </div>
                    {m.content?.text && (
                      <p className="text-slate-600 whitespace-pre-line text-[11px] bg-slate-50 p-2.5 rounded-lg">
                        {m.content.text}
                      </p>
                    )}
                    {m.content?.fileUrl && (
                      <div className="text-[11px] text-indigo-600 font-mono break-all">
                        Resource link: {m.content.fileUrl}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
