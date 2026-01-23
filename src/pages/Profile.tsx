import { useState } from 'react';
import { User, Mail, Calendar, Edit2, Save } from 'lucide-react';
import { useStore } from '../store/useStore';
import { userDataService } from '../services/userDataService';

const Profile = () => {
  const { user, updateProfile } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await api.get<{ success: boolean; data: any[] }>('/purchases');
      if (response.success && response.data) {
        setPurchases(response.data);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (agentId: string, agentName: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/agents/${agentId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
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
        const error = await response.json();
        alert(error.message || 'Failed to download file');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to download file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await updateProfile(formData);
    
    if (result.success) {
      setIsEditing(false);
      alert('Profile updated successfully!');
    } else {
      alert(result.error || 'Failed to update profile');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600">{user.email}</p>
                {user.verified && (
                  <span className="inline-block mt-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    Verified User
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              {user.email}
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              User ID: {user.id.substring(0, 12)}...
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Member since 2024
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
            </div>

            {isEditing && (
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            )}
          </form>
        </div>

        {/* Purchase History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Purchase History</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : purchases.length > 0 ? (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{purchase.agentName || purchase.agent_name}</h3>
                    <p className="text-sm text-gray-600">
                      Purchased on {new Date(purchase.purchaseDate || purchase.purchase_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-900">${parseFloat(purchase.price || purchase.totalAmount || purchase.total_amount).toFixed(2)}</span>
                    <button
                      onClick={() => handleDownload(purchase.agentId || purchase.agent_id, purchase.agentName || purchase.agent_name)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No purchases yet</p>
              <a href="/marketplace" className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block">
                Browse Marketplace
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
