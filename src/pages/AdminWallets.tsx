import { useState, useEffect } from 'react';
import {
  Wallet as WalletIcon,
  Send,
  Search,
  RefreshCw,
  Check,
  X,
  DollarSign,
  User,
  AlertCircle,
} from 'lucide-react';
import api from '../utils/api';

interface WalletItem {
  id: number;
  user_id: number;
  user: { id: number; name: string; email: string; role: string } | null;
  balance: number;
  currency: string;
  status: string;
}

interface WithdrawalItem {
  id: number;
  wallet_id: number;
  amount: number;
  status: string;
  payment_reference: string | null;
  notes: string | null;
  requested_at: string;
  processed_at: string | null;
  user: { id: number; name: string; email: string } | null;
}

const AdminWallets = () => {
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'wallets' | 'withdrawals'>('withdrawals');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [modalWithdrawal, setModalWithdrawal] = useState<WithdrawalItem | null>(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [notes, setNotes] = useState('');
  const [actionStatus, setActionStatus] = useState<'approved' | 'rejected' | 'paid'>('approved');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [walletPage, setWalletPage] = useState(1);
  const [walletMeta, setWalletMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [withdrawalPage, setWithdrawalPage] = useState(1);
  const [withdrawalMeta, setWithdrawalMeta] = useState({ current_page: 1, last_page: 1, total: 0 });

  const fetchWallets = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(p));
      if (search) params.set('search', search);
      const res = await api.get<{ success: boolean; data: WalletItem[]; meta?: any }>(
        `/admin/wallets?${params.toString()}`
      );
      if (res.success && res.data) {
        setWallets(res.data);
        if (res.meta) setWalletMeta(res.meta);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawals = async (p = 1) => {
    setWithdrawalsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(p));
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get<{ success: boolean; data: WithdrawalItem[]; meta?: any }>(
        `/admin/withdrawals?${params.toString()}`
      );
      if (res.success && res.data) {
        setWithdrawals(res.data);
        if (res.meta) setWithdrawalMeta(res.meta);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  useEffect(() => {
    setWalletPage(1);
  }, [search]);

  useEffect(() => {
    if (activeTab === 'wallets') fetchWallets(walletPage);
  }, [activeTab, walletPage, search]);

  useEffect(() => {
    if (activeTab === 'withdrawals') fetchWithdrawals(withdrawalPage);
  }, [activeTab, withdrawalPage, statusFilter]);

  const handleUpdateWithdrawal = async () => {
    if (!modalWithdrawal) return;
    setError('');
    setSuccess('');
    setProcessingId(modalWithdrawal.id);
    try {
      const res = await api.patch<{ success: boolean; message?: string }>(
        `/admin/withdrawals/${modalWithdrawal.id}`,
        {
          status: actionStatus,
          payment_reference: paymentRef || undefined,
          notes: notes || undefined,
        }
      );
      if (res.success) {
        setSuccess('Withdrawal updated successfully.');
        setModalWithdrawal(null);
        setPaymentRef('');
        setNotes('');
        fetchWithdrawals(withdrawalPage);
      } else {
        setError((res as any).message || 'Update failed');
      }
    } catch (err: any) {
      setError(err.message || 'Update failed');
    } finally {
      setProcessingId(null);
    }
  };

  const statusBadge = (status: string) => {
    const classes: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800',
      approved: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <span
        className={`px-2 py-0.5 rounded text-xs font-medium ${classes[status] || 'bg-gray-100 text-gray-800'}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-w-0">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Wallets & Withdrawals</h1>
        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage vendor wallets and process withdrawal requests</p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <div className="flex border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('wallets')}
          className={`px-4 sm:px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 -mb-px flex-shrink-0 ${
            activeTab === 'wallets'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          <WalletIcon className="w-4 h-4" />
          Wallets
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('withdrawals')}
          className={`px-4 sm:px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 -mb-px flex-shrink-0 ${
            activeTab === 'withdrawals'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          <Send className="w-4 h-4" />
          Withdrawal Requests
        </button>
      </div>

      {activeTab === 'wallets' && (
        <>
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchWallets(1)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto min-w-0">
                <table className="w-full min-w-[480px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">User</th>
                      <th className="text-left py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-700 hidden sm:table-cell">Role</th>
                      <th className="text-right py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">Balance</th>
                      <th className="text-left py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {wallets.map((w) => (
                      <tr key={w.id} className="hover:bg-gray-50">
                        <td className="py-3 px-3 sm:py-4 sm:px-6">
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{w.user?.name ?? '-'}</p>
                            <p className="text-xs sm:text-sm text-gray-500 truncate max-w-[140px] sm:max-w-none">{w.user?.email ?? '-'}</p>
                          </div>
                        </td>
                        <td className="py-3 px-3 sm:py-4 sm:px-6 text-sm text-gray-600 hidden sm:table-cell">{w.user?.role ?? '-'}</td>
                        <td className="py-3 px-3 sm:py-4 sm:px-6 text-right font-semibold text-gray-900 text-sm sm:text-base whitespace-nowrap">
                          {w.currency} {Number(w.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 sm:py-4 sm:px-6">{statusBadge(w.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {walletMeta.last_page > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Total {walletMeta.total} wallet(s)
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setWalletPage((p) => Math.max(1, p - 1))}
                    disabled={walletPage <= 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="py-1 px-2 text-sm">
                    Page {walletPage} of {walletMeta.last_page}
                  </span>
                  <button
                    type="button"
                    onClick={() => setWalletPage((p) => Math.min(walletMeta.last_page, p + 1))}
                    disabled={walletPage >= walletMeta.last_page}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'withdrawals' && (
        <>
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {withdrawalsLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto min-w-0">
                <table className="w-full min-w-[520px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">Vendor</th>
                      <th className="text-right py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">Amount</th>
                      <th className="text-left py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-700 hidden sm:table-cell">Requested</th>
                      <th className="text-left py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">Status</th>
                      <th className="text-right py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-gray-50">
                        <td className="py-3 px-3 sm:py-4 sm:px-6">
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{w.user?.name ?? '-'}</p>
                            <p className="text-xs sm:text-sm text-gray-500 truncate max-w-[140px] sm:max-w-none">{w.user?.email ?? '-'}</p>
                          </div>
                        </td>
                        <td className="py-3 px-3 sm:py-4 sm:px-6 text-right font-semibold text-sm sm:text-base whitespace-nowrap">
                          ${w.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm text-gray-600 whitespace-nowrap hidden sm:table-cell">
                          {new Date(w.requested_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 sm:py-4 sm:px-6">{statusBadge(w.status)}</td>
                        <td className="py-3 px-3 sm:py-4 sm:px-6 text-right">
                          {(w.status === 'pending' || w.status === 'approved') && (
                            <button
                              type="button"
                              onClick={() => {
                                setModalWithdrawal(w);
                                setPaymentRef(w.payment_reference || '');
                                setNotes(w.notes || '');
                                setActionStatus(w.status === 'approved' ? 'paid' : 'approved');
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                              {w.status === 'pending' ? 'Approve / Reject' : 'Mark as Paid'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {withdrawals.length === 0 && !withdrawalsLoading && (
              <div className="py-12 text-center text-gray-500">
                <Send className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No withdrawal requests.</p>
              </div>
            )}
            {withdrawalMeta.last_page > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Total {withdrawalMeta.total} request(s)</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawalPage((p) => Math.max(1, p - 1))}
                    disabled={withdrawalPage <= 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="py-1 px-2 text-sm">
                    Page {withdrawalPage} of {withdrawalMeta.last_page}
                  </span>
                  <button
                    type="button"
                    onClick={() => setWithdrawalPage((p) => Math.min(withdrawalMeta.last_page, p + 1))}
                    disabled={withdrawalPage >= withdrawalMeta.last_page}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal: Approve / Reject / Mark as Paid */}
      {modalWithdrawal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Withdrawal</h3>
            <p className="text-sm text-gray-600 mb-4">
              {modalWithdrawal.user?.name} — $
              {modalWithdrawal.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <select
                  value={actionStatus}
                  onChange={(e) => setActionStatus(e.target.value as 'approved' | 'rejected' | 'paid')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {modalWithdrawal.status === 'pending' && (
                    <>
                      <option value="approved">Approve</option>
                      <option value="rejected">Reject</option>
                    </>
                  )}
                  {modalWithdrawal.status === 'approved' && <option value="paid">Mark as Paid</option>}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Reference (optional)</label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Bank ref / Transaction ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Internal notes"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setModalWithdrawal(null);
                  setPaymentRef('');
                  setNotes('');
                }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateWithdrawal}
                disabled={processingId !== null}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processingId === modalWithdrawal.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {actionStatus === 'approved' && <Check className="w-4 h-4" />}
                    {actionStatus === 'rejected' && <X className="w-4 h-4" />}
                    {actionStatus === 'paid' && <DollarSign className="w-4 h-4" />}
                    {actionStatus === 'approved' ? 'Approve' : actionStatus === 'rejected' ? 'Reject' : 'Mark as Paid'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWallets;
