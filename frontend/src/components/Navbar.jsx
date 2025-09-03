import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
    setMenuOpen(false); // Close mobile menu after navigation
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setMenuOpen(false);
  };

  // Don't show navbar on login page
  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-[#0B192C] w-full shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 text-white font-bold text-xl cursor-pointer" onClick={() => navigate('/')}>
            Ministry Schedule
          </div>

          {/* User Info */}
          <div className="hidden md:flex items-center space-x-4 text-white">
            <div className="text-sm">
              <span className="font-medium">{user?.name}</span>
              <span className="text-gray-300 ml-2">({user?.team})</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user?.role === 'team_leader' && (
              <button 
                onClick={() => handleNavigation('/leader-dashboard')}
                className="bg-white text-[#0B192C] px-4 py-2 rounded hover:bg-gray-200 font-medium transition"
              >
                Leader Dashboard
              </button>
            )}
            {user?.role !== 'team_member' && (
              <button 
                onClick={() => handleNavigation('/member-dashboard')}
                className="bg-white text-[#0B192C] px-4 py-2 rounded hover:bg-gray-200 font-medium transition"
              >
                Member Dashboard
              </button>
            )}
            {user?.role !== 'team_member' && (
              <button 
                onClick={() => handleNavigation('/all-schedule')}
                className="bg-white text-[#0B192C] px-4 py-2 rounded hover:bg-gray-200 font-medium transition"
              >
                All Schedule
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 font-medium transition"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0B192C] px-2 pt-2 pb-3 space-y-1">
          {/* User Info Mobile */}
          <div className="px-4 py-2 text-white border-b border-gray-600 mb-2">
            <div className="text-sm">
              <span className="font-medium">{user?.name}</span>
              <span className="text-gray-300 ml-2">({user?.team})</span>
            </div>
          </div>
          
          {user?.role === 'team_leader' && (
            <button 
              onClick={() => handleNavigation('/leader-dashboard')}
              className="block w-full text-left bg-white text-[#0B192C] px-4 py-2 rounded hover:bg-gray-200 font-medium transition mb-2"
            >
              Leader Dashboard
            </button>
          )}
          {user?.role !== 'team_member' && (
            <button 
              onClick={() => handleNavigation('/member-dashboard')}
              className="block w-full text-left bg-white text-[#0B192C] px-4 py-2 rounded hover:bg-gray-200 font-medium transition mb-2"
            >
              Member Dashboard
            </button>
          )}
          {user?.role !== 'team_member' && (
            <button 
              onClick={() => handleNavigation('/all-schedule')}
              className="block w-full text-left bg-white text-[#0B192C] px-4 py-2 rounded hover:bg-gray-200 font-medium transition mb-2"
            >
              All Schedule
            </button>
          )}
          <button 
            onClick={handleLogout}
            className="block w-full text-left bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 font-medium transition"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
