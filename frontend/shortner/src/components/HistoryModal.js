import React, { useState, useEffect } from 'react';
import { FiX, FiClock } from 'react-icons/fi';
import { urlApi } from '../services/urlApi';

export function HistoryModal({ isOpen, onClose }) {
  const [urlHistory, setUrlHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
      // Prevent background scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore background scroll
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await urlApi.getHistory();
      setUrlHistory(response.urls || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch history');
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={handleBackdropClick}
      onKeydown={handleKeydown}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 w-full max-w-2xl max-h-[80vh] flex flex-col animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <FiClock className="text-2xl text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">URL History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/30 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <FiX className="text-xl text-gray-600 hover:text-gray-800" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <div className="inline-block animate-spin mb-3">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
                </div>
                <p className="text-gray-600">Loading history...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : urlHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <FiClock className="text-5xl mb-3 opacity-40" />
              <p className="text-lg font-semibold">No history yet</p>
              <p className="text-sm">Start shortening URLs to see them here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-fixed">
                <thead>
                  <tr className="border-b-2 border-white/30">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Shortened URL</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 w-32">Click Count</th>
                  </tr>
                </thead>
                <tbody>
                  {urlHistory.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-white/20 hover:bg-white/40 transition-colors"
                    >
                      <td className="py-3 px-4 min-w-0">
                        <div className="space-y-1 overflow-hidden">
                          <p className="font-mono font-semibold text-blue-600 truncate">
                            {item.short_url}
                          </p>
                          <p className="text-xs text-gray-500 truncate" title={item.original_url}>
                            {item.original_url}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right w-32 flex-shrink-0">
                        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-semibold">
                          {item.clicks}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && urlHistory.length > 0 && (
          <div className="border-t border-white/20 p-4 bg-white/30 text-xs text-gray-600 text-center">
            Showing {urlHistory.length} {urlHistory.length === 1 ? 'URL' : 'URLs'}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
