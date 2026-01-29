import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Download, Package, Loader2 } from 'lucide-react';
import api from '../utils/api';
import { userDataService, type Purchase } from '../services/userDataService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const orderIdsParam = searchParams.get('order_ids') || '';
  const orderIds = orderIdsParam ? orderIdsParam.split(',').map((id) => id.trim()).filter(Boolean) : [];
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (token) {
        setLoading(true);
        try {
          const res = await api.get<{ success?: boolean; data?: Purchase[] }>(`/purchases/by-token?token=${encodeURIComponent(token)}`);
          if (res.success && res.data) {
            setPurchases(res.data);
          } else {
            setPurchases([]);
          }
        } catch {
          setPurchases([]);
        } finally {
          setLoading(false);
          return;
        }
      }
      if (orderIds.length === 0) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const list = await userDataService.getPurchases();
        const idSet = new Set(orderIds.map((id) => String(id)));
        const filtered = list.filter((p) => idSet.has(String(p.id)));
        setPurchases(filtered);
      } catch {
        setPurchases([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token, orderIds.join(',')]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment successful</h1>
          <p className="text-gray-600 mb-8">
            Thank you for your purchase. Your order has been completed. You can download your AI agents below or from your dashboard.
          </p>

          {purchases.length > 0 ? (
            <div className="space-y-4 text-left">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Your purchases
              </h2>
              <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 overflow-hidden">
                {purchases.map((p) => (
                  <li key={p.id} className="p-4 bg-gray-50/50 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{p.agentName}</p>
                      <p className="text-sm text-gray-500">
                        ${typeof p.totalAmount === 'number' ? p.totalAmount.toFixed(2) : (p.price * (p.quantity || 1)).toFixed(2)} · Qty {p.quantity ?? 1}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
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
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              {!token && orderIds.length === 0
                ? 'No order information in the URL. You can view your purchases in your dashboard.'
                : 'Order details are loading or no matching orders were found. Check your dashboard for purchase history.'}
            </p>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
