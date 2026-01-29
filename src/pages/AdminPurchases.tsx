import { useState, useEffect } from 'react';
import { Search, Download } from 'lucide-react';
import api from '../utils/api';

interface Purchase {
  id: string;
  agent_name: string;
  total_amount: number;
  quantity: number;
  purchase_date: string;
  user: {
    email: string;
    name: string;
  };
  agent: {
    name: string;
  };
}

const AdminPurchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPurchases();
  }, [searchTerm]);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      // For now, we'll get purchases from dashboard data
      // In production, create a dedicated endpoint
      const response = await api.get<{ success: boolean; data: { recent_purchases: Purchase[] } }>('/admin/dashboard');
      if (response.success && response.data) {
        let filtered = response.data.recent_purchases || [];
        if (searchTerm) {
          filtered = filtered.filter((p: Purchase) =>
            p.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        setPurchases(filtered);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-w-0">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Purchase Management</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">View and manage all platform purchases</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 flex-shrink-0">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search purchases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading purchases...</p>
          </div>
        ) : (
          <div className="overflow-x-auto min-w-0">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">ID</th>
                  <th className="text-left py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">Agent</th>
                  <th className="text-left py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">Buyer</th>
                  <th className="text-left py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">Qty</th>
                  <th className="text-left py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">Amount</th>
                  <th className="text-left py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="py-3 px-3 sm:py-4 sm:px-6 text-gray-600 text-sm">#{purchase.id}</td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6 font-medium text-sm sm:text-base truncate max-w-[140px]">{purchase.agent_name}</td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6">
                      <div className="min-w-0">
                        <p className="text-gray-900 text-sm truncate">{purchase.user?.name || 'N/A'}</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate max-w-[140px]">{purchase.user?.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6">{purchase.quantity || 1}</td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6 font-semibold text-green-600 text-sm sm:text-base whitespace-nowrap">
                      ${parseFloat(purchase.total_amount.toString()).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6 text-gray-600 text-xs sm:text-sm whitespace-nowrap">
                      {new Date(purchase.purchase_date).toLocaleDateString()}
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

export default AdminPurchases;
