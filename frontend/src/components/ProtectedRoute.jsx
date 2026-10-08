import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/** Renders staff-only pages; everyone else is sent to the login page. */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/barber-login" replace state={{ from: location.pathname }} />;
  }
  return children;
};

export default ProtectedRoute;
