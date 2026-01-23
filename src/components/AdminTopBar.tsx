import { Link } from 'react-router-dom';
import { Home, User, ChevronDown, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useState, useRef, useEffect } from 'react';
import { getImageUrl } from '../utils/imageUrl';

const AdminTopBar = () => {
  const { user, logout } = useStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout().then(() => {
      window.location.href = '/';
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-30">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left side - Website Link */}
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">Visit Website</span>
        </Link>

        {/* Right side - Admin Info */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {user?.avatar ? (
                <img
                  src={getImageUrl(user.avatar)}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-600"
                />
              ) : (
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.name ? getInitials(user.name) : 'A'}
                </div>
              )}
              <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <Link
                  to="/admin/profile"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>My Profile</span>
                </Link>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTopBar;
