import { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, ShoppingBag, Eye, Users, Package, 
  CheckCircle, Clock, XCircle, Settings, UserPlus, FileText,
  BarChart3, Activity, AlertCircle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { userDataService } from '../services/userDataService';
import api from '../utils/api';
import { Link } from 'react-router-dom';

interface AdminStats {
  total_users: number;
  total_agents: number;
  active_agents: number;
  pending_agents: number;
  total_purchases: number;
  total_revenue: number;
  total_vendors: number;
  total_customers: number;
}

interface AdminDashboardData {
  stats: AdminStats;
  recent_users: any[];
  recent_agents: any[];
  recent_purchases: any[];
}

const Dashboard = () => {
  const { user } = useStore();
  const [adminData, setAdminData] = useState<AdminDashboardData | null>(null);
  const [vendorData, setVendorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'agents' | 'purchases'>('overview');
  
  const isAdmin = user?.role === 'admin';
  const isVendor = user?.role === 'vendor';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (isAdmin) {
          const response = await api.get<{ success: boolean; data: AdminDashboardData }>('/admin/dashboard');
          if (response.success && response.data) {
            setAdminData(response.data);
          }
        } else if (isVendor) {
          const response = await api.get<{ success: boolean; data: any }>('/dashboard');
          if (response.success && response.data) {
            setVendorData(response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, isAdmin, isVendor]);

  if (!user) {
    return null;
  }

  // Redirect admin to admin dashboard
  if (isAdmin) {
    window.location.href = '/admin/dashboard';
    return null;
  }

  // Admin Dashboard (old code - now redirects)
  if (false && isAdmin && adminData) {
    const stats = adminData.stats;
    
    const statCards = [
      {
        label: 'Total Users',
        value: stats.total_users,
        icon: Users,
        color: 'bg-blue-100 text-blue-600',
        change: '+12%',
        trend: 'up'
      },
      {
        label: 'Total Revenue',
        value: `$${stats.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: DollarSign,
        color: 'bg-green-100 text-green-600',
        change: '+8.2%',
        trend: 'up'
      },
      {
        label: 'Active Agents',
        value: stats.active_agents,
        icon: Package,
        color: 'bg-purple-100 text-purple-600',
        change: `${stats.pending_agents} pending`,
        trend: 'neutral'
      },
      {
        label: 'Total Purchases',
        value: stats.total_purchases,
        icon: ShoppingBag,
        color: 'bg-orange-100 text-orange-600',
        change: '+15%',
        trend: 'up'
      },
      {
        label: 'Vendors',
        value: stats.total_vendors,
        icon: Users,
        color: 'bg-indigo-100 text-indigo-600',
        change: `+${stats.total_vendors - 3}`,
        trend: 'up'
      },
      {
        label: 'Customers',
        value: stats.total_customers,
        icon: Users,
        color: 'bg-pink-100 text-pink-600',
        change: `+${stats.total_customers - 5}`,
        trend: 'up'
      }
    ];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-2">Welcome back, {user.name}!</p>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/admin/users"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Manage Users
                </Link>
                <Link
                  to="/admin/agents"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Manage Agents
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {stat.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-green-600" />}
                    {stat.trend === 'down' && <ArrowDownRight className="w-4 h-4 text-red-600" />}
                    <span className={stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'users', label: 'Users', icon: Users },
                  { id: 'agents', label: 'Agents', icon: Package },
                  { id: 'purchases', label: 'Purchases', icon: ShoppingBag }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Users */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Recent Users
                      </h3>
                      <div className="space-y-3">
                        {adminData.recent_users.slice(0, 5).map((u: any) => (
                          <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{u.name}</p>
                                <p className="text-sm text-gray-600">{u.email}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              u.role === 'admin' ? 'bg-red-100 text-red-800' :
                              u.role === 'vendor' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {u.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Agents */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Recent Agents
                      </h3>
                      <div className="space-y-3">
                        {adminData.recent_agents.slice(0, 5).map((agent: any) => (
                          <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{agent.name}</p>
                                <p className="text-sm text-gray-600">by {agent.seller?.name || 'Unknown'}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              agent.status === 'active' ? 'bg-green-100 text-green-800' :
                              agent.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {agent.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent Purchases */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5" />
                      Recent Purchases
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Agent</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Buyer</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminData.recent_purchases.slice(0, 10).map((purchase: any) => (
                            <tr key={purchase.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">{purchase.agent_name}</td>
                              <td className="py-3 px-4">{purchase.user?.email || 'N/A'}</td>
                              <td className="py-3 px-4 font-semibold">${parseFloat(purchase.total_amount).toFixed(2)}</td>
                              <td className="py-3 px-4 text-gray-600">
                                {new Date(purchase.purchase_date).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
                    <Link
                      to="/admin/users/new"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add User
                    </Link>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Name</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Email</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Role</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Verified</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminData.recent_users.map((u: any) => (
                          <tr key={u.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{u.name}</td>
                            <td className="py-3 px-4">{u.email}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                u.role === 'admin' ? 'bg-red-100 text-red-800' :
                                u.role === 'vendor' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {u.verified ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <XCircle className="w-5 h-5 text-gray-400" />
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Agents Tab */}
              {activeTab === 'agents' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">All Agents</h3>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                        Filter
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Name</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Seller</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Price</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Sales</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminData.recent_agents.map((agent: any) => (
                          <tr key={agent.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{agent.name}</td>
                            <td className="py-3 px-4">{agent.seller?.name || 'Unknown'}</td>
                            <td className="py-3 px-4">${parseFloat(agent.price).toFixed(2)}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                agent.status === 'active' ? 'bg-green-100 text-green-800' :
                                agent.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {agent.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">{agent.sales || 0}</td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                {agent.status === 'pending' && (
                                  <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                                    Approve
                                  </button>
                                )}
                                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                                  Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Purchases Tab */}
              {activeTab === 'purchases' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">All Purchases</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Agent</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Buyer</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Quantity</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminData.recent_purchases.map((purchase: any) => (
                          <tr key={purchase.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{purchase.agent_name}</td>
                            <td className="py-3 px-4">{purchase.user?.email || 'N/A'}</td>
                            <td className="py-3 px-4">{purchase.quantity || 1}</td>
                            <td className="py-3 px-4 font-semibold">${parseFloat(purchase.total_amount).toFixed(2)}</td>
                            <td className="py-3 px-4 text-gray-600">
                              {new Date(purchase.purchase_date).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vendor Dashboard (fallback to original)
  if (isVendor && vendorData) {
    const stats = vendorData.stats;
    
    const statsDisplay = [
      { 
        label: 'Total Revenue', 
        value: `$${stats.totalRevenue.toFixed(2)}`, 
        icon: DollarSign, 
        color: 'bg-green-100 text-green-600' 
      },
      { 
        label: 'Active Listings', 
        value: stats.activeListings.toString(), 
        icon: ShoppingBag, 
        color: 'bg-blue-100 text-blue-600' 
      },
      { 
        label: 'Total Sales', 
        value: stats.totalSales.toString(), 
        icon: TrendingUp, 
        color: 'bg-orange-100 text-orange-600' 
      },
      { 
        label: 'Total Views', 
        value: stats.totalViews.toString(), 
        icon: Eye, 
        color: 'bg-purple-100 text-purple-600' 
      },
    ];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user.name}!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsDisplay.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Sales</h2>
            {vendorData.recentSales && vendorData.recentSales.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Agent</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Buyer</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorData.recentSales.map((sale: any, index: number) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{sale.agentName}</td>
                        <td className="py-3 px-4">{sale.buyer}</td>
                        <td className="py-3 px-4 font-semibold">${sale.amount.toFixed(2)}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(sale.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No sales yet</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/sell"
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md p-6 text-white hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">List a New Agent</h3>
              <p className="mb-4 text-blue-100">
                Share your AI agent with thousands of potential customers
              </p>
              <span className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Get Started
              </span>
            </Link>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Listings</h3>
              <p className="text-gray-600 mb-4">
                Manage your AI agents and view performance metrics
              </p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                View Listings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;
