import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome, {user?.username}!
            </h1>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <p className="text-gray-600 text-lg mb-8">
            You are successfully logged in.
          </p>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-600 p-6 rounded">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Profile</h2>
            <div className="space-y-3">
              <p className="text-gray-700">
                <span className="font-semibold text-gray-900">Username:</span>{' '}
                {user?.username}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold text-gray-900">Email:</span>{' '}
                {user?.email || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
