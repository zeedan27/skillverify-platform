import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Role } from '@skillverify/shared';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Applicant Pages
import { JobBrowsePage } from './pages/applicant/JobBrowsePage';
import { JobDetailsPage } from './pages/applicant/JobDetailsPage';
import { CompanyProfilePage } from './pages/applicant/CompanyProfilePage';
import { QuizPage } from './pages/applicant/QuizPage';
import { GroomingPage } from './pages/applicant/GroomingPage';
import { ApplicantLeaderboardPage } from './pages/applicant/ApplicantLeaderboardPage';
import { ApplicantProfilePage } from './pages/applicant/ApplicantProfilePage';
import { CVPreviewPage } from './pages/applicant/CVPreviewPage';
import { MyApplicationsPage } from './pages/applicant/MyApplicationsPage';

// Employer Pages
import { EmployerDashboardPage } from './pages/employer/EmployerDashboardPage';
import { CreateJobPage } from './pages/employer/CreateJobPage';
import { EditJobPage } from './pages/employer/EditJobPage';
import { QuizBuilderPage } from './pages/employer/QuizBuilderPage';
import { CourseCreatorPage } from './pages/employer/CourseCreatorPage';
import { EmployerLeaderboardPage } from './pages/employer/EmployerLeaderboardPage';
import { EmployerAnalyticsPage } from './pages/employer/EmployerAnalyticsPage';
import { EmployerProfilePage } from './pages/employer/EmployerProfilePage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

// Shared Authenticated Pages
import { NotificationsPage } from './pages/notifications/NotificationsPage';

import { PublicPortfolioPage } from './pages/public/PublicPortfolioPage';
import { LandingPage } from './pages/LandingPage';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/jobs" element={<JobBrowsePage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route path="/companies/:employerId" element={<CompanyProfilePage />} />
          <Route path="/verify/:slug" element={<PublicPortfolioPage />} />

          {/* Any Authenticated User */}
          <Route element={<ProtectedRoute allowedRoles={[Role.APPLICANT, Role.EMPLOYER, Role.ADMIN]} />}>
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          {/* Applicant Role Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={[Role.APPLICANT]} />}>
            <Route path="/quiz/:jobId" element={<QuizPage />} />
            <Route path="/grooming/:jobId" element={<GroomingPage />} />
            <Route path="/leaderboard/:jobId" element={<ApplicantLeaderboardPage />} />
            <Route path="/profile" element={<ApplicantProfilePage />} />
            <Route path="/my-applications" element={<MyApplicationsPage />} />
            <Route path="/cv-preview" element={<CVPreviewPage />} />
          </Route>

          {/* Employer Role Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={[Role.EMPLOYER]} />}>
            <Route path="/employer/dashboard" element={<EmployerDashboardPage />} />
            <Route path="/employer/profile" element={<EmployerProfilePage />} />
            <Route path="/employer/jobs/create" element={<CreateJobPage />} />
            <Route path="/employer/jobs/:jobId/edit" element={<EditJobPage />} />
            <Route path="/employer/jobs/:jobId/quiz" element={<QuizBuilderPage />} />
            <Route path="/employer/jobs/:jobId/course" element={<CourseCreatorPage />} />
            <Route path="/employer/jobs/:jobId/leaderboard" element={<EmployerLeaderboardPage />} />
            <Route path="/employer/jobs/:jobId/analytics" element={<EmployerAnalyticsPage />} />
          </Route>

          {/* Admin Role Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN]} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/jobs" replace />} />
        </Routes>
      </main>
    </div>
  );
};
