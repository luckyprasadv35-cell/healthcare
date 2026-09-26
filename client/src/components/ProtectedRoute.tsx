import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Activity } from 'lucide-react';
import AICoachWidget from './AICoachWidget';

const ProtectedRoute: React.FC = () => {
  const { session, loading, hasProfile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
        <Activity className="h-12 w-12 text-emerald-500 animate-pulse mb-4" />
        <p className="text-gray-400">Loading your profile...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (session && !hasProfile && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <>
      <Outlet />
      {hasProfile && <AICoachWidget />}
    </>
  );
};

export default ProtectedRoute;
