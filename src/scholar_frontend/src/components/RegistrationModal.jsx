import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { X, User, GraduationCap, Loader, MapPin, Globe, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

const RegistrationModal = ({ isOpen, onClose, onSuccess }) => {
  const { registerUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    role: '',
    bio: '',
    location: '',
    website: '',
    interests: [],
    avatar_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [newInterest, setNewInterest] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    if (!formData.role) {
      toast.error('Please select a role');
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser(formData.username.trim(), formData.role);

      if (result.success) {
        // Update profile with additional fields if any are provided
        const hasAdditionalData = formData.bio.trim() || formData.location.trim() ||
          formData.website.trim() || formData.interests.length > 0 ||
          formData.avatar_url.trim();

        if (hasAdditionalData) {
          try {
            // Import the backend actor
            const { scholar_backend } = await import('../../../declarations/scholar_backend');

            const profileUpdate = {
              bio: formData.bio.trim() ? [formData.bio.trim()] : [],
              location: formData.location.trim() ? [formData.location.trim()] : [],
              website: formData.website.trim() ? [formData.website.trim()] : [],
              interests: formData.interests,
              avatar_url: formData.avatar_url.trim() ? [formData.avatar_url.trim()] : [],
            };

            await scholar_backend.update_user_profile(profileUpdate);
          } catch (profileError) {
            console.error('Profile update error:', profileError);
            // Don't fail registration if profile update fails
            toast.error('Registration successful, but profile update failed. You can update it later.');
          }
        }

        toast.success('Registration successful!');
        onClose();
        if (onSuccess) onSuccess();
      } else {
        // Handle specific error cases
        if (result.error.includes('already registered') || result.error.includes('already exists')) {
          toast.error(result.error);
          // Close modal since user is already registered
          onClose();
          if (onSuccess) onSuccess();
        } else {
          toast.error(result.error || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const addInterest = () => {
    const interest = newInterest.trim();
    if (interest && !formData.interests.includes(interest)) {
      setFormData({
        ...formData,
        interests: [...formData.interests, interest]
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interestToRemove) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(interest => interest !== interestToRemove)
    });
  };

  const handleInterestKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addInterest();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Important Notice */}
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <User className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>One Account Per Identity:</strong> Each Internet Identity can only create one Scholar account.
                Choose your username and role carefully as they cannot be changed later.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose a Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="input-field"
              placeholder="Enter your username"
              disabled={loading}
              maxLength={50}
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Your Role
            </label>
            <div className="grid grid-cols-1 gap-3">
              {/* Learner Role */}
              <motion.div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${formData.role === 'Learner'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300'
                  }`}
                onClick={() => handleRoleSelect('Learner')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.role === 'Learner' ? 'bg-primary-500' : 'bg-gray-100'
                    }`}>
                    <User className={`w-5 h-5 ${formData.role === 'Learner' ? 'text-white' : 'text-gray-500'
                      }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Learner</h3>
                    <p className="text-sm text-gray-600">
                      Take courses, earn tokens, and participate in discussions
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Educator Role */}
              <motion.div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${formData.role === 'Educator'
                  ? 'border-secondary-500 bg-secondary-50'
                  : 'border-gray-200 hover:border-secondary-300'
                  }`}
                onClick={() => handleRoleSelect('Educator')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.role === 'Educator' ? 'bg-secondary-500' : 'bg-gray-100'
                    }`}>
                    <GraduationCap className={`w-5 h-5 ${formData.role === 'Educator' ? 'text-white' : 'text-gray-500'
                      }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Educator</h3>
                    <p className="text-sm text-gray-600">
                      Create courses, earn tokens from enrollments
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {formData.role === 'Educator' && (
              <p className="text-sm text-yellow-600 mt-2 p-3 bg-yellow-50 rounded-lg">
                📝 Note: Educator accounts require admin approval before you can create courses.
              </p>
            )}
          </div>

          {/* Additional Profile Fields */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Complete Your Profile (Optional)
            </h3>

            {/* Bio */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 mr-2" />
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="input-field resize-none"
                placeholder="Tell us about yourself..."
                disabled={loading}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.bio.length}/500 characters
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 mr-2" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input-field"
                placeholder="e.g., San Francisco, CA"
                disabled={loading}
                maxLength={100}
              />
            </div>

            {/* Website */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 mr-2" />
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="input-field"
                placeholder="https://your-website.com"
                disabled={loading}
                maxLength={200}
              />
            </div>

            {/* Avatar URL */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 mr-2" />
                Avatar URL
              </label>
              <input
                type="url"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                className="input-field"
                placeholder="https://your-avatar-image.com/image.jpg"
                disabled={loading}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                URL to your profile picture (JPG, PNG, GIF)
              </p>
            </div>

            {/* Interests */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 mr-2" />
                Interests
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={handleInterestKeyPress}
                    className="input-field flex-1"
                    placeholder="Add an interest..."
                    disabled={loading}
                    maxLength={50}
                  />
                  <button
                    type="button"
                    onClick={addInterest}
                    disabled={loading || !newInterest.trim() || formData.interests.length >= 10}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add
                  </button>
                </div>

                {formData.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          disabled={loading}
                          className="ml-2 hover:text-primary-600 disabled:cursor-not-allowed"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  Add up to 10 interests (press Enter to add)
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading || !formData.username.trim() || !formData.role}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Creating Profile...
              </>
            ) : (
              'Complete Registration'
            )}
          </motion.button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            By registering, you agree to our terms of service and privacy policy.
            Your data is securely stored on the Internet Computer blockchain.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RegistrationModal;
