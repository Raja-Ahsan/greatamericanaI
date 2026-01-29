import { useState, useEffect } from 'react';
import {
  Wallet as WalletIcon,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Send,
  History,
  AlertCircle,
} from 'lucide-react';
import api from '../utils/api';

interface WalletData {
  id: number;
  balance: number;
  currency: string;
  status: string;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  balance_after: number;
  reference_type: string;
  description: string | null;
  created_at: string;
}

interface WithdrawalItem {
  id: number;
  amount: number;
  status: string;
  payment_reference: string | null;
  requested_at: string;
  processed_at: string | null;
}

const VendorWallet = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawNotes, setWithdrawNotes] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'transactions' | 'withdrawals'>('transactions');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchWallet = async () => {
    try {
      const res = await api.get<{ success: boolean; data: WalletData }>('/wallet');
      if (res.success && res.data) setWallet(res.data);
    } catch (e) {
      setError('Failed to load wallet');
    }
  };

  const fetchTransactions = async (p = 1) => {
    try {
      const res = await api.get<{ success: boolean; data: Transaction[]; meta?: { last_page: number } }>(
        `/wallet/transactions?page=${p}&per_page=15`
      );
      if (res.success && res.data) {
        setTransactions(res.data);
        if (res.meta) setTotalPages(res.meta.last_page);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const res = await api.get<{ success: boolean; data: WithdrawalItem[] }>('/wallet/withdrawals');
      if (res.success && res.data) setWithdrawals(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchWallet(), fetchTransactions(1), fetchWithdrawals()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 10) {
      setError('Minimum withdrawal is $10');
      return;
    }
    if (wallet && amount > wallet.balance) {
      setError('Insufficient balance');
      return;
    }
    setWithdrawing(true);
    try {
      const res = await api.post<{ success: boolean; message?: string }>('/wallet/withdraw', {
        amount,
        notes: withdrawNotes || undefined,
      });
      if (res.success) {
        setSuccess('Withdrawal request submitted. You will be notified when it is processed.');
        setWithdrawAmount('');
        setWithdrawNotes('');
        fetchWallet();
        fetchWithdrawals();
      } else {
        setError((res as any).message || 'Request failed');
      }
    } catch (err: any) {
      setError(err.message || 'Request failed');
    } finally {
      setWithdrawing(false);
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
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${classes[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
        <p className="text-gray-600 mt-2">Manage your earnings and withdrawals</p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-lg p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <WalletIcon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-green-100 text-sm">Available Balance</p>
              <p className="text-3xl font-bold">
                {wallet
                  ? `${wallet.currency} ${Number(wallet.balance).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : 'USD 0.00'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              Promise.all([fetchWallet(), fetchTransactions(1), fetchWithdrawals()]).finally(() =>
                setLoading(false)
              );
            }}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        {wallet?.status === 'locked' && (
          <p className="mt-3 text-sm text-amber-200">Your wallet is currently locked. Contact support.</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Withdraw Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-green-600" />
              Request Withdrawal
            </h2>
            <p className="text-sm text-gray-600 mb-4">Minimum withdrawal: $10. Processed by admin.</p>
            <form onSubmit={handleWithdraw}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
                <input
                  type="number"
                  min="10"
                  step="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0.00"
                  disabled={wallet?.status === 'locked'}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={withdrawNotes}
                  onChange={(e) => setWithdrawNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Bank details or reference"
                  disabled={wallet?.status === 'locked'}
                />
              </div>
              <button
                type="submit"
                disabled={withdrawing || wallet?.status === 'locked'}
                className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {withdrawing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Request Withdrawal
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Tabs: Transactions | Withdrawals */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('transactions')}
                className={`px-6 py-4 text-sm font-medium flex items-center gap-2 ${
                  activeTab === 'transactions'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <History className="w-4 h-4" />
                Transactions
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('withdrawals')}
                className={`px-6 py-4 text-sm font-medium flex items-center gap-2 ${
                  activeTab === 'withdrawals'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Send className="w-4 h-4" />
                Withdrawal Requests
              </button>
            </div>

            {activeTab === 'transactions' && (
              <div className="p-4">
                {transactions.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No transactions yet. Earnings from sales will appear here.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {transactions.map((t) => (
                      <li key={t.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              t.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {t.type === 'credit' ? (
                              <ArrowDownLeft className="w-5 h-5" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {t.description || t.reference_type}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(t.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              t.type === 'credit' ? 'text-green-600' : 'text-gray-900'
                            }`}
                          >
                            {t.type === 'credit' ? '+' : '-'}$
                            {Math.abs(t.amount).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                          <p className="text-xs text-gray-500">
                            Balance: $
                            {t.balance_after.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        const nextPage = Math.max(1, page - 1);
                        setPage(nextPage);
                        fetchTransactions(nextPage);
                      }}
                      disabled={page <= 1}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="py-1 px-2">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextPage = Math.min(totalPages, page + 1);
                        setPage(nextPage);
                        fetchTransactions(nextPage);
                      }}
                      disabled={page >= totalPages}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'withdrawals' && (
              <div className="p-4">
                {withdrawals.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <Send className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No withdrawal requests yet.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {withdrawals.map((w) => (
                      <li key={w.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            $
                            {w.amount.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                          <p className="text-xs text-gray-500">
                            Requested: {new Date(w.requested_at).toLocaleString()}
                            {w.processed_at &&
                              ` · Processed: ${new Date(w.processed_at).toLocaleString()}`}
                          </p>
                          {w.payment_reference && (
                            <p className="text-xs text-gray-600 mt-1">Ref: {w.payment_reference}</p>
                          )}
                        </div>
                        {statusBadge(w.status)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorWallet;
