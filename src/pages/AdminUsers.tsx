import { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Edit, Trash2, CheckCircle, XCircle, X, Save, Eye } from 'lucide-react';
import { useStore } from '../store/useStore';
import api from '../utils/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'vendor' | 'customer';
  verified: boolean;
  created_at?: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const AdminUsers = () => {
  const { user } = useStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer' as 'admin' | 'vendor' | 'customer',
    verified: false,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    vendors: 0,
    customers: 0,
    verified: 0,
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user, roleFilter, searchTerm, currentPage]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchUsers();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      if (roleFilter !== 'all') {
        params.append('role', roleFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await api.get<{ success: boolean; data: { data: User[]; current_page: number; last_page: number; per_page: number; total: number } }>(`/admin/users?${params.toString()}`);
      
      if (response.success && response.data) {
        setUsers(response.data.data || []);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
        });
        
        // Calculate statistics from current page data
        // Note: For accurate stats, you might want to fetch all users or have a separate stats endpoint
        calculateStats(response.data.data || [], response.data.total);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (userList: User[], total?: number) => {
    // For accurate role counts, we'd need to fetch all users or have a stats endpoint
    // For now, we'll show counts from current page and total from pagination
    setStats({
      total: total || pagination?.total || userList.length,
      admins: userList.filter(u => u.role === 'admin').length,
      vendors: userList.filter(u => u.role === 'vendor').length,
      customers: userList.filter(u => u.role === 'customer').length,
      verified: userList.filter(u => u.verified).length,
    });
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'customer',
      verified: false,
    });
    setError('');
    setSuccess('');
    setShowCreateModal(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      verified: user.verified,
    });
    setError('');
    setSuccess('');
    setShowEditModal(true);
  };

  const handleView = async (user: User) => {
    setFormLoading(true);
    try {
      const response = await api.get<{ success: boolean; data: User }>(`/admin/users/${user.id}`);
      if (response.success && response.data) {
        setSelectedUser(response.data);
        setShowViewModal(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user details');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setError('');
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    setFormLoading(true);
    setError('');
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`/admin/users/${selectedUser.id}`);
      if (response.success) {
        setSuccess('User deleted successfully');
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');

    try {
      if (showCreateModal) {
        // Create user
        const response = await api.post<{ success: boolean; message: string; data: User }>('/admin/users', formData);
        if (response.success) {
          setSuccess('User created successfully');
          setShowCreateModal(false);
          setFormData({
            name: '',
            email: '',
            password: '',
            role: 'customer',
            verified: false,
          });
          fetchUsers();
          setTimeout(() => setSuccess(''), 3000);
        }
      } else if (showEditModal && selectedUser) {
        // Update user
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          verified: formData.verified,
        };
        
        // Only include password if it's provided
        if (formData.password) {
          updateData.password = formData.password;
        }

        const response = await api.put<{ success: boolean; message: string; data: User }>(`/admin/users/${selectedUser.id}`, updateData);
        if (response.success) {
          setSuccess('User updated successfully');
          setShowEditModal(false);
          setSelectedUser(null);
          fetchUsers();
          setTimeout(() => setSuccess(''), 3000);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowViewModal(false);
    setSelectedUser(null);
    setError('');
    setSuccess('');
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'customer',
      verified: false,
    });
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-2">Manage all platform users</p>
            </div>
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-red-600">{stats.admins}</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vendors</p>
                <p className="text-2xl font-bold text-blue-600">{stats.vendors}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Customers</p>
                <p className="text-2xl font-bold text-green-600">{stats.customers}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-purple-600">{stats.verified}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="vendor">Vendor</option>
              <option value="customer">Customer</option>
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

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No users found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">User</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Email</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Role</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Status</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600">{u.email}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            u.role === 'admin' ? 'bg-red-100 text-red-800' :
                            u.role === 'vendor' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {u.verified ? (
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
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleView(u)}
                              className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(u)}
                              className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                              title="Edit User"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(u)}
                              className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                              title="Delete User"
                              disabled={u.id === user?.id}
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
                    Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} users
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

      {/* Create/Edit User Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {showCreateModal ? 'Create New User' : 'Edit User'}
              </h2>
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
                  placeholder="John Doe"
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
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password {showEditModal && '(leave blank to keep current)'} *
                </label>
                <input
                  type="password"
                  required={showCreateModal}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'vendor' | 'customer' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor</option>
                  <option value="admin">Admin</option>
                </select>
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
                      {showCreateModal ? 'Creating...' : 'Updating...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {showCreateModal ? 'Create User' : 'Update User'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Delete User</h2>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>{selectedUser.name}</strong> ({selectedUser.email})? This will permanently remove the user and all associated data.
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
                  {formLoading ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Role:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedUser.role === 'admin' ? 'bg-red-100 text-red-800' :
                    selectedUser.role === 'vendor' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Verified:</span>
                  <div className="flex items-center gap-2">
                    {selectedUser.verified ? (
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
                {selectedUser.created_at && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Created:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(selectedUser.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
