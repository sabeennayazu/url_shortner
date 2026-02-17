import toast from 'react-hot-toast';

/**
 * Notification utility for consistent toast messages across the app
 * Provides methods for success, error, loading, and info notifications
 */
export const notify = {
  /**
   * Show success notification
   * @param {string} message - Success message to display
   * @param {object} options - Optional toast configuration
   */
  success: (message = 'Success!', options = {}) => {
    return toast.success(message, {
      duration: 4000,
      position: 'top-right',
      ...options,
      style: {
        background: '#10b981',
        color: '#fff',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
        fontSize: '14px',
        fontWeight: '500',
        ...options.style,
      },
    });
  },

  /**
   * Show error notification
   * @param {string} message - Error message to display
   * @param {object} options - Optional toast configuration
   */
  error: (message = 'Something went wrong', options = {}) => {
    return toast.error(message, {
      duration: 5000,
      position: 'top-right',
      ...options,
      style: {
        background: '#ef4444',
        color: '#fff',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
        fontSize: '14px',
        fontWeight: '500',
        ...options.style,
      },
    });
  },

  /**
   * Show warning notification
   * @param {string} message - Warning message to display
   * @param {object} options - Optional toast configuration
   */
  warning: (message = 'Warning', options = {}) => {
    return toast(message, {
      duration: 4000,
      position: 'top-right',
      ...options,
      style: {
        background: '#f59e0b',
        color: '#fff',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
        fontSize: '14px',
        fontWeight: '500',
        ...options.style,
      },
    });
  },

  /**
   * Show info notification
   * @param {string} message - Info message to display
   * @param {object} options - Optional toast configuration
   */
  info: (message = 'Info', options = {}) => {
    return toast(message, {
      duration: 4000,
      position: 'top-right',
      ...options,
      style: {
        background: '#3b82f6',
        color: '#fff',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
        fontSize: '14px',
        fontWeight: '500',
        ...options.style,
      },
    });
  },

  /**
   * Show loading toast
   * @param {string} message - Loading message to display
   * @returns {string} Toast ID for later updates or dismissal
   */
  loading: (message = 'Loading...', options = {}) => {
    return toast.loading(message, {
      position: 'top-right',
      ...options,
      style: {
        background: '#6b7280',
        color: '#fff',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(107, 114, 128, 0.15)',
        fontSize: '14px',
        fontWeight: '500',
        ...options.style,
      },
    });
  },

  /**
   * Update an existing toast
   * @param {string} toastId - ID of the toast to update
   * @param {object} options - Update configuration
   */
  update: (toastId, options = {}) => {
    toast.remove(toastId);
  },

  /**
   * Dismiss all active toasts
   */
  dismissAll: () => {
    toast.remove();
  },

  /**
   * Handle API errors and display appropriate message
   * @param {Error} error - The error object
   * @param {string} defaultMessage - Fallback message if error doesn't specify one
   */
  handleError: (error, defaultMessage = 'Something went wrong') => {
    let message = defaultMessage;

    if (error?.response?.data?.error) {
      message = error.response.data.error;
    } else if (error?.response?.data?.message) {
      message = error.response.data.message;
    } else if (error?.message) {
      message = error.message;
    }

    notify.error(message);
  },
};

export default notify;
