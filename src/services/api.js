import axios from 'axios';
import meta from 'axios-metadata';

// Set base URL from environment variables or default
const API_BASE_URL = meta.env.VITE_API_URL || 'http://localhost:8080';
const GRAPHQL_ENDPOINT = `${API_BASE_URL}/graphql`;

// Create axios instance for REST API calls
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add this function to ensure HTML is properly handled
const processApiResponse = (response) => {
  // If we have an HTML processing need in the future, implement it here
  return response;
};

// Add request interceptor for logging
axiosInstance.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📡 REST API Request: ${config.method.toUpperCase()} ${config.url}`, 
        config.data ? config.data : '');
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging and handling auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📥 REST API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, 
        response.data);
    }
    return processApiResponse(response);
  },
  (error) => {
    console.error('Response error:', error);
    
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Dispatch auth error event
      window.dispatchEvent(new Event('auth-error'));
    }
    
    return Promise.reject(error);
  }
);

// Add logging to debug API calls
const logRequest = (operationName, variables) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📡 GraphQL Request: ${operationName}`, variables);
  }
};

const logResponse = (operationName, data) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📥 GraphQL Response: ${operationName}`, data);
  }
};

const api = {
  // REST API methods
  get: async (url, config = {}) => {
    return axiosInstance.get(url, config);
  },
  
  post: async (url, data = {}, config = {}) => {
    return axiosInstance.post(url, data, config);
  },
  
  put: async (url, data = {}, config = {}) => {
    return axiosInstance.put(url, data, config);
  },
  
  delete: async (url, config = {}) => {
    return axiosInstance.delete(url, config);
  },
  
  // Set default headers
  defaults: {
    headers: {
      common: {}
    }
  },
  
  // GraphQL API call
  graphql: async (query, variables = {}) => {
    try {
      // Extract operation name for logging
      const operationName = query.match(/(query|mutation)\s+(\w+)/)?.[2] || 'GraphQLOperation';
      logRequest(operationName, variables);
      
      const response = await axiosInstance.post(
        GRAPHQL_ENDPOINT,
        {
          query,
          variables
        }
      );
      
      // Check for GraphQL errors in the response
      if (response.data.errors) {
        const errorMessage = response.data.errors.map(e => e.message).join(', ');
        console.error(`GraphQL Errors in ${operationName}:`, response.data.errors);
        throw new Error(errorMessage);
      }
      
      logResponse(operationName, response.data);
      return response;
    } catch (error) {
      // Enhance error handling
      if (error.response) {
        console.error('Server error:', error.response.data);
        throw new Error(error.response.data.message || 'Server error occurred');
      } else if (error.request) {
        console.error('Network error - no response received');
        throw new Error('Network error - please check your connection');
      } else {
        console.error('Error:', error.message);
        throw error;
      }
    }
  },
  
  // For file uploads
  uploadFile: async (file, path = 'uploads') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);
      
      const response = await axiosInstance.post(`/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }
};

// Make sure the default headers from the axios instance are synced with our api object
api.defaults.headers = axiosInstance.defaults.headers;

// Sync changes to api.defaults.headers with the axios instance
Object.defineProperty(api.defaults, 'headers', {
  get: function() {
    return axiosInstance.defaults.headers;
  },
  set: function(newHeaders) {
    axiosInstance.defaults.headers = newHeaders;
  }
});

export default api;
