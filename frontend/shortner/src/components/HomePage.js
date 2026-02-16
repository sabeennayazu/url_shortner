import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { urlApi } from '../services/urlApi';

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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome back, {user?.username}!
              </h1>
              <p className="text-purple-100 text-sm mt-1">Ready to shorten some links?</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition-all duration-200 border border-white/30 backdrop-blur-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* URL Shortener Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            
            {!isShortened ? (
              <>
                {/* Input Section */}
                <div className="text-center mb-8">
                  <div className="inline-block p-3 bg-purple-100 rounded-2xl mb-4">
                    <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Shorten Your URL</h2>
                  <p className="text-gray-500">Paste your long URL below and get a short link instantly</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                      Enter your long URL
                    </label>
                    <input
                      type="url"
                      id="url"
                      placeholder="https://example.com/very/long/url/that/needs/shortening"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      required
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg"
                    />
                  </div>
                  
                  {error && (
                    <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
                      {error}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg rounded-2xl hover:from-purple-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '⏳ Shortening...' : '✨ Shorten URL'}
                  </button>
                </form>
              </>
            ) : (
              <>
                {/* Results Section */}
                <div className="text-center mb-8">
                  <div className="inline-block p-3 bg-green-100 rounded-2xl mb-4">
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Link is Ready!</h2>
                  <p className="text-gray-500">Share it anywhere you want</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  
                  {/* Short URL Section */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-700 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Shortened URL
                    </h3>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-purple-700">Original URL</span>
                      </div>
                      <p className="text-gray-600 text-sm truncate mb-4">
                        {shortenedUrl?.original_url}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-purple-700">Short URL</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={shortenedUrl?.short_url || ''}
                          readOnly
                          className="flex-1 px-4 py-3 bg-white border border-purple-300 rounded-xl font-mono text-purple-900 font-semibold"
                        />
                        <button
                          onClick={handleCopyToClipboard}
                          className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                          title="Copy to clipboard"
                        >
                          {copiedToClipboard ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      
                      <div className="text-xs text-purple-600 mt-2">
                        Created: {new Date(shortenedUrl?.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <button 
                        onClick={handleShowAnalytics}
                        disabled={analyticsLoading}
                        className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {analyticsLoading ? '⏳ Loading...' : '📊 Analytics'}
                      </button>
                      <button 
                        onClick={handleDeleteUrl}
                        className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                  {/* Analytics Section */}
                  {showAnalytics && analytics && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-700 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Analytics
                      </h3>
                      
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6">
                        <div className="text-center mb-4">
                          <div className="text-4xl font-bold text-blue-600">{analytics.total_clicks}</div>
                          <div className="text-sm text-gray-600">Total Clicks</div>
                        </div>
                        
                        {analytics.total_clicks > 0 && (
                          <div className="max-h-96 overflow-y-auto">
                            <div className="space-y-2">
                              {analytics.clicks.map((click, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-lg border border-blue-100 text-xs">
                                  <div className="flex justify-between mb-1">
                                    <span className="font-semibold text-gray-700">
                                      {new Date(click.clicked_at).toLocaleString()}
                                    </span>
                                    <span className="text-gray-500">{click.ip_address}</span>
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
                      <h3 className="text-xl font-semibold text-gray-700 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        QR Code
                      </h3>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-6 flex flex-col items-center">
                        {/* Placeholder QR Code */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg mb-4">
                          <div className="w-48 h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                            <svg className="w-32 h-32 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                          </div>
                        </div>
                        
                        <button className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium">
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
            <div className="text-center mt-8">
              <button
                onClick={handleShortenAnother}
                className="px-8 py-4 bg-white text-purple-600 font-bold text-lg rounded-2xl hover:bg-purple-50 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-purple-200"
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