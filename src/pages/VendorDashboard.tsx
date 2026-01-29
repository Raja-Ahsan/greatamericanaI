import { useState, useEffect } from 'react';
import {
  Package,
  DollarSign,
  ShoppingBag,
  Eye,
  CheckCircle,
  Clock,
  PlusCircle,
  ArrowUpRight,
} from 'lucide-react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

interface VendorStats {
  total_listings: number;
  active_listings: number;
  pending_listings: number;
  total_sales: number;
  total_revenue: number;
  views: number;
}

interface VendorDashboardData {
  stats: VendorStats;
  recent_listings: any[];
  recent_sales: any[];
}

const VendorDashboard = () => {
  const { user } = useStore();
  const [data, setData] = useState<VendorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ success: boolean; data: VendorDashboardData }>('/dashboard');
      console.log('Vendor dashboard response:', response);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        console.error('Invalid response format:', response);
      }
    } catch (error: any) {
      console.error('Error fetching vendor dashboard data:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error message:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load dashboard data</p>
        <p className="text-sm text-gray-600 mb-4">Please check the browser console for more details.</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = data.stats;

  const statCards = [
    {
      title: 'Total Listings',
      value: stats.total_listings,
      icon: Package,
      color: 'bg-blue-500',
      change: `${stats.active_listings} active`,
      trend: 'neutral',
      link: '/vendor/agents',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+8.2%',
      trend: 'up',
    },
    {
      title: 'Active Listings',
      value: stats.active_listings,
      icon: CheckCircle,
      color: 'bg-purple-500',
      change: `${stats.pending_listings} pending`,
      trend: 'neutral',
      link: '/vendor/agents',
    },
    {
      title: 'Total Sales',
      value: stats.total_sales,
      icon: ShoppingBag,
      color: 'bg-orange-500',
      change: '+15%',
      trend: 'up',
      link: '/vendor/sales',
    },
    {
      title: 'Total Views',
      value: stats.views,
      icon: Eye,
      color: 'bg-indigo-500',
      change: '+12%',
      trend: 'up',
    },
    {
      title: 'Pending Listings',
      value: stats.pending_listings,
      icon: Clock,
      color: 'bg-yellow-500',
      change: 'Awaiting approval',
      trend: 'neutral',
      link: '/vendor/agents',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name}! Manage your AI agents and track your sales.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const CardContent = (
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  {stat.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-green-600" />}
                  <span className={stat.trend === 'up' ? 'text-green-600' : 'text-gray-600'}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );

          return stat.link ? (
            <Link key={index} to={stat.link}>
              {CardContent}
            </Link>
          ) : (
            <div key={index}>{CardContent}</div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/vendor/sell"
            className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <PlusCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Create New Agent</p>
              <p className="text-sm text-gray-600">List a new AI agent for sale</p>
            </div>
          </Link>
          <Link
            to="/vendor/agents"
            className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Package className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Manage Agents</p>
              <p className="text-sm text-gray-600">View and edit your listings</p>
            </div>
          </Link>
          <Link
            to="/vendor/sales"
            className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <ShoppingBag className="w-6 h-6 text-orange-600" />
            <div>
              <p className="font-medium text-gray-900">View Sales</p>
              <p className="text-sm text-gray-600">Track your sales history</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Listings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Recent Listings
            </h2>
            <Link to="/vendor/agents" className="text-green-600 hover:text-green-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {data.recent_listings && data.recent_listings.length > 0 ? (
              data.recent_listings.slice(0, 5).map((listing: any) => (
                <div key={listing.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{listing.name}</p>
                      <p className="text-sm text-gray-600">${parseFloat(listing.price).toFixed(2)}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    listing.status === 'active' ? 'bg-green-100 text-green-800' :
                    listing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {listing.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No listings yet</p>
                <Link to="/vendor/sell" className="text-green-600 hover:text-green-700 text-sm font-medium mt-2 inline-block">
                  Create your first listing
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
              Recent Sales
            </h2>
            <Link to="/vendor/sales" className="text-green-600 hover:text-green-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {data.recent_sales && data.recent_sales.length > 0 ? (
              data.recent_sales.slice(0, 5).map((sale: any) => (
                <div key={sale.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900">{sale.agent_name}</p>
                    <p className="font-semibold text-gray-900">${parseFloat(sale.total_amount).toFixed(2)}</p>
                  </div>
                  <p className="text-sm text-gray-600">{sale.user?.email || sale.user?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(sale.purchase_date).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No sales yet</p>
                <p className="text-sm text-gray-400 mt-1">Your sales will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
