/**
 * API service for URL shortener
 * Handles all API calls for URL management, analytics, and history
 * 
 * Configuration:
 * - Uses environment variable REACT_APP_API_BASE_URL (defaults to localhost:8000)
 * - Works with session-based authentication
 * - Includes CSRF token protection
 */

// Get API base URL from environment variables
const getApiBaseUrl = () => {
  return process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();
const API_URL = `${API_BASE_URL}/api`;

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

// Fetch helper with authentication
// Includes CSRF protection and proper error handling
const fetchWithAuth = async (url, options = {}) => {
  const csrfToken = getCsrfToken();

  const response = await fetch(url, {
    credentials: 'include', // Include cookies for session auth
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken && { 'X-CSRFToken': csrfToken }),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let error;
    try {
      const data = await response.json();
      error = data.error || data.detail || `HTTP error! status: ${response.status}`;
    } catch {
      error = `HTTP error! status: ${response.status}`;
    }
    throw new Error(error);
  }

  return response.json();
};

export const urlApi = {
  /**
   * Create a shortened URL
   * @param {string} originalUrl - The original long URL
   * @returns {Promise<Object>} Created URL object with short_code and short_url
   */
  createShortUrl: async (originalUrl) => {
    return fetchWithAuth(`${API_URL}/urls/create/`, {
      method: 'POST',
      body: JSON.stringify({ original_url: originalUrl }),
    });
  },

  /**
   * Get all user's shortened URLs
   * @returns {Promise<Object>} Object containing count and urls array
   */
  getUserUrls: async () => {
    return fetchWithAuth(`${API_URL}/urls/`, {
      method: 'GET',
    });
  },

  /**
   * Get analytics for a specific URL
   * @param {number} urlId - The ID of the URL
   * @returns {Promise<Object>} Analytics object with clicks data
   */
  getUrlAnalytics: async (urlId) => {
    return fetchWithAuth(`${API_URL}/urls/${urlId}/analytics/`, {
      method: 'GET',
    });
  },

  /**
   * Delete a shortened URL
   * @param {number} urlId - The ID of the URL to delete
   * @returns {Promise<Object>} Confirmation message
   */
  deleteUrl: async (urlId) => {
    return fetchWithAuth(`${API_URL}/urls/${urlId}/delete/`, {
      method: 'DELETE',
    });
  },

  /**
   * Get user's URL history
   * @returns {Promise<Object>} Object containing urls array with short_url and clicks
   */
  getHistory: async () => {
    return fetchWithAuth(`${API_URL}/urls/`, {
      method: 'GET',
    });
  },
};
