import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  AcademicCapIcon,
  TrophyIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PhotoIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  MapPinIcon,
  GlobeAltIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import { AuthContext } from '../contexts/AuthContext';
import { scholar_backend } from '../../../declarations/scholar_backend';

const Profile = () => {
  const { principal, user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [createdCourses, setCreatedCourses] = useState([]);
  const [reputationHistory, setReputationHistory] = useState([]);

  useEffect(() => {
    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    if (!user?.principal) return;

    try {
      setLoading(true);
      setError('');

      // Load user profile
      const profile = await scholar_backend.get_user_profile(user.principal);
      if (profile && !('Err' in profile)) {
        const userData = 'Ok' in profile ? profile.Ok : profile;
        setProfileData(userData);
        setEditData({
          bio: userData.bio || '',
          location: userData.location || '',
          website: userData.website || '',
          interests: userData.interests || []
        });
      } else if ('Err' in profile) {
        if (profile.Err.UserNotFound !== undefined) {
          setError('User not found. Please complete registration to access your profile.');
          return;
        } else {
          setError('Failed to load profile data.');
          return;
        }
      }

      // Load enrolled courses
      const enrolled = await scholar_backend.get_user_courses(user.principal);
      setEnrolledCourses(enrolled);

      // Load created courses (if educator)
      if (user?.role && (user.role.Educator || user.role.PendingEducator)) {
        const created = await scholar_backend.get_courses_by_creator(user.principal);
        setCreatedCourses(created);
      }

      // Load reputation history
      const reputation = await scholar_backend.get_user_reputation_history(user.principal);
      setReputationHistory(reputation.map(([action, points, timestamp]) => ({
        action,
        points,
        timestamp
      })));

    } catch (err) {
      setError('Failed to load profile data');
      console.error('Profile loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError('');

      if (!user?.principal) {
        setError('User not authenticated');
        return;
      }

      // First check if user exists in backend, if not, show registration needed message
      try {
        const userCheck = await scholar_backend.get_user(user.principal);
        if ('Err' in userCheck) {
          setError('User not found in system. Please complete registration first.');
          return;
        }
      } catch (checkErr) {
        setError('Unable to verify user registration. Please try logging out and back in.');
        return;
      }

      const profileData = {
        bio: editData.bio && editData.bio.trim() ? [editData.bio.trim()] : [],
        location: editData.location && editData.location.trim() ? [editData.location.trim()] : [],
        website: editData.website && editData.website.trim() ? [editData.website.trim()] : [],
        interests: editData.interests || [],
        avatar_url: []
      };

      console.log('Sending profile data:', profileData);
      const result = await scholar_backend.update_user_profile(profileData);
      console.log('Profile update result:', result);

      if ('Ok' in result) {
        await loadProfileData();
        setIsEditing(false);
      } else if ('Err' in result) {
        console.error('Backend error:', result.Err);
        if (result.Err.UserNotFound !== undefined) {
          setError('User not found in system. Please complete registration first.');
        } else {
          setError(`Failed to update profile: ${JSON.stringify(result.Err)}`);
        }
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      setError(`Failed to update profile: ${err.message}`);
      console.error('Profile update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profileData) {
      setEditData({
        bio: profileData.bio || '',
        location: profileData.location || '',
        website: profileData.website || '',
        interests: profileData.interests || []
      });
    }
    setIsEditing(false);
  };

  const formatDate = (timestamp) => {
    return new Date(Number(timestamp) / 1000000).toLocaleDateString();
  };

  const getReputationLevel = (reputation) => {
    if (reputation >= 1000) return { level: 'Expert', color: 'text-purple-600' };
    if (reputation >= 500) return { level: 'Advanced', color: 'text-blue-600' };
    if (reputation >= 100) return { level: 'Intermediate', color: 'text-green-600' };
    return { level: 'Beginner', color: 'text-gray-600' };
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: UserIcon },
    { id: 'courses', name: 'Courses', icon: BookOpenIcon },
    { id: 'reputation', name: 'Reputation', icon: TrophyIcon }
  ];

  if (loading) {
    return (
      <Layout title="Profile">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (!profileData) {
    return (
      <Layout title="Profile">
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Complete Your Registration</h3>
          <p className="mt-2 text-sm text-gray-500">
            You're authenticated but need to complete your registration to access your profile.
          </p>
          {error && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
              <p className="text-yellow-800 text-sm">{error}</p>
            </div>
          )}
          <div className="mt-6">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Complete Registration
            </button>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">
              You'll be prompted to choose a username and role (Learner or Educator)
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const reputationLevel = getReputationLevel(profileData.reputation_score);

  return (
    <Layout title="Profile">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-white" />
                </div>
                <button className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50">
                  <PhotoIcon className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{profileData.username}</h1>
                      <p className="text-sm text-gray-500">Username cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        value={editData.bio}
                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        rows="3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={editData.location}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                        placeholder="Your location"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                      <input
                        type="url"
                        value={editData.website}
                        onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                        placeholder="https://your-website.com"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
                      <input
                        type="text"
                        value={editData.interests ? editData.interests.join(', ') : ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          interests: e.target.value.split(',').map(item => item.trim()).filter(item => item.length > 0)
                        })}
                        placeholder="Enter interests separated by commas"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Separate interests with commas (e.g., Programming, Design, Music)</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{profileData.username}</h1>
                    <p className="text-gray-600 mt-1">{profileData.bio || 'No bio provided'}</p>
                  </div>
                )}

                <div className="flex items-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2">
                    <TrophyIcon className="w-5 h-5 text-yellow-500" />
                    <span className={`font-medium ${reputationLevel.color}`}>
                      {reputationLevel.level}
                    </span>
                    <span className="text-gray-500">({profileData.reputation_score} pts)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">
                      Joined {formatDate(profileData.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <CheckIcon className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </motion.div>

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPinIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">{profileData.location || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <GlobeAltIcon className="w-5 h-5 text-gray-400" />
                      {profileData.website ? (
                        <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700">
                          {profileData.website}
                        </a>
                      ) : (
                        <span className="text-gray-600">No website provided</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.interests && profileData.interests.length > 0 ? (
                      profileData.interests.map((interest, index) => (
                        <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                          {interest}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No interests specified</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Courses Enrolled</span>
                      <span className="font-semibold">{enrolledCourses.length}</span>
                    </div>
                    {user?.role === 'educator' && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Courses Created</span>
                        <span className="font-semibold">{createdCourses.length}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reputation Points</span>
                      <span className="font-semibold">{profileData.reputation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Member Since</span>
                      <span className="font-semibold">{formatDate(profileData.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrolled Courses</h3>
                {enrolledCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enrolledCourses.map((course) => (
                      <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h4 className="font-medium text-gray-900">{course.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-500">Progress: {course.progress || 0}%</span>
                          <span className="text-xs text-indigo-600 font-medium">{course.price} ST</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No enrolled courses yet.</p>
                )}
              </div>

              {user?.role === 'educator' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Created Courses</h3>
                  {createdCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {createdCourses.map((course) => (
                        <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <h4 className="font-medium text-gray-900">{course.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-gray-500">{course.enrolled_students || 0} students</span>
                            <span className="text-xs text-indigo-600 font-medium">{course.price} ST</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No courses created yet.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reputation' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reputation History</h3>
              {reputationHistory.length > 0 ? (
                <div className="space-y-4">
                  {reputationHistory.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{entry.action}</p>
                        <p className="text-sm text-gray-600">{formatDate(entry.timestamp)}</p>
                      </div>
                      <span className={`font-bold ${entry.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {entry.points > 0 ? '+' : ''}{entry.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No reputation history available.</p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Profile;
