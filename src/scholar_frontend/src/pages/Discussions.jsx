import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FireIcon,
  ClockIcon,
  UserIcon,
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  EyeIcon,
  TagIcon,
  FunnelIcon,
  PaperAirplaneIcon,
  BookOpenIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import Layout from '../components/Layout';
import { AuthContext } from '../contexts/AuthContext';
import { scholar_backend } from '../../../declarations/scholar_backend';

const Discussions = () => {
  const { principal, user } = useContext(AuthContext);
  const [discussions, setDiscussions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    course_id: '',
    tags: []
  });
  const [creating, setCreating] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [newReply, setNewReply] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load discussions
      const allDiscussions = await scholar_backend.get_discussions();
      setDiscussions(allDiscussions);

      // Load available courses
      const allCourses = await scholar_backend.get_courses();
      setCourses(allCourses);

    } catch (err) {
      setError('Failed to load discussions');
      console.error('Discussions loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async () => {
    if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setCreating(true);
      setError('');

      const discussionData = {
        title: newDiscussion.title,
        content: newDiscussion.content,
        course_id: newDiscussion.course_id || null,
        tags: newDiscussion.tags
      };

      await scholar_backend.create_discussion(discussionData);

      // Reset form and reload
      setNewDiscussion({ title: '', content: '', course_id: '', tags: [] });
      setShowCreateModal(false);
      await loadData();

    } catch (err) {
      setError('Failed to create discussion');
      console.error('Discussion creation error:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleReply = async (discussionId) => {
    if (!newReply.trim()) return;

    try {
      setReplying(true);
      setError('');

      await scholar_backend.add_discussion_reply(discussionId, newReply);

      setNewReply('');
      await loadData();

      // Refresh selected discussion if viewing details
      if (selectedDiscussion && selectedDiscussion.id === discussionId) {
        const updated = await scholar_backend.get_discussion_details(discussionId);
        setSelectedDiscussion(updated);
      }

    } catch (err) {
      setError('Failed to add reply');
      console.error('Reply error:', err);
    } finally {
      setReplying(false);
    }
  };

  const handleLikeDiscussion = async (discussionId) => {
    try {
      await scholar_backend.like_discussion(discussionId);
      await loadData();
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleViewDiscussion = async (discussion) => {
    try {
      const details = await scholar_backend.get_discussion_details(discussion.id);
      setSelectedDiscussion(details);
    } catch (err) {
      console.error('Discussion details error:', err);
    }
  };

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || discussion.course_id === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const sortedDiscussions = [...filteredDiscussions].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'popular':
        return (b.likes || 0) - (a.likes || 0);
      case 'replies':
        return (b.reply_count || 0) - (a.reply_count || 0);
      default:
        return 0;
    }
  });

  const formatDate = (timestamp) => {
    return new Date(Number(timestamp) / 1000000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCourseTitle = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : 'General Discussion';
  };

  if (loading) {
    return (
      <Layout title="Discussions">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (selectedDiscussion) {
    return (
      <Layout title="Discussion Details">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedDiscussion(null)}
            className="mb-6 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Back to Discussions
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
          >
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedDiscussion.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <UserIcon className="w-4 h-4" />
                      <span>{selectedDiscussion.author_name || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>{formatDate(selectedDiscussion.created_at)}</span>
                    </div>
                    {selectedDiscussion.course_id && (
                      <div className="flex items-center space-x-1">
                        <BookOpenIcon className="w-4 h-4" />
                        <span>{getCourseTitle(selectedDiscussion.course_id)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLikeDiscussion(selectedDiscussion.id)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-red-500"
                  >
                    <HeartIcon className="w-5 h-5" />
                    <span>{selectedDiscussion.likes || 0}</span>
                  </button>
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedDiscussion.content}</p>
              </div>

              {selectedDiscussion.tags && selectedDiscussion.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedDiscussion.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Replies */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Replies ({selectedDiscussion.replies?.length || 0})
              </h3>

              <div className="space-y-4 mb-6">
                {selectedDiscussion.replies?.map((reply, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <UserIcon className="w-4 h-4" />
                        <span>{reply.author_name || 'Anonymous'}</span>
                        <span>•</span>
                        <span>{formatDate(reply.created_at)}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                  </div>
                ))}
              </div>

              {/* Add Reply */}
              {principal && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        placeholder="Add your reply..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        rows="3"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => handleReply(selectedDiscussion.id)}
                          disabled={replying || !newReply.trim()}
                          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                          <PaperAirplaneIcon className="w-4 h-4" />
                          <span>{replying ? 'Posting...' : 'Reply'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Discussions">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discussions</h1>
            <p className="text-gray-600 mt-2">Connect with learners and educators</p>
          </div>
          {principal && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Discussion</span>
            </button>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search discussions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="replies">Most Replies</option>
            </select>
          </div>
        </motion.div>

        {/* Discussions List */}
        <div className="space-y-4">
          {sortedDiscussions.map((discussion, index) => (
            <motion.div
              key={discussion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewDiscussion(discussion)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {discussion.course_id && (
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                        {getCourseTitle(discussion.course_id)}
                      </span>
                    )}
                    {discussion.is_pinned && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                        Pinned
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-indigo-600">
                    {discussion.title}
                  </h3>

                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {discussion.content}
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <UserIcon className="w-4 h-4" />
                      <span>{discussion.author_name || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>{formatDate(discussion.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ChatBubbleOvalLeftIcon className="w-4 h-4" />
                      <span>{discussion.reply_count || 0} replies</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <EyeIcon className="w-4 h-4" />
                      <span>{discussion.view_count || 0} views</span>
                    </div>
                  </div>

                  {discussion.tags && discussion.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {discussion.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                      {discussion.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{discussion.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLikeDiscussion(discussion.id);
                    }}
                    className="flex items-center space-x-1 text-gray-500 hover:text-red-500 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <HeartIcon className="w-5 h-5" />
                    <span>{discussion.likes || 0}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {sortedDiscussions.length === 0 && (
            <div className="text-center py-12">
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No discussions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedCourse !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Be the first to start a discussion!'
                }
              </p>
            </div>
          )}
        </div>

        {/* Create Discussion Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Discussion</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newDiscussion.title}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                    placeholder="What would you like to discuss?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course (Optional)
                  </label>
                  <select
                    value={newDiscussion.course_id}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, course_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">General Discussion</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={newDiscussion.content}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                    placeholder="Share your thoughts, questions, or insights..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newDiscussion.tags.join(', ')}
                    onChange={(e) => setNewDiscussion({
                      ...newDiscussion,
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    })}
                    placeholder="blockchain, tutorial, beginner"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleCreateDiscussion}
                    disabled={creating}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create Discussion'}
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
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

export default Discussions;
