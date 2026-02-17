import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { HomePage } from './components/HomePage';
import './App.css';

/**
 * Main App Component
 * 
 * Routing Structure:
 * - /login → Login page (public, redirects to /home if authenticated)
 * - /signup → Signup page (public, redirects to /home if authenticated)
 * - /home → HomePage (protected, redirects to /login if not authenticated)
 * - / → Default redirect to /home (which then redirects to /login if not authenticated)
 * 
 * All routes use proper route protection to prevent unauthorized access
 * and avoid showing protected content during loading
 */
function App() {
  return (
    <div className="min-h-screen bg-white">
      {/* Toast notifications container */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        }}
      />

      {/* Router wraps everything for client-side routing */}
      <Router>
        {/* AuthProvider must wrap all routes to make auth context available */}
        <AuthProvider>
          <Routes>
            {/* Login Route - Public (redirects to /home if authenticated) */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            {/* Signup Route - Public (redirects to /home if authenticated) */}
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            />

            {/* Home Route - Protected (redirects to /login if not authenticated) */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />

            {/* Default Route - Redirects to /home */}
            {/* The ProtectedRoute will handle redirecting to /login if needed */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* Catch-all Route - Redirects to /home for unknown paths */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
