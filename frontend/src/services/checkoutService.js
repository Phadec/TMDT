import api from './api';

const checkoutService = {
  createOrder: async (orderData) => {
    try {
      const response = await api.graphql(`
        mutation CreateOrder($input: OrderInput!) {
          createOrder(input: $input) {
            id
            orderNumber
            status
            createdAt
          }
        }
      `, { input: orderData });
      
      if (!response.data || !response.data.data) {
        throw new Error('Unexpected response format');
      }
      
      if (response.data.errors) {
        const errorMessage = response.data.errors[0]?.message || 'Đã xảy ra lỗi không xác định';
        throw new Error(errorMessage);
      }
      
      return response.data.data.createOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },
  
  // Future methods can be added here, such as:
  // getOrderById, cancelOrder, getOrderHistory, etc.
};

export default checkoutService;
