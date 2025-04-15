import React from 'react';
import { Link } from 'react-router-dom';
import './ErrorMessage.css';

const ErrorMessage = ({ 
  message = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
  buttonText = 'Trở về trang chủ',
  buttonLink = '/',
  icon = 'exclamation-triangle'
}) => {
  return (
    <div className="error-message-component">
      <div className="error-icon">
        <i className={`fas fa-${icon}`}></i>
      </div>
      <h3 className="error-title">Rất tiếc!</h3>
      <p className="error-text">{message}</p>
      <Link to={buttonLink} className="btn-primary error-button">
        {buttonText}
      </Link>
    </div>
  );
};

export default ErrorMessage;
