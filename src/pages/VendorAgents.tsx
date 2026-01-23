import { useState, useEffect } from 'react';
import { Package, PlusCircle, Eye, Edit, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react';
import api from '../utils/api';
import { Link } from 'react-router-dom';

const VendorAgents = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ success: boolean; data: any[] }>('/my-listings');
      if (response.success && response.data) {
        setAgents(response.data);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Agents</h1>
          <p className="text-gray-600 mt-2">Manage your AI agent listings</p>
        </div>
        <Link
          to="/sell"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          Create New Agent
        </Link>
      </div>

      {agents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No agents yet</h3>
          <p className="text-gray-600 mb-6">Start by creating your first AI agent listing</p>
          <Link
            to="/sell"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            Create Your First Agent
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    agent.status === 'active' ? 'bg-green-100 text-green-800' :
                    agent.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {agent.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{agent.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">${parseFloat(agent.price).toFixed(2)}</span>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{agent.sales || 0} sales</span>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <Link
                  to={`/agent/${agent.id}`}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  View Details
                </Link>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorAgents;
