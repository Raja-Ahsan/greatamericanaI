import { useState, useEffect } from 'react';
import { Users, Search, CheckCircle, XCircle, Edit, Trash2, Eye, X, Save, Mail, Phone, Calendar } from 'lucide-react';
import { useStore } from '../store/useStore';
import api from '../utils/api';

interface Customer {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  created_at?: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const AdminCustomers = () => {
  const { user } = useStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    verified: false,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    unverified: 0,
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchCustomers();
    }
  }, [user, searchTerm, currentPage]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchCustomers();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('role', 'customer'); // Filter by customer role
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await api.get<{ success: boolean; data: { data: Customer[]; current_page: number; last_page: number; per_page: number; total: number } }>(`/admin/users?${params.toString()}`);
      
      if (response.success && response.data) {
        setCustomers(response.data.data || []);
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
      setError(err.message || 'Failed to fetch customers');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (customerList: Customer[], total?: number) => {
    setStats({
      total: total || pagination?.total || customerList.length,
      verified: customerList.filter(c => c.verified).length,
      unverified: customerList.filter(c => !c.verified).length,
    });
  };

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      verified: customer.verified,
    });
    setError('');
    setSuccess('');
    setShowEditModal(true);
  };

  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setError('');
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedCustomer) return;

    setFormLoading(true);
    setError('');
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`/admin/users/${selectedCustomer.id}`);
      if (response.success) {
        setSuccess('Customer deleted successfully');
        setShowDeleteModal(false);
        setSelectedCustomer(null);
        fetchCustomers();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete customer');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    setFormLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        verified: formData.verified,
      };

      const response = await api.put<{ success: boolean; message: string; data: Customer }>(`/admin/users/${selectedCustomer.id}`, updateData);
      
      if (response.success) {
        setSuccess('Customer updated successfully');
        setShowEditModal(false);
        setSelectedCustomer(null);
        fetchCustomers();
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
    setSelectedCustomer(null);
    setError('');
    setSuccess('');
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
              <p className="text-gray-600 mt-2">Manage all customer accounts</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unverified</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.unverified}</p>
              </div>
              <XCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading customers...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No customers found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Customer</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Email</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Status</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Joined</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">{customer.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600">{customer.email}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {customer.verified ? (
                              <>
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-sm text-green-600">Verified</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-400">Unverified</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600 text-sm">
                          {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleView(customer)}
                              className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(customer)}
                              className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                              title="Edit Customer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(customer)}
                              className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                              title="Delete Customer"
                              disabled={customer.id === user?.id}
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
                    Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} customers
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

      {/* View Customer Modal */}
      {showViewModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Customer Details</h2>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedCustomer.name}</h3>
                  <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Email:</span>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{selectedCustomer.email}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Verified:</span>
                  <div className="flex items-center gap-2">
                    {selectedCustomer.verified ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-600">Verified</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-400">Unverified</span>
                      </>
                    )}
                  </div>
                </div>
                {selectedCustomer.created_at && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Joined:</span>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {new Date(selectedCustomer.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit Customer</h2>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
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
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="verified"
                  checked={formData.verified}
                  onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="verified" className="ml-2 text-sm text-gray-700">
                  Verified Account
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
                      Update Customer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Delete Customer</h2>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>{selectedCustomer.name}</strong> ({selectedCustomer.email})? This will permanently remove the customer and all associated data.
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
                  {formLoading ? 'Deleting...' : 'Delete Customer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
