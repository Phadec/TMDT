import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import CategoryList from '../components/categories/CategoryList';
import ProductCard from '../components/products/ProductCard';
import { formatCurrency } from '../utils/formatters';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryProductCounts, setCategoryProductCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [dealOfDay, setDealOfDay] = useState(null);
  const pageSize = 8;

  // Countdown timer for deal of the day
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  const timerRef = useRef(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Using Promise.allSettled to fetch all data in parallel
        const [productsResult, categoriesResult, featuredResult, productCountsResult] = await Promise.allSettled([
          productService.getProducts(0, pageSize),
          categoryService.getAvailableCategories(),
          productService.getProducts(0, 4), // Using regular products as featured for now
          categoryService.getCategoryProductCounts() // New API call to get product counts
        ]);
        
        console.log('Products result:', productsResult);
        
        if (productsResult.status === 'fulfilled') {
          // Products are already filtered for "SOLD" status in productService
          const activeProducts = productsResult.value || [];
          
          console.log('Active products:', activeProducts);
          
          // Make sure each product has a properly defined category object
          const productsWithCategories = activeProducts.map(product => {
            if (!product.category) {
              product.category = { id: product.categoryId, name: "Unknown Category" };
            }
            return product;
          });
          
          setProducts(productsWithCategories);
          setHasMore(activeProducts.length === pageSize);
          
          // Set deal of the day (first product with discount that's not sold)
          const discountedProduct = activeProducts.find(product => product.discount > 0);
          if (discountedProduct) {
            setDealOfDay(discountedProduct);
          } else if (activeProducts.length > 0) {
            // If no discounted product, just use the first active one
            setDealOfDay(activeProducts[0]);
          }
        } else {
          console.error('Error fetching products:', productsResult.reason);
          setError('Could not load products');
        }
        
        if (categoriesResult.status === 'fulfilled') {
          setCategories(categoriesResult.value || []);
        }
        
        if (featuredResult.status === 'fulfilled') {
          // Featured products are already filtered for "SOLD" status in productService
          setFeaturedProducts(featuredResult.value || []);
        }
        
        if (productCountsResult.status === 'fulfilled') {
          setCategoryProductCounts(productCountsResult.value || {});
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Could not load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
    
    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Reset timer to 24 hours when it reaches zero
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const loadMoreProducts = async () => {
    if (loading || !hasMore) return;
    
    try {
      setLoading(true);
      const nextPage = currentPage + 1;
      const moreProducts = await productService.getProducts(nextPage, pageSize);
      
      // Make sure each product has a properly defined category object
      const productsWithCategories = moreProducts.map(product => {
        if (!product.category) {
          product.category = { id: product.categoryId, name: "Unknown Category" };
        }
        return product;
      });
      
      setProducts(prev => [...prev, ...productsWithCategories]);
      setCurrentPage(nextPage);
      setHasMore(moreProducts.length === pageSize);
    } catch (error) {
      console.error('Error loading more products:', error);
      setError('Không thể tải thêm sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (value) => {
    return value < 10 ? `0${value}` : value;
  };

  // Categories for filter buttons - take first 6 categories plus "All"
  const topCategories = [{ id: 'all', name: 'Tất cả' }].concat(
    categories.slice(0, 6).map(cat => ({ id: cat.id, name: cat.name }))
  );

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Chợ Việt - Mua Bán Trực Tuyến</h1>
          <p>Kết nối người mua và người bán với hàng triệu sản phẩm đa dạng và chất lượng</p>
          
          <div className="hero-buttons">
            <Link to="/create-product" className="btn-primary">
              <i className="fas fa-plus-circle"></i> Đăng tin ngay
            </Link>
            <Link to="/category/all" className="btn-secondary">
              <i className="fas fa-th-large"></i> Khám phá danh mục
            </Link>
          </div>
        </div>
        <div className="hero-overlay"></div>
      </section>

      {/* Service Features Section */}
      <section className="services-section">
        <div className="services-container">
          <div className="service-item">
            <div className="service-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div className="service-content">
              <h3>Mua Sắm An Toàn</h3>
              <p>Bảo vệ người mua & người bán</p>
            </div>
          </div>
          
          <div className="service-item">
            <div className="service-icon">
              <i className="fas fa-handshake"></i>
            </div>
            <div className="service-content">
              <h3>Giao Dịch Trực Tiếp</h3>
              <p>Không qua trung gian, giá tốt hơn</p>
            </div>
          </div>
          
          <div className="service-item">
            <div className="service-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="service-content">
              <h3>Sản Phẩm Đa Dạng</h3>
              <p>Nhiều lựa chọn với mọi nhu cầu</p>
            </div>
          </div>
          
          <div className="service-item">
            <div className="service-icon">
              <i className="fas fa-headset"></i>
            </div>
            <div className="service-content">
              <h3>Hỗ Trợ 24/7</h3>
              <p>Đội ngũ CSKH luôn sẵn sàng</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Now more compact */}
      <section className="categories-section">
        <div className="section-header">
          <h2 className="section-title">Danh Mục Nổi Bật</h2>
          <Link to="/category/all" className="see-all">
            Xem tất cả <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
        <CategoryList 
          categories={categories} 
          productCounts={categoryProductCounts} 
          limit={8} 
          compact={true} 
        />
      </section>
      
      {/* Deal of the Day */}
      {dealOfDay && (
        <section className="deal-of-day-section">
          <div className="section-header">
            <h2 className="section-title">Ưu Đãi Trong Ngày</h2>
            <div className="countdown-timer">
              <div className="countdown-item">
                <span className="countdown-value">{formatTime(timeLeft.hours)}</span>
                <span className="countdown-label">Giờ</span>
              </div>
              <div className="countdown-separator">:</div>
              <div className="countdown-item">
                <span className="countdown-value">{formatTime(timeLeft.minutes)}</span>
                <span className="countdown-label">Phút</span>
              </div>
              <div className="countdown-separator">:</div>
              <div className="countdown-item">
                <span className="countdown-value">{formatTime(timeLeft.seconds)}</span>
                <span className="countdown-label">Giây</span>
              </div>
            </div>
          </div>
          
          <div className="deal-container">
            <div className="deal-image">
              <img 
                src={dealOfDay.images && dealOfDay.images.length > 0 ? dealOfDay.images[0] : '/images/placeholder.jpg'} 
                alt={dealOfDay.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/placeholder.jpg';
                }}
              />
              {dealOfDay.discount > 0 && (
                <div className="deal-discount">-{dealOfDay.discount}%</div>
              )}
            </div>
            <div className="deal-content">
              <h3 className="deal-title">{dealOfDay.title}</h3>
              <div className="deal-price-container">
                <div className="deal-price">{formatCurrency(dealOfDay.price)}</div>
                {dealOfDay.discount > 0 && (
                  <div className="deal-original-price">
                    {formatCurrency(dealOfDay.price * (100 + dealOfDay.discount) / 100)}
                  </div>
                )}
              </div>
              <div className="deal-description">
                {dealOfDay.description && dealOfDay.description.length > 150 
                  ? `${dealOfDay.description.substring(0, 150)}...` 
                  : dealOfDay.description}
              </div>
              <div className="deal-actions">
                <Link to={`/products/${dealOfDay.id}`} className="btn-primary">
                  Xem chi tiết
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="featured-products-section">
          <div className="section-header">
            <h2 className="section-title">Sản Phẩm Nổi Bật</h2>
            <Link to="/search?featured=true" className="see-all">
              Xem tất cả <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
          
          <div className="featured-products-slider">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} featured />
            ))}
          </div>
        </section>
      )}

      {/* Recent Products with Category Filters */}
      <section className="recent-products-section">
        <div className="section-header">
          <h2 className="section-title">Sản Phẩm Mới Đăng</h2>
          <Link to="/search?sort=newest" className="see-all">
            Xem tất cả <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
        
        <div className="home-category-filters">
          {topCategories.map(category => (
            <button
              key={category.id}
              className={`category-filter-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {loading && products.length === 0 ? (
          <div className="loading-container">
            <div className="loader"></div>
            <p>Đang tải sản phẩm...</p>
          </div>
        ) : error && products.length === 0 ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="no-products">
            <i className="fas fa-box-open empty-icon"></i>
            <p>Chưa có sản phẩm nào được đăng.</p>
            <Link to="/create-product" className="btn-primary">
              <i className="fas fa-plus-circle"></i> Đăng sản phẩm đầu tiên
            </Link>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {products
                .filter(product => activeCategory === 'all' || 
                  (product.category && product.category.id === activeCategory) || 
                  (product.categoryId === activeCategory))
                .map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
            
            {hasMore && (
              <div className="load-more-container">
                <button 
                  onClick={loadMoreProducts} 
                  className="btn-load-more"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="btn-spinner"></div>
                      <span>Đang tải...</span>
                    </>
                  ) : (
                    <>
                      <span>Xem thêm sản phẩm</span>
                      <i className="fas fa-chevron-down"></i>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2 className="section-title">Khách Hàng Nói Gì Về Chúng Tôi</h2>
        </div>
        
        <div className="testimonials-container">
          <div className="testimonial-card">
            <div className="testimonial-avatar">
              <img src="/images/default-avatar.png" alt="Nguyễn Văn A" />
            </div>
            <div className="testimonial-rating">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
            </div>
            <p className="testimonial-quote">
              "Tôi đã bán được rất nhiều sản phẩm trên Chợ Việt. Giao diện dễ sử dụng và kết nối trực tiếp với người mua!"
            </p>
            <div className="testimonial-author">
              <h4>Nguyễn Văn A</h4>
              <p>Người bán từ TP.HCM</p>
            </div>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-avatar">
              <img src="/images/default-avatar.png" alt="Trần Thị B" />
            </div>
            <div className="testimonial-rating">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
            </div>
            <p className="testimonial-quote">
              "Chợ Việt giúp tôi tìm được những sản phẩm cũ chất lượng tốt với giá cả phải chăng. Rất hài lòng với trải nghiệm mua sắm!"
            </p>
            <div className="testimonial-author">
              <h4>Trần Thị B</h4>
              <p>Người mua từ Hà Nội</p>
            </div>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-avatar">
              <img src="/images/default-avatar.png" alt="Lê Văn C" />
            </div>
            <div className="testimonial-rating">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star-half-alt"></i>
            </div>
            <p className="testimonial-quote">
              "Nền tảng an toàn và đáng tin cậy. Tôi đã tìm thấy những món đồ độc đáo mà không thể tìm thấy ở nơi khác."
            </p>
            <div className="testimonial-author">
              <h4>Lê Văn C</h4>
              <p>Người mua từ Đà Nẵng</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
