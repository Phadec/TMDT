// Format currency to Vietnamese Dong
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount);
};

/**
 * Format a date string to a more readable format
 * @param {string} dateString - The date string to format
 * @param {boolean} includeTime - Whether to include time in the result
 * @returns {string} - The formatted date string
 */
export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return 'Không có thông tin';
  
  try {
    // Special handling for dates with 'ICT' timezone
    let date;
    if (typeof dateString === 'string' && dateString.includes('ICT')) {
      // Replace ICT with +07:00 (Indochina Time offset)
      const correctedDateString = dateString.replace('ICT', '+07:00');
      date = new Date(correctedDateString);
      
      // Fall back to manual parsing if the above doesn't work
      if (isNaN(date.getTime())) {
        // Try manual parsing for format like: Tue Apr 15 00:02:08 ICT 2025
        const parts = dateString.split(' ');
        if (parts.length >= 6) {
          const month = {
            Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
            Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
          }[parts[1]];
          
          const day = parseInt(parts[2], 10);
          const timeParts = parts[3].split(':');
          const hour = parseInt(timeParts[0], 10);
          const minute = parseInt(timeParts[1], 10);
          const second = parseInt(timeParts[2], 10);
          const year = parseInt(parts[5], 10);
          
          date = new Date(year, month, day, hour, minute, second);
        }
      }
    } else {
      date = new Date(dateString);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date format:', dateString);
      return 'Không có thông tin';
    }
    
    // Check if date is in the future (accounting for time zone differences with a 24-hour buffer)
    const now = new Date();
    if (date > new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
      // If date is more than 24 hours in the future, it's likely an error
      console.warn('Future date detected (likely error):', dateString);
      return 'Mới đăng';
    }
    
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return date.toLocaleDateString('vi-VN', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Không có thông tin';
  }
};

/**
 * Format relative time (e.g., "2 days ago")
 * @param {string} dateString - The date string to format
 * @returns {string} - The formatted relative time
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Không có thông tin';
  
  try {
    // Special handling for dates with 'ICT' timezone
    let date;
    if (typeof dateString === 'string' && dateString.includes('ICT')) {
      // Replace ICT with +07:00 (Indochina Time offset)
      const correctedDateString = dateString.replace('ICT', '+07:00');
      date = new Date(correctedDateString);
      
      // Fall back to manual parsing if the above doesn't work
      if (isNaN(date.getTime())) {
        // Try manual parsing for format like: Tue Apr 15 00:02:08 ICT 2025
        const parts = dateString.split(' ');
        if (parts.length >= 6) {
          const month = {
            Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
            Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
          }[parts[1]];
          
          const day = parseInt(parts[2], 10);
          const timeParts = parts[3].split(':');
          const hour = parseInt(timeParts[0], 10);
          const minute = parseInt(timeParts[1], 10);
          const second = parseInt(timeParts[2], 10);
          const year = parseInt(parts[5], 10);
          
          date = new Date(year, month, day, hour, minute, second);
        }
      }
    } else {
      date = new Date(dateString);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date format in relative time:', dateString);
      return 'Mới đăng';
    }
    
    const now = new Date();
    
    // Check if date is in the future (accounting for time zone differences with a 24-hour buffer)
    if (date > new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
      console.warn('Future date detected in relative time:', dateString);
      return 'Mới đăng';
    }
    
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        if (diffMinutes === 0) {
          return 'Vừa xong';
        }
        return `${diffMinutes} phút trước`;
      }
      return `${diffHours} giờ trước`;
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} tuần trước`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} tháng trước`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} năm trước`;
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Không có thông tin';
  }
};

// Format product condition
export const formatCondition = (condition) => {
  const conditionMap = {
    NEW: 'Mới',
    LIKE_NEW: 'Như mới',
    GOOD: 'Tốt',
    FAIR: 'Khá',
    POOR: 'Kém'
  };
  
  return conditionMap[condition] || condition;
};
