export function calculateProfileCompletion(user) {
  let completion = 0;
  const fields = [
    'name',
    'email',
    'phone',
    'location',
    'resume',
    'skills',
    'experience',
    'education',
    'bio'
  ];

  fields.forEach(field => {
    if (user[field]) {
      if (Array.isArray(user[field])) {
        if (user[field].length > 0) completion += (100 / fields.length);
      } else {
        completion += (100 / fields.length);
      }
    }
  });

  return Math.round(completion);
}

export function formatSalary(min, max, currency = 'USD') {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });

  return `${formatter.format(min)} - ${formatter.format(max)}`;
}

export function getTimeAgo(date) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }

  return 'Just now';
}

export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validatePassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}

// export function sanitizeSearchQuery(query) {
//   // Remove special characters that could cause issues
//   return query.replace(/[.*+?^${}()|[\]\\]/g, '\\      if (alert.location) {
//         query.location = { $regex: alert.location, $options: 'i');
// }
