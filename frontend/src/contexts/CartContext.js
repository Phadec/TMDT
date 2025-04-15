import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { isAuthenticated, currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchCartCount();
      fetchCartItems();
    } else {
      setCartItems([]);
      setCartCount(0);
    }
  }, [isAuthenticated, currentUser]);

  const fetchCartItems = async (page = 0, size = 10) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      console.log("Fetching cart items for user:", currentUser.username);
      
      // Updated GraphQL query with the username parameter
      const response = await api.graphql(`
        query GetCartItems($username: String!, $page: Int!, $size: Int!) {
          cartItems(username: $username, page: $page, size: $size) {
            id
            username
            productId
            product {
              id
              title
              description
              price
              images
              condition
              negotiable
              status
              createdAt
            }
            quantity
            dateAdded
          }
        }
      `, { 
        username: currentUser.username,
        page, 
        size 
      });
      
      console.log("Cart items response:", response);
      
      if (response.data && response.data.data && response.data.data.cartItems) {
        const cartItemsData = response.data.data.cartItems.map(item => ({
          id: item.id,
          productId: item.productId,
          ...item.product,
          quantity: item.quantity,
          dateAdded: item.dateAdded,
          // Ensure images is an array
          images: item.product.images || []
        }));
        
        console.log("Processed cart items:", cartItemsData);
        setCartItems(cartItemsData);
      } else {
        console.warn("No cart items found in response:", response);
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Không thể tải giỏ hàng');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    if (!currentUser) return;
    
    try {
      // Use the cartItemCount query with username parameter
      const response = await api.graphql(`
        query CartItemCount($username: String!) {
          cartItemCount(username: $username)
        }
      `, {
        username: currentUser.username
      });
      
      if (response.data && response.data.data) {
        setCartCount(response.data.data.cartItemCount);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartCount(0);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }
    
    try {
      setLoading(true);
      
      // Updated mutation to match our schema
      const response = await api.graphql(`
        mutation AddToCart($productId: ID!, $quantity: Int!) {
          addToCart(productId: $productId, quantity: $quantity) {
            id
            quantity
          }
        }
      `, { 
        productId: product.id,
        quantity: quantity
      });
      
      if (response.data && response.data.data && response.data.data.addToCart) {
        toast.success(`${quantity} sản phẩm đã được thêm vào giỏ hàng`);
        fetchCartItems();
        fetchCartCount();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Không thể thêm vào giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const updateCartItemQuantity = async (productId, quantity) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      // Update the mutation to match the schema
      const response = await api.graphql(`
        mutation UpdateCartItemQuantity($productId: ID!, $quantity: Int!) {
          updateCartItemQuantity(productId: $productId, quantity: $quantity) {
            id
            quantity
          }
        }
      `, { 
        productId: productId,
        quantity: quantity
      });
      
      if (response.data && response.data.data && response.data.data.updateCartItemQuantity) {
        toast.success('Số lượng sản phẩm đã được cập nhật');
        
        // Cập nhật state trực tiếp thay vì gọi lại API
        setCartItems(prevItems => 
          prevItems.map(item => 
            item.id === productId ? { ...item, quantity } : item
          )
        );
      }
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      toast.error('Không thể cập nhật số lượng sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      // Update the mutation to match the schema
      const response = await api.graphql(`
        mutation RemoveFromCart($productId: ID!) {
          removeFromCart(productId: $productId)
        }
      `, { 
        productId: productId
      });
      
      if (response.data && response.data.data && response.data.data.removeFromCart) {
        toast.success('Sản phẩm đã được xóa khỏi giỏ hàng');
        setCartItems(cartItems.filter(item => item.id !== productId));
        setCartCount(prevCount => prevCount - 1);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Không thể xóa khỏi giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!currentUser || cartItems.length === 0) return;
    
    try {
      setLoading(true);
      
      const response = await api.graphql(`
        mutation ClearCart {
          clearCart
        }
      `);
      
      if (response.data && response.data.data && response.data.data.clearCart) {
        toast.success('Giỏ hàng đã được xóa');
        setCartItems([]);
        setCartCount(0);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Không thể xóa giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * (item.quantity || 1));
    }, 0);
  };

  const value = {
    cartItems,
    cartCount,
    loading,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    fetchCartItems,
    getCartTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
