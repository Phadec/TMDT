import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { CartContext } from '../../contexts/CartContext';
import productService from '../../services/productService';
import { formatCurrency, formatDate, formatCondition } from '../../utils/formatters';
import { toast } from 'react-toastify';
import './ProductDetail.css';
import ProductReviews from '../../components/product/ProductReviews';
import api from '../../services/api';

const incrementProductViews = async (productId) => {
  try {
    const response = await api.graphql(`
      mutation IncrementProductViews($id: ID!) {
        incrementProductViews(id: $id) {
          id
          views
        }
      }
    `, { id: productId });
    
    return response.data?.data?.incrementProductViews?.views;
  } catch (error) {
    console.error('Error incrementing product views:', error);
    return null;
  }
};

const toggleProductFavorite = async (productId) => {
  try {
    const response = await api.graphql(`
      mutation ToggleProductFavorite($id: ID!) {
        toggleProductFavorite(id: $id) {
          id
          favorites
          isFavorited
        }
      }
    `, { id: productId });
    
    return response.data?.data?.toggleProductFavorite;
  } catch (error) {
    console.error('Error toggling product favorite:', error);
    return null;
  }
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  
  const { currentUser } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await api.graphql(`
          query GetProductDetails($id: ID!) {
            product(id: $id) {
              id
              title
              description
              price
              condition
              images
              location
              sellerUsername
              negotiable
              status
              createdAt
              updatedAt
              views
              favorites
              category {
                id
                name
              }
              seller {
                id
                firstName
                lastName
                username
                avatar
              }
              quantity
              isFavorited
            }
          }
        `, { id });
        
        const productData = response.data?.data?.product;
        if (productData) {
          setProduct(productData);
          setIsFavorited(productData.isFavorited);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  useEffect(() => {
    if (product) {
      incrementProductViews(product.id)
        .then(viewCount => {
          if (viewCount !== null) {
            setProduct(prev => ({...prev, views: viewCount}));
          }
        });
    }
  }, [product?.id]);

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = async () => {
    if (!currentUser) {
      toast.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      navigate('/login');
      return;
    }
    
    setAddingToCart(true);
    
    try {
      await addToCart(product, quantity);
      toast.success('Đã thêm sản phẩm vào giỏ hàng');
      
      setTimeout(() => {
        setAddingToCart(false);
      }, 1000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Không thể thêm sản phẩm vào giỏ hàng');
      setAddingToCart(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      return;
    }
    
    try {
      await productService.deleteProduct(id);
      toast.success('Sản phẩm đã được xóa thành công');
      navigate('/my-products');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const handleToggleFavorite = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    
    const result = await toggleProductFavorite(product.id);
    if (result) {
      setProduct(prev => ({...prev, favorites: result.favorites}));
      setIsFavorited(result.isFavorited);
    }
  };

  const isOwner = currentUser && product && currentUser.username === product.sellerUsername;

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = process.env.PUBLIC_URL + '/images/placeholder.jpg';
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Đã xảy ra lỗi</h2>
        <p>{error}</p>
        <Link to="/" className="btn-primary">Trở về trang chủ</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container">
        <h2>Không tìm thấy sản phẩm</h2>
        <p>Sản phẩm này không tồn tại hoặc đã bị xóa.</p>
        <Link to="/" className="btn-primary">Trở về trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="product-detail-header">
        <h1 className="product-detail-title">{product.title}</h1>
        <div className="product-detail-meta">
          <div className="product-meta-item">
            <i className="fas fa-calendar-alt"></i>
            <span>Đăng ngày: {formatDate(product.createdAt)}</span>
          </div>
          <div className="product-meta-item">
            <i className="fas fa-eye"></i>
            <span>{product.views || 0} lượt xem</span>
          </div>
          <div 
            className="product-meta-item favorite-item" 
            onClick={handleToggleFavorite}
            title={isFavorited ? "Bỏ yêu thích" : "Yêu thích sản phẩm này"}
          >
            <i className={`fas fa-heart ${isFavorited ? 'favorited' : ''}`}></i>
            <span>{product.favorites || 0} yêu thích</span>
          </div>
        </div>
      </div>

      <div className="product-detail-main">
        <div className="product-detail-gallery">
          <div className="product-detail-main-image">
            <img 
              src={product.images && product.images.length > 0 ? product.images[selectedImage] : process.env.PUBLIC_URL + '/images/placeholder.jpg'}
              alt={product.title} 
              onError={handleImageError}
            />
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="product-detail-thumbnails">
              {product.images.map((image, index) => (
                <div 
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img 
                    src={image} 
                    alt={`${product.title} - ảnh ${index + 1}`} 
                    onError={handleImageError}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="product-detail-info">
          <div className="product-detail-price-container">
            <div className="product-detail-price">{formatCurrency(product.price)}</div>
            {product.negotiable && <span className="negotiable-badge">Có thể thương lượng</span>}
          </div>
          
          <div className="product-detail-attributes">
            <div className="attribute">
              <span className="attribute-label">Tình trạng:</span>
              <span className="attribute-value">{formatCondition(product.condition)}</span>
            </div>
            
            <div className="attribute">
              <span className="attribute-label">Danh mục:</span>
              <span className="attribute-value">
                <Link to={`/category/${product.category?.slug}`}>
                  {product.category?.name}
                </Link>
              </span>
            </div>
            
            <div className="attribute">
              <span className="attribute-label">Địa điểm:</span>
              <span className="attribute-value">{product.location}</span>
            </div>
            
            <div className="attribute">
              <span className="attribute-label">Số lượng có sẵn:</span>
              <span className="attribute-value stock-quantity">
                {product.quantity}
                {product.quantity > 0 ? (
                  <span className="in-stock">Còn hàng</span>
                ) : (
                  <span className="out-of-stock">Hết hàng</span>
                )}
              </span>
            </div>
          </div>
          
          <div className="product-detail-actions">
            {!isOwner && product.quantity > 0 && (
              <>
                <div className="action-buttons-row">
                  <button 
                    className="btn-primary contact-seller-btn"
                    onClick={() => {
                      toast.info(`Liên hệ: ${product.seller?.phoneNumber || 'Chưa có thông tin liên hệ'}`);
                    }}
                  >
                    <i className="fa fa-phone"></i> Liên hệ người bán
                  </button>
                  
                  <button 
                    className={`btn-favorite ${isFavorited ? 'favorited' : ''}`}
                    onClick={handleToggleFavorite}
                  >
                    <i className="fas fa-heart"></i>
                    {isFavorited ? ' Đã yêu thích' : ' Yêu thích'}
                  </button>
                </div>
                
                <div className="add-to-cart-section">
                  <div className="quantity-selector">
                    <span className="quantity-label">Số lượng:</span>
                    <div className="quantity-control">
                      <button 
                        className="quantity-btn"
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                        aria-label="Giảm số lượng"
                      >
                        <i className="fas fa-minus"></i>
                      </button>
                      <input 
                        type="number" 
                        min="1" 
                        max={product.quantity}
                        value={quantity} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setQuantity(Math.min(val, product.quantity));
                        }}
                        className="quantity-input"
                        aria-label="Số lượng sản phẩm"
                      />
                      <button 
                        className="quantity-btn"
                        onClick={increaseQuantity}
                        disabled={quantity >= product.quantity}
                        aria-label="Tăng số lượng"
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    className={`cart-button ${addingToCart ? 'adding' : ''}`}
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                  >
                    <span className="cart-button-icon">
                      <i className={`fas ${addingToCart ? 'fa-check' : 'fa-shopping-cart'}`}></i>
                    </span>
                    <span className="cart-button-text">
                      {addingToCart ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}
                    </span>
                  </button>
                </div>
                
                <div className="cart-summary">
                  <div className="product-total">
                    <span>Tổng cộng:</span>
                    <span className="total-price">{formatCurrency(product.price * quantity)}</span>
                  </div>
                  <Link to="/cart" className="view-cart-link">
                    <i className="fas fa-arrow-right"></i> Xem giỏ hàng
                  </Link>
                </div>
              </>
            )}
            
            {!isOwner && product.quantity <= 0 && (
              <div className="out-of-stock-message">
                <i className="fas fa-exclamation-circle"></i>
                <span>Sản phẩm này hiện đã hết hàng</span>
              </div>
            )}
            
            {isOwner && (
              <>
                <Link 
                  to={`/edit-product/${product.id}`} 
                  className="btn-secondary edit-product-btn"
                >
                  <i className="fa fa-edit"></i> Sửa tin đăng
                </Link>
                
                <button 
                  className="btn-danger delete-product-btn"
                  onClick={handleDeleteProduct}
                >
                  <i className="fa fa-trash"></i> Xóa tin đăng
                </button>
              </>
            )}
          </div>
          
          <div className="seller-info">
            <h3>Thông tin người bán</h3>
            <div className="seller-profile">
              <div className="seller-avatar">
                <img 
                  src={product.seller?.avatar || process.env.PUBLIC_URL + '/images/default-avatar.png'} 
                  alt={product.seller?.username || product.sellerUsername} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = process.env.PUBLIC_URL + '/images/default-avatar.png';
                  }}
                />
              </div>
              <div className="seller-details">
                <div className="seller-name">
                  {product.seller?.firstName} {product.seller?.lastName}
                </div>
                <div className="seller-username">
                  @{product.seller?.username || product.sellerUsername}
                </div>
                <Link to={`/user/${product.seller?.username || product.sellerUsername}`} className="view-profile-link">
                  Xem trang cá nhân
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="product-detail-description">
        <h3>Mô tả sản phẩm</h3>
        <div className="description-content">
          {product.description.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>

      <ProductReviews productId={product.id} />
    </div>
  );
};

export default ProductDetail;
