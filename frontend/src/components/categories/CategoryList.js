import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './CategoryList.css';

const CategoryList = ({ categories, productCounts, limit, showSubcategories = false, compact = false }) => {
  const [expanded, setExpanded] = useState({});

  if (!categories || categories.length === 0) {
    return (
      <div className="category-list-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải danh mục...</p>
      </div>
    );
  }

  // Get root categories (level 1 or no parent)
  const rootCategories = categories.filter(
    category => category.level === 1 || !category.parentId
  );

  // Limit categories if a limit is specified
  const displayedCategories = limit ? rootCategories.slice(0, limit) : rootCategories;

  // Get subcategories by parent ID
  const getSubcategories = (parentId) => {
    return categories.filter(category => category.parentId === parentId);
  };

  // Toggle subcategory expansion
  const toggleExpand = (categoryId) => {
    setExpanded(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  return (
    <div className={`category-list ${compact ? 'category-list-compact' : ''}`}>
      {displayedCategories.map((category) => (
        <div key={category.id} className="category-item-container">
          <Link 
            to={`/category/${category.slug}`} 
            className="category-item"
          >
            <div className="category-image">
              <img 
                src={category.imageUrl || '/images/category-placeholder.jpg'} 
                alt={category.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/category-placeholder.jpg';
                }}
              />
            </div>
            <h3 className="category-name">{category.name}</h3>
            {productCounts && (
              <span className="category-count">
                {productCounts[category.id] || 0} sản phẩm
              </span>
            )}
          </Link>
          
          {showSubcategories && getSubcategories(category.id).length > 0 && (
            <>
              <button 
                className={`subcategory-toggle ${expanded[category.id] ? 'expanded' : ''}`}
                onClick={() => toggleExpand(category.id)}
                aria-label={expanded[category.id] ? "Thu gọn danh mục con" : "Mở rộng danh mục con"}
              >
                <i className={`fas fa-chevron-${expanded[category.id] ? 'up' : 'down'}`}></i>
              </button>
              
              {expanded[category.id] && (
                <div className="subcategory-list">
                  {getSubcategories(category.id).map(subcat => (
                    <Link 
                      key={subcat.id} 
                      to={`/category/${subcat.slug}`}
                      className="subcategory-item"
                    >
                      <span className="subcategory-name">{subcat.name}</span>
                      {productCounts && (
                        <span className="subcategory-count">
                          {productCounts[subcat.id] || 0}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default CategoryList;
