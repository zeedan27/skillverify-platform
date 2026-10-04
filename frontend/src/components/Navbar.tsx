import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NotificationBell } from './NotificationBell';
import { Role } from '@skillverify/shared';
import { NeoButton } from './ui/NeoButton';
import {
  ShieldCheck,
  Briefcase,
  Award,
  User,
  LogOut,
  LayoutDashboard,
  PlusCircle,
  ListChecks,
  Building2,
  Sun,
  Moon,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-zinc-900/95 border-b-2 md:border-b-3 border-black dark:border-white shadow-neo-sm backdrop-blur transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-black text-xl text-black dark:text-white tracking-tight group">
          <div className="bg-main text-black dark:text-white p-1.5 rounded-base border-2 border-black dark:border-white shadow-neo-sm group-hover:rotate-6 transition-transform">
            <ShieldCheck className="w-5 h-5 stroke-[2.5px]" />
          </div>
          <span className="font-black text-lg sm:text-xl">SkillVerify</span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-3 sm:gap-6">
          {user ? (
            <>
              {user.role === Role.APPLICANT && (
                <>
                  <Link to="/jobs" className="text-sm font-black text-black dark:text-white hover:text-neutral-700 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 stroke-[2.5px]" />
                    <span className="hidden md:inline">Browse Jobs</span>
                  </Link>
                  <Link to="/my-applications" className="text-sm font-black text-black dark:text-white hover:text-neutral-700 flex items-center gap-1.5">
                    <ListChecks className="w-4 h-4 stroke-[2.5px]" />
                    <span className="hidden md:inline">My Applications</span>
                  </Link>
                  <Link to="/profile" className="text-sm font-black text-black dark:text-white hover:text-neutral-700 flex items-center gap-1.5">
                    <User className="w-4 h-4 stroke-[2.5px]" />
                    <span className="hidden md:inline">Profile</span>
                  </Link>
                  <Link to="/cv-preview" className="text-sm font-black text-black dark:text-white hover:text-neutral-700 flex items-center gap-1.5">
                    <Award className="w-4 h-4 stroke-[2.5px]" />
                    <span className="hidden md:inline">Verified CV</span>
                  </Link>
                </>
              )}

              {user.role === Role.EMPLOYER && (
                <>
                  <Link to="/employer/dashboard" className="text-sm font-black text-black dark:text-white hover:text-neutral-700 flex items-center gap-1.5">
                    <LayoutDashboard className="w-4 h-4 stroke-[2.5px]" />
                    <span className="hidden md:inline">Portal</span>
                  </Link>
                  <Link to="/employer/profile" className="text-sm font-black text-black dark:text-white hover:text-neutral-700 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 stroke-[2.5px]" />
                    <span className="hidden md:inline">Company</span>
                  </Link>
                  <Link to="/employer/jobs/create" className="text-sm font-black text-black dark:text-white hover:text-neutral-700 flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 stroke-[2.5px]" />
                    <span className="hidden md:inline">Post Job</span>
                  </Link>
                </>
              )}

              {user.role === Role.ADMIN && (
                <Link to="/admin" className="text-sm font-black text-black dark:text-white hover:text-neutral-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 stroke-[2.5px]" />
                  <span>Admin</span>
                </Link>
              )}

              {/* Notification Bell */}
              <NotificationBell />

              <div className="flex items-center gap-2.5 pl-3 border-l-2 border-black dark:border-white">
                <div className="flex items-center gap-2">
                  {(user as any).profilePhotoUrl ? (
                    <img
                      src={(user as any).profilePhotoUrl}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover border-2 border-black dark:border-white"
                    />
                  ) : null}
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-black text-black dark:text-white leading-tight">
                      {user.fullName || (user as any).companyName || user.email.split('@')[0]}
                    </div>
                    <span className="inline-block text-[10px] uppercase font-black px-1.5 py-0.5 rounded-sm bg-yellow-200 border border-black dark:border-white text-black dark:text-white">
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-1.5 rounded-base border-2 border-black dark:border-white bg-white dark:bg-zinc-900 hover:bg-alert-red hover:text-white dark:text-black transition shadow-neo-sm"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4 stroke-[2.5px]" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-black text-black dark:text-white hover:underline px-2">
                Sign In
              </Link>
              <Link to="/register">
                <NeoButton variant="primary" size="sm">
                  Start Learning
                </NeoButton>
              </Link>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-base border-2 border-black dark:border-white bg-white dark:bg-zinc-900 hover:bg-neutral-100 shadow-neo-sm transition"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
          </button>
        </nav>
      </div>
    </header>
  );
};
