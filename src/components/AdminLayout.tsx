import { ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';
import { useStore } from '../store/useStore';
import { Navigate } from 'react-router-dom';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, isAuthenticated, loading } = useStore();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if user is admin
  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You must be an admin to access this panel.</p>
          <a
            href="/admin/login"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Go to Admin Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col min-w-0 overflow-x-hidden">
      <AdminTopBar />
      <div className="flex flex-1 pt-14 sm:pt-16 lg:pt-0 min-h-0 min-w-0">
        <AdminSidebar />
        <main className="flex-1 lg:ml-64 w-full min-w-0 overflow-x-hidden">
          <div className="p-3 sm:p-6 lg:p-8 max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
