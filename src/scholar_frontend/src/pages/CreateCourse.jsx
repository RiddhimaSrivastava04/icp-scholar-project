import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import {
  BookOpen,
  DollarSign,
  FileText,
  Tag,
  Plus,
  X,
  Save,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { categories } from '../utils/helpers';
import toast from 'react-hot-toast';

const CreateCourse = () => {
  const { user, actor, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    difficulty: 'Beginner',
    estimated_duration: '',
    requirements: [''],
    learning_outcomes: [''],
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    // Only registered users can access this page
    // Note: Each Internet Identity can only create one user account
    if (!user || (!user.role.Educator && !user.role.PendingEducator)) {
      navigate('/dashboard');
      toast.error('You need to be an approved educator to create courses');
      return;
    }

    if (user.role.PendingEducator) {
      toast.error('Your educator application is still pending approval');
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (field, value) => {
    setCourseData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setCourseData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setCourseData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setCourseData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!courseData.title.trim()) errors.push('Title is required');
    if (!courseData.description.trim()) errors.push('Description is required');
    if (!courseData.category) errors.push('Category is required');
    if (!courseData.price || courseData.price < 0) errors.push('Valid price is required');
    if (!courseData.estimated_duration.trim()) errors.push('Estimated duration is required');

    const validRequirements = courseData.requirements.filter(req => req.trim());
    if (validRequirements.length === 0) errors.push('At least one requirement is needed');

    const validOutcomes = courseData.learning_outcomes.filter(outcome => outcome.trim());
    if (validOutcomes.length === 0) errors.push('At least one learning outcome is needed');

    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setIsLoading(true);

    try {
      // Filter out empty strings from arrays
      const cleanedData = {
        ...courseData,
        price: Number(courseData.price),
        requirements: courseData.requirements.filter(req => req.trim()),
        learning_outcomes: courseData.learning_outcomes.filter(outcome => outcome.trim()),
      };

      const result = await actor.create_course(
        cleanedData.title,
        cleanedData.description,
        cleanedData.category,
        cleanedData.price,
        cleanedData.difficulty,
        cleanedData.estimated_duration,
        cleanedData.requirements,
        cleanedData.learning_outcomes
      );

      if ('Ok' in result) {
        toast.success('Course created successfully!');
        navigate(`/course/${result.Ok}`);
      } else {
        throw new Error(Object.keys(result.Err)[0]);
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error(`Failed to create course: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem('courseDraft', JSON.stringify(courseData));
    toast.success('Draft saved locally');
  };

  const loadDraft = () => {
    const draft = localStorage.getItem('courseDraft');
    if (draft) {
      setCourseData(JSON.parse(draft));
      toast.success('Draft loaded');
    }
  };

  if (!user || !user.role.Educator) {
    return (
      <Layout title="Create Course">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-4">
            You need to be an approved educator to create courses.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Create Course">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
            <p className="text-gray-600 mt-1">Share your knowledge and earn tokens</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadDraft}
              className="btn-secondary"
            >
              Load Draft
            </button>
            <button
              onClick={handleSaveDraft}
              className="btn-secondary flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </button>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="btn-secondary flex items-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              {previewMode ? 'Edit' : 'Preview'}
            </button>
          </div>
        </div>

        {previewMode ? (
          /* Preview Mode */
          <motion.div
            className="bg-white rounded-xl p-8 shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
                {courseData.category || 'Category'}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {courseData.title || 'Course Title'}
              </h1>
              <p className="text-gray-600 text-lg">
                {courseData.description || 'Course description...'}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Price</p>
                <p className="text-xl font-bold text-gray-900">
                  {courseData.price || '0'} tokens
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Tag className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Level</p>
                <p className="text-xl font-bold text-gray-900">{courseData.difficulty}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-xl font-bold text-gray-900">
                  {courseData.estimated_duration || 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h3>
                <ul className="space-y-2">
                  {courseData.requirements.filter(req => req.trim()).map((req, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Learning Outcomes</h3>
                <ul className="space-y-2">
                  {courseData.learning_outcomes.filter(outcome => outcome.trim()).map((outcome, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Edit Mode */
          <div className="space-y-6">
            {/* Basic Information */}
            <motion.div
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
                Basic Information
              </h2>

              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={courseData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="input-field"
                    placeholder="Enter course title"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={courseData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="input-field"
                    rows={4}
                    placeholder="Describe what students will learn in this course"
                    maxLength={1000}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={courseData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={courseData.difficulty}
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                      className="input-field"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (tokens) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={courseData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      className="input-field"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Duration *
                  </label>
                  <input
                    type="text"
                    value={courseData.estimated_duration}
                    onChange={(e) => handleInputChange('estimated_duration', e.target.value)}
                    className="input-field"
                    placeholder="e.g., 4 weeks, 20 hours, etc."
                  />
                </div>
              </div>
            </motion.div>

            {/* Requirements */}
            <motion.div
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Prerequisites & Requirements
              </h2>

              <div className="space-y-3">
                {courseData.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={requirement}
                      onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                      className="input-field flex-1"
                      placeholder="Enter a requirement"
                    />
                    {courseData.requirements.length > 1 && (
                      <button
                        onClick={() => removeArrayItem('requirements', index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('requirements')}
                  className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Requirement
                </button>
              </div>
            </motion.div>

            {/* Learning Outcomes */}
            <motion.div
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Learning Outcomes
              </h2>

              <div className="space-y-3">
                {courseData.learning_outcomes.map((outcome, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={outcome}
                      onChange={(e) => handleArrayChange('learning_outcomes', index, e.target.value)}
                      className="input-field flex-1"
                      placeholder="What will students learn?"
                    />
                    {courseData.learning_outcomes.length > 1 && (
                      <button
                        onClick={() => removeArrayItem('learning_outcomes', index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('learning_outcomes')}
                  className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Learning Outcome
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Submit Button */}
        <motion.div
          className="flex justify-center pt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="btn-primary px-8 py-3 text-lg disabled:opacity-50"
          >
            {isLoading ? 'Creating Course...' : 'Create Course'}
          </button>
        </motion.div>
      </div>
    </Layout>
  );
};

export default CreateCourse;
