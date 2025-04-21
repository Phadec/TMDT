import api from './api';

const checkoutService = {
  createOrder: async (orderData) => {
    try {
      console.log('Creating order with data:', orderData);
      
      const response = await api.graphql(`
        mutation CreateOrder($input: OrderInput!) {
          createOrder(input: $input) {
            id
            orderNumber
            status
            totalAmount
            subtotal
            discountAmount
            promoCode
            createdAt
          }
        }
      `, {
        input: {
          customerInfo: orderData.customerInfo,
          items: orderData.items,
          totalAmount: orderData.totalAmount,
          subtotal: orderData.subtotal,
          discountAmount: orderData.discountAmount || 0,
          promoCode: orderData.promoCode || null,
          paymentMethod: orderData.paymentMethod,
          notes: orderData.notes || ""
        }
      });
      
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
