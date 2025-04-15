import React from 'react';
import { Link } from 'react-router-dom';
import './EmptyState.css';

const EmptyState = ({ title, message, actionText, actionPath, icon }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <i className={`fas fa-${icon || 'box-open'}`}></i>
      </div>
      <h2>{title || 'Không có dữ liệu'}</h2>
      <p>{message || 'Không tìm thấy dữ liệu nào. Vui lòng thử lại sau.'}</p>
      {actionText && actionPath && (
        <Link to={actionPath} className="empty-state-action">
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
