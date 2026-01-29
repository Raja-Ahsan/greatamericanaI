import { useState, useEffect } from 'react';
import {
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
} from 'lucide-react';
import api from '../utils/api';
import { Link } from 'react-router-dom';

interface AdminStats {
  total_users: number;
  total_agents: number;
  active_agents: number;
  pending_agents: number;
  total_purchases: number;
  total_revenue: number;
  admin_profit: number;
  total_vendors: number;
  total_customers: number;
}

interface AdminDashboardData {
  stats: AdminStats;
  recent_users: any[];
  recent_agents: any[];
  recent_purchases: any[];
}

const AdminDashboard = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ success: boolean; data: AdminDashboardData }>('/admin/dashboard');
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load dashboard data</p>
      </div>
    );
  }

  const stats = data.stats;

  const statCards = [
    {
      title: 'Total Users',
      value: stats.total_users,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      trend: 'up',
      link: '/admin/users',
    },
    {
      title: 'Total Revenue',
      value: `$${(stats.total_revenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: 'Gross sales',
      trend: 'neutral',
    },
    {
      title: 'Admin Profit',
      value: `$${(stats.admin_profit ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Banknote,
      color: 'bg-emerald-600',
      change: '15% platform fee',
      trend: 'neutral',
    },
    {
      title: 'Active Agents',
      value: stats.active_agents,
      icon: Package,
      color: 'bg-purple-500',
      change: `${stats.pending_agents} pending`,
      trend: 'neutral',
      link: '/admin/agents',
    },
    {
      title: 'Total Purchases',
      value: stats.total_purchases,
      icon: ShoppingBag,
      color: 'bg-orange-500',
      change: '+15%',
      trend: 'up',
      link: '/admin/purchases',
    },
    {
      title: 'Vendors',
      value: stats.total_vendors,
      icon: Users,
      color: 'bg-indigo-500',
      change: `+${stats.total_vendors}`,
      trend: 'up',
    },
    {
      title: 'Customers',
      value: stats.total_customers,
      icon: Users,
      color: 'bg-pink-500',
      change: `+${stats.total_customers}`,
      trend: 'up',
    },
  ];

  return (
    <div className="min-w-0">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Welcome to the admin control panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const CardContent = (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow min-w-0">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  {stat.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-green-600" />}
                  {stat.trend === 'down' && <ArrowDownRight className="w-4 h-4 text-red-600" />}
                  <span className={stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4 gap-2 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Recent Users
            </h2>
            <Link to="/admin/users" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {data.recent_users.slice(0, 5).map((user: any) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-2 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  user.role === 'admin' ? 'bg-red-100 text-red-800' :
                  user.role === 'vendor' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Agents */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4 gap-2 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Recent Agents
            </h2>
            <Link to="/admin/agents" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {data.recent_agents.slice(0, 5).map((agent: any) => (
              <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-2 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{agent.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">by {agent.seller?.name || 'Unknown'}</p>
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

        {/* Recent Purchases */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4 gap-2 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
              Recent Purchases
            </h2>
            <Link to="/admin/purchases" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {data.recent_purchases.slice(0, 5).map((purchase: any) => (
              <div key={purchase.id} className="p-3 bg-gray-50 rounded-lg min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{purchase.agent_name}</p>
                  <p className="font-semibold text-gray-900 flex-shrink-0">${parseFloat(purchase.total_amount).toFixed(2)}</p>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{purchase.user?.email || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(purchase.purchase_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
