import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { urlApi } from '../services/urlApi';
import { QRDisplay } from './qrdisplay';
import { HistoryModal } from './HistoryModal';
import {
  FiLogOut,
  FiClock,
  FiLink2,
  FiCheck,
  FiBarChart2,
  FiTrash2,
  FiQrCode
} from 'react-icons/fi';

export function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isShortened, setIsShortened] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await urlApi.createShortUrl(urlInput);
      setShortenedUrl(result);
      setIsShortened(true);
      setUrlInput('');
    } catch (err) {
      setError(err.message || 'Failed to shorten URL. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (shortenedUrl?.short_url) {
      navigator.clipboard.writeText(shortenedUrl.short_url);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    }
  };

  const handleShowAnalytics = async () => {
    if (!showAnalytics) {
      setAnalyticsLoading(true);
      try {
        const analyticsData = await urlApi.getUrlAnalytics(shortenedUrl.id);
        setAnalytics(analyticsData);
        setShowAnalytics(true);
      } catch (err) {
        setError('Failed to fetch analytics. Please try again.');
        console.error('Error:', err);
      } finally {
        setAnalyticsLoading(false);
      }
    } else {
      setShowAnalytics(false);
    }
  };

  const handleDeleteUrl = async () => {
    if (window.confirm('Are you sure you want to delete this shortened URL?')) {
      try {
        await urlApi.deleteUrl(shortenedUrl.id);
        handleShortenAnother();
      } catch (err) {
        setError('Failed to delete URL. Please try again.');
        console.error('Error:', err);
      }
    }
  };

  const handleShortenAnother = () => {
    setIsShortened(false);
    setShortenedUrl(null);
    setUrlInput('');
    setError(null);
    setShowAnalytics(false);
    setAnalytics(null);
  };


  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="backdrop-blur-sm sticky top-0 z-40 border-b border-white/20">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-4 border border-white/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                  Welcome back, {user?.username}!
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">Ready to shorten some links?</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowHistory(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white/40 hover:bg-white/60 text-gray-800 font-semibold rounded-xl transition-all duration-200 border border-white/30 backdrop-blur-sm hover:shadow-md text-sm"
                  title="View URL history"
                >
                  <FiClock className="text-lg" />
                  <span className="hidden sm:inline">History</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white/40 hover:bg-white/60 text-gray-800 font-semibold rounded-xl transition-all duration-200 border border-white/30 backdrop-blur-sm hover:shadow-md text-sm"
                  title="Logout"
                >
                  <FiLogOut className="text-lg text-red-600" />
                  <span className="hidden sm:inline text-red-500">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Modal */}
      <HistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 sm:py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* URL Shortener Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 border border-white/30">
            {!isShortened ? (
              <>
                {/* Input Section */}
                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-block p-2 sm:p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mb-3 sm:mb-4">
                    <FiLink2 className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Shorten Your URL</h2>
                  <p className="text-sm sm:text-base text-gray-600">Paste your long URL below and get a short link instantly</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div>
                    <label htmlFor="url" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Enter your long URL
                    </label>
                    <input
                      type="url"
                      id="url"
                      placeholder="https://example.com/very/long/url/that/needs/shortening"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      required
                      className="w-full px-4 py-3 sm:py-4 border-2 border-white/30 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base sm:text-lg bg-white/60 backdrop-blur-md"
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50/80 backdrop-blur-md border border-red-200 text-red-700 text-sm rounded-lg">
                      <p className="font-semibold mb-1">Error</p>
                      <p>{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '⏳ Shortening...' : '✨ Shorten URL'}
                  </button>
                </form>
              </>
            ) : (
              <>
                {/* Results Section */}
                <div className="text-center mb-6 sm:mb-8">
                  
            
                  <div className='flex items-center justify-center gap-2'>

                    <FiCheck className="w-8 h-8 sm:w-12 sm:h-12 text-green-600" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Your Link is Ready!</h2>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600">Share it anywhere you want</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 sm:gap-8">

                  {/* Short URL Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 flex items-center">
                      <FiLink2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600" />
                      Shortened URL
                    </h3>

                    <div className="bg-white/70 backdrop-blur-lg border border-white/30 rounded-2xl p-4 sm:p-6 shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs sm:text-sm font-medium text-blue-700">Original URL</span>
                      </div>
                      <p className="text-gray-600 text-xs sm:text-sm truncate mb-4">
                        {shortenedUrl?.original_url}
                      </p>

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs sm:text-sm font-medium text-blue-700">Short URL</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={shortenedUrl?.short_url || ''}
                          readOnly
                          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white/60 backdrop-blur-md border border-white/30 rounded-lg sm:rounded-xl font-mono text-gray-800 font-semibold text-xs sm:text-sm"
                        />
                        <button
                          onClick={handleCopyToClipboard}
                          className="px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors"
                          title="Copy to clipboard"
                        >
                          {copiedToClipboard ? (
                            <FiCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>

                      <div className="text-xs text-blue-600 mt-2">
                        Created: {new Date(shortenedUrl?.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={handleShowAnalytics}
                        disabled={analyticsLoading}
                        className="flex items-center justify-center gap-2 flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-blue-500 text-white rounded-lg sm:rounded-xl hover:bg-blue-600 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiBarChart2 className="text-base sm:text-lg" />
                        {analyticsLoading ? 'Loading...' : 'Analytics'}
                      </button>
                      <button
                        onClick={handleDeleteUrl}
                        className="flex items-center justify-center gap-2 flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-red-500 text-white rounded-lg sm:rounded-xl hover:bg-red-600 transition-colors font-medium text-sm"
                      >
                        <FiTrash2 className="text-base sm:text-lg" />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Analytics Section */}
                  {showAnalytics && analytics && (
                    <div className="space-y-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-700 flex items-center">
                        <FiBarChart2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600" />
                        Analytics
                      </h3>

                      <div className="bg-white/70 backdrop-blur-lg border border-white/30 rounded-2xl p-4 sm:p-6 shadow-lg">
                        <div className="text-center mb-4">
                          <div className="text-3xl sm:text-4xl font-bold text-blue-600">{analytics.total_clicks}</div>
                          <div className="text-xs sm:text-sm text-gray-600">Total Clicks</div>
                        </div>

                        {analytics.total_clicks > 0 && (
                          <div className="max-h-96 overflow-y-auto">
                            <div className="space-y-2">
                              {analytics.clicks.map((click, idx) => (
                                <div key={idx} className="bg-white/50 backdrop-blur-md p-2 sm:p-3 rounded-lg border border-white/30 text-xs">
                                  <div className="flex justify-between mb-1 gap-2">
                                    <span className="font-semibold text-gray-700 truncate">
                                      {new Date(click.clicked_at).toLocaleString()}
                                    </span>
                                    <span className="text-gray-500 flex-shrink-0">{click.ip_address}</span>
                                  </div>
                                  <div className="text-gray-600 truncate">{click.user_agent}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* QR Code Section */}
                  {!showAnalytics && (
                    <div className="space-y-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-700 flex items-center">
                        QR Code
                      </h3>

                      <div className="bg-white/70 backdrop-blur-lg border border-white/30 rounded-2xl p-4 sm:p-6 flex flex-col items-center shadow-lg">

                        <QRDisplay shortUrl={shortenedUrl.short_url} />

                        <button className="w-full px-4 py-2 sm:py-3 mt-4 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base">
                          Download QR Code
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Shorten Another Link Button (Outside Card) */}
          {isShortened && (
            <div className="text-center mt-6 sm:mt-8">
              <button
                onClick={handleShortenAnother}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white/80 backdrop-blur-lg text-blue-600 font-bold text-base sm:text-lg rounded-lg sm:rounded-2xl hover:bg-white/90 transform hover:scale-105 transition-all duration-200 shadow-2xl hover:shadow-2xl border border-white/30"
              >
                 ➕ Shorten Another Link
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}