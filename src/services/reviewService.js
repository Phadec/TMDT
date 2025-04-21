import api from './api';

const reviewService = {
  getProductReviews: async (productId, page = 0, size = 20) => {
    try {
      const response = await api.graphql(`
        query GetProductReviews($productId: ID!, $page: Int, $size: Int) {
          productReviews(productId: $productId, page: $page, size: $size) {
            id
            username
            userFullName
            userAvatar
            rating
            comment
            createdAt
            verified
            sellerReply
            sellerReplyAt
          }
        }
      `, {
        productId,
        page,
        size
      });
      
      if (response.data && response.data.data && response.data.data.productReviews) {
        return response.data.data.productReviews;
      }
      return [];
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      return [];
    }
  },

  getReviewSummary: async (productId) => {
    try {
      const response = await api.graphql(`
        query GetReviewSummary($productId: ID!) {
          reviewSummary(productId: $productId) {
            averageRating
            totalReviews
            fiveStarCount
            fourStarCount
            threeStarCount
            twoStarCount
            oneStarCount
          }
        }
      `, { productId });
      
      if (response.data && response.data.data && response.data.data.reviewSummary) {
        return response.data.data.reviewSummary;
      }
      return {
        averageRating: 0,
        totalReviews: 0,
        fiveStarCount: 0,
        fourStarCount: 0,
        threeStarCount: 0,
        twoStarCount: 0,
        oneStarCount: 0
      };
    } catch (error) {
      console.error('Error fetching review summary:', error);
      return {
        averageRating: 0,
        totalReviews: 0,
        fiveStarCount: 0,
        fourStarCount: 0,
        threeStarCount: 0,
        twoStarCount: 0,
        oneStarCount: 0
      };
    }
  },

  canReviewProduct: async (productId) => {
    try {
      const response = await api.graphql(`
        query CanReviewProduct($productId: ID!) {
          canReviewProduct(productId: $productId)
        }
      `, { productId });
      
      if (response.data && response.data.data) {
        return response.data.data.canReviewProduct;
      }
      return false;
    } catch (error) {
      console.error('Error checking if user can review:', error);
      return false;
    }
  },

  createReview: async (productId, rating, comment) => {
    try {
      const response = await api.graphql(`
        mutation CreateReview($input: ReviewInput!) {
          createReview(input: $input) {
            id
            username
            userFullName
            userAvatar
            rating
            comment
            createdAt
            verified
          }
        }
      `, {
        input: {
          productId,
          rating,
          comment
        }
      });
      
      if (response.data && response.data.data && response.data.data.createReview) {
        return response.data.data.createReview;
      }
      return null;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  updateReview: async (reviewId, rating, comment) => {
    try {
      const response = await api.graphql(`
        mutation UpdateReview($id: ID!, $input: ReviewUpdateInput!) {
          updateReview(id: $id, input: $input) {
            id
            rating
            comment
            updatedAt
          }
        }
      `, {
        id: reviewId,
        input: {
          rating,
          comment
        }
      });
      
      if (response.data && response.data.data && response.data.data.updateReview) {
        return response.data.data.updateReview;
      }
      return null;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  deleteReview: async (reviewId) => {
    try {
      const response = await api.graphql(`
        mutation DeleteReview($id: ID!) {
          deleteReview(id: $id)
        }
      `, { id: reviewId });
      
      if (response.data && response.data.data) {
        return response.data.data.deleteReview;
      }
      return false;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }
};

export default reviewService;
