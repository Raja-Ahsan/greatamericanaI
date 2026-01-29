import { useState, useEffect } from 'react';
import {
  BarChart3,
  DollarSign,
  Users,
  ShoppingBag,
  Package,
  Banknote,
  Calendar,
  RefreshCw,
  AlertCircle,
  TrendingUp,
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

interface RevenueByDay {
  date: string;
  gross: number;
  admin_profit: number;
  sales_count: number;
  units: number;
}

interface TopAgent {
  agent_id: number;
  agent_name: string;
  units_sold: number;
  order_count: number;
  gross: number;
  platform_fee: number;
}

interface RecentPurchase {
  id: number;
  agent_name: string;
  quantity: number;
  total_amount: number;
  platform_fee: number;
  purchase_date: string;
  user: { name: string; email: string } | null;
  seller: string | null;
}

interface AdminAnalyticsData {
  stats: AdminStats;
  revenue_by_day: RevenueByDay[];
  top_agents: TopAgent[];
  recent_purchases: RecentPurchase[];
}

const AdminAnalytics = () => {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<'7' | '30'>('7');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<{ success: boolean; data: AdminAnalyticsData }>('/admin/analytics');
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError('Failed to load analytics.');
      }
    } catch (err) {
      setError('Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const chartData = data?.revenue_by_day
    ? period === '7'
      ? data.revenue_by_day.slice(-7)
      : data.revenue_by_day
    : [];
  const maxGross = chartData.length ? Math.max(...chartData.map((d) => d.gross), 1) : 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-600 mt-2">Platform performance metrics and trends</p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <span>{error || 'No data available.'}</span>
          <button
            type="button"
            onClick={fetchAnalytics}
            className="ml-auto px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { stats, revenue_by_day, top_agents, recent_purchases } = data;

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-600 mt-2">Platform performance metrics and trends</p>
        </div>
        <button
          type="button"
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                ${(stats.total_revenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Gross sales</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Admin Profit</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                ${(stats.admin_profit ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Banknote className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">15% platform fee</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Purchases</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{stats.total_purchases ?? 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Orders</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{stats.total_users ?? 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.total_vendors ?? 0} vendors · {stats.total_customers ?? 0} customers
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Agents</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{stats.active_agents ?? 0}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{stats.pending_agents ?? 0} pending</p>
        </div>
      </div>

      {/* Revenue by day chart */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Revenue trend (gross sales)
          </h2>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <button
              type="button"
              onClick={() => setPeriod('7')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${period === '7' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Last 7 days
            </button>
            <button
              type="button"
              onClick={() => setPeriod('30')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${period === '30' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Last 30 days
            </button>
          </div>
        </div>
        <div className="p-6">
          {chartData.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No sales in this period. Revenue will appear here once purchases are made.</p>
            </div>
          ) : (
            <>
              <div className="flex gap-1 sm:gap-2 h-52">
                {chartData.map((d) => {
                  const pct = Math.max((d.gross / maxGross) * 100, 4);
                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center h-full min-w-0">
                      <span className="text-xs text-gray-500 truncate w-full text-center flex-shrink-0" title={d.date}>
                        {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex-1 min-h-0 w-full flex flex-col justify-end">
                        <div
                          className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                          style={{ height: `${pct}%` }}
                          title={`$${d.gross.toFixed(2)} gross · $${d.admin_profit.toFixed(2)} profit · ${d.sales_count} sale(s)`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>$0</span>
                <span>${maxGross.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top selling agents */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Top selling agents</h2>
              <p className="text-sm text-gray-500">By gross sales (platform-wide)</p>
            </div>
            <Link to="/admin/agents" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            {top_agents.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No sales yet. Top agents will appear here.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Agent</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Units</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Orders</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Gross</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Platform fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {top_agents.map((a) => (
                    <tr key={a.agent_id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900 truncate max-w-[180px]" title={a.agent_name}>
                        {a.agent_name}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">{a.units_sold}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{a.order_count}</td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        ${a.gross.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-emerald-600">
                        ${a.platform_fee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent purchases */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent purchases</h2>
              <p className="text-sm text-gray-500">Latest platform orders</p>
            </div>
            <Link to="/admin/purchases" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            {recent_purchases.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No purchases yet.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Agent</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Qty</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Fee</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recent_purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-[140px]" title={p.agent_name}>
                            {p.agent_name}
                          </p>
                          {p.seller && (
                            <p className="text-xs text-gray-500">by {p.seller}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">{p.quantity}</td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        ${p.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-600 font-medium">
                        ${p.platform_fee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(p.purchase_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
