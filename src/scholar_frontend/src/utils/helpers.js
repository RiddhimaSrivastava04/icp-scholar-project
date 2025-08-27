export const formatTokens = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

export const formatDate = (timestamp) => {
  const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (timestamp) => {
  const date = new Date(Number(timestamp) / 1000000);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const getProgressColor = (progress) => {
  if (progress === 100) return 'bg-green-500';
  if (progress >= 75) return 'bg-blue-500';
  if (progress >= 50) return 'bg-yellow-500';
  if (progress >= 25) return 'bg-orange-500';
  return 'bg-red-500';
};

export const getProgressText = (progress) => {
  if (progress === 100) return 'Completed';
  if (progress >= 75) return 'Almost Done';
  if (progress >= 50) return 'Halfway';
  if (progress >= 25) return 'Getting Started';
  return 'Just Started';
};

export const categories = [
  'Programming',
  'Design',
  'Business',
  'Marketing',
  'Data Science',
  'Blockchain',
  'AI & ML',
  'Cybersecurity',
  'Mobile Development',
  'Web Development',
  'DevOps',
  'Other',
];

export const getCategoryIcon = (category) => {
  const icons = {
    Programming: '💻',
    Design: '🎨',
    Business: '💼',
    Marketing: '📢',
    'Data Science': '📊',
    Blockchain: '⛓️',
    'AI & ML': '🤖',
    Cybersecurity: '🔒',
    'Mobile Development': '📱',
    'Web Development': '🌐',
    DevOps: '⚙️',
    Other: '📚',
  };
  return icons[category] || '📚';
};

export const handleError = (error) => {
  console.error('Error:', error);

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    if (error.message) return error.message;
    if (error.Err) return error.Err;
    if (error.UserNotFound) return 'User not found';
    if (error.CourseNotFound) return 'Course not found';
    if (error.InsufficientFunds) return 'Insufficient tokens';
    if (error.Unauthorized) return 'Unauthorized access';
    if (error.AlreadyEnrolled) return 'Already enrolled in this course';
    if (error.InvalidInput) return 'Invalid input provided';
    if (error.NotEnrolled) return 'Not enrolled in this course';
  }

  return 'An unexpected error occurred';
};
