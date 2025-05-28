import api from './axiosConfig';
import authService from './authService';
import apiService from './apiService';
import userService from './userService';

// Export all services
export {
  api,
  authService,
  apiService,
  userService
};

// Default export for convenience
export default {
  api,
  auth: authService,
  apiService,
  user: userService
};