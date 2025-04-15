import React from 'react';
import './Pagination.css';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  showLoadMore = false,
  loadMoreText = 'Xem thêm',
  loading = false
}) => {
  if (showLoadMore) {
    return (
      <div className="load-more-container">
        <button 
          onClick={() => onPageChange(currentPage + 1)} 
          className="btn-secondary load-more-btn"
          disabled={currentPage >= totalPages - 1 || loading}
        >
          {loading ? 'Đang tải...' : loadMoreText}
        </button>
      </div>
    );
  }

  // Generate page numbers array
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // If total pages is less than max, show all pages
      for (let i = 0; i < totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show first page
      pageNumbers.push(0);
      
      // Get pages around current page
      let startPage = Math.max(1, currentPage - 1);
      let endPage = Math.min(totalPages - 2, currentPage + 1);
      
      // Add ellipsis after first page if needed
      if (startPage > 1) {
        pageNumbers.push('...');
      }
      
      // Add pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 2) {
        pageNumbers.push('...');
      }
      
      // Show last page
      pageNumbers.push(totalPages - 1);
    }
    
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination-container">
      <button 
        className="pagination-button prev-button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0 || loading}
      >
        <i className="fas fa-chevron-left"></i> Trước
      </button>
      
      <div className="pagination-numbers">
        {pageNumbers.map((pageNumber, index) => (
          pageNumber === '...' ? (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
          ) : (
            <button 
              key={pageNumber}
              className={`pagination-number ${pageNumber === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange(pageNumber)}
              disabled={loading}
            >
              {pageNumber + 1}
            </button>
          )
        ))}
      </div>
      
      <button 
        className="pagination-button next-button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1 || loading}
      >
        Tiếp <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  );
};

export default Pagination;
