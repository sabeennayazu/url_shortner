import React, { useState } from 'react';
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
  const handleDownloadQR = () => {
    const svg = document.getElementById("qr-code-svg");

    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const img = new Image();
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "qr-code.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    img.src = url;
  };


  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <div className="sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgba(31,38,135,0.15)] p-4 border border-white/40 ring-1 ring-white/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                  Welcome back, {user?.username}!
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  Ready to shorten some links?
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowHistory(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white/40 hover:bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl transition shadow-lg text-sm"
                >
                  <FiClock className="text-lg" />
                  <span className="hidden sm:inline">History</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white/40 hover:bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl transition shadow-lg text-sm"
                >
                  <FiLogOut className="text-lg text-red-600" />
                  <span className="hidden sm:inline text-red-500">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <HistoryModal isOpen={showHistory} onClose={() => setShowHistory(false)} />

      <div className="container mx-auto px-4 py-6 sm:py-12">
        <div className="max-w-4xl mx-auto">

          {/* Main Card */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(31,38,135,0.15)] p-6 sm:p-8 md:p-12 border border-white/40 ring-1 ring-white/30">

            {!isShortened ? (
              <>
                <div className="text-center mb-8">
                  <div className="inline-block p-4 bg-white/40 backdrop-blur-xl border border-white/40 rounded-3xl shadow-inner mb-4">
                    <FiLink2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                    Shorten Your URL
                  </h2>
                  <p className="text-gray-600">
                    Paste your long URL below and get a short link instantly
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    required
                    placeholder="https://example.com/very/long/url"
                    className="w-full px-5 py-4 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/40 shadow-inner text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />

                  {error && (
                    <div className="p-4 bg-red-100/60 backdrop-blur-md border border-red-200 text-red-700 text-sm rounded-xl">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-[1.02] shadow-lg"
                  >
                    {loading ? 'Shortening...' : 'Shorten URL'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="flex text-center justify-center mb-2 gap-2">
                  <FiCheck className="w-12 h-12 text-green-600 mb-2" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    Your Link is Ready!
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">

                  {/* URL Card */}
                  <div className="bg-white/50 backdrop-blur-2xl border border-white/40 rounded-3xl p-6 shadow-[0_8px_32px_rgba(31,38,135,0.12)] ring-1 ring-white/30 space-y-6">

                    {/* Original URL */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Original URL</p>
                      <p className="text-sm text-gray-700 truncate">
                        {shortenedUrl?.original_url}
                      </p>
                    </div>

                    {/* Short URL */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">Short URL</p>
                      <div className="flex items-center gap-2">
                        <input
                          readOnly
                          value={shortenedUrl?.short_url || ''}
                          className="flex-1 px-4 py-3 rounded-xl bg-white/40 backdrop-blur-xl border border-white/40 shadow-inner font-mono text-sm text-gray-800 focus:outline-none"
                        />
                        <button
                          onClick={handleCopyToClipboard}
                          className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium shadow-sm active:scale-[0.97]"
                        >
                          {copiedToClipboard ? <FiCheck /> : 'Copy'}
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 pt-2">

                      <button
                        onClick={handleShowAnalytics}
                        className="w-full py-3 bg-purple-500 text-white font-medium rounded-xl hover:bg-purple-600 transition-all shadow-md active:scale-[0.98]"
                      >
                        {analyticsLoading
                          ? 'Loading...'
                          : showAnalytics
                            ? 'Hide Analytics'
                            : 'View Analytics'}
                      </button>

                      <button
                        onClick={handleDeleteUrl}
                        className="w-full py-3 bg-red-500/90 text-white font-medium rounded-xl hover:bg-red-600 transition-all shadow-sm active:scale-[0.98]"
                      >
                        Delete
                      </button>

                    </div>
                  </div>


                  {/* QR / Analytics Card */}
                  <div className="bg-white/50 backdrop-blur-2xl border border-white/40 rounded-3xl p-6 shadow-[0_8px_32px_rgba(31,38,135,0.12)] ring-1 ring-white/30">

                    {!showAnalytics ? (
                      <>
                        <QRDisplay shortUrl={shortenedUrl.short_url} />
                        <button onClick={handleDownloadQR} className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
                          Download QR Code
                        </button>
                      </>
                    ) : (
                      analytics && (
                        <div className="text-center">
                          <div className="text-4xl font-bold text-blue-600">
                            {analytics.total_clicks}
                          </div>
                          <div className="text-gray-600 text-sm">
                            Total Clicks
                          </div>
                        </div>
                      )
                    )}
                  </div>

                </div>
              </>
            )}
          </div>

          {isShortened && (
            <div className="text-center mt-8">
              <button
                onClick={handleShortenAnother}
                className="px-8 py-4 bg-white/50 backdrop-blur-2xl border border-white/40 rounded-3xl font-semibold text-blue-600 hover:bg-white/60 transition shadow-lg ring-1 ring-white/30"
              >
                Shorten Another Link
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

}