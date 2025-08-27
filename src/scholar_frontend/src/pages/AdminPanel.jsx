import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  BanknotesIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  HandRaisedIcon
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import { AuthContext } from '../contexts/AuthContext';
import { scholar_backend } from '../../../declarations/scholar_backend';

const AdminPanel = () => {
  const { principal, user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    if (principal && user?.role === 'admin') {
      loadAdminData();
    }
  }, [principal, user]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load platform statistics
      const platformStats = await scholar_backend.get_platform_stats();
      setStats(platformStats);

      // Load users
      const allUsers = await scholar_backend.get_all_users();
      setUsers(allUsers);

      // Load courses
      const allCourses = await scholar_backend.get_courses();
      setCourses(allCourses);

      // Load discussions
      const allDiscussions = await scholar_backend.get_discussions();
      setDiscussions(allDiscussions);

      // Load recent transactions
      const recentTransactions = await scholar_backend.get_recent_transactions();
      setTransactions(recentTransactions);

      // Load reports
      const systemReports = await scholar_backend.get_reports();
      setReports(systemReports);

    } catch (err) {
      setError('Failed to load admin data');
      console.error('Admin data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      switch (action) {
        case 'suspend':
          await scholar_backend.suspend_user(userId);
          break;
        case 'activate':
          await scholar_backend.activate_user(userId);
          break;
        case 'promote':
          await scholar_backend.promote_user(userId);
          break;
        case 'demote':
          await scholar_backend.demote_user(userId);
          break;
      }
      await loadAdminData();
    } catch (err) {
      setError(`Failed to ${action} user`);
    }
  };

  const handleCourseAction = async (courseId, action) => {
    try {
      switch (action) {
        case 'approve':
          await scholar_backend.approve_course(courseId);
          break;
        case 'reject':
          await scholar_backend.reject_course(courseId);
          break;
        case 'feature':
          await scholar_backend.feature_course(courseId);
          break;
        case 'hide':
          await scholar_backend.hide_course(courseId);
          break;
      }
      await loadAdminData();
    } catch (err) {
      setError(`Failed to ${action} course`);
    }
  };

  const handleReportAction = async (reportId, action) => {
    try {
      switch (action) {
        case 'resolve':
          await scholar_backend.resolve_report(reportId);
          break;
        case 'dismiss':
          await scholar_backend.dismiss_report(reportId);
          break;
      }
      await loadAdminData();
    } catch (err) {
      setError(`Failed to ${action} report`);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'resolved':
        return 'text-green-600 bg-green-100';
      case 'suspended':
      case 'rejected':
      case 'dismissed':
        return 'text-red-600 bg-red-100';
      case 'pending':
      case 'under_review':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <Layout title="Admin Panel">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">You don't have permission to access the admin panel.</p>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'users', name: 'Users', icon: UserGroupIcon },
    { id: 'courses', name: 'Courses', icon: AcademicCapIcon },
    { id: 'discussions', name: 'Discussions', icon: ChatBubbleLeftRightIcon },
    { id: 'transactions', name: 'Transactions', icon: BanknotesIcon },
    { id: 'reports', name: 'Reports', icon: ExclamationTriangleIcon }
  ];

  if (loading) {
    return (
      <Layout title="Admin Panel">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Panel">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600 mt-2">Platform management and oversight</p>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-8 h-8 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-600">Administrator</span>
          </div>
        </motion.div>

        {/* Quick Stats */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-3">
                  <UserGroupIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_users || users.length}</p>
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
                <div className="bg-green-100 rounded-full p-3">
                  <AcademicCapIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_courses || courses.length}</p>
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
                <div className="bg-purple-100 rounded-full p-3">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Discussions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_discussions || discussions.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center">
                <div className="bg-yellow-100 rounded-full p-3">
                  <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Open Reports</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reports.filter(r => r.status === 'pending').length}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

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

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

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
                        <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{tx.description}</p>
                          <p className="text-xs text-gray-500">{formatDate(tx.timestamp)}</p>
                        </div>
                      </div>
                      <span className="font-bold text-indigo-600">{tx.amount} ST</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Platform Status</span>
                    <span className="flex items-center space-x-1 text-green-600">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">Operational</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Active Users (24h)</span>
                    <span className="font-medium text-gray-900">{stats.active_users_24h || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Token Circulation</span>
                    <span className="font-medium text-gray-900">{stats.token_circulation || 'N/A'} ST</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Pending Reviews</span>
                    <span className="font-medium text-yellow-600">
                      {courses.filter(c => c.status === 'pending').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                  <div className="flex space-x-4">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search users..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Users</option>
                      <option value="students">Students</option>
                      <option value="educators">Educators</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users
                      .filter(user => {
                        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
                        const matchesFilter = selectedFilter === 'all' || user.role === selectedFilter || user.status === selectedFilter;
                        return matchesSearch && matchesFilter;
                      })
                      .map((user) => (
                        <tr key={user.principal} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                                  <UserIcon className="h-6 w-6 text-white" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500 truncate">{user.principal}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status || 'active')}`}>
                              {user.status || 'active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleUserAction(user.principal, user.status === 'suspended' ? 'activate' : 'suspend')}
                              className={`${user.status === 'suspended' ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'}`}
                            >
                              {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                            </button>
                            <button
                              onClick={() => handleUserAction(user.principal, user.role === 'educator' ? 'demote' : 'promote')}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              {user.role === 'educator' ? 'Demote' : 'Promote'}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Course Management</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {courses.map((course) => (
                  <div key={course.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{course.title}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status || 'approved')}`}>
                            {course.status || 'approved'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>By: {course.instructor_name}</span>
                          <span>Price: {course.price} ST</span>
                          <span>Students: {course.enrolled_count || 0}</span>
                          <span>Created: {formatDate(course.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        {course.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleCourseAction(course.id, 'approve')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleCourseAction(course.id, 'reject')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircleIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleCourseAction(course.id, course.featured ? 'hide' : 'feature')}
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Content Reports</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <div key={report.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{report.title}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Reported by: {report.reporter_name}</span>
                          <span>Type: {report.type}</span>
                          <span>Date: {formatDate(report.created_at)}</span>
                        </div>
                      </div>
                      {report.status === 'pending' && (
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleReportAction(report.id, 'resolve')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircleIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleReportAction(report.id, 'dismiss')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircleIcon className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {reports.length === 0 && (
                  <div className="p-12 text-center">
                    <HandRaisedIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No reports</h3>
                    <p className="mt-1 text-sm text-gray-500">All content reports have been resolved.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default AdminPanel;
