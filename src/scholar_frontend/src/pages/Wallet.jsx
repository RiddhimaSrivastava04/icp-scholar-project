import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  MinusIcon,
  BanknotesIcon,
  GiftIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import { AuthContext } from '../contexts/AuthContext';
import { scholar_backend } from '../../../declarations/scholar_backend';

const Wallet = () => {
  const { principal, user } = useContext(AuthContext);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  useEffect(() => {
    if (user?.principal) {
      loadWalletData();
    }
  }, [user]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      setError('');

      // Get user balance
      const userBalance = await scholar_backend.get_user_balance(user.principal);
      setBalance(userBalance);

      // Get transaction history
      const txHistory = await scholar_backend.get_user_transactions(user.principal);
      setTransactions(txHistory);

    } catch (err) {
      setError('Failed to load wallet data');
      console.error('Wallet loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferRecipient || !transferAmount) {
      setError('Please fill in all transfer fields');
      return;
    }

    const amount = parseInt(transferAmount);
    if (amount <= 0 || amount > balance) {
      setError('Invalid transfer amount');
      return;
    }

    try {
      setTransferring(true);
      setError('');

      await scholar_backend.transfer_tokens(transferRecipient, amount);

      // Reset form and reload data
      setTransferAmount('');
      setTransferRecipient('');
      setShowTransferModal(false);
      await loadWalletData();

    } catch (err) {
      setError('Transfer failed: ' + err.message);
    } finally {
      setTransferring(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'course_purchase':
        return <AcademicCapIcon className="w-5 h-5 text-blue-500" />;
      case 'course_sale':
        return <BanknotesIcon className="w-5 h-5 text-green-500" />;
      case 'reward':
        return <GiftIcon className="w-5 h-5 text-purple-500" />;
      case 'transfer_sent':
        return <ArrowUpIcon className="w-5 h-5 text-red-500" />;
      case 'transfer_received':
        return <ArrowDownIcon className="w-5 h-5 text-green-500" />;
      default:
        return <ArrowsRightLeftIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'course_sale':
      case 'reward':
      case 'transfer_received':
        return 'text-green-600';
      case 'course_purchase':
      case 'transfer_sent':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (timestamp) => {
    return new Date(Number(timestamp) / 1000000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionDescription = (tx) => {
    switch (tx.transaction_type) {
      case 'course_purchase':
        return `Purchased course: ${tx.description || 'Course'}`;
      case 'course_sale':
        return `Course sale: ${tx.description || 'Course'}`;
      case 'reward':
        return `Reward: ${tx.description || 'Achievement'}`;
      case 'transfer_sent':
        return `Sent to ${tx.to_user || 'User'}`;
      case 'transfer_received':
        return `Received from ${tx.from_user || 'User'}`;
      default:
        return tx.description || 'Transaction';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'transactions', name: 'Transactions', icon: ClockIcon },
    { id: 'transfer', name: 'Transfer', icon: ArrowsRightLeftIcon }
  ];

  if (loading) {
    return (
      <Layout title="Wallet">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Wallet">
      <div className="max-w-6xl mx-auto">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg text-white p-8 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-sm font-medium">Scholar Token Balance</p>
              <p className="text-4xl font-bold mt-2">{balance.toLocaleString()} ST</p>
              <p className="text-indigo-200 text-sm mt-1">
                ≈ ${(balance * 0.1).toFixed(2)} USD
              </p>
            </div>
            <div className="bg-white/10 rounded-full p-4">
              <CurrencyDollarIcon className="w-12 h-12" />
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              onClick={() => setShowTransferModal(true)}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowUpIcon className="w-4 h-4" />
              <span>Send</span>
            </button>
            <button className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
              <ArrowDownIcon className="w-4 h-4" />
              <span>Request</span>
            </button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3">
                <ArrowDownIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month Earned</p>
                <p className="text-2xl font-bold text-gray-900">
                  {transactions
                    .filter(tx => ['course_sale', 'reward', 'transfer_received'].includes(tx.transaction_type))
                    .reduce((sum, tx) => sum + tx.amount, 0)
                    .toLocaleString()} ST
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center">
              <div className="bg-red-100 rounded-full p-3">
                <ArrowUpIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {transactions
                    .filter(tx => ['course_purchase', 'transfer_sent'].includes(tx.transaction_type))
                    .reduce((sum, tx) => sum + tx.amount, 0)
                    .toLocaleString()} ST
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3">
                <ClockIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(tx.transaction_type)}
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {getTransactionDescription(tx)}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(tx.timestamp)}</p>
                        </div>
                      </div>
                      <span className={`font-bold ${getTransactionColor(tx.transaction_type)}`}>
                        {['course_sale', 'reward', 'transfer_received'].includes(tx.transaction_type) ? '+' : '-'}
                        {tx.amount} ST
                      </span>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No transactions yet</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Earning Opportunities</h3>
                <div className="space-y-4">
                  <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg text-center">
                    <AcademicCapIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Create Courses</h4>
                    <p className="text-sm text-gray-600 mt-1">Earn tokens by creating and selling courses</p>
                  </div>
                  <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg text-center">
                    <GiftIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Complete Achievements</h4>
                    <p className="text-sm text-gray-600 mt-1">Get rewarded for learning milestones</p>
                  </div>
                  <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg text-center">
                    <ChartBarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-900">Participate in Forums</h4>
                    <p className="text-sm text-gray-600 mt-1">Earn reputation and token rewards</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {transactions.map((tx, index) => (
                  <div key={index} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getTransactionIcon(tx.transaction_type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {getTransactionDescription(tx)}
                          </p>
                          <p className="text-sm text-gray-500">{formatDate(tx.timestamp)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${getTransactionColor(tx.transaction_type)}`}>
                          {['course_sale', 'reward', 'transfer_received'].includes(tx.transaction_type) ? '+' : '-'}
                          {tx.amount} ST
                        </p>
                        <p className="text-sm text-gray-500">
                          Status: {tx.status || 'Completed'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <div className="p-12 text-center">
                    <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
                    <p className="mt-1 text-sm text-gray-500">Start learning or teaching to see your transaction history.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'transfer' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Send Scholar Tokens</h3>
              <div className="max-w-md">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Principal ID
                    </label>
                    <input
                      type="text"
                      value={transferRecipient}
                      onChange={(e) => setTransferRecipient(e.target.value)}
                      placeholder="Enter recipient's principal ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (ST)
                    </label>
                    <input
                      type="number"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="0"
                      min="1"
                      max={balance}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Available balance: {balance.toLocaleString()} ST
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleTransfer}
                    disabled={transferring || !transferRecipient || !transferAmount}
                    className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowUpIcon className="w-4 h-4" />
                    <span>{transferring ? 'Sending...' : 'Send Tokens'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Transfer Modal */}
        {showTransferModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Transfer</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={transferRecipient}
                  onChange={(e) => setTransferRecipient(e.target.value)}
                  placeholder="Recipient Principal ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="Amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleTransfer}
                    disabled={transferring}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {transferring ? 'Sending...' : 'Send'}
                  </button>
                  <button
                    onClick={() => setShowTransferModal(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Wallet;
