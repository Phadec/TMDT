import api from './api';

const userService = {
  updateAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Sử dụng REST API endpoint thay vì GraphQL cho upload file
      const response = await api.post('/api/v1/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.graphql(`
        query {
          currentUser {
            id
            username
            firstName
            lastName
            avatar
            email
            phoneNumber
          }
        }
      `);
      return response.data.data.currentUser;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }
};

export default userService;