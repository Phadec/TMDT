// Format currency to Vietnamese Dong
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) {
    return '0 ₫';
  }
  
  // Format with Intl but use code display and replace "VND" with "₫" symbol
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    currencyDisplay: 'code' // This will display "VND" which we'll replace
  }).format(amount)
    .replace('VND', '₫') // Replace "VND" with ₫ symbol
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim(); // Remove any extra spaces
};

// Format date from various formats to locale date string
export const formatDate = (dateString) => {
  if (!dateString) {
    console.warn('formatDate received undefined or null date'); 
    return 'Không xác định';
  }
  
  try {
    // Handle ICT timezone format (e.g., "Tue Apr 15 23:22:52 ICT 2025")
    if (typeof dateString === 'string' && dateString.includes('ICT')) {
      // Replace ICT with a standard timezone offset for Asia/Bangkok (UTC+7)
      const fixedDateString = dateString.replace(' ICT ', ' GMT+0700 ');
      const date = new Date(fixedDateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date after ICT replacement:', dateString);
        // Try parsing with a more direct approach
        const parts = dateString.split(' ');
        if (parts.length >= 6) {
          // Format is typically: "Tue Apr 15 23:22:52 ICT 2025"
          const day = parseInt(parts[2], 10);
          const months = {'Jan':0,'Feb':1,'Mar':2,'Apr':3,'May':4,'Jun':5,'Jul':6,'Aug':7,'Sep':8,'Oct':9,'Nov':10,'Dec':11};
          const month = months[parts[1]];
          const year = parseInt(parts[5], 10);
          const timeParts = parts[3].split(':');
          const hour = parseInt(timeParts[0], 10);
          const minute = parseInt(timeParts[1], 10);
          const second = parseInt(timeParts[2], 10);
          
          const manualDate = new Date(year, month, day, hour, minute, second);
          
          if (!isNaN(manualDate.getTime())) {
            return `${manualDate.getDate().toString().padStart(2, '0')}/${(manualDate.getMonth() + 1).toString().padStart(2, '0')}/${manualDate.getFullYear()}`;
          }
        }
        
        return 'Không xác định';
      }
      
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    }
    
    // For standard ISO format or timestamp
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date format:', dateString);
      return 'Không xác định';
    }
    
    // Format date as DD/MM/YYYY
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  } catch (error) {
    console.error('Error formatting date:', error, 'Original date string:', dateString);
    return 'Không xác định';
  }
};

// Helper function to get relative time strings
const getRelativeTimeString = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  const diffMonth = Math.round(diffDay / 30);
  const diffYear = Math.round(diffMonth / 12);

  if (diffSec < 60) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 30) return `${diffDay} ngày trước`;
  if (diffMonth < 12) return `${diffMonth} tháng trước`;
  return `${diffYear} năm trước`;
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
