import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { notify } from '../utils/notificationUtils';

export function Signup() {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  /**
   * Auto-redirect if already authenticated
   * Prevents showing signup page to logged-in users
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

    if (username.length > 150) {
      const error = 'Username is too long (max 150 characters)';
      setValidationError(error);
      notify.error(error);
      return false;
    }

    // Email validation
    if (!email || email.trim() === '') {
      const error = 'Email is required';
      setValidationError(error);
      notify.error(error);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = 'Please enter a valid email address';
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

    if (password.length < 8) {
      const error = 'Password must be at least 8 characters';
      setValidationError(error);
      notify.error(error);
      return false;
    }

    // Password confirmation validation
    if (!passwordConfirm) {
      const error = 'Password confirmation is required';
      setValidationError(error);
      notify.error(error);
      return false;
    }

    if (password !== passwordConfirm) {
      const error = 'Passwords do not match';
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

    // Validate before attempting signup
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setValidationError('');

    try {
      // Attempt signup
      await signup(username, email, password, passwordConfirm);

      // Show success message
      notify.success('✓ Account created successfully! Redirecting...');

      // Brief delay to show success message, then navigate
      setTimeout(() => {
        navigate('/home', { replace: true });
      }, 800);
    } catch (err) {
      // Comprehensive error handling
      let errorMessage = 'Signup failed. Please try again.';

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
        errorMessage.toLowerCase().includes('username') &&
        errorMessage.toLowerCase().includes('already')
      ) {
        errorMessage = 'This username is already taken. Please choose a different one.';
      } else if (
        errorMessage.toLowerCase().includes('email') &&
        errorMessage.toLowerCase().includes('already')
      ) {
        errorMessage =
          'This email is already registered. Please use a different email or log in.';
      } else if (errorMessage.toLowerCase().includes('password')) {
        errorMessage =
          'Password does not meet requirements. Use at least 8 characters.';
      } else if (errorMessage.toLowerCase().includes('network')) {
        errorMessage =
          'Network error. Please check your connection and try again.';
      } else if (
        errorMessage.toLowerCase().includes('mismatch') ||
        errorMessage.toLowerCase().includes('match')
      ) {
        errorMessage = 'Passwords do not match. Please check and try again.';
      }

      // Display error in popup
      setValidationError(errorMessage);
      notify.error(errorMessage);

      console.error('Signup error:', err); // Log full error for debugging
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
      <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl shadow-[0_8px_40px_rgba(31,38,135,0.25)] p-6 sm:p-8 w-full max-w-md border border-white/50 ring-1 ring-white/30 transition-all max-h-[95vh] overflow-y-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-2">
          Sign Up
        </h1>
        <p className="text-center text-gray-600 text-sm mb-6">
          Create your account to get started.
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
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              placeholder="Choose a unique username"
              className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-xl border border-white/40 shadow-inner text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">3-150 characters</p>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="Enter your email address"
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="At least 8 characters"
              className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-xl border border-white/40 shadow-inner text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="passwordConfirm"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="passwordConfirm"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              disabled={loading}
              placeholder="Re-enter your password"
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
                Creating account...
              </span>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-gray-600 text-xs sm:text-sm mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:text-blue-700 transition"
          >
            Login
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
