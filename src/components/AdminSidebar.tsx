import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Store,
  Package,
  ShoppingBag,
  Settings,
  BarChart3,
  FileText,
  LogOut,
  Menu,
  X,
  Wallet
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useState, useEffect } from 'react';

const AdminSidebar = () => {
  const location = useLocation();
  const { logout, user } = useStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
      exact: true,
    },
    {
      title: 'Users',
      icon: Users,
      path: '/admin/users',
    },
    {
      title: 'Customers',
      icon: UserCheck,
      path: '/admin/customers',
    },
    {
      title: 'Vendors',
      icon: Store,
      path: '/admin/vendors',
    },
    {
      title: 'Agents',
      icon: Package,
      path: '/admin/agents',
    },
    {
      title: 'Purchases',
      icon: ShoppingBag,
      path: '/admin/purchases',
    },
    {
      title: 'Wallets',
      icon: Wallet,
      path: '/admin/wallets',
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      path: '/admin/analytics',
    },
    {
      title: 'Reports',
      icon: FileText,
      path: '/admin/reports',
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/admin/settings',
    },
  ];

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout().then(() => {
      window.location.href = '/';
    });
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-16 left-4 z-50 bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="p-4 sm:p-6 border-b border-blue-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-blue-900 font-bold text-xl">GA</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold truncate">GreatAmerican.Ai</h2>
              <p className="text-xs text-blue-200">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-blue-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-700 flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-blue-200 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu - Scrollable */}
        <nav 
          className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 min-h-0"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#2563eb #1e3a8a',
          }}
        >
          <style>{`
            nav::-webkit-scrollbar {
              width: 6px;
            }
            nav::-webkit-scrollbar-track {
              background: rgba(30, 58, 138, 0.3);
              border-radius: 10px;
              margin: 8px 0;
            }
            nav::-webkit-scrollbar-thumb {
              background: #2563eb;
              border-radius: 10px;
            }
            nav::-webkit-scrollbar-thumb:hover {
              background: #3b82f6;
            }
          `}</style>
          <ul className="space-y-1 sm:space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors ${
                      active
                        ? 'bg-blue-700 text-white shadow-lg'
                        : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-2 sm:p-4 border-t border-blue-700 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-blue-100 hover:bg-blue-700/50 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
