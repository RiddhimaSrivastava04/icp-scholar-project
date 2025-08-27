import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpen, Users, Trophy, Shield, ChevronRight, Star, Play, Loader,
  ArrowRight, Check, Globe, Zap, Target, Award, MessageCircle,
  TrendingUp, Clock, DollarSign, Brain, Lightbulb, Code,
  ChevronDown, Menu, X, Github, Twitter, Mail,
  Lock, Database, Cpu, Network, BarChart3, PieChart,
  User, Calendar, BookmarkPlus, Heart, Share2, Download
} from 'lucide-react';
import RegistrationModal from '../components/RegistrationModal';
import toast from 'react-hot-toast';

const LandingPage = () => {
  const { isAuthenticated, user, login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeFAQ, setActiveFAQ] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard');
    } else if (isAuthenticated && !user) {
      // User is authenticated but not registered, show registration modal
      setIsRegistrationModalOpen(true);
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async () => {
    try {
      toast.loading('Connecting to Internet Identity...', { id: 'login' });
      await login();
      toast.success('Successfully connected!', { id: 'login' });
    } catch (error) {
      toast.error('Failed to connect. Please try again.', { id: 'login' });
      console.error('Login error:', error);
    }
  };

  const handleRegistrationComplete = () => {
    setIsRegistrationModalOpen(false);
    navigate('/dashboard');
  };

  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Learn & Earn',
      description: 'Complete courses and earn tokens as rewards for your learning journey.',
      benefits: ['Token rewards for completion', 'Skill-based learning paths', 'Interactive content', 'Progress tracking']
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Peer-to-Peer Learning',
      description: 'Engage with fellow learners in discussions and get rewarded for helpful contributions.',
      benefits: ['Community discussions', 'Peer mentoring', 'Study groups', 'Knowledge sharing']
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Reputation System',
      description: 'Build your reputation through course completion and community participation.',
      benefits: ['Merit-based scoring', 'Achievement badges', 'Leaderboards', 'Recognition rewards']
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Blockchain Security',
      description: 'Your progress and achievements are securely stored on the Internet Computer.',
      benefits: ['Immutable records', 'Decentralized storage', 'Data ownership', 'Fraud prevention']
    },
  ];

  const advancedFeatures = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'AI-Powered Learning Paths',
      description: 'Personalized learning recommendations based on your goals and progress'
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'Interactive Coding Labs',
      description: 'Hands-on programming exercises with real-time feedback'
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Live Mentorship Sessions',
      description: 'Connect with industry experts for personalized guidance'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Blockchain Certificates',
      description: 'Verifiable certificates stored permanently on the blockchain'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Skills Assessment',
      description: 'Regular evaluations to track your learning progress'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Global Community',
      description: 'Learn with students from around the world'
    }
  ];

  const courseCategories = [
    {
      title: 'Blockchain & Web3',
      count: '150+ courses',
      icon: <Network className="w-8 h-8" />,
      topics: ['Smart Contracts', 'DeFi', 'NFTs', 'Cryptocurrency', 'Ethereum', 'Solidity'],
      color: 'from-purple-500 to-indigo-600'
    },
    {
      title: 'Programming',
      count: '200+ courses',
      icon: <Code className="w-8 h-8" />,
      topics: ['JavaScript', 'Python', 'React', 'Node.js', 'Machine Learning', 'AI'],
      color: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'Data Science',
      count: '120+ courses',
      icon: <BarChart3 className="w-8 h-8" />,
      topics: ['Analytics', 'Visualization', 'Statistics', 'Big Data', 'Python', 'R'],
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Business & Finance',
      count: '80+ courses',
      icon: <TrendingUp className="w-8 h-8" />,
      topics: ['Entrepreneurship', 'Marketing', 'Finance', 'Strategy', 'Leadership', 'Management'],
      color: 'from-orange-500 to-red-600'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Frontend Developer',
      company: 'TechCorp',
      image: '/api/placeholder/64/64',
      rating: 5,
      text: 'ICP Scholar transformed my career. I went from a complete beginner to landing a developer job in just 6 months. The earn-while-you-learn model kept me motivated throughout the journey.',
      tokens_earned: '2,450',
      courses_completed: 12
    },
    {
      name: 'Michael Chen',
      role: 'Blockchain Engineer',
      company: 'CryptoStartup',
      image: '/api/placeholder/64/64',
      rating: 5,
      text: 'The blockchain courses here are incredibly detailed and up-to-date. I earned over 5,000 tokens while learning Solidity and landed my dream job in Web3.',
      tokens_earned: '5,200',
      courses_completed: 18
    },
    {
      name: 'Emily Rodriguez',
      role: 'Data Scientist',
      company: 'Analytics Pro',
      image: '/api/placeholder/64/64',
      rating: 5,
      text: 'The peer-to-peer learning environment is amazing. I not only learned data science but also built a network of professionals who became mentors and friends.',
      tokens_earned: '3,800',
      courses_completed: 15
    },
    {
      name: 'David Kim',
      role: 'Product Manager',
      company: 'Innovation Labs',
      image: '/api/placeholder/64/64',
      rating: 5,
      text: 'As an educator on the platform, I\'ve been able to share my knowledge while earning tokens. The community is engaged and the platform tools are excellent.',
      tokens_earned: '7,600',
      courses_completed: 8
    }
  ];

  const faqs = [
    {
      question: 'How do I earn tokens on ICP Scholar?',
      answer: 'You earn tokens by completing course modules, participating in discussions, helping other learners, creating quality content, and achieving learning milestones. The more engaged you are, the more you earn!'
    },
    {
      question: 'What can I do with my earned tokens?',
      answer: 'Tokens can be used to unlock premium courses, access exclusive content, book mentorship sessions, purchase course materials, or even be converted to other cryptocurrencies through our integrated wallet.'
    },
    {
      question: 'Are the certificates blockchain-verified?',
      answer: 'Yes! All certificates are stored on the Internet Computer blockchain, making them permanently verifiable and tamper-proof. Employers can instantly verify your credentials using our verification portal.'
    },
    {
      question: 'How does the reputation system work?',
      answer: 'Your reputation score increases based on course completions, community contributions, peer reviews, and mentor feedback. Higher reputation unlocks special privileges, better earning rates, and exclusive opportunities.'
    },
    {
      question: 'Can I become an educator on the platform?',
      answer: 'Absolutely! We welcome subject matter experts to join as educators. You can create courses, conduct live sessions, mentor students, and earn tokens for your contributions. Apply through our educator program.'
    },
    {
      question: 'Is my learning data secure?',
      answer: 'Yes, your data is secured using blockchain technology on the Internet Computer. You maintain full ownership of your learning records, and our decentralized architecture ensures maximum security and privacy.'
    },
    {
      question: 'What makes ICP Scholar different from other learning platforms?',
      answer: 'We combine education with blockchain technology, offering token rewards, verifiable certificates, peer-to-peer learning, and a decentralized approach that puts learners first. You\'re not just learning - you\'re earning and building a verified professional profile.'
    },
    {
      question: 'How do I get started?',
      answer: 'Simply connect with Internet Identity, complete your profile, choose your learning path, and start your first course. You\'ll begin earning tokens immediately and can track your progress on your personalized dashboard.'
    }
  ];

  const stats = [
    {
      number: '25,000+',
      label: 'Active Learners',
      description: 'Students actively learning and earning'
    },
    {
      number: '1,200+',
      label: 'Courses Available',
      description: 'Comprehensive courses across multiple domains'
    },
    {
      number: '2.5M+',
      label: 'Tokens Distributed',
      description: 'Total tokens earned by our community'
    },
    {
      number: '99.2%',
      label: 'Satisfaction Rate',
      description: 'Learners who recommend our platform'
    },
    {
      number: '150+',
      label: 'Expert Educators',
      description: 'Industry professionals teaching courses'
    },
    {
      number: '50+',
      label: 'Countries',
      description: 'Global learning community'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-2xl font-semibold text-primary-600"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading ICP Scholar...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient">ICP Scholar</span>
            </motion.div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-primary-600 transition-colors">Features</a>
              <a href="#courses" className="text-gray-700 hover:text-primary-600 transition-colors">Courses</a>
              <a href="#testimonials" className="text-gray-700 hover:text-primary-600 transition-colors">Reviews</a>
              <a href="#pricing" className="text-gray-700 hover:text-primary-600 transition-colors">Pricing</a>
              <a href="#faq" className="text-gray-700 hover:text-primary-600 transition-colors">FAQ</a>
            </div>

            <div className="flex items-center space-x-4">
              <motion.button
                onClick={handleLogin}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || isAuthenticated}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: isAuthenticated ? 1 : 1.05 }}
                whileTap={{ scale: isAuthenticated ? 1 : 0.95 }}
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : isAuthenticated ? (
                  user ? 'Dashboard' : 'Complete Setup'
                ) : (
                  'Get Started'
                )}
              </motion.button>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden py-4 border-t border-gray-200"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col space-y-3">
                <a href="#features" className="text-gray-700 hover:text-primary-600 transition-colors px-2 py-1">Features</a>
                <a href="#courses" className="text-gray-700 hover:text-primary-600 transition-colors px-2 py-1">Courses</a>
                <a href="#testimonials" className="text-gray-700 hover:text-primary-600 transition-colors px-2 py-1">Reviews</a>
                <a href="#pricing" className="text-gray-700 hover:text-primary-600 transition-colors px-2 py-1">Pricing</a>
                <a href="#faq" className="text-gray-700 hover:text-primary-600 transition-colors px-2 py-1">FAQ</a>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Learn, Earn &{' '}
                <span className="text-gradient relative">
                  Grow
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full"></div>
                </span>{' '}
                Together
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                Join the future of education on the blockchain. Complete courses, earn tokens,
                and build your reputation in our decentralized learning platform powered by the Internet Computer.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">Free to Start</span>
                </div>
                <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">Instant Rewards</span>
                </div>
                <div className="flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-full">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <span className="text-purple-800 font-medium">Blockchain Secured</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <motion.button
                  onClick={handleLogin}
                  className="btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || isAuthenticated}
                  whileHover={{ scale: (isLoading || isAuthenticated) ? 1 : 1.05 }}
                  whileTap={{ scale: (isLoading || isAuthenticated) ? 1 : 0.95 }}
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : isAuthenticated ? (
                    user ? (
                      <>
                        Go to Dashboard
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </>
                    ) : (
                      'Complete Registration'
                    )
                  ) : (
                    <>
                      Start Learning
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </motion.button>

                <motion.button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center justify-center px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </motion.button>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <span>1000+ Happy Learners</span>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative z-10 glass-effect rounded-2xl p-8 shadow-2xl">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Your Journey</h3>
                  <p className="text-gray-600">Connect with Internet Identity to begin</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-primary-600 font-semibold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Connect Wallet</p>
                      <p className="text-sm text-gray-500">Use Internet Identity</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-primary-600 font-semibold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Choose Your Role</p>
                      <p className="text-sm text-gray-500">Learner or Educator</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-primary-600 font-semibold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Start Learning</p>
                      <p className="text-sm text-gray-500">Earn tokens & reputation</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-secondary-400 to-secondary-600 rounded-full opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full opacity-20"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Why Choose ICP Scholar?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of education with our blockchain-powered learning platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl hover:border-primary-200 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{feature.title}</h3>
                <p className="text-gray-600 mb-4 text-center">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-500">
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Advanced Features Grid */}
          <motion.div
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 md:p-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Advanced Learning Features</h3>
              <p className="text-lg text-gray-600">Cutting-edge tools to enhance your learning experience</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {advancedFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Course Categories Section */}
      <section id="courses" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Explore Our Course Categories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From blockchain technology to data science, discover courses that match your interests and career goals
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {courseCategories.map((category, index) => (
              <motion.div
                key={index}
                className="group relative overflow-hidden bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>

                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white group-hover:scale-110 transition-transform duration-300`}>
                    {category.icon}
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">{category.title}</h3>
                  <p className="text-primary-600 font-semibold text-center mb-4">{category.count}</p>

                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {category.topics.slice(0, 4).map((topic, idx) => (
                      <span key={idx} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        {topic}
                      </span>
                    ))}
                    {category.topics.length > 4 && (
                      <span className="inline-block bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">
                        +{category.topics.length - 4} more
                      </span>
                    )}
                  </div>

                  <motion.button
                    className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Explore Courses
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">Join Our Growing Community</h2>
            <p className="text-xl text-primary-100">Real numbers from our thriving learning ecosystem</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-xl font-semibold text-primary-100 mb-2">{stat.label}</div>
                <div className="text-sm text-primary-200">{stat.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">What Our Learners Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real stories from students who transformed their careers with ICP Scholar
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-xs text-primary-600">{testimonial.company}</p>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-gray-700 mb-6 text-sm leading-relaxed">"{testimonial.text}"</p>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <div className="text-center">
                      <div className="font-bold text-primary-600">{testimonial.tokens_earned}</div>
                      <div className="text-gray-500">Tokens Earned</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-secondary-600">{testimonial.courses_completed}</div>
                      <div className="text-gray-500">Courses Done</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about ICP Scholar
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <button
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setActiveFAQ(activeFAQ === index ? null : index)}
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${activeFAQ === index ? 'transform rotate-180' : ''
                      }`}
                  />
                </button>

                {activeFAQ === index && (
                  <motion.div
                    className="px-8 pb-6"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-xl text-primary-100 mb-8 leading-relaxed">
              Join thousands of learners earning tokens while building valuable skills. Start for free and begin earning immediately.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <motion.button
                onClick={handleLogin}
                className="bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Free
                <ChevronRight className="w-6 h-6 ml-2 inline" />
              </motion.button>

              <motion.button
                onClick={() => setIsModalOpen(true)}
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-primary-600 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Watch Demo
                <Play className="w-6 h-6 ml-2 inline" />
              </motion.button>
            </div>

            <div className="grid md:grid-cols-3 gap-8 text-primary-100">
              <div className="flex items-center justify-center space-x-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>No hidden fees</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>Earn while you learn</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-bold text-gradient">ICP Scholar</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                Empowering learners worldwide with blockchain-based education. Earn tokens, build skills,
                and create your future on the decentralized web.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors duration-300">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors duration-300">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors duration-300">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-primary-400 transition-colors">Features</a></li>
                <li><a href="#courses" className="hover:text-primary-400 transition-colors">Courses</a></li>
                <li><a href="#testimonials" className="hover:text-primary-400 transition-colors">Reviews</a></li>
                <li><a href="#faq" className="hover:text-primary-400 transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Support</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              © 2025 ICP Scholar. Built on Internet Computer Protocol.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary-400 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {isModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Platform Demo</h3>
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-4">
              <Play className="w-16 h-16 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-6">
              This demo video would showcase the key features of ICP Scholar, including course enrollment,
              token earning, and peer-to-peer interactions.
            </p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full btn-primary"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        onSuccess={handleRegistrationComplete}
      />
    </div>
  );
};

export default LandingPage;
