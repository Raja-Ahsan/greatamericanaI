import { DollarSign, TrendingUp, ShoppingBag, Eye } from 'lucide-react';
import { useStore } from '../store/useStore';
import { userDataService } from '../services/userDataService';

const Dashboard = () => {
  const { user } = useStore();
  
  if (!user) {
    return null;
  }

  const stats = userDataService.getStats(user.id);
  const sales = userDataService.getSales(user.id).slice(0, 5); // Get last 5 sales

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

        {/* Stats Grid */}
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

        {/* Recent Sales */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Sales</h2>
          {sales.length > 0 ? (
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
                  {sales.map((sale, index) => (
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
              <p className="text-sm text-gray-400 mt-2">
                Start selling by listing your first AI agent
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md p-6 text-white">
            <h3 className="text-xl font-semibold mb-2">List a New Agent</h3>
            <p className="mb-4 text-blue-100">
              Share your AI agent with thousands of potential customers
            </p>
            <a
              href="/sell"
              className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started
            </a>
          </div>

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
};

export default Dashboard;
