import { useState, useEffect, useRef } from 'react';
import { User, Save, Camera, Mail, UserCircle, CheckCircle, X, Lock, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../store/useStore';
import api from '../utils/api';
import { authService } from '../services/authService';
import { getImageUrl } from '../utils/imageUrl';

const VendorProfile = () => {
  const { user, updateProfile, loading: storeLoading } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || '',
      });
      if (user.avatar) {
        setAvatarPreview(getImageUrl(user.avatar));
      }
    } else {
      setFormData({
        name: '',
        email: '',
        avatar: '',
      });
    }
  }, [user]);

  // Show loading state only if actively loading
  if (storeLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setAvatarFile(file);
      setError('');

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let avatarUrl = formData.avatar;

      if (avatarFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('avatar', avatarFile);

        try {
          const uploadResponse = await api.post<{ success: boolean; avatar: string; message?: string }>('/profile/avatar', formDataToSend);
          console.log('Avatar upload response:', uploadResponse);

          if (uploadResponse.success && uploadResponse.avatar) {
            avatarUrl = uploadResponse.avatar;
            setFormData(prev => ({ ...prev, avatar: avatarUrl }));
            setAvatarPreview(getImageUrl(avatarUrl));
          } else {
            throw new Error('Avatar upload failed: Invalid response');
          }
        } catch (uploadError: any) {
          console.error('Avatar upload error:', uploadError);
          setError(uploadError.response?.data?.message || uploadError.message || 'Failed to upload avatar. Please try again.');
          setLoading(false);
          return;
        }
      }

      const hasChanges = 
        formData.name !== user.name || 
        formData.email !== user.email || 
        (avatarFile !== null) ||
        (avatarUrl && avatarUrl !== user.avatar);

      if (!hasChanges) {
        setError('No changes to save');
        setLoading(false);
        return;
      }

      const updatePayload: any = {
        name: formData.name,
        email: formData.email,
      };
      
      if (avatarFile || (avatarUrl && avatarUrl !== user.avatar)) {
        updatePayload.avatar = avatarUrl;
      }

      console.log('Updating profile with payload:', updatePayload);
      const result = await updateProfile(updatePayload);
      console.log('Profile update result:', result);

      if (result.success) {
        setSuccess('Profile updated successfully');
        setAvatarFile(null);
        if (result.user) {
          setFormData({
            name: result.user.name || '',
            email: result.user.email || '',
            avatar: result.user.avatar || '',
          });
          if (result.user.avatar) {
            setAvatarPreview(getImageUrl(result.user.avatar));
          }
        }
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required');
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      setPasswordLoading(false);
      return;
    }

    try {
      const result = await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );

      if (result.success) {
        setPasswordSuccess(result.message || 'Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setShowPasswordForm(false);
        setTimeout(() => setPasswordSuccess(''), 3000);
      } else {
        setPasswordError(result.error || 'Failed to change password');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your vendor profile information</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <X className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Profile Picture Section */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8">
              <div className="flex flex-col items-center">
                <div className="relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      <span className="text-4xl font-bold text-green-600">
                        {user?.name ? getInitials(user.name) : 'V'}
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors border-2 border-white"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <p className="text-white mt-4 font-medium">{user?.name}</p>
                <p className="text-green-100 text-sm">Vendor</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-green-900 mb-1">Profile Picture</h4>
                    <p className="text-xs text-green-700">
                      Click on the camera icon above to upload a new profile picture. Supported formats: JPG, PNG, GIF. Max size: 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
            <button
              type="button"
              onClick={() => {
                setShowPasswordForm(!showPasswordForm);
                setPasswordError('');
                setPasswordSuccess('');
                setPasswordData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                });
              }}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              {showPasswordForm ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {passwordSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <X className="w-5 h-5" />
              <span>{passwordError}</span>
            </div>
          )}

          {showPasswordForm && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter new password (min. 8 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {passwordLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Change Password
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Account Information Card */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Role</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Vendor
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Account Status</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">Verified</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">User ID</span>
              <span className="text-sm text-gray-900 font-mono">{user?.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;
