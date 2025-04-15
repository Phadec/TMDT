import React from 'react';
import './Loading.css';

const Loading = ({ message }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-message">{message || 'Đang tải...'}</p>
    </div>
  );
};

export default Loading;
