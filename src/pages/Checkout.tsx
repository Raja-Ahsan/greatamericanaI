import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, Lock, Loader2, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import api from '../utils/api';

interface GatewayOption {
  key: string;
  name: string;
  region: string;
  logo_url: string;
}

const PAYMENT_STATUS_MESSAGES: Record<string, string> = {
  failed: 'Payment could not be completed or was declined. Please try again or choose another payment method.',
  expired: 'Your payment session has expired. Please place your order again.',
  invalid: 'Invalid payment session. Please start checkout again.',
  cancelled: 'Payment was cancelled. You can try again when ready.',
};

function getInitialPaymentError(): string {
  if (typeof window === 'undefined') return '';
  const p = new URLSearchParams(window.location.search).get('payment');
  return (p && PAYMENT_STATUS_MESSAGES[p]) ? PAYMENT_STATUS_MESSAGES[p] : '';
}

const Checkout = () => {
  const { cart, getTotalPrice, user } = useStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [platformName, setPlatformName] = useState('GreatAmerican.Ai');
  const [taxRate, setTaxRate] = useState(10);
  const [gateways, setGateways] = useState<GatewayOption[]>([]);
  const [defaultGateway, setDefaultGateway] = useState('stripe');
  const [selectedGateway, setSelectedGateway] = useState<string>('');
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(getInitialPaymentError);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    billingAddress: '',
    city: '',
    zipCode: '',
    country: '',
  });

  // Sync error from URL when landing with ?payment=... and clear param after a short delay so message stays visible
  useEffect(() => {
    const status = searchParams.get('payment');
    if (status && PAYMENT_STATUS_MESSAGES[status]) {
      setError(PAYMENT_STATUS_MESSAGES[status]);
      const t = setTimeout(() => {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.delete('payment');
          return next;
        }, { replace: true });
      }, 50);
      return () => clearTimeout(t);
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoadingSettings(true);
      try {
        const [platformRes, gatewaysRes] = await Promise.all([
          api.get<{ success?: boolean; data?: { platformName?: string; taxRate?: number } }>('/platform-settings'),
          api.get<{ success?: boolean; data?: { default_gateway?: string; gateways?: GatewayOption[] } }>('/payment-gateways'),
        ]);
        if (platformRes.success && platformRes.data) {
          setPlatformName(platformRes.data.platformName ?? 'GreatAmerican.Ai');
          setTaxRate(platformRes.data.taxRate ?? 10);
        }
        if (gatewaysRes.success && gatewaysRes.data) {
          const list = gatewaysRes.data.gateways ?? [];
          setGateways(list);
          const def = gatewaysRes.data.default_gateway ?? 'stripe';
          setDefaultGateway(def);
          setSelectedGateway(def);
          if (list.length > 0 && !list.some((g) => g.key === def)) {
            setSelectedGateway(list[0].key);
          }
        }
      } catch {
        setGateways([
          { key: 'stripe', name: 'Stripe', region: 'Global', logo_url: '' },
          { key: 'paypal', name: 'PayPal', region: 'Global', logo_url: '' },
        ]);
        setDefaultGateway('stripe');
        setSelectedGateway('stripe');
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  const taxMultiplier = taxRate / 100;
  const subtotal = getTotalPrice();
  const taxAmount = subtotal * taxMultiplier;
  const total = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedGateway) {
      setError('Please select a payment method.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post<{ success?: boolean; redirect_url?: string; message?: string }>(
        '/checkout/create-payment',
        { gateway: selectedGateway }
      );
      if (res.success && res.redirect_url) {
        window.location.href = res.redirect_url;
        return;
      }
      setError(res.message ?? 'Payment could not be started. Please try again.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  if (loadingSettings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-1">
            Complete your purchase at <span className="font-medium text-gray-900">{platformName}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method – active gateways from admin */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  Payment Method
                </h2>
                <p className="text-sm text-gray-500 mb-4">Choose how you want to pay. You’ll complete payment on the next step.</p>
                <div className="space-y-3">
                  {gateways.length === 0 ? (
                    <p className="text-gray-500 text-sm">No payment methods available. Please contact {platformName}.</p>
                  ) : (
                    gateways.map((gateway) => {
                      const isSelected = selectedGateway === gateway.key;
                      return (
                        <button
                          key={gateway.key}
                          type="button"
                          onClick={() => setSelectedGateway(gateway.key)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/50'
                              : 'border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {gateway.logo_url ? (
                              <img src={gateway.logo_url} alt={gateway.name} className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            ) : (
                              <CreditCard className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{gateway.name}</p>
                            <p className="text-xs text-gray-500">{gateway.region}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                            {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="billingAddress"
                      required
                      value={formData.billingAddress}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        required
                        value={formData.zipCode}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || gateways.length === 0}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Pay with {gateways.find((g) => g.key === selectedGateway)?.name ?? selectedGateway} – ${total.toFixed(2)}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary – dynamic tax from admin */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div key={item.agent.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.agent.name} × {item.quantity}
                    </span>
                    <span className="text-gray-900 font-medium">
                      ${(item.agent.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-700 text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700 text-sm">
                  <span>Tax ({taxRate}%)</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
