import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-number">404</div>
        <h1 className="not-found-title">Không tìm thấy trang</h1>
        <p className="not-found-message">
          Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn-primary">
            <i className="fas fa-home"></i> Trở về trang chủ
          </Link>
          <button 
            className="btn-secondary"
            onClick={() => window.history.back()}
          >
            <i className="fas fa-arrow-left"></i> Quay lại trang trước
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
