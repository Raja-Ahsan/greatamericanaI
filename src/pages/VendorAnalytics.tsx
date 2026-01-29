import { useState, useEffect } from 'react';
import {
  BarChart3,
  DollarSign,
  ShoppingBag,
  Package,
  TrendingUp,
  Calendar,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import api from '../utils/api';

interface AnalyticsStats {
  total_listings: number;
  active_listings: number;
  total_sales: number;
  total_revenue: number;
}

interface RevenueByDay {
  date: string;
  revenue: number;
  sales_count: number;
  units: number;
}

interface TopAgent {
  agent_id: number;
  agent_name: string;
  units_sold: number;
  order_count: number;
  gross: number;
  revenue: number;
}

interface RecentSale {
  id: number;
  agent_name: string;
  quantity: number;
  total_amount: number;
  revenue: number;
  purchase_date: string;
  user: { name: string; email: string } | null;
}

interface AnalyticsData {
  stats: AnalyticsStats;
  revenue_by_day: RevenueByDay[];
  top_agents: TopAgent[];
  recent_sales: RecentSale[];
}

const VendorAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<'7' | '30'>('7');
  const [sellerCommission, setSellerCommission] = useState(85);

  useEffect(() => {
    api.get<{ success?: boolean; data?: { sellerCommission?: number } }>('/platform-settings').then((res) => {
      if (res.success && res.data?.sellerCommission != null) setSellerCommission(res.data.sellerCommission);
    }).catch(() => {});
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<{ success: boolean; data: AnalyticsData }>('/analytics');
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
  const maxRevenue = chartData.length
    ? Math.max(...chartData.map((d) => d.revenue), 1)
    : 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">View detailed analytics and insights</p>
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

  const { stats, top_agents, recent_sales } = data;

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">View detailed analytics and insights</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${stats.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{sellerCommission}% of sales (after platform fee)</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_sales}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Units sold</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Listings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_listings}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Agents listed</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Listings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active_listings}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Live on marketplace</p>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            Revenue by day
          </h2>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <button
              type="button"
              onClick={() => setPeriod('7')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${period === '7' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Last 7 days
            </button>
            <button
              type="button"
              onClick={() => setPeriod('30')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${period === '30' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Last 30 days
            </button>
          </div>
        </div>
        <div className="p-6">
          {chartData.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No sales in this period. Revenue will appear here once you make sales.</p>
            </div>
          ) : (
            <>
              <div className="flex gap-1 sm:gap-2 h-52">
                {chartData.map((d) => {
                  const pct = Math.max((d.revenue / maxRevenue) * 100, 4);
                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center h-full min-w-0">
                      <span className="text-xs text-gray-500 truncate w-full text-center flex-shrink-0" title={d.date}>
                        {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex-1 min-h-0 w-full flex flex-col justify-end">
                        <div
                          className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600"
                          style={{ height: `${pct}%` }}
                          title={`$${d.revenue.toFixed(2)} · ${d.sales_count} sale(s)`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>$0</span>
                <span>${maxRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top performing agents */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top performing agents</h2>
            <p className="text-sm text-gray-500">By revenue (last 30 days)</p>
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
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Revenue</th>
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
                      <td className="py-3 px-4 text-right font-medium text-green-600">
                        ${a.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent sales */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent sales</h2>
            <p className="text-sm text-gray-500">Latest purchases of your agents</p>
          </div>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            {recent_sales.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No sales yet.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Agent</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Qty</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recent_sales.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900 truncate max-w-[140px]" title={s.agent_name}>
                        {s.agent_name}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">{s.quantity}</td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        ${s.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(s.purchase_date).toLocaleDateString()}
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

export default VendorAnalytics;
