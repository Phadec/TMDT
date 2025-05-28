import api from './axiosConfig';

/**
 * Authentication service for handling user login, registration, and session management
 */
const authService = {
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - Response with user data and token
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password });
      
      if (response.data.token) {
        // Store token and user data in localStorage
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - Response with user data
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout current user
   */
  logout: () => {
    // Call logout endpoint if needed
    api.post('/auth/logout').catch(error => console.error('Logout error:', error));
    
    // Remove user data from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  /**
   * Get current authenticated user
   * @returns {Object|null} - User data or null if not authenticated
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise} - Response data
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} password - New password
   * @returns {Promise} - Response data
   */
  resetPassword: async (token, password) => {
    try {
      const response = await api.post('/auth/reset-password', { 
        token, 
        password,
        password_confirmation: password 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default authService;