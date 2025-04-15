import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import ProductCard from '../../components/products/ProductCard';
import './SearchResults.css';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const initialSortBy = searchParams.get('sort') || 'newest';
  const featured = searchParams.get('featured') === 'true';
  const initialMinPrice = searchParams.get('minPrice') || '';
  const initialMaxPrice = searchParams.get('maxPrice') || '';
  const initialCondition = searchParams.get('condition') || 'all';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 12;
  
  // Filters
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [condition, setCondition] = useState(initialCondition);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchProducts = async (page) => {
    setLoading(true);
    
    try {
      // Base query that will handle both regular search and featured products
      let query_string = '';
      let variables = {
        page,
        size: pageSize
      };

      if (query) {
        // If there's a query, use searchProducts
        query_string = `
          query SearchProducts($keyword: String!, $page: Int!, $size: Int!) {
            searchProducts(keyword: $keyword, page: $page, size: $size) {
              id
              title
              price
              images
              location
              createdAt
              condition
              views
              favorites
              sellerUsername
              category {
                name
              }
            }
          }
        `;
        variables.keyword = query;
      } else {
        // If there's no query, use the products query
        query_string = `
          query GetProducts($page: Int!, $size: Int!) {
            products(page: $page, size: $size) {
              id
              title
              price
              images
              location
              createdAt
              condition
              views
              favorites
              sellerUsername
              category {
                name
              }
            }
          }
        `;
      }
      
      const response = await api.graphql(query_string, variables);
      
      // Get products based on which query was used
      let newProducts = [];
      if (query) {
        newProducts = response.data.data.searchProducts || [];
      } else {
        newProducts = response.data.data.products || [];
      }
      
      // Apply client-side filtering for featured products
      if (featured) {
        newProducts = newProducts.filter(product => 
          product.views > 50 || product.favorites > 10
        );
      }
      
      // Apply client-side filtering for price
      if (minPrice) {
        newProducts = newProducts.filter(p => p.price >= parseFloat(minPrice));
      }
      
      if (maxPrice) {
        newProducts = newProducts.filter(p => p.price <= parseFloat(maxPrice));
      }
      
      // Apply client-side filtering for condition
      if (condition !== 'all') {
        newProducts = newProducts.filter(p => p.condition === condition);
      }
      
      // Client-side sorting 
      const sortedProducts = sortClientSide(newProducts, sortBy);
      
      if (page === 0) {
        setProducts(sortedProducts);
      } else {
        setProducts(prev => [...prev, ...sortedProducts]);
      }
      
      setTotalCount(newProducts.length);
      setHasMore(newProducts.length === pageSize);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Client-side sorting function
  const sortClientSide = (products, sortOption) => {
    const productsCopy = [...products];
    
    switch (sortOption) {
      case 'newest':
        return productsCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'price_asc':
        return productsCopy.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return productsCopy.sort((a, b) => b.price - a.price);
      case 'popular':
        return productsCopy.sort((a, b) => b.views - a.views);
      default:
        return productsCopy;
    }
  };

  useEffect(() => {
    setProducts([]);
    setCurrentPage(0);
    setHasMore(true);
    
    // Check if filters are applied
    setIsFilterApplied(
      minPrice !== '' || 
      maxPrice !== '' || 
      condition !== 'all' || 
      sortBy !== 'newest'
    );
    
    fetchProducts(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sortBy, featured]);

  const loadMoreProducts = () => {
    if (!loading && hasMore) {
      fetchProducts(currentPage + 1);
    }
  };

  // Handle price input changes
  const handlePriceChange = (e, setPriceFn) => {
    const value = e.target.value;
    // Only allow numeric input
    if (value === '' || /^\d+$/.test(value)) {
      setPriceFn(value);
    }
  };

  // Apply filters
  const applyFilters = () => {
    setIsFilterApplied(true);
    setProducts([]);
    setCurrentPage(0);
    
    // Update URL with filter parameters
    const params = new URLSearchParams(searchParams);
    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');
    
    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');
    
    if (condition !== 'all') params.set('condition', condition);
    else params.delete('condition');
    
    if (sortBy !== 'newest') params.set('sort', sortBy);
    else params.delete('sort');
    
    setSearchParams(params);
    
    fetchProducts(0);
    setShowMobileFilters(false);
  };

  // Reset all filters
  const resetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setCondition('all');
    setSortBy('newest');
    setIsFilterApplied(false);
    
    // Update URL to remove filter parameters
    const params = new URLSearchParams(searchParams);
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('condition');
    params.delete('sort');
    setSearchParams(params);
    
    fetchProducts(0);
  };

  const getPageTitle = () => {
    if (featured) {
      return 'Sản phẩm nổi bật';
    } else if (query) {
      return `Kết quả tìm kiếm cho "${query}"`;
    } else if (sortBy === 'newest') {
      return 'Sản phẩm mới nhất';
    } else if (sortBy === 'price_asc') {
      return 'Sản phẩm giá thấp đến cao';
    } else if (sortBy === 'price_desc') {
      return 'Sản phẩm giá cao đến thấp';
    } else if (sortBy === 'popular') {
      return 'Sản phẩm phổ biến';
    } else {
      return 'Tất cả sản phẩm';
    }
  };

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  return (
    <div className="category-products-container">
      <div className="search-header">
        <h1>{getPageTitle()}</h1>
        {featured && (
          <p className="feature-description">
            Những sản phẩm được nhiều người quan tâm và yêu thích nhất trên Chợ Việt
          </p>
        )}
      </div>

      <button 
        className="mobile-filter-toggle"
        onClick={toggleMobileFilters}
      >
        <i className="fas fa-filter"></i> Lọc và sắp xếp
      </button>

      <div className="category-content">
        {/* Sidebar filters */}
        <div className={`category-sidebar ${showMobileFilters ? 'show-mobile' : ''}`}>
          <div className="sidebar-header">
            <h3>Bộ lọc tìm kiếm</h3>
            <div>
              {isFilterApplied && (
                <button 
                  className="reset-filters-btn"
                  onClick={resetFilters}
                >
                  <i className="fas fa-undo-alt"></i> Xóa bộ lọc
                </button>
              )}
              <button 
                className="close-mobile-filter"
                onClick={toggleMobileFilters}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div className="category-filters">
            {/* Price range filter */}
            <div className="filter-section">
              <h4 className="filter-title">
                <i className="fas fa-tags"></i> Khoảng giá
              </h4>
              <div className="price-inputs">
                <input
                  type="text"
                  placeholder="Từ"
                  value={minPrice}
                  onChange={(e) => handlePriceChange(e, setMinPrice)}
                  className="price-input"
                />
                <span className="price-separator">-</span>
                <input
                  type="text"
                  placeholder="Đến"
                  value={maxPrice}
                  onChange={(e) => handlePriceChange(e, setMaxPrice)}
                  className="price-input"
                />
              </div>
              <div className="price-quick-filters">
                <button onClick={() => { setMinPrice(''); setMaxPrice('500000'); }}>
                  Dưới 500k
                </button>
                <button onClick={() => { setMinPrice('500000'); setMaxPrice('1000000'); }}>
                  500k - 1 triệu
                </button>
                <button onClick={() => { setMinPrice('1000000'); setMaxPrice('5000000'); }}>
                  1 - 5 triệu
                </button>
                <button onClick={() => { setMinPrice('5000000'); setMaxPrice(''); }}>
                  Trên 5 triệu
                </button>
              </div>
            </div>
            
            {/* Condition filter */}
            <div className="filter-section">
              <h4 className="filter-title">
                <i className="fas fa-star"></i> Tình trạng
              </h4>
              <div className="condition-options">
                <button
                  className={`condition-option ${condition === 'all' ? 'active' : ''}`}
                  onClick={() => setCondition('all')}
                >
                  Tất cả
                </button>
                <button
                  className={`condition-option ${condition === 'NEW' ? 'active' : ''}`}
                  onClick={() => setCondition('NEW')}
                >
                  Mới
                </button>
                <button
                  className={`condition-option ${condition === 'LIKE_NEW' ? 'active' : ''}`}
                  onClick={() => setCondition('LIKE_NEW')}
                >
                  Như mới
                </button>
                <button
                  className={`condition-option ${condition === 'GOOD' ? 'active' : ''}`}
                  onClick={() => setCondition('GOOD')}
                >
                  Tốt
                </button>
                <button
                  className={`condition-option ${condition === 'FAIR' ? 'active' : ''}`}
                  onClick={() => setCondition('FAIR')}
                >
                  Khá
                </button>
              </div>
            </div>
            
            {/* Sort options */}
            <div className="filter-section">
              <h4 className="filter-title">
                <i className="fas fa-sort"></i> Sắp xếp theo
              </h4>
              <div className="sort-options">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá tăng dần</option>
                  <option value="price_desc">Giá giảm dần</option>
                  <option value="popular">Phổ biến nhất</option>
                </select>
              </div>
            </div>
            
            <button 
              className="apply-filter-btn"
              onClick={applyFilters}
            >
              <i className="fas fa-filter"></i> Áp dụng
            </button>
          </div>
        </div>
        
        {/* Main content - product list */}
        <div className="category-main">
          {/* Info bar shows total products and current filters */}
          <div className="category-info-bar">
            <div className="product-count">
              {!loading && (
                <span>
                  <i className="fas fa-shopping-basket"></i>
                  {products.length > 0 
                    ? `Hiển thị ${Math.min(products.length, totalCount)} sản phẩm` 
                    : 'Không tìm thấy sản phẩm phù hợp'}
                </span>
              )}
            </div>
            
            {/* Show applied filters */}
            {isFilterApplied && (
              <div className="applied-filters">
                {minPrice && (
                  <div className="filter-tag">
                    <span>Từ: {parseInt(minPrice).toLocaleString('vi-VN')} ₫</span>
                    <button onClick={() => setMinPrice('')}>×</button>
                  </div>
                )}
                
                {maxPrice && (
                  <div className="filter-tag">
                    <span>Đến: {parseInt(maxPrice).toLocaleString('vi-VN')} ₫</span>
                    <button onClick={() => setMaxPrice('')}>×</button>
                  </div>
                )}
                
                {condition !== 'all' && (
                  <div className="filter-tag">
                    <span>Tình trạng: {
                      condition === 'NEW' ? 'Mới' : 
                      condition === 'LIKE_NEW' ? 'Như mới' :
                      condition === 'GOOD' ? 'Tốt' : 'Khá'
                    }</span>
                    <button onClick={() => setCondition('all')}>×</button>
                  </div>
                )}

                {sortBy !== 'newest' && (
                  <div className="filter-tag">
                    <span>Sắp xếp: {
                      sortBy === 'price_asc' ? 'Giá tăng dần' : 
                      sortBy === 'price_desc' ? 'Giá giảm dần' : 'Phổ biến nhất'
                    }</span>
                    <button onClick={() => setSortBy('newest')}>×</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {loading && products.length === 0 ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>{featured ? "Đang tải sản phẩm nổi bật..." : query ? "Đang tìm kiếm sản phẩm..." : "Đang tải sản phẩm..."}</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p>{error}</p>
              <Link to="/" className="btn-primary">Trở về trang chủ</Link>
            </div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <i className="fas fa-box-open no-products-icon"></i>
              <p>
                {featured 
                  ? "Không có sản phẩm nổi bật nào phù hợp với bộ lọc của bạn"
                  : query 
                    ? `Không tìm thấy sản phẩm phù hợp với từ khóa "${query}"`
                    : "Hiện tại không có sản phẩm nào phù hợp với bộ lọc của bạn"
                }
              </p>
              <div className="no-products-actions">
                <Link to="/" className="btn-primary">
                  <i className="fas fa-home"></i> Khám phá danh mục khác
                </Link>
                {isFilterApplied && (
                  <button className="btn-secondary" onClick={resetFilters}>
                    <i className="fas fa-filter-slash"></i> Xóa bộ lọc
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {hasMore && (
                <div className="load-more-container">
                  <button 
                    onClick={loadMoreProducts} 
                    className="btn-secondary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="loading-spinner-small"></span> Đang tải...
                      </>
                    ) : (
                      <>Xem thêm sản phẩm</>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
