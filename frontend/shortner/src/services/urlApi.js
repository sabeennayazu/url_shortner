// API service for URL shortener
// Use localhost for local development, martis.com will be the shortened URL domain
const API_URL = 'http://localhost:8000/api';

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
const fetchWithAuth = async (url, options = {}) => {
  const csrfToken = getCsrfToken();

  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken && { 'X-CSRFToken': csrfToken }),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
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
};
