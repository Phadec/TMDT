import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CartContext } from '../../contexts/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  
  // Default image if no images available
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : '/images/placeholder.jpg';

  // Check if product is new (less than 3 days old)
  const isNewProduct = useMemo(() => {
    const productDate = new Date(product.createdAt);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - productDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  }, [product.createdAt]);

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent navigating to product detail
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div className={`product-card ${isNewProduct ? 'new-product' : ''}`}>
      <div className="product-image-container">
        <Link to={`/products/${product.id}`} className="product-link">
          <img 
            src={imageUrl} 
            alt={product.title}
            className="product-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/placeholder.jpg';
            }}
          />
          {product.condition && (
            <span className="product-condition">{product.condition}</span>
          )}
          {isNewProduct && (
            <span className="product-badge badge-new">Mới</span>
          )}
          <button 
            className="add-to-cart-btn" 
            onClick={handleAddToCart}
            title="Thêm vào giỏ hàng"
          >
            <i className="fas fa-cart-plus"></i>
          </button>
        </Link>
      </div>
      <div className="product-details">
        <h3 className="product-title">
          <Link to={`/products/${product.id}`}>{product.title}</Link>
        </h3>
        <p className="product-price">{formatCurrency(product.price)}</p>
        <div className="product-meta">
          <span className="product-location">
            <i className="fas fa-map-marker-alt"></i> {product.location || 'Không xác định'}
          </span>
          <span className="product-date">
            <i className="far fa-clock"></i> {formatDate(product.createdAt)}
          </span>
        </div>
        {product.seller && (
          <span className="product-seller">
            <i className="fas fa-user"></i> {product.seller.username || 'Ẩn danh'}
          </span>
        )}
        {product.negotiable && (
          <span className="product-negotiable">
            <i className="fas fa-handshake"></i> Có thương lượng
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
