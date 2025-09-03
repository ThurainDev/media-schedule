import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectBasedOnRole(user.role);
    }
  }, [isAuthenticated, user]);

  const redirectBasedOnRole = (role) => {
    if (role === 'team_leader') {
      navigate('/leader-dashboard');
    } else if (role === 'team_member') {
      navigate('/member-dashboard');
    } else {
      // Fallback to member dashboard for unknown roles
      navigate('/member-dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      const result = await login(email, password);
      
      if (result.success) {
        // Redirect based on user role
        redirectBasedOnRole(result.user.role);
      }
    } catch (err) {
      setError(err.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-start justify-center">
      <div className="w-full max-w-md mt-10 bg-white/95 border border-[#0B4D8C]/20 rounded-2xl shadow-lg p-6 backdrop-blur-sm">
        <h1 className="text-2xl font-semibold text-center text-[#0B192C] mb-6">Sign In</h1>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B4D8C]/40"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm text-gray-700">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="text-xs text-[#0B4D8C] hover:underline"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B4D8C]/40"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 rounded-md px-4 py-2 text-white font-medium ${loading ? 'bg-[#0B4D8C]/60' : 'bg-[#0B4D8C] hover:bg-[#0B4D8C]/80'} transition`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Test Account Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Test Accounts:</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>Team Leader:</strong> photo.leader@church.com / password123</p>
            <p><strong>Team Member:</strong> photo1@church.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
