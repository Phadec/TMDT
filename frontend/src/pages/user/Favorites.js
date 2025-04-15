import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import ProductCard from '../../components/products/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import favoriteService from '../../services/favoriteService';
import './Favorites.css';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchFavorites();
    }
  }, [isAuthenticated, currentUser]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const favoriteProducts = await favoriteService.getUserFavorites();
      setFavorites(favoriteProducts);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError('Không thể tải danh sách sản phẩm yêu thích. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId) => {
    try {
      await favoriteService.toggleFavorite(productId);
      
      // Remove the product from the local state
      setFavorites(favorites.filter(product => product.id !== productId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="user-favorites-container not-authenticated">
        <div className="user-not-authenticated-content">
          <i className="fas fa-heart-broken"></i>
          <h2>Bạn chưa đăng nhập</h2>
          <p>Vui lòng đăng nhập để xem danh sách sản phẩm yêu thích của bạn.</p>
          <Link to="/login" className="user-favorites-btn-login">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="user-favorites-container">
      <div className="user-favorites-header">
        <h1>Sản phẩm yêu thích</h1>
        <p>Danh sách các sản phẩm bạn đã đánh dấu yêu thích</p>
      </div>

      {loading ? (
        <div className="user-favorites-loading">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="user-favorites-error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="user-empty-favorites">
          <i className="far fa-heart"></i>
          <h3>Chưa có sản phẩm yêu thích</h3>
          <p>Bạn chưa thêm sản phẩm nào vào danh sách yêu thích.</p>
          <Link to="/category/all" className="user-browse-products-btn">
            <i className="fas fa-search"></i> Tìm sản phẩm ngay
          </Link>
        </div>
      ) : (
        <div className="user-favorites-grid">
          {favorites.map(product => (
            <div key={product.id} className="user-favorite-item">
              <ProductCard product={product} />
              <button 
                className="user-remove-favorite-btn" 
                onClick={() => handleRemoveFavorite(product.id)}
                title="Xóa khỏi danh sách yêu thích"
              >
                <i className="fas fa-heart-broken"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
