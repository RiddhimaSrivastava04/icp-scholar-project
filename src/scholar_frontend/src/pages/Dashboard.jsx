import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import RegistrationModal from '../components/RegistrationModal';
import {
  BookOpen,
  TrendingUp,
  Award,
  Users,
  Clock,
  Target,
  ChevronRight,
  Play,
  CheckCircle,
} from 'lucide-react';
import { formatTokens, formatDate, getProgressColor } from '../utils/helpers';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { isAuthenticated, user, actor, loading } = useAuth();
  const navigate = useNavigate();
  const [showRegistration, setShowRegistration] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    balance: 0,
    enrollments: [],
    createdCourses: [],
    recentActivity: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
      return;
    }

    if (isAuthenticated && !user) {
      setShowRegistration(true);
    }
  }, [isAuthenticated, user, loading, navigate]);

  useEffect(() => {
    if (user && actor) {
      loadDashboardData();
    }
  }, [user, actor]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // First check if user exists in backend
      const userCheck = await actor.get_user(user.principal);
      if ('Err' in userCheck) {
        // User not registered in backend, show registration modal
        setShowRegistration(true);
        setIsLoading(false);
        return;
      }

      const balance = await actor.get_user_balance(user.principal);

      let enrollments = [];
      if (user.role.Learner) {
        enrollments = await actor.get_enrollments(user.principal);
      }

      let createdCourses = [];
      if (user.role.Educator) {
        createdCourses = await actor.get_courses_by_educator(user.principal);
      }

      setDashboardData({
        balance: Number(balance),
        enrollments,
        createdCourses,
        recentActivity: []
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // If there's an error, it might be because user is not registered
      setShowRegistration(true);
    } finally {
      setIsLoading(false);
    }
  }; if (loading || isLoading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <motion.div
            className="text-lg text-gray-600"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading dashboard...
          </motion.div>
        </div>
      </Layout>
    );
  }

  const stats = [
    {
      title: 'Token Balance',
      value: formatTokens(dashboardData.balance),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: user?.role?.Learner ? 'Enrolled Courses' : 'Created Courses',
      value: user?.role?.Learner ? dashboardData.enrollments.length : dashboardData.createdCourses.length,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Reputation Score',
      value: user?.reputation_score || 0,
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Completed Courses',
      value: user?.completed_courses?.length || 0,
      icon: CheckCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <Layout title="Dashboard">
      {/* Registration Modal */}
      <RegistrationModal
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
        onSuccess={() => {
          setShowRegistration(false);
          // Reload dashboard data after successful registration
          if (user && actor) {
            loadDashboardData();
          }
        }}
      />

      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.username}! 👋
              </h1>
              <p className="text-primary-100 text-lg">
                {user?.role?.Learner && "Ready to continue your learning journey?"}
                {user?.role?.Educator && "Ready to share your knowledge?"}
                {user?.role?.PendingEducator && "Your educator application is being reviewed."}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -2, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Course Progress/Management */}
          <div className="lg:col-span-2 space-y-6">
            {user?.role?.Learner && (
              <motion.div
                className="bg-white rounded-xl shadow-sm border border-gray-100"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
                    <button
                      onClick={() => navigate('/courses')}
                      className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
                    >
                      Browse All <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {dashboardData.enrollments.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.enrollments.slice(0, 3).map((enrollment) => (
                        <motion.div
                          key={enrollment.course_id}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => navigate(`/course/${enrollment.course_id}`)}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">Course #{enrollment.course_id}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${enrollment.completed
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                              }`}>
                              {enrollment.completed ? 'Completed' : 'In Progress'}
                            </span>
                          </div>

                          <div className="mb-3">
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                              <span>Progress</span>
                              <span>{enrollment.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(enrollment.progress)}`}
                                style={{ width: `${enrollment.progress}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>Enrolled: {formatDate(enrollment.enrolled_at)}</span>
                            {!enrollment.completed && (
                              <button className="text-primary-600 hover:text-primary-700 flex items-center">
                                <Play className="w-4 h-4 mr-1" />
                                Continue
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                      <p className="text-gray-600 mb-4">Start your learning journey today!</p>
                      <button
                        onClick={() => navigate('/courses')}
                        className="btn-primary"
                      >
                        Browse Courses
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {user?.role?.Educator && (
              <motion.div
                className="bg-white rounded-xl shadow-sm border border-gray-100"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
                    <button
                      onClick={() => navigate('/create-course')}
                      className="btn-primary"
                    >
                      Create Course
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {dashboardData.createdCourses.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.createdCourses.slice(0, 3).map((course) => (
                        <motion.div
                          key={course.id}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => navigate(`/course/${course.id}`)}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900">{course.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{course.category}</p>
                            </div>
                            <span className="text-sm font-medium text-primary-600">
                              {formatTokens(course.price)} tokens
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{course.enrolled_count} students</span>
                            <span>Created: {formatDate(course.created_at)}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No courses created</h3>
                      <p className="text-gray-600 mb-4">Start sharing your knowledge!</p>
                      <button
                        onClick={() => navigate('/create-course')}
                        className="btn-primary"
                      >
                        Create Your First Course
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {user?.role?.PendingEducator && (
              <motion.div
                className="bg-yellow-50 border border-yellow-200 rounded-xl p-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-yellow-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-800">Educator Application Pending</h3>
                    <p className="text-yellow-700 mt-1">
                      Your educator application is being reviewed by our admins. You'll be notified once approved.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Quick Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              className="bg-white rounded-xl shadow-sm border border-gray-100"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
              </div>

              <div className="p-6 space-y-4">
                <button
                  onClick={() => navigate('/courses')}
                  className="w-full flex items-center p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <BookOpen className="w-6 h-6 text-primary-600 mr-3" />
                  <span className="font-medium text-gray-900">Browse Courses</span>
                </button>

                <button
                  onClick={() => navigate('/wallet')}
                  className="w-full flex items-center p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <TrendingUp className="w-6 h-6 text-green-600 mr-3" />
                  <span className="font-medium text-gray-900">View Wallet</span>
                </button>

                {user?.role?.Educator && (
                  <button
                    onClick={() => navigate('/create-course')}
                    className="w-full flex items-center p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Users className="w-6 h-6 text-secondary-600 mr-3" />
                    <span className="font-medium text-gray-900">Create Course</span>
                  </button>
                )}
              </div>
            </motion.div>

            {/* Achievement Badge */}
            <motion.div
              className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-center mb-4">
                <Award className="w-8 h-8 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold">Level {Math.floor((user?.reputation_score || 0) / 10) + 1}</h3>
                  <p className="text-purple-100">Keep learning to level up!</p>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Progress to next level</span>
                  <span>{(user?.reputation_score || 0) % 10}/10</span>
                </div>
                <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((user?.reputation_score || 0) % 10) * 10}%` }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
