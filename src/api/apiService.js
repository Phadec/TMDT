import api from './axiosConfig';

/**
 * General API service for handling common API requests
 */
const apiService = {
  /**
   * Generic GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise} - Response data
   */
  get: async (endpoint, params = {}) => {
    try {
      const response = await api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Generic POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request payload
   * @returns {Promise} - Response data
   */
  post: async (endpoint, data = {}) => {
    try {
      const response = await api.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Generic PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request payload
   * @returns {Promise} - Response data
   */
  put: async (endpoint, data = {}) => {
    try {
      const response = await api.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Generic PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request payload
   * @returns {Promise} - Response data
   */
  patch: async (endpoint, data = {}) => {
    try {
      const response = await api.patch(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Generic DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise} - Response data
   */
  delete: async (endpoint, params = {}) => {
    try {
      const response = await api.delete(endpoint, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload file(s)
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - Form data with files
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} - Response data
   */
  uploadFiles: async (endpoint, formData, onProgress = null) => {
    try {
      const response = await api.post(endpoint, formData, {
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
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default apiService;