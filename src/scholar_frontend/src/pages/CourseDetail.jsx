import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import {
  BookOpen,
  Users,
  Clock,
  DollarSign,
  Star,
  Play,
  CheckCircle,
  MessageSquare,
  ArrowLeft,
  ExternalLink,
  Award,
} from 'lucide-react';
import { formatTokens, formatDate, getCategoryIcon, getProgressColor, handleError } from '../utils/helpers';
import toast from 'react-hot-toast';

const CourseDetail = () => {
  const { id } = useParams();
  const { user, actor } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    loadCourseData();
  }, [id, actor]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      if (!actor || !id) return;

      // Load course details
      const courseResult = await actor.get_course(BigInt(id));
      if ('Ok' in courseResult) {
        setCourse(courseResult.Ok);
      } else {
        throw new Error('Course not found');
      }

      // Load user balance
      if (user) {
        const userBalance = await actor.get_user_balance(user.principal);
        setBalance(Number(userBalance));

        // Check if user is enrolled
        if (user.role.Learner) {
          const enrollments = await actor.get_enrollments(user.principal);
          const courseEnrollment = enrollments.find(e => Number(e.course_id) === Number(id));
          setEnrollment(courseEnrollment || null);
        }
      }
    } catch (error) {
      console.error('Error loading course:', error);
      toast.error('Failed to load course details');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);

      if (!user?.role?.Learner) {
        toast.error('Only learners can enroll in courses');
        return;
      }

      if (balance < Number(course.price)) {
        toast.error('Insufficient tokens to enroll');
        return;
      }

      const result = await actor.enroll_in_course(BigInt(id));
      if ('Ok' in result) {
        setEnrollment(result.Ok);
        setBalance(prev => prev - Number(course.price));
        toast.success('Successfully enrolled in course!');
        loadCourseData(); // Refresh data
      } else {
        throw new Error(handleError(result.Err));
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error(handleError(error));
    } finally {
      setEnrolling(false);
    }
  };

  const updateProgress = async (newProgress) => {
    try {
      const result = await actor.update_progress(BigInt(id), newProgress);
      if ('Ok' in result) {
        setEnrollment(prev => ({ ...prev, progress: newProgress, completed: newProgress >= 100 }));
        toast.success('Progress updated!');
        if (newProgress >= 100) {
          toast.success('🎉 Course completed! You earned bonus tokens!');
        }
      } else {
        throw new Error(handleError(result.Err));
      }
    } catch (error) {
      console.error('Progress update error:', error);
      toast.error(handleError(error));
    }
  };

  if (loading) {
    return (
      <Layout title="Course Details">
        <div className="flex items-center justify-center h-64">
          <motion.div
            className="text-lg text-gray-600"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading course details...
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout title="Course Not Found">
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Course not found</h3>
          <p className="text-gray-600 mb-6">
            The course you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/courses')}
            className="btn-primary"
          >
            Browse Courses
          </button>
        </div>
      </Layout>
    );
  }

  const isEnrolled = !!enrollment;
  const canEnroll = user?.role?.Learner && !isEnrolled;
  const isEducator = user && course.educator.toString() === user.principal.toString();

  return (
    <Layout title={course.title}>
      <div className="space-y-6">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate('/courses')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Courses
        </motion.button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Header */}
            <motion.div
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Course Image */}
              <div className="h-64 bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                <div className="text-8xl">
                  {getCategoryIcon(course.category)}
                </div>
              </div>

              <div className="p-8">
                {/* Category and Stats */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 text-sm font-medium bg-primary-100 text-primary-800 rounded-full">
                    {course.category}
                  </span>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {course.enrolled_count} students
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(course.created_at)}
                    </div>
                  </div>
                </div>

                {/* Title and Description */}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
                <p className="text-lg text-gray-600 leading-relaxed">{course.description}</p>

                {/* Progress Bar for Enrolled Users */}
                {isEnrolled && (
                  <motion.div
                    className="mt-6 p-4 bg-gray-50 rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Your Progress</span>
                      <span className="text-sm text-gray-600">{enrollment.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(enrollment.progress)}`}
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>

                    {!enrollment.completed && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateProgress(25)}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                          disabled={enrollment.progress >= 25}
                        >
                          25%
                        </button>
                        <button
                          onClick={() => updateProgress(50)}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                          disabled={enrollment.progress >= 50}
                        >
                          50%
                        </button>
                        <button
                          onClick={() => updateProgress(75)}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                          disabled={enrollment.progress >= 75}
                        >
                          75%
                        </button>
                        <button
                          onClick={() => updateProgress(100)}
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                          disabled={enrollment.progress >= 100}
                        >
                          Complete
                        </button>
                      </div>
                    )}

                    {enrollment.completed && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="font-medium">Course Completed!</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Course Content */}
            <motion.div
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>

              {isEnrolled ? (
                <div className="space-y-4">
                  <p className="text-gray-600 mb-4">
                    Access your course materials and content through the link below:
                  </p>
                  <a
                    href={course.content_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Access Course Content
                  </a>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Enroll to Access Content
                  </h3>
                  <p className="text-gray-600">
                    Course materials and content are available after enrollment.
                  </p>
                </div>
              )}
            </motion.div>

            {/* Discussion Section */}
            <motion.div
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Discussions</h2>
                {(isEnrolled || isEducator) && (
                  <button
                    onClick={() => navigate(`/discussions/${course.id}`)}
                    className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Join Discussion
                  </button>
                )}
              </div>

              {isEnrolled || isEducator ? (
                <p className="text-gray-600">
                  Participate in course discussions, ask questions, and help other students.
                  Earn tokens for helpful contributions!
                </p>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Join the Discussion
                  </h3>
                  <p className="text-gray-600">
                    Enroll in the course to participate in discussions and Q&A.
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <motion.div
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatTokens(course.price)} tokens
                </div>
                <p className="text-gray-600">Course Price</p>
              </div>

              {canEnroll && (
                <>
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Your Balance:</span>
                      <span className={`font-medium ${balance >= Number(course.price) ? 'text-green-600' : 'text-red-600'}`}>
                        {formatTokens(balance)} tokens
                      </span>
                    </div>
                  </div>

                  <motion.button
                    onClick={handleEnroll}
                    disabled={enrolling || balance < Number(course.price)}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: enrolling ? 1 : 1.02 }}
                    whileTap={{ scale: enrolling ? 1 : 0.98 }}
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </motion.button>

                  {balance < Number(course.price) && (
                    <p className="text-sm text-red-600 mt-2 text-center">
                      Insufficient tokens. You need {formatTokens(Number(course.price) - balance)} more tokens.
                    </p>
                  )}
                </>
              )}

              {isEnrolled && (
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Enrolled</h3>
                  <p className="text-gray-600 text-sm">
                    You have access to all course materials
                  </p>
                </div>
              )}

              {isEducator && (
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                    <Award className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Course</h3>
                  <p className="text-gray-600 text-sm">
                    You are the instructor of this course
                  </p>
                </div>
              )}

              {!user && (
                <button
                  onClick={() => navigate('/')}
                  className="w-full btn-primary"
                >
                  Login to Enroll
                </button>
              )}

              {user && !user.role.Learner && !isEducator && (
                <div className="text-center">
                  <p className="text-gray-600 text-sm">
                    Only learners can enroll in courses
                  </p>
                </div>
              )}
            </motion.div>

            {/* Course Stats */}
            <motion.div
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Students Enrolled</span>
                  <span className="font-medium text-gray-900">{course.enrolled_count}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium text-gray-900">{formatDate(course.created_at)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium text-gray-900">{course.category}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Course ID</span>
                  <span className="font-medium text-gray-900">#{course.id}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CourseDetail;
