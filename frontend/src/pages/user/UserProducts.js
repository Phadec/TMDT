import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import productService from '../../services/productService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { toast } from 'react-toastify';
import './UserProducts.css';

const UserProducts = () => {
  const { currentUser } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('ACTIVE');
  
  const fetchUserProducts = async (status) => {
    if (!currentUser) return;
    
    setLoading(true);
    
    try {
      const userProducts = await productService.getSellerProducts(currentUser.username, status);
      setProducts(userProducts);
    } catch (error) {
      console.error('Error fetching user products:', error);
      toast.error('Không thể tải danh sách sản phẩm của bạn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUserProducts(activeStatus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, activeStatus]);

  const handleStatusChange = (status) => {
    setActiveStatus(status);
  };

  const handleToggleStatus = async (productId, newStatus) => {
    try {
      await productService.toggleProductStatus(productId, newStatus);
      
      // Cập nhật trạng thái sản phẩm trong danh sách
      setProducts(products.map(product => {
        if (product.id === productId) {
          return { ...product, status: newStatus };
        }
        return product;
      }));
      
      toast.success(
        newStatus === 'ACTIVE' 
          ? 'Sản phẩm đã được kích hoạt' 
          : newStatus === 'INACTIVE' 
          ? 'Sản phẩm đã được tạm khóa'
          : 'Sản phẩm đã được đánh dấu đã bán'
      );
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast.error('Không thể thay đổi trạng thái sản phẩm');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      return;
    }
    
    try {
      await productService.deleteProduct(productId);
      
      // Xóa sản phẩm khỏi danh sách
      setProducts(products.filter(product => product.id !== productId));
      
      toast.success('Sản phẩm đã được xóa thành công');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Không thể xóa sản phẩm');
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Đang tải sản phẩm của bạn...</p>
      </div>
    );
  }

  return (
    <div className="user-products-container">
      <div className="user-products-header">
        <h1>Sản phẩm của tôi</h1>
        <Link to="/create-product" className="btn-primary">
          <i className="fas fa-plus"></i> Đăng sản phẩm mới
        </Link>
      </div>
      
      <div className="product-tabs">
        <button 
          className={`tab-button ${activeStatus === 'ACTIVE' ? 'active' : ''}`}
          onClick={() => handleStatusChange('ACTIVE')}
        >
          Đang hoạt động
        </button>
        <button 
          className={`tab-button ${activeStatus === 'INACTIVE' ? 'active' : ''}`}
          onClick={() => handleStatusChange('INACTIVE')}
        >
          Tạm khóa
        </button>
        <button 
          className={`tab-button ${activeStatus === 'SOLD' ? 'active' : ''}`}
          onClick={() => handleStatusChange('SOLD')}
        >
          Đã bán
        </button>
      </div>
      
      {products.length === 0 ? (
        <div className="no-products">
          <p>Bạn chưa có sản phẩm nào {activeStatus === 'ACTIVE' ? 'đang hoạt động' : activeStatus === 'INACTIVE' ? 'tạm khóa' : 'đã bán'}</p>
          {activeStatus !== 'ACTIVE' && (
            <button 
              className="btn-secondary"
              onClick={() => handleStatusChange('ACTIVE')}
            >
              Xem sản phẩm đang hoạt động
            </button>
          )}
        </div>
      ) : (
        <div className="user-products-list">
          {products.map(product => (
            <div key={product.id} className="user-product-item">
              <div className="product-image">
                <img 
                  src={product.images && product.images.length > 0 ? product.images[0] : '/images/placeholder.jpg'} 
                  alt={product.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
              </div>
              
              <div className="product-info">
                <h3 className="product-title">
                  <Link to={`/products/${product.id}`}>{product.title}</Link>
                </h3>
                
                <div className="product-meta">
                  <span className="product-price">{formatCurrency(product.price)}</span>
                  <span className="product-category">{product.category?.name}</span>
                  <span className="product-date">{formatDate(product.createdAt)}</span>
                </div>
                
                <div className="product-stats">
                  <span className="product-views">
                    <i className="fas fa-eye"></i> {product.views} lượt xem
                  </span>
                  <span className="product-favorites">
                    <i className="fas fa-heart"></i> {product.favorites} yêu thích
                  </span>
                </div>
              </div>
              
              <div className="product-actions">
                <Link to={`/edit-product/${product.id}`} className="btn-secondary">
                  <i className="fas fa-edit"></i> Sửa
                </Link>
                
                {activeStatus === 'ACTIVE' && (
                  <button 
                    className="btn-secondary"
                    onClick={() => handleToggleStatus(product.id, 'INACTIVE')}
                  >
                    <i className="fas fa-pause"></i> Tạm khóa
                  </button>
                )}
                
                {activeStatus === 'INACTIVE' && (
                  <button 
                    className="btn-secondary"
                    onClick={() => handleToggleStatus(product.id, 'ACTIVE')}
                  >
                    <i className="fas fa-play"></i> Kích hoạt
                  </button>
                )}
                
                {activeStatus !== 'SOLD' && (
                  <button 
                    className="btn-secondary"
                    onClick={() => handleToggleStatus(product.id, 'SOLD')}
                  >
                    <i className="fas fa-check-circle"></i> Đánh dấu đã bán
                  </button>
                )}
                
                <button 
                  className="btn-danger"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  <i className="fas fa-trash"></i> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProducts;
