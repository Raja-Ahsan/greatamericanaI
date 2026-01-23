import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import AgentDetail from './pages/AgentDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import SellAgent from './pages/SellAgent';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminUsers from './pages/AdminUsers';
import AdminCustomers from './pages/AdminCustomers';
import AdminVendors from './pages/AdminVendors';
import AdminAgents from './pages/AdminAgents';
import AdminProfile from './pages/AdminProfile';
import AdminDashboard from './pages/AdminDashboard';
import AdminPurchases from './pages/AdminPurchases';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './components/AdminLayout';
import VendorLogin from './pages/VendorLogin';
import VendorRegister from './pages/VendorRegister';
import VendorDashboard from './pages/VendorDashboard';
import VendorAgents from './pages/VendorAgents';
import VendorSales from './pages/VendorSales';
import VendorAnalytics from './pages/VendorAnalytics';
import VendorSettings from './pages/VendorSettings';
import VendorProfile from './pages/VendorProfile';
import VendorLayout from './components/VendorLayout';
import { useStore } from './store/useStore';

// Component to conditionally show Header/Footer
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdminLogin = location.pathname === '/admin/login';
  const isVendorRoute = location.pathname.startsWith('/vendor');
  const isVendorLogin = location.pathname === '/vendor/login';
  const isVendorRegister = location.pathname === '/vendor/register';

  // Don't show Header/Footer for admin routes (except login which is handled separately)
  if (isAdminRoute && !isAdminLogin) {
    return <>{children}</>;
  }

  // Admin login page - no header/footer
  if (isAdminLogin) {
    return <>{children}</>;
  }

  // Don't show Header/Footer for vendor routes (except login/register which are handled separately)
  if (isVendorRoute && !isVendorLogin && !isVendorRegister) {
    return <>{children}</>;
  }

  // Vendor login/register pages - no header/footer
  if (isVendorLogin || isVendorRegister) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

// Inner component that can use hooks inside Router
function AppContent() {
  const { checkAuth } = useStore();

  // Always check authentication on app load/refresh to verify token is still valid
  useEffect(() => {
    // Run auth check on mount to verify token with backend
    checkAuth().catch(console.error);
  }, []); // Only run once on mount

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route path="/vendor/register" element={<VendorRegister />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/agent/:id" element={<AgentDetail />} />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sell"
          element={
            <ProtectedRoute>
              <SellAgent />
            </ProtectedRoute>
          }
        />
        {/* Vendor Sell Agent Route - within vendor dashboard */}
        <Route
          path="/vendor/sell"
          element={
            <ProtectedRoute>
              <VendorLayout>
                <SellAgent />
              </VendorLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        
        {/* Admin Panel Routes with Sidebar */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminCustomers />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vendors"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminVendors />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/agents"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminAgents />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        <Route
          path="/admin/purchases"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminPurchases />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminAnalytics />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminReports />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminSettings />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminProfile />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Vendor Panel Routes with Sidebar */}
        <Route
          path="/vendor/dashboard"
          element={
            <ProtectedRoute>
              <VendorLayout>
                <VendorDashboard />
              </VendorLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/agents"
          element={
            <ProtectedRoute>
              <VendorLayout>
                <VendorAgents />
              </VendorLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/sales"
          element={
            <ProtectedRoute>
              <VendorLayout>
                <VendorSales />
              </VendorLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/analytics"
          element={
            <ProtectedRoute>
              <VendorLayout>
                <VendorAnalytics />
              </VendorLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/settings"
          element={
            <ProtectedRoute>
              <VendorLayout>
                <VendorSettings />
              </VendorLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/profile"
          element={
            <ProtectedRoute>
              <VendorLayout>
                <VendorProfile />
              </VendorLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MainLayout>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
