import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { CartContext } from '../../contexts/CartContext';
import SearchBar from '../common/SearchBar';
import './Header.css';

const Header = () => {
  const { currentUser, isAuthenticated, logout } = useContext(AuthContext);
  const { cartItems, cartCount } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);

  // Handle scroll event to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  // Use cartCount directly from context instead of calculating it
  const cartItemCount = cartCount || 0;

  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo-container">
          <Link to="/" className="logo">
            <span className="logo-text">Chợ Việt</span>
          </Link>
        </div>

        <div className="search-container">
          <SearchBar />
        </div>

        <nav className={`main-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <ul className="nav-links">
            <li className="nav-item">
              <Link to="/category/all" className={location.pathname.includes('/category') ? 'active' : ''}>
                <i className="fas fa-th-large"></i>
                <span>Danh mục</span>
              </Link>
            </li>
            <li className="nav-item highlight-item">
              <Link to="/create-product" className="post-btn">
                <i className="fas fa-plus-circle"></i>
                <span>Đăng tin</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/cart" className={location.pathname === '/cart' ? 'active' : ''}>
                <i className="fas fa-shopping-cart"></i>
                <span>Giỏ hàng</span>
                {cartItemCount > 0 && (
                  <span className="cart-badge">{cartItemCount}</span>
                )}
              </Link>
            </li>

            {isAuthenticated ? (
              <li className="nav-item user-nav" ref={userDropdownRef}>
                <button
                  className={`user-btn ${isUserDropdownOpen ? 'active' : ''}`}
                  onClick={toggleUserDropdown}
                >
                  <div className="user-avatar">
                    <img
                      src={currentUser?.avatar || '/images/default-avatar.png'}
                      alt={currentUser?.username}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/default-avatar.png';
                      }}
                    />
                  </div>
                  <span className="username">{currentUser?.username}</span>
                  <i className={`fas fa-chevron-${isUserDropdownOpen ? 'up' : 'down'}`}></i>
                </button>

                {isUserDropdownOpen && (
                  <div className="user-dropdown">
                    <Link to="/profile" className="dropdown-item">
                      <i className="fas fa-user"></i> Thông tin tài khoản
                    </Link>
                    <Link to="/my-products" className="dropdown-item">
                      <i className="fas fa-box"></i> Sản phẩm của tôi
                    </Link>
                    <Link to="/my-orders" className="dropdown-item">
                      <i className="fas fa-shopping-bag"></i> Đơn mua của tôi
                    </Link>
                    <Link to="/seller/orders" className="dropdown-item">
                      <i className="fas fa-clipboard-list"></i> Quản lý đơn hàng
                    </Link>

                    <Link to="/favorites" className="dropdown-item">
                      <i className="fas fa-heart"></i> Sản phẩm yêu thích
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item logout-btn">
                      <i className="fas fa-sign-out-alt"></i> Đăng xuất
                    </button>
                  </div>
                )}
              </li>
            ) : (
              <li className="nav-item auth-buttons">
                <Link to="/login" className="login-btn">
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Đăng nhập</span>
                </Link>
                <Link to="/register" className="register-btn">
                  <span>Đăng ký</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <button
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
