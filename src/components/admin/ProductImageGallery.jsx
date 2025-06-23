import { useState } from 'react';
import { getProxyImageUrl, handleImageError } from '~/utils/imageProxy';
import { useMultipleImageLoader } from '~/hooks/useImageLoader';

/**
 * Component hiển thị gallery ảnh sản phẩm
 * @param {Object} props
 * @param {string[]} props.images - Mảng URL ảnh
 * @param {string} props.productTitle - Tên sản phẩm
 * @param {string} props.className - CSS class cho container
 */
function ProductImageGallery({ images = [], productTitle = '', className = '' }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { images: loadedImages, loading, errors, retryAll } = useMultipleImageLoader(images);
  
  // Nếu không có ảnh, hiển thị placeholder
  if (!images || images.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg h-64 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📷</div>
          <p>Không có ảnh</p>
        </div>
      </div>
    );
  }

  // Hiển thị loading
  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg h-64 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
          <p>Đang tải ảnh...</p>
        </div>
      </div>
    );
  }

  const currentImage = loadedImages[selectedImageIndex] || loadedImages[0];

  return (
    <div className={className}>
      {/* Ảnh chính */}
      <div className="mb-4 relative">
        <img 
          src={currentImage} 
          alt={`${productTitle} - Ảnh ${selectedImageIndex + 1}`} 
          className="w-full h-64 object-cover rounded-lg shadow-sm"
        />
        {errors.includes(selectedImageIndex) && (
          <div className="absolute top-2 right-2">
            <button 
              onClick={retryAll}
              className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
            >
              Thử lại
            </button>
          </div>
        )}
      </div>
      
      {/* Thumbnails */}
      {loadedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {loadedImages.map((img, index) => (
            <div key={index} className="relative">
              <img 
                src={img} 
                alt={`${productTitle} - Thumbnail ${index + 1}`} 
                className={`
                  flex-shrink-0 w-16 h-16 object-cover rounded cursor-pointer 
                  transition-all duration-200 hover:opacity-80
                  ${index === selectedImageIndex 
                    ? 'ring-2 ring-blue-500 ring-offset-2' 
                    : 'hover:ring-2 hover:ring-gray-300'
                  }
                `}
                onClick={() => setSelectedImageIndex(index)}
              />
              {errors.includes(index) && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Indicator */}
      {loadedImages.length > 1 && (
        <div className="text-center text-sm text-gray-500 mt-2">
          {selectedImageIndex + 1} / {loadedImages.length}
          {errors.length > 0 && (
            <span className="text-red-500 ml-2">
              ({errors.length} lỗi)
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductImageGallery;