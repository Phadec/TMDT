import api from './api';

const promoCodeService = {
  getActivePromoCodes: async () => {
    try {
      const response = await api.graphql(`
        query GetActivePromoCodes {
          activePromoCodes {
            id
            code
            description
            discountAmount
            discountPercent
            minimumPurchase
            validFrom
            validTo
            usageLimit
            usageCount
            isActive
          }
        }
      `);
      
      return response.data.data.activePromoCodes;
    } catch (error) {
      console.error('Error fetching active promo codes:', error);
      return [];
    }
  },
  
  validatePromoCode: async (code, cartTotal) => {
    try {
      const response = await api.graphql(`
        query ValidatePromoCode($code: String!, $cartTotal: Float!) {
          validatePromoCode(code: $code, cartTotal: $cartTotal) {
            valid
            code
            discount
            description
            message
          }
        }
      `, { code, cartTotal });
      
      return response.data.data.validatePromoCode;
    } catch (error) {
      console.error('Error validating promo code:', error);
      return {
        valid: false,
        message: 'Lỗi kết nối máy chủ'
      };
    }
  },
  
  applyPromoCode: async (code, cartTotal) => {
    try {
      const response = await api.graphql(`
        mutation ApplyPromoCode($code: String!, $cartTotal: Float!) {
          applyPromoCode(code: $code, cartTotal: $cartTotal)
        }
      `, { code, cartTotal });
      
      return response.data.data.applyPromoCode;
    } catch (error) {
      console.error('Error applying promo code:', error);
      return 0;
    }
  }
};

export default promoCodeService;
