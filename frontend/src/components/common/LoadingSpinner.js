import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', color = 'primary' }) => {
  const spinnerClass = `loading-spinner size-${size} color-${color}`;
  
  return (
    <div className="spinner-container">
      <div className={spinnerClass}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
