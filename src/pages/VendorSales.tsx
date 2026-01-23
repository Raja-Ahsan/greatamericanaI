import { useState, useEffect } from 'react';
import { ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';
import api from '../utils/api';

const VendorSales = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    averageOrder: 0,
  });

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      // Fetch purchases where user is the seller
      const response = await api.get<{ success: boolean; data: any }>('/dashboard');
      if (response.success && response.data) {
        setSales(response.data.recent_sales || []);
        setStats({
          totalRevenue: response.data.stats.total_revenue || 0,
          totalSales: response.data.stats.total_sales || 0,
          averageOrder: response.data.stats.total_sales > 0 
            ? (response.data.stats.total_revenue / response.data.stats.total_sales) 
            : 0,
        });
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sales History</h1>
        <p className="text-gray-600 mt-2">Track your sales and revenue</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900">
            ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Sales</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalSales}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Average Order</p>
          <p className="text-2xl font-bold text-gray-900">
            ${stats.averageOrder.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Sales</h2>
        </div>
        {sales.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sales yet</h3>
            <p className="text-gray-600">Your sales will appear here once customers purchase your agents</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{sale.agent_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sale.user?.email || sale.user?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ${parseFloat(sale.total_amount).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {new Date(sale.purchase_date).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorSales;
