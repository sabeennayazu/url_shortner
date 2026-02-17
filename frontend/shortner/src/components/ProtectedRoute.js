import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * ProtectedRoute Component
 * 
 * Protects routes that require authentication
 * 
 * Behavior:
 * - While loading: Show loading spinner (prevents flash of login page)
 * - If not authenticated: Redirect to /login
 * - If authenticated: Render the protected content
 * 
 * Usage:
 * <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while verifying authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content if authenticated
  return children;
}

/**
 * PublicRoute Component
 * 
 * Routes that should only be accessible to unauthenticated users
 * (login, signup pages, etc.)
 * 
 * Behavior:
 * - While loading: Show loading spinner
 * - If authenticated: Redirect to /home
 * - If not authenticated: Render the public content
 * 
 * Usage:
 * <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
 */
export function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while verifying authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to home if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  // Render public content if not authenticated
  return children;
}
