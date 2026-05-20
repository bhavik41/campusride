import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { unreadTotal, fetchUnreadCount } = useChatStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Poll unread count every 30s when logged in
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30_000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-700">
            <span className="text-2xl">🚗</span>
            <span>CampusRide</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/search"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/search')
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Find a Ride
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/post-ride"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/post-ride')
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Post a Ride
                </Link>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </Link>
                {/* Messages with unread badge */}
                <Link
                  to="/chat"
                  className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/chat')
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Messages
                  {unreadTotal > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {unreadTotal > 9 ? '9+' : unreadTotal}
                    </span>
                  )}
                </Link>
              </>
            )}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {user?.isStudent && (
                  <span className="badge-student">🎓 Student</span>
                )}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xs">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span>{user?.name?.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} className="btn-ghost text-sm">
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 relative"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {unreadTotal > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 w-2 h-2 rounded-full" />
            )}
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            <Link
              to="/search"
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              Find a Ride
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/post-ride"
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Post a Ride
                </Link>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/chat"
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  <span>Messages</span>
                  {unreadTotal > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                      {unreadTotal}
                    </span>
                  )}
                </Link>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-primary-700 hover:bg-primary-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
