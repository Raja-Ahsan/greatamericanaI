import { useState, useEffect } from 'react';
import { Package, PlusCircle, Eye, Edit, Trash2, CheckCircle, Clock, XCircle, Search, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import { Link, useNavigate } from 'react-router-dom';

const VendorAgents = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    // Filter agents based on search term
    if (searchTerm.trim() === '') {
      setFilteredAgents(agents);
    } else {
      const filtered = agents.filter(agent =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAgents(filtered);
    }
  }, [searchTerm, agents]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await api.get<{ success: boolean; data: any[] }>('/my-listings');
      if (response.success && response.data) {
        setAgents(response.data);
        setFilteredAgents(response.data);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (agentId: number, agentName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${agentName}"? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(agentId);
    try {
      const response = await api.delete<{ success: boolean; message?: string }>(`/agents/${agentId}`);
      if (response.success) {
        // Remove agent from list
        setAgents(agents.filter(agent => agent.id !== agentId));
        setFilteredAgents(filteredAgents.filter(agent => agent.id !== agentId));
      } else {
        alert(response.message || 'Failed to delete agent');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete agent');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (agentId: number) => {
    navigate(`/vendor/sell/${agentId}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Statistics
  const stats = {
    total: agents.length,
    active: agents.filter(a => a.status === 'active').length,
    pending: agents.filter(a => a.status === 'pending').length,
    totalSales: agents.reduce((sum, a) => sum + (parseInt(a.sales) || 0), 0),
    totalRevenue: agents.reduce((sum, a) => sum + (parseFloat(a.price) * (parseInt(a.sales) || 0)), 0),
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
          to="/vendor/sell"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          Create New Agent
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Total Agents</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">Total Sales</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalSales}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search agents by name, description, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {filteredAgents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          {searchTerm ? (
            <>
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No agents found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search terms</p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No agents yet</h3>
              <p className="text-gray-600 mb-6">Start by creating your first AI agent listing</p>
              <Link
                to="/vendor/sell"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <PlusCircle className="w-5 h-5" />
                Create Your First Agent
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <div key={agent.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">{agent.name}</h3>
                  <div className="flex items-center gap-2 ml-2">
                    {getStatusIcon(agent.status)}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{agent.description}</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-gray-900">${parseFloat(agent.price || 0).toFixed(2)}</span>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{agent.sales || 0} sales</span>
                  </div>
                </div>
                {agent.rating > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <span className="font-medium">Rating:</span>
                    <span className="text-yellow-500">★</span>
                    <span>{parseFloat(agent.rating).toFixed(1)}</span>
                    <span className="text-gray-400">({agent.reviews || 0} reviews)</span>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <Link
                  to={`/agent/${agent.id}`}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  View Details
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(agent.id)}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Edit Agent"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(agent.id, agent.name)}
                    disabled={deleteLoading === agent.id}
                    className="p-2 text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Delete Agent"
                  >
                    {deleteLoading === agent.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
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
