import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/common/ScrollToTop';

// Context providers
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// Route guard
import PrivateRoute from './components/common/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import EmailVerification from './pages/auth/EmailVerification';
import Profile from './pages/user/Profile';
import UserProducts from './pages/user/UserProducts';
import Favorites from './pages/user/Favorites';
import CreateProduct from './pages/products/CreateProduct';
import EditProduct from './pages/products/EditProduct';
import ProductDetail from './pages/products/ProductDetail';
import ProductsByCategory from './pages/products/ProductsByCategory';
import SearchResults from './pages/products/SearchResults';
import ShoppingCart from './pages/cart/ShoppingCart';
import OrderConfirmation from './pages/cart/OrderConfirmation';
import NotFound from './pages/NotFound';
import VerifyEmail from './pages/VerifyEmail';
import Checkout from './pages/checkout/Checkout';
import CheckoutSuccess from './pages/checkout/CheckoutSuccess';
import MyOrders from './pages/orders/MyOrders';
import OrderDetail from './pages/orders/OrderDetail';
import SellerOrders from './pages/seller/SellerOrders';
import SellerOrderDetail from './pages/seller/SellerOrderDetail';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="app-container">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/profile" element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } />
                <Route path="/my-products" element={
                  <PrivateRoute>
                    <UserProducts />
                  </PrivateRoute>
                } />
                <Route path="/favorites" element={
                  <PrivateRoute>
                    <Favorites />
                  </PrivateRoute>
                } />
                <Route path="/create-product" element={
                  <PrivateRoute>
                    <CreateProduct />
                  </PrivateRoute>
                } />
                <Route path="/edit-product/:id" element={
                  <PrivateRoute>
                    <EditProduct />
                  </PrivateRoute>
                } />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/category/:slug" element={<ProductsByCategory />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/cart" element={
                  <PrivateRoute>
                    <ShoppingCart />
                  </PrivateRoute>
                } />
                <Route path="/checkout" element={
                  <PrivateRoute>
                    <Checkout />
                  </PrivateRoute>
                } />
                <Route path="/checkout/success/:id" element={
                  <PrivateRoute>
                    <CheckoutSuccess />
                  </PrivateRoute>
                } />
                <Route path="/order-confirmation" element={
                  <PrivateRoute>
                    <OrderConfirmation />
                  </PrivateRoute>
                } />
                <Route path="/my-orders" element={
                  <PrivateRoute>
                    <MyOrders />
                  </PrivateRoute>
                } />
                <Route path="/my-orders/:id" element={
                  <PrivateRoute>
                    <OrderDetail />
                  </PrivateRoute>
                } />
                <Route path="/seller/orders" element={
                  <PrivateRoute>
                    <SellerOrders />
                  </PrivateRoute>
                } />
                <Route path="/seller/orders/:id" element={
                  <PrivateRoute>
                    <SellerOrderDetail />
                  </PrivateRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <ScrollToTop />
          </div>
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
