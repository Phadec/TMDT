import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import categoryService from '../../services/categoryService';
import productService from '../../services/productService';
import ProductCard from '../../components/products/ProductCard';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import './ProductsByCategory.css';

const ProductsByCategory = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  // Get filter params from URL
  const initialMinPrice = searchParams.get('minPrice') || '';
  const initialMaxPrice = searchParams.get('maxPrice') || '';
  const initialCondition = searchParams.get('condition') || 'all';
  const initialSort = searchParams.get('sort') || 'newest';
  
  // State
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [allCategories, setAllCategories] = useState([]);
  
  // Filter state
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [condition, setCondition] = useState(initialCondition);
  const [sortBy, setSortBy] = useState(initialSort);
  const [isFilterApplied, setIsFilterApplied] = useState(false);

  const pageSize = 12;

  // Prepare breadcrumb navigation path
  const buildBreadcrumbPath = useCallback(async (category) => {
    if (!category) return [];
    
    const path = [];
    let current = category;
    path.unshift(current);
    
    // Recursively get parent categories to build the full path
    while (current && current.parentId) {
      try {
        const parent = await categoryService.getCategoryById(current.parentId);
        if (parent) {
          path.unshift(parent);
          current = parent;
        } else {
          break;
        }
      } catch (err) {
        console.error('Error fetching parent category:', err);
        break;
      }
    }
    
    return path;
  }, []);

  // Get subcategories for the current category
  const loadSubcategories = useCallback(async (categoryId) => {
    try {
      const childCategories = allCategories.filter(cat => cat.parentId === categoryId);
      setSubcategories(childCategories);
    } catch (err) {
      console.error('Error loading subcategories:', err);
    }
  }, [allCategories]);

  // Get all subcategory IDs recursively for a parent category
  const getAllSubcategoryIds = useCallback((categoryId) => {
    const result = [categoryId];
    
    // Find direct subcategories
    const childCategories = allCategories.filter(cat => cat.parentId === categoryId);
    
    // Recursively add subcategories of subcategories
    if (childCategories.length > 0) {
      childCategories.forEach(child => {
        result.push(...getAllSubcategoryIds(child.id));
      });
    }
    
    return result;
  }, [allCategories]);

  // Apply filters and reload products
  const applyFilters = () => {
    setIsFilterApplied(true);
    setCurrentPage(0);
    setProducts([]);
    
    // Update URL with filter parameters
    const params = new URLSearchParams();
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (condition !== 'all') params.append('condition', condition);
    if (sortBy !== 'newest') params.append('sort', sortBy);
    
    navigate(`/category/${slug}?${params.toString()}`, { replace: true });
    
    // Reload products with filters
    if (slug === 'all') {
      fetchAllProducts(0, true);
    } else if (category) {
      const categoryIds = getAllSubcategoryIds(category.id);
      fetchProductsFromMultipleCategories(categoryIds, 0, true);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setCondition('all');
    setSortBy('newest');
    setIsFilterApplied(false);
    navigate(`/category/${slug}`, { replace: true });
    
    if (slug === 'all') {
      fetchAllProducts(0, true);
    } else if (category) {
      const categoryIds = getAllSubcategoryIds(category.id);
      fetchProductsFromMultipleCategories(categoryIds, 0, true);
    }
  };

  // Fetch all available categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await categoryService.getAvailableCategories();
        setAllCategories(categories);
      } catch (err) {
        console.error('Error loading all categories:', err);
      }
    };
    
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Special handling for "all" slug
        if (slug === 'all') {
          setCategory({
            id: 'all',
            name: 'Tất cả sản phẩm',
            slug: 'all',
            description: 'Tất cả sản phẩm có sẵn trên chợ',
            level: 0
          });
          
          // Use root categories as subcategories for "all"
          const rootCategories = allCategories.filter(cat => !cat.parentId || cat.level === 1);
          setSubcategories(rootCategories);
          
          // Fetch all products
          await fetchAllProducts(0, true);
        } else {
          // Fetch category by slug
          const categoryData = await categoryService.getCategoryBySlug(slug);
          
          if (!categoryData) {
            setError('Danh mục không tồn tại');
            setLoading(false);
            return;
          }
          
          setCategory(categoryData);
          
          // Get parent categories for breadcrumb
          const breadcrumbPath = await buildBreadcrumbPath(categoryData);
          setParentCategories(breadcrumbPath);
          
          // Get subcategories
          await loadSubcategories(categoryData.id);
          
          // Fetch products for the category and all its subcategories
          const categoryIds = getAllSubcategoryIds(categoryData.id);
          await fetchProductsFromMultipleCategories(categoryIds, 0, true);
        }
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    if (slug && allCategories.length > 0) {
      fetchCategoryAndProducts();
    }
  }, [slug, buildBreadcrumbPath, loadSubcategories, allCategories, getAllSubcategoryIds]);

  const fetchAllProducts = async (page, reset = false) => {
    try {
      // Build filter parameters for API
      const filterParams = {
        page,
        size: pageSize,
        sortBy: sortBy
      };
      
      if (minPrice) filterParams.minPrice = parseFloat(minPrice);
      if (maxPrice) filterParams.maxPrice = parseFloat(maxPrice);
      if (condition !== 'all') filterParams.condition = condition;
      
      // Fetch all products with pagination
      const products = await productService.getProducts(page, pageSize);
      let filteredProducts = [...products];
      
      // Client-side filtering for 'all' products
      if (minPrice) {
        filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
      }
      
      if (maxPrice) {
        filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
      }
      
      if (condition !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.condition === condition);
      }
      
      // Apply sorting
      if (sortBy) {
        switch(sortBy) {
          case 'price_asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
          case 'price_desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
          case 'popular':
            filteredProducts.sort((a, b) => b.views - a.views);
            break;
          case 'newest':
          default:
            filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        }
      }
      
      if (reset) {
        setProducts(filteredProducts);
      } else {
        setProducts(prev => [...prev, ...filteredProducts]);
      }
      
      setTotalProducts(filteredProducts.length);
      setHasMore(products.length === pageSize);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching all products:', err);
      setError('Không thể tải danh sách sản phẩm');
    }
  };

  // New function to fetch products from multiple categories
  const fetchProductsFromMultipleCategories = async (categoryIds, page, reset = false) => {
    try {
      setLoading(true);
      
      // Fetch products from each category and combine them
      const productsPromises = categoryIds.map(categoryId => {
        // Build filter parameters for API
        const filterParams = {
          page,
          size: pageSize * 2, // Fetch more per category to ensure we have enough
          categoryId,
          sortBy: sortBy
        };
        
        if (minPrice) filterParams.minPrice = parseFloat(minPrice);
        if (maxPrice) filterParams.maxPrice = parseFloat(maxPrice);
        if (condition !== 'all') filterParams.condition = condition;
        
        return productService.getFilteredProductsByCategory(filterParams);
      });
      
      const productsResults = await Promise.all(productsPromises);
      
      // Combine all products from different categories
      let allProducts = [];
      let totalCount = 0;
      
      productsResults.forEach(result => {
        if (result && result.products) {
          allProducts = [...allProducts, ...result.products];
          totalCount += result.totalCount || 0;
        }
      });
      
      // Remove duplicates (in case a product belongs to multiple categories)
      allProducts = allProducts.filter((product, index, self) =>
        index === self.findIndex((p) => p.id === product.id)
      );
      
      // Apply sorting to combined results
      if (sortBy) {
        switch(sortBy) {
          case 'price_asc':
            allProducts.sort((a, b) => a.price - b.price);
            break;
          case 'price_desc':
            allProducts.sort((a, b) => b.price - a.price);
            break;
          case 'popular':
            allProducts.sort((a, b) => b.views - a.views);
            break;
          case 'newest':
          default:
            allProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        }
      }
      
      // Take only pageSize products for current page
      const paginatedProducts = allProducts.slice(page * pageSize, (page + 1) * pageSize);
      
      if (reset) {
        setProducts(paginatedProducts);
      } else {
        setProducts(prev => [...prev, ...paginatedProducts]);
      }
      
      setTotalProducts(allProducts.length);
      setHasMore(paginatedProducts.length === pageSize && allProducts.length > (page + 1) * pageSize);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching products from multiple categories:', err);
      setError('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreProducts = () => {
    if (loading || !hasMore) return;
    
    if (slug === 'all') {
      fetchAllProducts(currentPage + 1);
    } else if (category) {
      const categoryIds = getAllSubcategoryIds(category.id);
      fetchProductsFromMultipleCategories(categoryIds, currentPage + 1);
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

  if (loading && !products.length) {
    return <Loading message="Đang tải danh mục sản phẩm..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon="exclamation-triangle"
        title="Đã xảy ra lỗi"
        message={error}
        action={<Link to="/" className="btn-primary">Trở về trang chủ</Link>}
      />
    );
  }

  return (
    <div className="category-products-container">
      {category && (
        <div className="category-header">
          <div className="category-breadcrumb">
            <Link to="/">
              <i className="fas fa-home"></i> Trang chủ
            </Link>
            {slug !== 'all' && parentCategories.length > 0 && 
              parentCategories.map((cat, index) => (
                index < parentCategories.length - 1 && (
                  <Link key={cat.id} to={`/category/${cat.slug}`}>
                    {cat.name}
                  </Link>
                )
              ))
            }
            <span className="current-category">{category.name}</span>
          </div>
          
          <h1>{category.name}</h1>
          
          {category.description && (
            <p className="category-description">{category.description}</p>
          )}
          
          {/* Show subcategories if available */}
          {subcategories.length > 0 && (
            <div className="subcategories-nav">
              {subcategories.map(subcat => (
                <Link 
                  key={subcat.id}
                  to={`/category/${subcat.slug}`}
                  className="subcategory-link"
                >
                  {subcat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="category-content">
        {/* Sidebar filters */}
        <div className="category-sidebar">
          <div className="sidebar-header">
            <h3>Bộ lọc tìm kiếm</h3>
            {isFilterApplied && (
              <button 
                className="reset-filters-btn"
                onClick={resetFilters}
              >
                <i className="fas fa-undo-alt"></i> Xóa bộ lọc
              </button>
            )}
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
              {totalProducts > 0 ? (
                <span>Hiển thị {Math.min(products.length, totalProducts)} / {totalProducts} sản phẩm</span>
              ) : (
                <span>Không tìm thấy sản phẩm phù hợp</span>
              )}
            </div>
            
            {/* Show applied filters */}
            {isFilterApplied && (
              <div className="applied-filters">
                {minPrice && maxPrice && (
                  <div className="filter-tag">
                    <span>Giá: {minPrice} - {maxPrice} ₫</span>
                    <button onClick={() => {setMinPrice(''); setMaxPrice('');}}>×</button>
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
              </div>
            )}
          </div>

          {products.length === 0 ? (
            <div className="no-products">
              <i className="fas fa-box-open no-products-icon"></i>
              <p>Không có sản phẩm nào trong danh mục này</p>
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

export default ProductsByCategory;
