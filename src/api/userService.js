import api from './axiosConfig';

/**
 * User service for handling user-related API requests
 */
const userService = {
  /**
   * Get current user profile
   * @returns {Promise} - User profile data
   */
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} - Updated user profile
   */
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/user/profile', profileData);
      
      // Update stored user data if needed
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...response.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise} - Response data
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/user/change-password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPassword
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload user avatar
   * @param {File} file - Avatar image file
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} - Response with avatar URL
   */
  uploadAvatar: async (file, onProgress = null) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await api.post('/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress
          ? (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percentCompleted);
            }
          : undefined,
      });
      
      // Update stored user data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, avatar: response.data.avatar_url };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user notifications
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} - Notifications data
   */
  getNotifications: async (page = 1, limit = 10) => {
    try {
      const response = await api.get('/user/notifications', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise} - Response data
   */
  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await api.post(`/user/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default userService;