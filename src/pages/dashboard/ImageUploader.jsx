import React, { useRef, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const ImageUploader = ({ 
  images, 
  onImagesChange, 
  maxImages = 15, 
  minImages = 10, 
  maxFileSize = 10 * 1024 * 1024 // 10MB
}) => {
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Image handling functions
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const totalImages = images.length + files.length;
    
    if (totalImages > maxImages) {
      Swal.fire({
        icon: 'warning',
        title: 'Giới hạn ảnh',
        text: `Bạn chỉ có thể tải lên tối đa ${maxImages} ảnh`,
        confirmButtonColor: '#3B82F6'
      });
      return;
    }
    
    // Validate file types and sizes
    const invalidFiles = files.filter(file => 
      !file.type.startsWith('image/') || file.size > maxFileSize
    );
    
    if (invalidFiles.length > 0) {
      const oversizedFiles = invalidFiles.filter(file => file.size > maxFileSize);
      const nonImageFiles = invalidFiles.filter(file => !file.type.startsWith('image/'));
      
      let errorMessage = '';
      if (nonImageFiles.length > 0) {
        errorMessage += 'Chỉ chấp nhận file ảnh (JPG, PNG, GIF). ';
      }
      if (oversizedFiles.length > 0) {
        errorMessage += `File không được vượt quá ${maxFileSize / (1024 * 1024)}MB.`;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'File không hợp lệ',
        text: errorMessage,
        confirmButtonColor: '#3B82F6'
      });
      return;
    }
    
    if (files.length > 0) {
      const newImages = files.map((file, index) => ({
        id: Date.now() + index,
        file: file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      }));
      
      const updatedImages = [...images, ...newImages];
      onImagesChange(updatedImages);
      
      // Success notification
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: `Đã thêm ${files.length} ảnh`,
        timer: 1500,
        showConfirmButton: false
      });
    }
    
    // Reset input value
    event.target.value = '';
  };

  const handleImageRemove = (imageId) => {
    Swal.fire({
      title: 'Xác nhận xóa',
      text: 'Bạn có chắc muốn xóa ảnh này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        // Clean up URL to prevent memory leaks
        const imageToRemove = images.find(img => img.id === imageId);
        if (imageToRemove && imageToRemove.url && imageToRemove.url.startsWith('blob:')) {
          URL.revokeObjectURL(imageToRemove.url);
        }
        
        const updatedImages = images.filter(img => img.id !== imageId);
        onImagesChange(updatedImages);
        
        Swal.fire({
          icon: 'success',
          title: 'Đã xóa!',
          text: 'Ảnh đã được xóa thành công',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const handleImageClick = (image, index) => {
    setSelectedImage(image);
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const handlePrevImage = () => {
    const newIndex = selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1;
    setSelectedImageIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  const handleNextImage = () => {
    const newIndex = selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0;
    setSelectedImageIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      const mockEvent = { target: { files } };
      handleImageUpload(mockEvent);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach(image => {
        if (image.url && image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [images]);

  // Enhanced Image Modal Component with Navigation
  const ImageModal = ({ image, onClose }) => {
    if (!image) return null;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'Escape') onClose();
    };

    useEffect(() => {
      const keyDownHandler = (e) => handleKeyDown(e);
      document.addEventListener('keydown', keyDownHandler);
      return () => document.removeEventListener('keydown', keyDownHandler);
    }, [selectedImageIndex, images.length]);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm">
        <div className="relative w-full max-w-6xl max-h-screen p-4">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute z-20 p-3 text-white transition-colors bg-red-600 rounded-full shadow-lg top-4 right-4 hover:bg-red-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous button */}
          {images.length > 1 && (
            <button
              onClick={handlePrevImage}
              className="absolute z-20 p-3 text-white transition-all transform -translate-y-1/2 bg-gray-800 bg-opacity-75 rounded-full shadow-lg left-4 top-1/2 hover:bg-opacity-90"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={handleNextImage}
              className="absolute z-20 p-3 text-white transition-all transform -translate-y-1/2 bg-gray-800 bg-opacity-75 rounded-full shadow-lg right-4 top-1/2 hover:bg-opacity-90"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Main image */}
          <div className="flex items-center justify-center h-full">
            <img
              src={image.url}
              alt={image.name}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Image info panel */}
          <div className="absolute p-4 bg-white rounded-lg shadow-lg bottom-4 left-4 right-4 bg-opacity-95 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 truncate">{image.name}</h3>
                <p className="text-gray-600">Kích thước: {formatFileSize(image.size)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {selectedImageIndex + 1} / {images.length}
                </p>
                <div className="flex mt-2 space-x-1">
                  {images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === selectedImageIndex ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-700">
        Hình ảnh sản phẩm
        <span className="ml-1 text-xs text-gray-500">
          ({images.length}/{maxImages} ảnh - Tối thiểu {minImages} ảnh, tối đa {maxImages} ảnh)
        </span>
      </label>
      
      {/* Enhanced Upload Area */}
      <div 
        className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all duration-300 ${
          dragActive 
            ? 'border-blue-500 bg-blue-50 scale-105' 
            : images.length >= maxImages 
              ? 'border-gray-200 bg-gray-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Animated upload icon */}
        <div className={`transition-transform duration-300 ${dragActive ? 'scale-110' : ''}`}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`w-16 h-16 transition-colors duration-300 ${
              dragActive ? 'text-blue-500' : 'text-gray-400'
            }`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>

        {/* Upload text */}
        <div className="mt-4 text-center">
          <p className={`text-lg font-medium transition-colors duration-300 ${
            dragActive ? 'text-blue-600' : 'text-gray-700'
          }`}>
            {dragActive ? 'Thả ảnh vào đây' : 'Tải lên ảnh sản phẩm'}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Kéo thả hoặc nhấp để chọn ảnh
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Hỗ trợ: JPG, PNG, GIF • Tối đa {maxImages} ảnh • Mỗi ảnh &lt; {maxFileSize / (1024 * 1024)}MB
          </p>
        </div>

        {/* Upload progress indicator */}
        <div className="w-full max-w-xs mt-4">
          <div className="flex justify-between mb-1 text-xs text-gray-500">
            <span>Đã tải: {images.length}</span>
            <span>Tối đa: {maxImages}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                images.length >= minImages ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${(images.length / maxImages) * 100}%` }}
            ></div>
          </div>
        </div>

        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          multiple
          accept="image/*"
          onChange={handleImageUpload}
        />
        
        {/* Upload button */}
        <button 
          onClick={() => fileInputRef.current?.click()}
          className={`px-6 py-3 mt-4 font-medium rounded-lg transition-all duration-300 ${
            images.length >= maxImages
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
          }`}
          disabled={images.length >= maxImages}
        >
          {images.length >= maxImages ? (
            <>
              <svg className="inline w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Đã đạt giới hạn
            </>
          ) : (
            <>
              <svg className="inline w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Chọn ảnh ({maxImages - images.length} còn lại)
            </>
          )}
        </button>
      </div>

      {/* Enhanced Image Preview Grid */}
      {images.length > 0 && (
        <div className="mt-6">
          <div className="mb-4">
            <h3 className="mb-2 text-lg font-medium text-gray-800">Ảnh đã tải lên</h3>
            <div className="flex items-center space-x-4 text-sm">
              <span className="px-3 py-1 text-blue-800 bg-blue-100 rounded-full">
                {images.length} ảnh
              </span>
              {images.length >= minImages ? (
                <span className="flex items-center px-3 py-1 text-green-800 bg-green-100 rounded-full">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Đủ điều kiện
                </span>
              ) : (
                <span className="px-3 py-1 text-yellow-800 bg-yellow-100 rounded-full">
                  Cần {minImages - images.length} ảnh nữa
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {images.map((image, index) => (
              <div key={image.id} className="relative group">
                <div className="overflow-hidden transition-all duration-300 shadow-sm aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl hover:shadow-lg">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="object-cover w-full h-full transition-transform duration-300 cursor-pointer hover:scale-110"
                    onClick={() => handleImageClick(image, index)}
                  />
                </div>
                
                {/* Enhanced overlay with controls */}
                <div className="absolute inset-0 flex items-end justify-center pb-3 transition-all duration-300 opacity-0 bg-gradient-to-t from-black via-transparent to-transparent group-hover:opacity-100 rounded-xl">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleImageClick(image, index)}
                      className="p-2 transition-all transform bg-white rounded-full shadow-lg bg-opacity-90 backdrop-blur-sm hover:bg-opacity-100 hover:scale-105"
                      title="Xem chi tiết"
                    >
                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleImageRemove(image.id)}
                      className="p-2 transition-all transform bg-red-500 rounded-full shadow-lg bg-opacity-90 backdrop-blur-sm hover:bg-opacity-100 hover:scale-105"
                      title="Xóa ảnh"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Image number badge */}
                <div className="absolute px-2 py-1 text-xs text-white bg-black bg-opacity-75 rounded-full top-2 left-2">
                  {index + 1}
                </div>
                
                {/* Image info */}
                <div className="px-1 mt-2">
                  <div className="text-xs font-medium text-gray-600 truncate">
                    {image.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatFileSize(image.size)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Enhanced status messages */}
          <div className="mt-6">
            {images.length < minImages ? (
              <div className="p-4 border border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Cần thêm ảnh để đăng sản phẩm
                    </p>
                    <p className="mt-1 text-xs text-yellow-700">
                      Bạn cần ít nhất {minImages - images.length} ảnh nữa để đáp ứng yêu cầu tối thiểu
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Hoàn tất! Sản phẩm sẵn sàng đăng bán
                    </p>
                    <p className="mt-1 text-xs text-green-700">
                      Bạn đã có {images.length} ảnh chất lượng cho sản phẩm
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Image Detail Modal */}
      {showImageModal && (
        <ImageModal 
          image={selectedImage} 
          onClose={() => {
            setShowImageModal(false);
            setSelectedImage(null);
          }} 
        />
      )}
    </div>
  );
};

export default ImageUploader;