import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import {
  Search,
  Filter,
  BookOpen,
  Users,
  Star,
  Clock,
  DollarSign,
  ChevronDown,
  Grid,
  List,
} from 'lucide-react';
import { formatTokens, formatDate, categories, getCategoryIcon } from '../utils/helpers';
import toast from 'react-hot-toast';

const CourseCatalog = () => {
  const { actor, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    priceRange: { min: 0, max: 10000 },
    sortBy: 'newest',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    loadCourses();
  }, [isAuthenticated, navigate, actor]);

  useEffect(() => {
    applyFilters();
  }, [courses, filters]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      if (actor) {
        const coursesData = await actor.get_courses();
        setCourses(coursesData);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...courses];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        course.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        course.category.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(course => course.category === filters.category);
    }

    // Price range filter
    filtered = filtered.filter(course =>
      Number(course.price) >= filters.priceRange.min &&
      Number(course.price) <= filters.priceRange.max
    );

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => Number(b.created_at) - Number(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => Number(a.created_at) - Number(b.created_at));
        break;
      case 'price-low':
        filtered.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'popular':
        filtered.sort((a, b) => b.enrolled_count - a.enrolled_count);
        break;
      default:
        break;
    }

    setFilteredCourses(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      priceRange: { min: 0, max: 10000 },
      sortBy: 'newest',
    });
  };

  const CourseCard = ({ course, isListView = false }) => (
    <motion.div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer ${isListView ? 'flex' : ''
        }`}
      onClick={() => navigate(`/course/${course.id}`)}
      whileHover={{ y: isListView ? 0 : -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Course Image/Icon */}
      <div className={`${isListView ? 'w-48 flex-shrink-0' : 'h-48'} bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center`}>
        <div className="text-6xl">
          {getCategoryIcon(course.category)}
        </div>
      </div>

      <div className={`p-6 ${isListView ? 'flex-1 flex flex-col justify-between' : ''}`}>
        <div>
          {/* Category Badge */}
          <div className="flex items-center justify-between mb-3">
            <span className="px-3 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
              {course.category}
            </span>
            <div className="flex items-center text-sm text-gray-500">
              <Users className="w-4 h-4 mr-1" />
              {course.enrolled_count}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {course.description}
          </p>
        </div>

        <div className={`${isListView ? 'flex items-center justify-between' : 'space-y-3'}`}>
          {/* Course Info */}
          <div className={`flex items-center ${isListView ? 'space-x-6' : 'justify-between'} text-sm text-gray-500`}>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {formatDate(course.created_at)}
            </div>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              {formatTokens(course.price)} tokens
            </div>
          </div>

          {/* Enroll Button */}
          <motion.button
            className={`btn-primary ${isListView ? 'flex-shrink-0' : 'w-full'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/course/${course.id}`);
            }}
          >
            View Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <Layout title="Course Catalog">
        <div className="flex items-center justify-center h-64">
          <motion.div
            className="text-lg text-gray-600"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading courses...
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Course Catalog">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-gray-600 mt-1">
              Discover and enroll in courses that match your interests
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                  ? 'bg-primary-100 text-primary-600'
                  : 'text-gray-500 hover:bg-gray-100'
                }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                  ? 'bg-primary-100 text-primary-600'
                  : 'text-gray-500 hover:bg-gray-100'
                }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
              <ChevronDown className={`w-4 h-4 ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Sort Dropdown */}
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <motion.div
              className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price (tokens)
                </label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={filters.priceRange.max}
                  onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, max: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="text-sm text-gray-600 mt-1">
                  Up to {formatTokens(filters.priceRange.max)} tokens
                </div>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Course Grid/List */}
        {filteredCourses.length > 0 ? (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isListView={viewMode === 'list'}
              />
            ))}
          </div>
        ) : (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or browse all categories
            </p>
            <button
              onClick={clearFilters}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default CourseCatalog;
