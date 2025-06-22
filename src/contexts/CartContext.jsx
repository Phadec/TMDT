import { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { apiServices } from '~/api';
import { getOrCreateCartId } from '~/utils/cartUtils';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Hàm lấy số lượng sản phẩm trong giỏ hàng
  const fetchCartItemCount = async () => {
    if (!isAuthenticated) {
      setCartItemCount(0);
      setCartItems([]);
      return;
    }

    try {
      setLoading(true);
      const cartId = getOrCreateCartId();
      const response = await apiServices.cart.getCartItems(cartId);
      
      if (response && Array.isArray(response)) {
        setCartItems(response);
        setCartItemCount(response.length);
      } else {
        setCartItems([]);
        setCartItemCount(0);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setCartItems([]);
      setCartItemCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Hàm thêm sản phẩm vào giỏ hàng và cập nhật count
  const addToCart = async (productData) => {
    try {
      const response = await apiServices.cart.addToCartWithManagedId(productData);
      if (response) {
        // Cập nhật lại số lượng sau khi thêm thành công
        await fetchCartItemCount();
      }
      return response;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  // Hàm xóa sản phẩm khỏi giỏ hàng và cập nhật count
  const removeFromCart = async (cartId, productId) => {
    try {
      const response = await apiServices.cart.removeFromCart(cartId, productId);
      if (response) {
        // Cập nhật lại số lượng sau khi xóa thành công
        await fetchCartItemCount();
      }
      return response;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  // Hàm xóa sản phẩm khỏi giỏ hàng mà không tự động refresh (để tránh gọi API nhiều lần)
  const removeFromCartOnly = async (cartId, productId) => {
    try {
      const response = await apiServices.cart.removeFromCart(cartId, productId);
      return response;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  // Hàm clear giỏ hàng
  const clearCart = () => {
    setCartItems([]);
    setCartItemCount(0);
    apiServices.cart.clearCart();
  };

  // Fetch cart items khi user đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      fetchCartItemCount();
    } else {
      setCartItemCount(0);
      setCartItems([]);
    }
  }, [isAuthenticated]);

  const value = {
    cartItemCount,
    cartItems,
    loading,
    fetchCartItemCount,
    addToCart,
    removeFromCart,
    removeFromCartOnly,
    clearCart,
    refreshCart: fetchCartItemCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};