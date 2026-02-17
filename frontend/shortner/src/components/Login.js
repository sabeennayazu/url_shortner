import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { notify } from '../utils/notificationUtils';

export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  /**
   * Auto-redirect if already authenticated
   * Prevents showing login page to logged-in users
   */
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  /**
   * Validate form inputs before submission
   */
  const validateForm = () => {
    // Clear previous validation errors
    setValidationError('');

    // Username validation
    if (!username || username.trim() === '') {
      const error = 'Username is required';
      setValidationError(error);
      notify.error(error);
      return false;
    }

    if (username.length < 3) {
      const error = 'Username must be at least 3 characters';
      setValidationError(error);
      notify.error(error);
      return false;
    }

    // Password validation
    if (!password) {
      const error = 'Password is required';
      setValidationError(error);
      notify.error(error);
      return false;
    }

    if (password.length < 1) {
      const error = 'Password cannot be empty';
      setValidationError(error);
      notify.error(error);
      return false;
    }

    return true;
  };

  /**
   * Handle form submission
   * Includes comprehensive error handling with popup display
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate before attempting login
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setValidationError('');

    try {
      // Attempt login
      await login(username, password);

      // Show success message
      notify.success('✓ Login successful! Redirecting...');

      // Brief delay to show success message, then navigate
      setTimeout(() => {
        navigate('/home', { replace: true });
      }, 800);
    } catch (err) {
      // Comprehensive error handling
      let errorMessage = 'Login failed. Please try again.';

      // Extract error message from different error types
      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.details?.error) {
        errorMessage = err.details.error;
      } else if (err?.details?.detail) {
        errorMessage = err.details.detail;
      }

      // Map common backend error messages to user-friendly versions
      if (
        errorMessage.toLowerCase().includes('not found') ||
        errorMessage.toLowerCase().includes('invalid username')
      ) {
        errorMessage =
          'Username not found. Please check your username or sign up.';
      } else if (
        errorMessage.toLowerCase().includes('invalid password') ||
        errorMessage.toLowerCase().includes('password')
      ) {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (errorMessage.toLowerCase().includes('network')) {
        errorMessage =
          'Network error. Please check your connection and try again.';
      }

      // Display error in popup
      setValidationError(errorMessage);
      notify.error(errorMessage);

      console.error('Login error:', err); // Log full error for debugging
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-8 overflow-hidden bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-200">
      {/* Subtle Noise Texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>

      {/* Background Blur Blobs */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-400/30 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gray-400/30 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-indigo-300/30 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>

      {/* Glass Card */}
      <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl shadow-[0_8px_40px_rgba(31,38,135,0.25)] p-6 sm:p-8 w-full max-w-md border border-white/50 ring-1 ring-white/30 transition-all">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-2">
          Login
        </h1>
        <p className="text-center text-gray-600 text-sm mb-6">
          Welcome back! Enter your credentials.
        </p>

        {/* Validation Error Display */}
        {validationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{validationError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              placeholder="Enter your username"
              autoComplete="username"
              className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-xl border border-white/40 shadow-inner text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-xl border border-white/40 shadow-inner text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center text-gray-600 text-xs sm:text-sm mt-6">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-blue-600 font-semibold hover:text-blue-700 transition"
          >
            Sign Up
          </Link>
        </p>
      </div>

      {/* Autofill Style Fix */}
      <style>
        {`
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus,
          input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 1000px rgba(255,255,255,0.5) inset !important;
            -webkit-text-fill-color: #1f2937 !important;
            transition: background-color 9999s ease-in-out 0s;
          }
        `}
      </style>
    </div>
  );
}
