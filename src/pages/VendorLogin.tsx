import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Store, Lock, Mail, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

const VendorLogin = () => {
  const navigate = useNavigate();
  const { login, user, isAuthenticated, loading: authLoading } = useStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if vendor is already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated && user && user.role === 'vendor') {
      navigate('/vendor/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Check if user is vendor
        const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
        if (currentUser.role === 'vendor') {
          navigate('/vendor/dashboard', { replace: true });
        } else {
          setError('Access denied. Vendor credentials required.');
          // Clear the session for non-vendor users
          localStorage.removeItem('auth_token');
          localStorage.removeItem('current_user');
        }
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  // Don't render login form if already authenticated as vendor (will redirect)
  if (isAuthenticated && user && user.role === 'vendor') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
              <Store className="w-12 h-12 text-green-900" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Vendor Portal</h1>
          <p className="text-green-200">GreatAmerican.Ai Vendor Dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-400"
                  placeholder="vendor@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-400"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm text-green-600 hover:text-green-700">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In to Vendor Panel
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Don't have a vendor account?{' '}
              <a
                href="/vendor/register"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Sign up here
              </a>
            </p>
            <a
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Regular user login
            </a>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-green-200">
            🔒 Secure vendor access only. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VendorLogin;
