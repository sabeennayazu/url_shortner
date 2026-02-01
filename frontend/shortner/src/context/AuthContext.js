import React, { createContext, useCallback, useEffect, useState, useContext } from 'react';

export const AuthContext = createContext(null);

const API_URL = 'http://localhost:8000/accounts';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get CSRF token from cookie
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

  // Fetch helper with CSRF
  const fetchWithAuth = async (url, options = {}) => {
    const csrfToken = getCsrfToken();
    
    return fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRFToken': csrfToken }),
        ...options.headers,
      },
      ...options,
    });
  };

  // Initialize: get CSRF token and check auth status
  useEffect(() => {
    const initialize = async () => {
      try {
        // First, get CSRF token
        await fetch(`${API_URL}/csrf/`, { credentials: 'include' });
        
        // Then check if user is authenticated
        const res = await fetchWithAuth(`${API_URL}/me/`);
        const data = await res.json();
        
        if (res.ok && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Signup
  const signup = useCallback(async (username, email, password, passwordConfirm) => {
    setLoading(true);
    setError(null);
    
    try {
      const payload = {
        username,
        email,
        password,
        password_confirm: passwordConfirm,
      };
      
      console.log('Sending signup data:', payload);
      
      const res = await fetchWithAuth(`${API_URL}/register/`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setUser(data.user);
      return true;
    } catch (err) {
      const errorMessage = err.message || 'Signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Login
  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const payload = { username, password };
      
      console.log('Sending login data:', payload);
      
      const res = await fetchWithAuth(`${API_URL}/login/`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setUser(data.user);
      return true;
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await fetchWithAuth(`${API_URL}/logout/`, { method: 'POST' });
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signup,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};