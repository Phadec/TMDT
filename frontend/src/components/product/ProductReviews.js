import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/formatters';
import reviewService from '../../services/reviewService';
import './ProductReviews.css';

const StarRating = ({ rating, setRating = null, disabled = false }) => {
  const stars = [1, 2, 3, 4, 5];
  
  return (
    <div className="star-rating">
      {stars.map((star) => (
        <span 
          key={star}
          className={`star ${star <= rating ? 'filled' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={() => !disabled && setRating && setRating(star)}
        >
          <i className={`fas fa-star`}></i>
        </span>
      ))}
    </div>
  );
};

const ReviewItem = ({ review, isUserReview, onEditReview, onDeleteReview }) => {
  return (
    <div className="review-item">
      <div className="review-header">
        <div className="reviewer-info">
          <div className="reviewer-avatar">
            {review.userAvatar ? (
              <img src={review.userAvatar} alt={review.userFullName} />
            ) : (
              <i className="fas fa-user-circle"></i>
            )}
          </div>
          <div className="reviewer-details">
            <div className="reviewer-name">
              {review.userFullName}
              {review.verified && (
                <span className="verified-badge">
                  <i className="fas fa-check-circle"></i> Đã mua hàng
                </span>
              )}
            </div>
            <div className="review-date">{formatDate(review.createdAt)}</div>
          </div>
        </div>
        <div className="review-rating">
          <StarRating rating={review.rating} disabled={true} />
        </div>
      </div>
      
      <div className="review-content">
        <p>{review.comment}</p>
      </div>
      
      {review.sellerReply && (
        <div className="seller-reply">
          <div className="seller-reply-header">
            <i className="fas fa-store"></i> Phản hồi từ người bán:
          </div>
          <div className="seller-reply-content">
            <p>{review.sellerReply}</p>
            <div className="seller-reply-date">{formatDate(review.sellerReplyAt)}</div>
          </div>
        </div>
      )}
      
      {isUserReview && (
        <div className="review-actions">
          <button className="btn-edit" onClick={() => onEditReview(review)}>
            <i className="fas fa-edit"></i> Sửa
          </button>
          <button className="btn-delete" onClick={() => onDeleteReview(review.id)}>
            <i className="fas fa-trash"></i> Xóa
          </button>
        </div>
      )}
    </div>
  );
};

const ProductReviews = ({ productId }) => {
  const { currentUser } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
    fiveStarCount: 0,
    fourStarCount: 0,
    threeStarCount: 0,
    twoStarCount: 0,
    oneStarCount: 0
  });
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    rating: 5,
    comment: ''
  });
  const [editingReview, setEditingReview] = useState(null);
  
  useEffect(() => {
    fetchReviews();
    fetchReviewSummary();
    
    if (currentUser) {
      checkCanReview();
    }
  }, [productId, currentUser]);
  
  const fetchReviews = async () => {
    try {
      const reviewsData = await reviewService.getProductReviews(productId);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching product reviews:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchReviewSummary = async () => {
    try {
      const summaryData = await reviewService.getReviewSummary(productId);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching review summary:', error);
    }
  };
  
  const checkCanReview = async () => {
    try {
      const canReviewResult = await reviewService.canReviewProduct(productId);
      setCanReview(canReviewResult);
    } catch (error) {
      console.error('Error checking if user can review:', error);
      setCanReview(false);
    }
  };
  
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Vui lòng đăng nhập để đánh giá sản phẩm.');
      return;
    }
    
    try {
      setLoading(true);
      
      if (editingReview) {
        // Update existing review
        const updatedReview = await reviewService.updateReview(
          editingReview.id,
          reviewFormData.rating,
          reviewFormData.comment
        );
        
        if (updatedReview) {
          // Update the reviews array
          setReviews(prevReviews => 
            prevReviews.map(review => 
              review.id === editingReview.id ? 
                { ...review, 
                  rating: reviewFormData.rating, 
                  comment: reviewFormData.comment,
                  updatedAt: updatedReview.updatedAt 
                } : review
            )
          );
          
          // Reset form
          setReviewFormData({ rating: 5, comment: '' });
          setEditingReview(null);
          setShowReviewForm(false);
          
          // Refresh summary
          fetchReviewSummary();
        }
      } else {
        // Create new review
        const newReview = await reviewService.createReview(
          productId,
          reviewFormData.rating,
          reviewFormData.comment
        );
        
        if (newReview) {
          // Add the new review to the reviews array
          setReviews(prevReviews => [newReview, ...prevReviews]);
          
          // Reset form
          setReviewFormData({ rating: 5, comment: '' });
          setShowReviewForm(false);
          
          // User can't review again
          setCanReview(false);
          
          // Refresh summary
          fetchReviewSummary();
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(`Có lỗi xảy ra: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditReview = (review) => {
    setReviewFormData({
      rating: review.rating,
      comment: review.comment
    });
    setEditingReview(review);
    setShowReviewForm(true);
  };
  
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const success = await reviewService.deleteReview(reviewId);
      
      if (success) {
        // Remove the review from the reviews array
        setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
        
        // User can review again
        setCanReview(true);
        
        // Refresh summary
        fetchReviewSummary();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert(`Có lỗi xảy ra: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const calculatePercentage = (count) => {
    if (summary.totalReviews === 0) return 0;
    return Math.round((count / summary.totalReviews) * 100);
  };
  
  return (
    <div className="product-reviews-section">
      <h2 className="section-title">Đánh giá sản phẩm</h2>
      
      <div className="review-summary">
        <div className="review-summary-left">
          <div className="average-rating">
            <div className="average-rating-value">{summary.averageRating.toFixed(1)}</div>
            <div className="average-rating-stars">
              <StarRating rating={Math.round(summary.averageRating)} disabled={true} />
            </div>
            <div className="total-reviews">{summary.totalReviews} đánh giá</div>
          </div>
        </div>
        
        <div className="review-summary-right">
          <div className="rating-bars">
            <div className="rating-bar-item">
              <span className="rating-label">5 sao</span>
              <div className="rating-bar">
                <div className="rating-bar-fill" style={{ width: `${calculatePercentage(summary.fiveStarCount)}%` }}></div>
              </div>
              <span className="rating-count">{summary.fiveStarCount}</span>
            </div>
            
            <div className="rating-bar-item">
              <span className="rating-label">4 sao</span>
              <div className="rating-bar">
                <div className="rating-bar-fill" style={{ width: `${calculatePercentage(summary.fourStarCount)}%` }}></div>
              </div>
              <span className="rating-count">{summary.fourStarCount}</span>
            </div>
            
            <div className="rating-bar-item">
              <span className="rating-label">3 sao</span>
              <div className="rating-bar">
                <div className="rating-bar-fill" style={{ width: `${calculatePercentage(summary.threeStarCount)}%` }}></div>
              </div>
              <span className="rating-count">{summary.threeStarCount}</span>
            </div>
            
            <div className="rating-bar-item">
              <span className="rating-label">2 sao</span>
              <div className="rating-bar">
                <div className="rating-bar-fill" style={{ width: `${calculatePercentage(summary.twoStarCount)}%` }}></div>
              </div>
              <span className="rating-count">{summary.twoStarCount}</span>
            </div>
            
            <div className="rating-bar-item">
              <span className="rating-label">1 sao</span>
              <div className="rating-bar">
                <div className="rating-bar-fill" style={{ width: `${calculatePercentage(summary.oneStarCount)}%` }}></div>
              </div>
              <span className="rating-count">{summary.oneStarCount}</span>
            </div>
          </div>
        </div>
      </div>
      
      {currentUser && canReview && !showReviewForm && (
        <div className="review-action">
          <button 
            className="btn-primary review-button"
            onClick={() => setShowReviewForm(true)}
          >
            <i className="fas fa-star"></i> Viết đánh giá
          </button>
        </div>
      )}
      
      {currentUser && showReviewForm && (
        <div className="review-form-container">
          <h3>{editingReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}</h3>
          
          <form onSubmit={handleSubmitReview}>
            <div className="form-group">
              <label>Đánh giá của bạn:</label>
              <StarRating 
                rating={reviewFormData.rating} 
                setRating={(rating) => setReviewFormData({...reviewFormData, rating})} 
              />
            </div>
            
            <div className="form-group">
              <label>Nhận xét:</label>
              <textarea 
                rows="4"
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                value={reviewFormData.comment}
                onChange={(e) => setReviewFormData({...reviewFormData, comment: e.target.value})}
                required
              ></textarea>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => {
                  setShowReviewForm(false);
                  setReviewFormData({ rating: 5, comment: '' });
                  setEditingReview(null);
                }}
              >
                Hủy
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Đang gửi...' : (editingReview ? 'Cập nhật' : 'Gửi đánh giá')}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="reviews-list">
        {loading && reviews.length === 0 ? (
          <div className="loading-reviews">Đang tải đánh giá...</div>
        ) : reviews.length === 0 ? (
          <div className="no-reviews">
            <i className="fas fa-comment-dots"></i>
            <p>Sản phẩm này chưa có đánh giá nào</p>
          </div>
        ) : (
          reviews.map(review => (
            <ReviewItem 
              key={review.id} 
              review={review} 
              isUserReview={currentUser && review.username === currentUser.username}
              onEditReview={handleEditReview}
              onDeleteReview={handleDeleteReview}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
