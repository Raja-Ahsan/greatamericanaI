import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Edit2, Save, Download, Loader2, Store, ShoppingCart, LayoutDashboard } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import { userDataService, type Purchase } from '../services/userDataService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const Profile = () => {
  const { user, updateProfile, getTotalItems } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    setFormData({ name: user?.name || '', email: user?.email || '' });
  }, [user?.name, user?.email]);

  useEffect(() => {
    const fetchPurchases = async () => {
      setLoading(true);
      try {
        const list = await userDataService.getPurchases();
        setPurchases(list);
      } catch (error) {
        console.error('Error fetching purchases:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, []);

  const handleDownload = async (agentId: string, agentName: string) => {
    setDownloading(agentId);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/agents/${agentId}/download`, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${agentName.replace(/\s+/g, '_')}_files.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const err = await response.json().catch(() => ({}));
        alert(err.message || 'Download failed');
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setDownloading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateProfile(formData);
    setSaving(false);
    if (result.success) {
      setIsEditing(false);
      alert('Profile updated successfully!');
    } else {
      alert(result.error || 'Failed to update profile');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCancelEdit = () => {
    setFormData({ name: user?.name || '', email: user?.email || '' });
    setIsEditing(false);
  };

  if (!user) {
    return null;
  }

  const cartCount = getTotalItems();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account and view purchase history.</p>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                  <p className="text-gray-600">{user.email}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {user.verified && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Verified
                      </span>
                    )}
                    {user.role && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                        {user.role}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => (isEditing ? handleCancelEdit() : setIsEditing(true))}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors flex-shrink-0 h-fit"
                style={isEditing ? { background: '#e5e7eb', color: '#374151' } : { background: '#2563eb', color: 'white' }}
              >
                {isEditing ? (
                  <>
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" />
                    <span>Edit profile</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="font-mono text-xs">ID: {String(user.id).slice(0, 12)}…</span>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>Member</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile information</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>
            {isEditing && (
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            )}
          </form>
        </div>

        {/* Purchase history */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-semibold text-gray-900">Purchase history</h2>
            <Link to="/marketplace" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <Store className="w-4 h-4" />
              Browse marketplace
            </Link>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
            ) : purchases.length > 0 ? (
              <ul className="space-y-4">
                {purchases.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">{p.agentName}</p>
                      <p className="text-sm text-gray-500">
                        ${typeof p.totalAmount === 'number' ? p.totalAmount.toFixed(2) : (p.price * (p.quantity || 1)).toFixed(2)} · Qty {p.quantity ?? 1} · {new Date(p.purchaseDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        to={`/agent/${p.agentId}`}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View agent
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDownload(p.agentId, p.agentName)}
                        disabled={downloading === p.agentId}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {downloading === p.agentId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        Download
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-2">You haven&apos;t made any purchases yet.</p>
                <Link to="/marketplace" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                  <Store className="w-4 h-4" />
                  Browse marketplace
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/dashboard"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Dashboard</p>
              <p className="text-sm text-gray-500">Orders & overview</p>
            </div>
          </Link>
          <Link
            to="/cart"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Cart</p>
              <p className="text-sm text-gray-500">{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
            </div>
          </Link>
          <Link
            to="/marketplace"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Marketplace</p>
              <p className="text-sm text-gray-500">Browse agents</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
