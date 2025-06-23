import { getProxyImageUrl, handleImageError } from '~/utils/imageProxy';

/**
 * Component hiển thị thumbnail ảnh sản phẩm
 * @param {Object} props
 * @param {string} props.src - URL ảnh
 * @param {string} props.alt - Alt text
 * @param {string} props.size - Kích thước ('sm', 'md', 'lg')
 * @param {string} props.className - CSS class bổ sung
 * @param {Function} props.onClick - Callback khi click
 */
function ProductThumbnail({ 
  src, 
  alt = '', 
  size = 'md', 
  className = '', 
  onClick 
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const sizePixels = {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 64, height: 64 },
    xl: { width: 80, height: 80 }
  };

  const currentSize = sizePixels[size] || sizePixels.md;

  return (
    <div className={`flex-shrink-0 ${sizeClasses[size]} ${className}`}>
      <img 
        className={`
          w-full h-full object-cover rounded 
          ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
        `}
        src={getProxyImageUrl(src)} 
        alt={alt}
        onError={(e) => handleImageError(e, currentSize.width, currentSize.height)}
        onClick={onClick}
      />
    </div>
  );
}

export default ProductThumbnail;