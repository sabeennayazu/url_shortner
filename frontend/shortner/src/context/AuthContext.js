import React, { createContext, useCallback, useEffect, useState, useContext } from 'react';

export const AuthContext = createContext(null);

/**
 * Get API base URL from environment variables
 * Falls back to localhost:8000 for local development if not set
 */
const getApiBaseUrl = () => {
  return process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();
const ACCOUNTS_API = `${API_BASE_URL}/accounts`;

/**
 * Extract meaningful error message from API response
 * Handles various Django and custom error formats
 */
const extractErrorMessage = (data, defaultMessage = 'Request failed') => {
  if (typeof data === 'string') {
    return data;
  }

  if (data?.error) {
    return data.error;
  }

  if (data?.detail) {
    return data.detail;
  }

  if (data?.message) {
    return data.message;
  }

  // Handle field-specific errors (from Django serializers)
  if (typeof data === 'object' && data !== null) {
    const firstError = Object.values(data).find(
      (val) => typeof val === 'string' || (Array.isArray(val) && val.length > 0)
    );
    if (firstError) {
      return Array.isArray(firstError) ? firstError[0] : firstError;
    }
  }

  return defaultMessage;
};

/**
 * Helper function to make authenticated requests with CSRF protection
 * Uses session-based auth with credentials: 'include'
 * Compatible with both local development and production deployments
 */
const fetchWithAuth = async (url, options = {}) => {
  const getCsrfToken = () => {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  const csrfToken = getCsrfToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(csrfToken && { 'X-CSRFToken': csrfToken }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include cookies for session auth across domains
  });

  if (!response.ok) {
    let data = {};
    try {
      data = await response.json();
    } catch {
      data = { error: `HTTP ${response.status}` };
    }
    const error = new Error(extractErrorMessage(data, 'Request failed'));
    error.statusCode = response.status;
    error.details = data;
    throw error;
  }

  return response;
};

/**
 * Verify user authentication by calling /me/ endpoint
 * This is the source of truth for authentication
 * Returns user object if authenticated, null otherwise
 */
const verifyAuthentication = async () => {
  try {
    const res = await fetchWithAuth(`${ACCOUNTS_API}/me/`);
    const data = await res.json();

    if (data.user) {
      return data.user;
    }
    return null;
  } catch (err) {
    // Verification failed - user is not authenticated
    console.debug('Authentication verification failed:', err?.message);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Initialize app: Get CSRF token and check if user is already authenticated
   * Runs once on app mount
   * This is critical for:
   * - Preventing auto-login with invalid sessions
   * - Supporting page refreshes while maintaining valid sessions
   * - Working correctly in production with separate domains
   */
  useEffect(() => {
    let isMounted = true; // Prevent state updates after unmount

    const initialize = async () => {
      try {
        // Step 1: Get CSRF token (sets cookie)
        // This is necessary for CSRF-protected endpoints
        await fetch(`${ACCOUNTS_API}/csrf/`, { credentials: 'include' }).catch(
          (err) => {
            console.debug('CSRF token fetch failed (may be expected):', err?.message);
          }
        );

        // Step 2: Verify if there's an active session by checking /me/ endpoint
        // This is the ONLY way to determine if user is actually authenticated
        const authenticatedUser = await verifyAuthentication();

        if (isMounted) {
          if (authenticatedUser) {
            // User has a valid session
            setUser(authenticatedUser);
          } else {
            // No valid session - user must login
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Authentication initialization error:', err);
        if (isMounted) {
          setUser(null); // Fail safely - user is not authenticated
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false; // Cleanup: prevent state updates after unmount
    };
  }, []); // Empty dependency array: runs exactly once on mount

  /**
   * Login user and verify authentication
   * Don't trust the login response alone - verify with /me/
   */
  const login = useCallback(async (username, password) => {
    setError(null);
    setLoading(true);

    try {
      // Step 1: Send login request
      const response = await fetchWithAuth(`${ACCOUNTS_API}/login/`, {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          extractErrorMessage(data, 'Login failed. Please try again.')
        );
      }

      // Step 2: Verify authentication via /me/ endpoint
      // This ensures the session is valid on the backend
      const authenticatedUser = await verifyAuthentication();

      if (authenticatedUser) {
        setUser(authenticatedUser);
        setError(null);
        return true;
      } else {
        // Login response was OK but /me/ verification failed
        // This shouldn't happen, but handle it gracefully
        throw new Error(
          'Login succeeded but session verification failed. Please try again.'
        );
      }
    } catch (err) {
      const errorMessage =
        err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      setUser(null);
      throw err; // Re-throw for component to handle
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign up user and verify authentication
   * Similar to login - verify with /me/ after signup
   */
  const signup = useCallback(async (username, email, password, passwordConfirm) => {
    setError(null);
    setLoading(true);

    try {
      // Step 1: Send signup request
      const response = await fetchWithAuth(`${ACCOUNTS_API}/register/`, {
        method: 'POST',
        body: JSON.stringify({
          username,
          email,
          password,
          password_confirm: passwordConfirm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          extractErrorMessage(data, 'Signup failed. Please try again.')
        );
      }

      // Step 2: Verify authentication via /me/ endpoint
      // This ensures the session is valid after signup
      const authenticatedUser = await verifyAuthentication();

      if (authenticatedUser) {
        setUser(authenticatedUser);
        setError(null);
        return true;
      } else {
        // Signup response was OK but /me/ verification failed
        throw new Error(
          'Account created but session verification failed. Please log in.'
        );
      }
    } catch (err) {
      const errorMessage =
        err.message || 'Signup failed. Please try again.';
      setError(errorMessage);
      setUser(null);
      throw err; // Re-throw for component to handle
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user and fully clear all auth state
   * Always clears frontend state even if API request fails
   */
  const logout = useCallback(async () => {
    try {
      // Attempt to notify backend of logout
      await fetchWithAuth(`${ACCOUNTS_API}/logout/`, { method: 'POST' });
    } catch (err) {
      // Even if logout API call fails, we clear frontend state for security
      console.error('Logout API error:', err);
    } finally {
      // Always clear local auth state - this is critical for security
      setUser(null);
      setError(null);
      // Note: Session cookies are managed by the browser and will expire
      // No need to manually clear localStorage (we don't use it for auth)
    }
  }, []);

  /**
   * Clear error state (useful for dismissing error messages)
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh authentication state
   * Call this if you need to re-verify authentication (e.g., after profile change)
   */
  const refreshAuth = useCallback(async () => {
    const authenticatedUser = await verifyAuthentication();
    if (authenticatedUser) {
      setUser(authenticatedUser);
    } else {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        clearError,
        signup,
        login,
        logout,
        refreshAuth,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access authentication context
 * Must be used within an AuthProvider
 * Throws error if used outside provider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider. ' +
        'Make sure AuthProvider wraps your components.'
    );
  }
  return context;
};