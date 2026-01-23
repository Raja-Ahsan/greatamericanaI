import { ReactNode } from 'react';
import VendorSidebar from './VendorSidebar';
import VendorTopBar from './VendorTopBar';
import { useStore } from '../store/useStore';
import { Navigate } from 'react-router-dom';

interface VendorLayoutProps {
  children: ReactNode;
}

const VendorLayout = ({ children }: VendorLayoutProps) => {
  const { user, isAuthenticated, loading } = useStore();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Check if user is vendor
  if (!isAuthenticated || !user) {
    return <Navigate to="/vendor/login" replace />;
  }

  if (user.role !== 'vendor') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You must be a vendor to access this panel.</p>
          <a
            href="/vendor/login"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Go to Vendor Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <VendorTopBar />
      <div className="flex flex-1 pt-16 lg:pt-0">
        <VendorSidebar />
        <main className="flex-1 lg:ml-64 w-full">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
