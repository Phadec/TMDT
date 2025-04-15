import React from 'react';
import './Badge.css';

const Badge = ({ 
  text, 
  variant = 'primary', 
  icon = null,
  pill = false,
  outline = false,
  size = 'medium'
}) => {
  const variantClass = `badge-${variant}${outline ? '-outline' : ''}`;
  const sizeClass = `badge-${size}`;
  const shapeClass = pill ? 'badge-pill' : '';
  
  return (
    <span className={`badge ${variantClass} ${sizeClass} ${shapeClass}`}>
      {icon && <i className={`fas fa-${icon}`}></i>}
      {text}
    </span>
  );
};

export default Badge;
