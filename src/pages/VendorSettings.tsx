import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
  Bell,
  DollarSign,
  Globe,
  User,
  Wallet,
  Save,
  CheckCircle,
  X,
  Mail,
  Info,
  Building2,
  CreditCard,
  FileText,
} from 'lucide-react';


type PayoutMethod = 'paypal' | 'bank_transfer' | 'other';
type PayoutFrequency = 'weekly' | 'biweekly' | 'monthly' | '';

interface VendorSettingsData {
  notifications: {
    newSale: boolean;
    withdrawalProcessed: boolean;
    newMessage: boolean;
    weeklySummary: boolean;
  };
  payoutMethod: PayoutMethod;
  payoutEmail: string;
  bankAccountHolder: string;
  bankName: string;
  bankAccountNumber: string;
  bankRoutingOrSwift: string;
  payoutNotes: string;
  payoutFrequency: PayoutFrequency;
  timezone: string;
}

const defaultSettings: VendorSettingsData = {
  notifications: {
    newSale: true,
    withdrawalProcessed: true,
    newMessage: true,
    weeklySummary: false,
  },
  payoutMethod: 'paypal',
  payoutEmail: '',
  bankAccountHolder: '',
  bankName: '',
  bankAccountNumber: '',
  bankRoutingOrSwift: '',
  payoutNotes: '',
  payoutFrequency: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
};

const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'UTC',
  'Europe/London',
  'Europe/Paris',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Australia/Sydney',
];

const VendorSettings = () => {
  const [settings, setSettings] = useState<VendorSettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<{ success: boolean; data: VendorSettingsData | Record<string, never> }>('/settings');
      if (res.success && res.data && Object.keys(res.data).length > 0) {
        const parsed = res.data as VendorSettingsData;
        setSettings((_prev) => ({
          ...defaultSettings,
          ...parsed,
          notifications: { ...defaultSettings.notifications, ...(parsed.notifications || {}) },
        }));
      }
    } catch (err) {
      setError('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof VendorSettingsData['notifications'], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.put<{ success: boolean; message?: string }>('/settings', { settings });
      setSuccess('Settings saved successfully.');
      successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your vendor account and preferences</p>
      </div>

      {success && (
        <div
          ref={successRef}
          role="alert"
          className="mb-6 flex items-center gap-3 p-4 bg-green-50 border-2 border-green-300 text-green-800 rounded-lg shadow-sm"
        >
          <CheckCircle className="w-6 h-6 flex-shrink-0 text-green-600" />
          <span className="font-medium">{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <X className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          to="/vendor/profile"
          className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:border-green-500 hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Profile</p>
            <p className="text-sm text-gray-500">Update name, email, avatar & password</p>
          </div>
        </Link>
        <Link
          to="/vendor/wallet"
          className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:border-green-500 hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Wallet className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Wallet</p>
            <p className="text-sm text-gray-500">Balance, transactions & withdrawals</p>
          </div>
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-green-600" />
              Notifications
            </h2>
            <p className="text-sm text-gray-500 mt-1">Choose what you want to be notified about</p>
          </div>
          <div className="p-6 space-y-4">
            <label className="flex items-center justify-between py-3 border-b border-gray-100 cursor-pointer">
              <span className="text-gray-700">New sale</span>
              <input
                type="checkbox"
                checked={settings.notifications.newSale}
                onChange={(e) => handleNotificationChange('newSale', e.target.checked)}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
            </label>
            <label className="flex items-center justify-between py-3 border-b border-gray-100 cursor-pointer">
              <span className="text-gray-700">Withdrawal processed</span>
              <input
                type="checkbox"
                checked={settings.notifications.withdrawalProcessed}
                onChange={(e) => handleNotificationChange('withdrawalProcessed', e.target.checked)}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
            </label>
            <label className="flex items-center justify-between py-3 border-b border-gray-100 cursor-pointer">
              <span className="text-gray-700">New message</span>
              <input
                type="checkbox"
                checked={settings.notifications.newMessage}
                onChange={(e) => handleNotificationChange('newMessage', e.target.checked)}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
            </label>
            <label className="flex items-center justify-between py-3 cursor-pointer">
              <span className="text-gray-700">Weekly summary</span>
              <input
                type="checkbox"
                checked={settings.notifications.weeklySummary}
                onChange={(e) => handleNotificationChange('weeklySummary', e.target.checked)}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
            </label>
          </div>
        </div>

        {/* Payout preferences */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Payout preferences
            </h2>
            <p className="text-sm text-gray-500 mt-1">How you receive withdrawal payouts</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">How payouts work</p>
                <p>
                  Withdrawals are processed by the platform admin. Minimum withdrawal is $10. Request a withdrawal from your Wallet page; once approved and marked as paid, you will receive the payment via the method you specify below.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred payout method</label>
              <select
                value={settings.payoutMethod}
                onChange={(e) => setSettings((prev) => ({ ...prev, payoutMethod: e.target.value as PayoutMethod }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="paypal">PayPal</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>

            {settings.payoutMethod === 'paypal' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PayPal email <span className="text-gray-500 font-normal">(for receiving payouts)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={settings.payoutEmail}
                    onChange={(e) => setSettings((prev) => ({ ...prev, payoutEmail: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="your@paypal.com"
                  />
                </div>
              </div>
            )}

            {settings.payoutMethod === 'bank_transfer' && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Provide your bank details for wire transfer. Admin will use this when processing your withdrawal.</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account holder name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={settings.bankAccountHolder}
                      onChange={(e) => setSettings((prev) => ({ ...prev, bankAccountHolder: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={settings.bankName}
                      onChange={(e) => setSettings((prev) => ({ ...prev, bankName: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                      placeholder="e.g. Chase Bank"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={settings.bankAccountNumber}
                      onChange={(e) => setSettings((prev) => ({ ...prev, bankAccountNumber: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                      placeholder="Account number"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Routing number / SWIFT or IBAN</label>
                  <input
                    type="text"
                    value={settings.bankRoutingOrSwift}
                    onChange={(e) => setSettings((prev) => ({ ...prev, bankRoutingOrSwift: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    placeholder="Routing # (US) or SWIFT/IBAN (international)"
                  />
                </div>
              </div>
            )}

            {settings.payoutMethod === 'other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payout instructions or notes</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    value={settings.payoutNotes}
                    onChange={(e) => setSettings((prev) => ({ ...prev, payoutNotes: e.target.value }))}
                    rows={4}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g. Check, money order, or other payment method and how to send it..."
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Describe how you prefer to receive payouts. Admin will use this when processing withdrawals.</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred payout frequency</label>
              <select
                value={settings.payoutFrequency}
                onChange={(e) => setSettings((prev) => ({ ...prev, payoutFrequency: e.target.value as PayoutFrequency }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">No preference</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Informational only. Admin may use this when scheduling payouts.</p>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-600" />
              Preferences
            </h2>
            <p className="text-sm text-gray-500 mt-1">Display and regional settings</p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings((prev) => ({ ...prev, timezone: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorSettings;
