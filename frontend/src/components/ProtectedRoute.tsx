import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '@skillverify/shared';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== Role.ADMIN) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-red-50 rounded-xl border border-red-200 text-center">
        <h2 className="text-lg font-bold text-red-800">Access Denied</h2>
        <p className="text-sm text-red-600 mt-2">
          Your account role ({user.role}) does not have permission to view this page.
        </p>
      </div>
    );
  }

  return <Outlet />;
};
