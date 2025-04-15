import api from './api';

const orderService = {
  getOrderById: async (id) => {
    try {
      const response = await api.graphql(`
        query GetOrderDetails($id: ID!) {
          order(id: $id) {
            id
            orderNumber
            totalAmount
            status
            paymentMethod
            createdAt
            notes
            customerInfo {
              fullName
              email
              phone
              address
            }
            items {
              id
              quantity
              price
              product {
                id
                title
                images
                description
              }
            }
          }
        }
      `, { id });

      if (!response.data || !response.data.data) {
        throw new Error('Unexpected response format');
      }
      
      return response.data.data.order;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  },
  
  getUserOrders: async (username) => {
    try {
      const response = await api.graphql(`
        query GetMyOrders($username: String!) {
          orders(username: $username) {
            id
            orderNumber
            totalAmount
            status
            paymentMethod
            createdAt
            items {
              quantity
              product {
                title
                images
              }
            }
          }
        }
      `, { username });

      if (!response.data || !response.data.data) {
        throw new Error('Unexpected response format');
      }
      
      return response.data.data.orders || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  cancelOrder: async (id) => {
    try {
      const response = await api.graphql(`
        mutation CancelOrder($id: ID!) {
          cancelOrder(id: $id) {
            id
            status
          }
        }
      `, { id });

      if (!response.data || !response.data.data) {
        throw new Error('Unexpected response format');
      }
      
      return response.data.data.cancelOrder;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  },

  // New seller-related methods
  getSellerOrders: async () => {
    try {
      const response = await api.graphql(`
        query GetSellerOrders {
          sellerOrders {
            id
            orderNumber
            totalAmount
            status
            paymentMethod
            createdAt
            customerInfo {
              fullName
              phone
            }
            items {
              quantity
              price
              product {
                id
                title
                images
              }
            }
          }
        }
      `);
      
      if (response.data && response.data.errors) {
        const errorMessages = response.data.errors.map(err => err.message).join(', ');
        console.error("GraphQL errors:", response.data.errors);
        throw new Error(`Error loading orders: ${errorMessages}`);
      } 
      
      return response.data?.data?.sellerOrders || [];
    } catch (error) {
      console.error('Error fetching seller orders:', error);
      throw error;
    }
  },
  
  getSellerOrderDetail: async (id) => {
    try {
      const response = await api.graphql(`
        query GetOrderDetails($id: ID!) {
          sellerOrderDetail(id: $id) {
            id
            orderNumber
            totalAmount
            status
            paymentMethod
            createdAt
            updatedAt
            notes
            customerInfo {
              fullName
              email
              phone
              address
            }
            items {
              id
              quantity
              price
              product {
                id
                title
                images
                description
              }
            }
          }
        }
      `, { id });

      if (response.data && response.data.errors) {
        throw new Error(response.data.errors[0]?.message || 'Error fetching order details');
      }
      
      return response.data?.data?.sellerOrderDetail;
    } catch (error) {
      console.error('Error fetching seller order details:', error);
      throw error;
    }
  },

  updateOrderStatus: async (orderId, newStatus) => {
    try {
      const response = await api.graphql(`
        mutation UpdateOrderStatus($id: ID!, $status: OrderStatus!) {
          updateOrderStatus(id: $id, status: $status) {
            id
            status
          }
        }
      `, { 
        id: orderId,
        status: newStatus
      });

      if (response.data && response.data.errors) {
        throw new Error(response.data.errors[0]?.message || 'Error updating order status');
      }
      
      return response.data?.data?.updateOrderStatus;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
};

export default orderService;
