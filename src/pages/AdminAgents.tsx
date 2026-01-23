import { useState, useEffect } from 'react';
import { Package, Search, CheckCircle, Clock, XCircle, Edit, Trash2, Eye, X, Save, DollarSign, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import api from '../utils/api';

interface Agent {
  id: string;
  name: string;
  description: string;
  long_description?: string;
  price: number;
  category: string;
  status: 'active' | 'pending' | 'inactive';
  sales: number;
  rating: number;
  reviews: number;
  image?: string;
  seller: {
    id: string;
    name: string;
    email: string;
  };
  capabilities?: string[];
  languages?: string[];
  tags?: string[];
  model?: string;
  response_time?: string;
  api_access?: boolean;
  date_added?: string;
  created_at?: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const AdminAgents = () => {
  const { user } = useStore();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    long_description: '',
    price: '',
    category: '',
    status: 'pending' as 'active' | 'pending' | 'inactive',
    capabilities: [] as string[],
    languages: [] as string[],
    tags: [] as string[],
    model: '',
    response_time: '',
    api_access: true,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
    totalSales: 0,
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAgents();
    }
  }, [user, statusFilter, categoryFilter, currentPage]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchAgents();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchAgents = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await api.get<{ success: boolean; data: { data: Agent[]; current_page: number; last_page: number; per_page: number; total: number } }>(`/admin/agents?${params.toString()}`);
      
      if (response.success && response.data) {
        setAgents(response.data.data || []);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
        });
        
        // Calculate statistics
        calculateStats(response.data.data || [], response.data.total);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch agents');
      console.error('Error fetching agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (agentList: Agent[], total?: number) => {
    const totalSales = agentList.reduce((sum, agent) => sum + (agent.sales || 0), 0);
    setStats({
      total: total || pagination?.total || agentList.length,
      active: agentList.filter(a => a.status === 'active').length,
      pending: agentList.filter(a => a.status === 'pending').length,
      inactive: agentList.filter(a => a.status === 'inactive').length,
      totalSales,
    });
  };

  const handleView = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowViewModal(true);
  };

  const handleEdit = (agent: Agent) => {
    setSelectedAgent(agent);
    setFormData({
      name: agent.name,
      description: agent.description,
      long_description: agent.long_description || '',
      price: agent.price.toString(),
      category: agent.category,
      status: agent.status,
      capabilities: agent.capabilities || [],
      languages: agent.languages || [],
      tags: agent.tags || [],
      model: agent.model || '',
      response_time: agent.response_time || '',
      api_access: agent.api_access ?? true,
    });
    setError('');
    setSuccess('');
    setShowEditModal(true);
  };

  const handleDelete = (agent: Agent) => {
    setSelectedAgent(agent);
    setError('');
    setShowDeleteModal(true);
  };

  const handleStatusUpdate = async (agentId: string, newStatus: string) => {
    setFormLoading(true);
    setError('');
    try {
      const response = await api.patch<{ success: boolean; message: string }>(`/admin/agents/${agentId}/status`, { status: newStatus });
      if (response.success) {
        setSuccess('Vendor application status updated successfully');
        fetchAgents();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedAgent) return;

    setFormLoading(true);
    setError('');
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`/admin/agents/${selectedAgent.id}`);
      if (response.success) {
        setSuccess('Vendor application deleted successfully');
        setShowDeleteModal(false);
        setSelectedAgent(null);
        fetchAgents();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete agent');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;

    setFormLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update agent via the regular agent update endpoint
      const updateData = {
        name: formData.name,
        description: formData.description,
        long_description: formData.long_description,
        price: parseFloat(formData.price),
        category: formData.category,
        capabilities: formData.capabilities,
        languages: formData.languages,
        tags: formData.tags,
        model: formData.model,
        response_time: formData.response_time,
        api_access: formData.api_access,
      };

      const response = await api.put<{ success: boolean; message: string; data: Agent }>(`/agents/${selectedAgent.id}`, updateData);
      
      if (response.success) {
        // Also update status if changed
        if (formData.status !== selectedAgent.status) {
          await api.patch(`/admin/agents/${selectedAgent.id}/status`, { status: formData.status });
        }
        
        setSuccess('Vendor application updated successfully');
        setShowEditModal(false);
        setSelectedAgent(null);
        fetchAgents();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const closeModals = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedAgent(null);
    setError('');
    setSuccess('');
  };

  // Get unique categories from agents
  const categories = Array.from(new Set(agents.map(a => a.category))).filter(Boolean);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vendor Applications Management</h1>
          <p className="text-gray-600 mt-2">Manage all AI agent applications created by vendors</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
              </div>
              <XCircle className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalSales}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendor applications by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Agents Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading agents...</p>
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No vendor applications found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Application</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Vendor</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Category</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Price</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Status</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Sales</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {agents.map((agent) => (
                      <tr key={agent.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {agent.image ? (
                              <img src={agent.image} alt={agent.name} className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-purple-600" />
                              </div>
                            )}
                            <div>
                              <span className="font-medium text-gray-900">{agent.name}</span>
                              <p className="text-xs text-gray-500 truncate max-w-xs">{agent.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-sm text-gray-900">{agent.seller?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{agent.seller?.email || ''}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {agent.category}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-semibold text-gray-900">
                          ${parseFloat(agent.price.toString()).toFixed(2)}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            agent.status === 'active' ? 'bg-green-100 text-green-800' :
                            agent.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{agent.sales || 0}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleView(agent)}
                              className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(agent)}
                              className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                              title="Edit Application"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {agent.status === 'pending' && (
                              <button
                                onClick={() => handleStatusUpdate(agent.id, 'active')}
                                className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50 text-sm font-medium"
                                title="Approve Application"
                                disabled={formLoading}
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(agent)}
                              className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                              title="Delete Application"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.last_page > 1 && (
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} applications
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={pagination.current_page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(pagination.last_page, p + 1))}
                      disabled={pagination.current_page === pagination.last_page}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* View Agent Modal */}
      {showViewModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Vendor Application Details</h2>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                {selectedAgent.image ? (
                  <img src={selectedAgent.image} alt={selectedAgent.name} className="w-20 h-20 rounded-lg object-cover" />
                ) : (
                  <div className="w-20 h-20 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Package className="w-10 h-10 text-purple-600" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{selectedAgent.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedAgent.description}</p>
                </div>
              </div>

              {selectedAgent.long_description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{selectedAgent.long_description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <span className="text-sm text-gray-600">Price:</span>
                  <p className="text-lg font-bold text-gray-900">${parseFloat(selectedAgent.price.toString()).toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Category:</span>
                  <p className="text-sm font-medium text-gray-900">{selectedAgent.category}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                    selectedAgent.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedAgent.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedAgent.status.charAt(0).toUpperCase() + selectedAgent.status.slice(1)}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Sales:</span>
                  <p className="text-sm font-medium text-gray-900">{selectedAgent.sales || 0}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Rating:</span>
                  <p className="text-sm font-medium text-gray-900">{selectedAgent.rating || 0} ({selectedAgent.reviews || 0} reviews)</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Vendor:</span>
                  <p className="text-sm font-medium text-gray-900">{selectedAgent.seller?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">{selectedAgent.seller?.email || ''}</p>
                </div>
                {selectedAgent.model && (
                  <div>
                    <span className="text-sm text-gray-600">Model:</span>
                    <p className="text-sm font-medium text-gray-900">{selectedAgent.model}</p>
                  </div>
                )}
                {selectedAgent.response_time && (
                  <div>
                    <span className="text-sm text-gray-600">Response Time:</span>
                    <p className="text-sm font-medium text-gray-900">{selectedAgent.response_time}</p>
                  </div>
                )}
              </div>

              {selectedAgent.capabilities && selectedAgent.capabilities.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Capabilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.capabilities.map((cap, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedAgent.tags && selectedAgent.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Agent Modal */}
      {showEditModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit Vendor Application</h2>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Long Description
                </label>
                <textarea
                  rows={4}
                  value={formData.long_description}
                  onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'pending' | 'inactive' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Time
                  </label>
                  <input
                    type="text"
                    value={formData.response_time}
                    onChange={(e) => setFormData({ ...formData, response_time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., < 1 second"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="api_access"
                  checked={formData.api_access}
                  onChange={(e) => setFormData({ ...formData, api_access: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="api_access" className="ml-2 text-sm text-gray-700">
                  API Access Enabled
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Update Application
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Delete Vendor Application</h2>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>{selectedAgent.name}</strong>? This will permanently remove this vendor application and all associated data.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? 'Deleting...' : 'Delete Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAgents;
