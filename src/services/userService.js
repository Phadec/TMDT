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

  getUserByUsername: async (username) => {
    try {
      // Using a modified query that doesn't directly include totalSoldProducts
      const response = await api.graphql(`
        query GetUserByUsername($username: String!) {
          userByUsername(username: $username) {
            id
            firstName
            lastName
            username
            email
            phoneNumber
            avatar
            createdAt
            updatedAt
            emailVerified
          }
          
          # Get user reviews separately
          userReviews(username: $username) {
            id
            rating
            comment
            createdAt
            sellerReply
            sellerReplyAt
          }
        }
      `, { username });
      
      if (!response.data || !response.data.data) {
        console.error('No data received from userByUsername query');
        return null;
      }
      
      // Combine user data with review stats
      const userData = response.data.data.userByUsername;
      const userReviews = response.data.data.userReviews || [];
      
      // Calculate average rating
      let averageRating = 0;
      if (userReviews.length > 0) {
        const totalRating = userReviews.reduce((sum, review) => sum + review.rating, 0);
        averageRating = totalRating / userReviews.length;
      }
      
      // Calculate response rate
      const reviewsWithReply = userReviews.filter(review => review.sellerReply).length;
      const responseRate = userReviews.length > 0 
        ? Math.round((reviewsWithReply / userReviews.length) * 100) 
        : 0;
      
      try {
        // Fetch sold products count in a separate query to handle potential errors
        const soldProductsResponse = await api.graphql(`
          query GetSellerProducts($username: String!) {
            sellerProducts(username: $username, status: "SOLD") {
              id
              soldQuantity
            }
          }
        `, { username });
        
        let totalSoldProducts = 0;
        
        if (soldProductsResponse.data?.data?.sellerProducts) {
          const soldProducts = soldProductsResponse.data.data.sellerProducts;
          // Calculate total sold products
          totalSoldProducts = soldProducts.reduce((total, product) => {
            return total + (product.soldQuantity || 1);
          }, 0);
          console.log('Calculated totalSoldProducts:', totalSoldProducts);
        }
        
        return {
          ...userData,
          totalSoldProducts, // Add totalSoldProducts field manually
          reviewStats: {
            averageRating,
            totalReviews: userReviews.length,
            responseRate
          }
        };
      } catch (soldError) {
        console.error('Error fetching sold products:', soldError);
        // Return user data without sold products count if there's an error
        return {
          ...userData,
          totalSoldProducts: 0, // Default to 0 if we couldn't fetch the data
          reviewStats: {
            averageRating,
            totalReviews: userReviews.length,
            responseRate
          }
        };
      }
    } catch (error) {
      console.error(`Error fetching user with username ${username}:`, error);
      return null;
    }
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.graphql(`
        query GetCurrentUser {
          currentUser {
            id
            firstName
            lastName
            username
            email
            phoneNumber
            avatar
            role
            createdAt
            updatedAt
          }
        }
      `);
      
      if (!response.data || !response.data.data) {
        return null;
      }
      
      return response.data.data.currentUser;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }
};

export default userService;