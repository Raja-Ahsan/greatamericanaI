import { useState, useEffect } from 'react';
import { Settings, Save, CreditCard, AlertCircle, Loader2, Key, Image, CheckCircle } from 'lucide-react';
import api from '../utils/api';

interface PlatformSettings {
  platformName: string;
  platformFee: number;
  sellerCommission: number;
  taxRate: number;
  maintenanceMode: boolean;
}

interface PaymentGatewayInfo {
  name: string;
  region: string;
}

interface GatewayConfig {
  mode: string;
  logo_url: string;
  credentials: Record<string, string>;
}

interface CredentialField {
  key: string;
  label: string;
  type: string;
  options?: Record<string, string>;
}

interface SettingsResponse {
  success: boolean;
  data: {
    platform: PlatformSettings;
    payment_settings: {
      default_gateway: string;
      enabled_gateways: string[];
      gateways: Record<string, GatewayConfig>;
      available_gateways: Record<string, PaymentGatewayInfo>;
      credential_fields: Record<string, CredentialField[]>;
    };
  };
}

const defaultPlatform: PlatformSettings = {
  platformName: 'GreatAmerican.Ai',
  platformFee: 15,
  sellerCommission: 85,
  taxRate: 10,
  maintenanceMode: false,
};

const defaultGatewayConfig = (key: string): GatewayConfig => ({
  mode: key === 'paypal' ? 'sandbox' : 'sandbox',
  logo_url: '',
  credentials: {},
});

/** Normalize stored mode to display: only "sandbox" or "live". */
const normalizeMode = (mode: string): 'sandbox' | 'live' =>
  mode === 'live' ? 'live' : 'sandbox';

/** Filter credential fields by mode: Sandbox = test_* / sandbox_*, Live = live_*. */
const filterFieldsByMode = (fields: CredentialField[], mode: string): CredentialField[] => {
  const isLive = normalizeMode(mode) === 'live';
  return fields.filter((f) =>
    isLive ? f.key.startsWith('live_') : f.key.startsWith('test_') || f.key.startsWith('sandbox_')
  );
};

/** Fallback list so gateway sections always show even if API returns empty (e.g. backend not running or old API). */
const FALLBACK_AVAILABLE_GATEWAYS: Record<string, PaymentGatewayInfo> = {
  stripe: { name: 'Stripe', region: 'Global' },
  paypal: { name: 'PayPal', region: 'Global' },
  paymob: { name: 'Paymob', region: 'MENA' },
  fawry: { name: 'Fawry', region: 'Egypt' },
  tabby: { name: 'Tabby', region: 'MENA' },
  moyasar: { name: 'Moyasar', region: 'MENA' },
  myfatoorah: { name: 'MyFatoorah', region: 'Middle East' },
  urway: { name: 'Urway', region: 'MENA' },
  geidea: { name: 'Geidea', region: 'MENA' },
  telr: { name: 'Telr', region: 'Middle East' },
  tamara: { name: 'Tamara', region: 'MENA' },
  alrajhibank: { name: 'Al Rajhi Bank', region: 'Saudi Arabia' },
  clickpay: { name: 'ClickPay', region: 'MENA' },
  hyperpay: { name: 'HyperPay', region: 'MENA' },
  tap: { name: 'Tap', region: 'MENA' },
};

/** Fallback credential fields per gateway so API key inputs always show (matches backend CREDENTIAL_FIELDS). */
const FALLBACK_CREDENTIAL_FIELDS: Record<string, CredentialField[]> = {
  stripe: [
    { key: 'test_secret', label: 'Test Secret Key (sk_test_...)', type: 'password' },
    { key: 'test_publishable', label: 'Test Publishable Key (pk_test_...)', type: 'text' },
    { key: 'live_secret', label: 'Live Secret Key (sk_live_...)', type: 'password' },
    { key: 'live_publishable', label: 'Live Publishable Key (pk_live_...)', type: 'text' },
  ],
  paypal: [
    { key: 'test_client_id', label: 'Test Client ID', type: 'text' },
    { key: 'test_client_secret', label: 'Test Client Secret', type: 'password' },
    { key: 'live_client_id', label: 'Live Client ID', type: 'text' },
    { key: 'live_client_secret', label: 'Live Client Secret', type: 'password' },
  ],
  paymob: [
    { key: 'test_api_key', label: 'Test API Key', type: 'password' },
    { key: 'live_api_key', label: 'Live API Key', type: 'password' },
  ],
  fawry: [
    { key: 'test_merchant_code', label: 'Test Merchant Code', type: 'text' },
    { key: 'test_security_key', label: 'Test Security Key', type: 'password' },
    { key: 'live_merchant_code', label: 'Live Merchant Code', type: 'text' },
    { key: 'live_security_key', label: 'Live Security Key', type: 'password' },
  ],
  tabby: [
    { key: 'test_api_key', label: 'Test API Key', type: 'password' },
    { key: 'live_api_key', label: 'Live API Key', type: 'password' },
  ],
  moyasar: [
    { key: 'test_api_key', label: 'Test API Key', type: 'password' },
    { key: 'live_api_key', label: 'Live API Key', type: 'password' },
  ],
  myfatoorah: [
    { key: 'test_api_key', label: 'Test API Key', type: 'password' },
    { key: 'live_api_key', label: 'Live API Key', type: 'password' },
  ],
  urway: [
    { key: 'test_terminal_id', label: 'Test Terminal ID', type: 'text' },
    { key: 'test_password', label: 'Test Password', type: 'password' },
    { key: 'live_terminal_id', label: 'Live Terminal ID', type: 'text' },
    { key: 'live_password', label: 'Live Password', type: 'password' },
  ],
  geidea: [
    { key: 'test_api_key', label: 'Test API Key', type: 'password' },
    { key: 'live_api_key', label: 'Live API Key', type: 'password' },
  ],
  telr: [
    { key: 'test_store_id', label: 'Test Store ID', type: 'text' },
    { key: 'test_auth_key', label: 'Test Auth Key', type: 'password' },
    { key: 'live_store_id', label: 'Live Store ID', type: 'text' },
    { key: 'live_auth_key', label: 'Live Auth Key', type: 'password' },
  ],
  tamara: [
    { key: 'test_api_key', label: 'Test API Key', type: 'password' },
    { key: 'live_api_key', label: 'Live API Key', type: 'password' },
  ],
  alrajhibank: [
    { key: 'test_transportal_id', label: 'Test Transportal ID', type: 'text' },
    { key: 'test_password', label: 'Test Password', type: 'password' },
    { key: 'live_transportal_id', label: 'Live Transportal ID', type: 'text' },
    { key: 'live_password', label: 'Live Password', type: 'password' },
  ],
  clickpay: [
    { key: 'test_server_key', label: 'Test Server Key', type: 'password' },
    { key: 'live_server_key', label: 'Live Server Key', type: 'password' },
  ],
  hyperpay: [
    { key: 'test_entity_id', label: 'Test Entity ID', type: 'text' },
    { key: 'test_api_key', label: 'Test API Key', type: 'password' },
    { key: 'live_entity_id', label: 'Live Entity ID', type: 'text' },
    { key: 'live_api_key', label: 'Live API Key', type: 'password' },
  ],
  tap: [
    { key: 'test_api_key', label: 'Test API Key', type: 'password' },
    { key: 'live_api_key', label: 'Live API Key', type: 'password' },
  ],
};

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [savingPlatform, setSavingPlatform] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [uploadingLogoFor, setUploadingLogoFor] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [settings, setSettings] = useState<PlatformSettings>(defaultPlatform);
  const [defaultGateway, setDefaultGateway] = useState('stripe');
  const [enabledGateways, setEnabledGateways] = useState<string[]>(['stripe', 'paypal']);
  const [gatewaysConfig, setGatewaysConfig] = useState<Record<string, GatewayConfig>>({});
  const [availableGateways, setAvailableGateways] = useState<Record<string, PaymentGatewayInfo>>(FALLBACK_AVAILABLE_GATEWAYS);
  const [credentialFields, setCredentialFields] = useState<Record<string, CredentialField[]>>(FALLBACK_CREDENTIAL_FIELDS);

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<SettingsResponse>('/admin/settings');
      if (res.success && res.data) {
        setSettings({
          platformName: res.data.platform?.platformName ?? defaultPlatform.platformName,
          platformFee: res.data.platform?.platformFee ?? defaultPlatform.platformFee,
          sellerCommission: res.data.platform?.sellerCommission ?? defaultPlatform.sellerCommission,
          taxRate: res.data.platform?.taxRate ?? defaultPlatform.taxRate,
          maintenanceMode: res.data.platform?.maintenanceMode ?? defaultPlatform.maintenanceMode,
        });
        const ps = res.data.payment_settings;
        setDefaultGateway(ps?.default_gateway ?? 'stripe');
        setEnabledGateways(ps?.enabled_gateways ?? ['stripe', 'paypal']);
        setGatewaysConfig(ps?.gateways ?? {});
        const gateways = ps?.available_gateways;
        setAvailableGateways(
          gateways && Object.keys(gateways).length > 0 ? gateways : FALLBACK_AVAILABLE_GATEWAYS
        );
        const creds = ps?.credential_fields;
        setCredentialFields(
          creds && Object.keys(creds).length > 0 ? creds : FALLBACK_CREDENTIAL_FIELDS
        );
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSavePlatform = async () => {
    setSavingPlatform(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.put<{ success: boolean; message?: string }>('/admin/settings/platform', settings);
      if (res.success) {
        setSuccess('Platform settings saved successfully.');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save platform settings.');
    } finally {
      setSavingPlatform(false);
    }
  };

  const handleLogoUpload = async (gatewayKey: string, file: File) => {
    setUploadingLogoFor(gatewayKey);
    setError('');
    try {
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('gateway_key', gatewayKey);
      const res = await api.post<{ success: boolean; logo_url?: string; message?: string }>(
        '/admin/settings/gateway-logo',
        formData
      );
      if (res.success && res.logo_url) {
        setGatewayConfig(gatewayKey, 'logo_url', res.logo_url);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to upload logo.');
    } finally {
      setUploadingLogoFor(null);
    }
  };

  const handleSavePaymentSettings = async () => {
    setSavingPayment(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        default_gateway: defaultGateway,
        enabled_gateways: enabledGateways,
        gateways: gatewaysConfig,
      };
      const res = await api.put<{
        success?: boolean;
        message?: string;
        data?: { payment_settings?: { default_gateway?: string; enabled_gateways?: string[]; gateways?: Record<string, GatewayConfig> } };
      }>('/admin/settings/payment-settings', payload);
      const ok = (res as { success?: boolean }).success === true;
      if (ok) {
        setSuccess('All payment gateway settings saved successfully.');
        setTimeout(() => setSuccess(''), 5000);
        const ps = (res as { data?: { payment_settings?: { default_gateway?: string; enabled_gateways?: string[]; gateways?: Record<string, GatewayConfig> } } }).data?.payment_settings;
        if (ps) {
          if (ps.default_gateway != null) setDefaultGateway(ps.default_gateway);
          if (ps.enabled_gateways != null) setEnabledGateways(ps.enabled_gateways);
          if (ps.gateways != null && Object.keys(ps.gateways).length > 0) setGatewaysConfig(ps.gateways);
        }
      } else {
        setError((res as { message?: string }).message || 'Failed to save payment settings.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save payment settings.');
    } finally {
      setSavingPayment(false);
    }
  };

  const toggleGatewayEnabled = (gatewayKey: string) => {
    setEnabledGateways((prev) => {
      const next = prev.includes(gatewayKey) ? prev.filter((g) => g !== gatewayKey) : [...prev, gatewayKey];
      if (!next.includes(defaultGateway)) {
        setDefaultGateway(next[0] ?? defaultGateway);
      }
      return next;
    });
    setGatewaysConfig((prev) => {
      const next = { ...prev };
      if (!next[gatewayKey]) next[gatewayKey] = defaultGatewayConfig(gatewayKey);
      return next;
    });
  };

  const setGatewayConfig = (gatewayKey: string, field: keyof GatewayConfig, value: string | Record<string, string>) => {
    setGatewaysConfig((prev) => ({
      ...prev,
      [gatewayKey]: {
        ...(prev[gatewayKey] ?? defaultGatewayConfig(gatewayKey)),
        [field]: value,
      },
    }));
  };

  const setGatewayCredential = (gatewayKey: string, key: string, value: string) => {
    setGatewaysConfig((prev) => ({
      ...prev,
      [gatewayKey]: {
        ...(prev[gatewayKey] ?? defaultGatewayConfig(gatewayKey)),
        credentials: {
          ...(prev[gatewayKey]?.credentials ?? {}),
          [key]: value,
        },
      },
    }));
  };

  const getGatewayConfig = (key: string): GatewayConfig => gatewaysConfig[key] ?? defaultGatewayConfig(key);

  if (loading) {
    return (
      <div className="min-w-0 flex items-center justify-center py-16">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage platform and payment gateway settings. All settings are stored in the database.</p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Platform Settings */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Platform Settings
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform Fee (%)</label>
              <input type="number" value={settings.platformFee} onChange={(e) => setSettings({ ...settings, platformFee: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Seller Commission (%)</label>
              <input type="number" value={settings.sellerCommission} onChange={(e) => setSettings({ ...settings, sellerCommission: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
              <input type="number" value={settings.taxRate} onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="maintenance" checked={settings.maintenanceMode} onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <label htmlFor="maintenance" className="ml-2 text-sm text-gray-700">Maintenance Mode</label>
          </div>
          <div className="pt-4 border-t">
            <button onClick={handleSavePlatform} disabled={savingPlatform} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {savingPlatform ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Platform Settings
            </button>
          </div>
        </div>
      </div>

      {/* Payment Gateways — one section per gateway (arafadev/payment-gateways) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Gateways
            </h2>
            <p className="text-sm text-gray-500 mt-1">Manage each gateway: set default, activate/inactivate, test/live mode, logo, and API keys. All settings are saved in the database.</p>
          </div>
          <button onClick={handleSavePaymentSettings} disabled={savingPayment} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {savingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save all payment settings
          </button>
        </div>

        {Object.entries(availableGateways).length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            No payment gateways loaded. Ensure arafadev/payment-gateways is installed and backend is running.
          </div>
        ) : (
          Object.entries(availableGateways).map(([gatewayKey, info]) => {
            const config = getGatewayConfig(gatewayKey);
            const enabled = enabledGateways.includes(gatewayKey);
            const isDefault = defaultGateway === gatewayKey;
            const allFields = credentialFields[gatewayKey] ?? FALLBACK_CREDENTIAL_FIELDS[gatewayKey] ?? [];
            const fields = filterFieldsByMode(allFields, config.mode);
            return (
              <div key={gatewayKey} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                {/* Gateway header: logo, name, enable, default */}
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {config.logo_url ? (
                        <img src={config.logo_url} alt={info.name} className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <CreditCard className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{info.name}</h3>
                      <p className="text-xs text-gray-500">{info.region}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-auto flex-wrap">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={enabled} onChange={() => toggleGatewayEnabled(gatewayKey)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm font-medium text-gray-700">{enabled ? 'Active' : 'Inactive'}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="default_gateway" checked={isDefault} onChange={() => setDefaultGateway(gatewayKey)} disabled={!enabled} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                      <span className="text-sm font-medium text-gray-700">Set as default</span>
                    </label>
                  </div>
                </div>

                {/* Gateway body: mode, logo URL, keys */}
                <div className="px-4 sm:px-6 py-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                      <select
                        value={normalizeMode(config.mode)}
                        onChange={(e) => setGatewayConfig(gatewayKey, 'mode', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="sandbox">Sandbox</option>
                        <option value="live">Live</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Image className="w-4 h-4" />
                        Gateway logo
                      </label>
                      <div className="flex items-center gap-3 flex-wrap">
                        {config.logo_url && (
                          <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-white flex-shrink-0">
                            <img src={config.logo_url} alt="" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingLogoFor === gatewayKey}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleLogoUpload(gatewayKey, f);
                              e.target.value = '';
                            }}
                            className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
                          />
                          {uploadingLogoFor === gatewayKey && (
                            <span className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Uploading…
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {fields.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Key className="w-4 h-4" />
                        API keys ({normalizeMode(config.mode) === 'live' ? 'Live' : 'Sandbox'})
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {fields.map((field) => (
                          <div key={field.key}>
                            <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
                            <input
                              type={field.type === 'password' ? 'password' : 'text'}
                              value={config.credentials[field.key] ?? ''}
                              onChange={(e) => setGatewayCredential(gatewayKey, field.key, e.target.value)}
                              placeholder={field.type === 'password' ? '••••••••' : ''}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              autoComplete="off"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
