import { useState, useEffect } from 'react';

/**
 * Hook để load ảnh với fallback xử lý
 * @param {string} src - URL ảnh gốc
 * @param {string} fallback - URL ảnh fallback
 * @returns {Object} Object chứa src, isLoading, hasError, isUsingFallback
 */
function useImageWithFallback(src, fallback) {
  const [imageState, setImageState] = useState({
    src: src || fallback,
    isLoading: true,
    hasError: false,
    isUsingFallback: false
  });

  useEffect(() => {
    if (!src && !fallback) {
      setImageState(prev => ({
        ...prev,
        isLoading: false,
        hasError: true,
        isUsingFallback: false
      }));
      return;
    }

    // Reset state khi src thay đổi
    setImageState(prev => ({
      ...prev,
      isLoading: true,
      hasError: false,
      isUsingFallback: false
    }));

    const img = new Image();
    
    const handleLoad = () => {
      setImageState({
        src: src || fallback,
        isLoading: false,
        hasError: false,
        isUsingFallback: !src
      });
    };
    
    const handleError = () => {
      // Nếu src gốc lỗi và có fallback, thử fallback
      if (src && fallback && imageState.src === src) {
        // Thử load fallback
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          setImageState({
            src: fallback,
            isLoading: false,
            hasError: false,
            isUsingFallback: true
          });
        };
        
        fallbackImg.onerror = () => {
          setImageState({
            src: fallback, // Vẫn dùng fallback URL để tránh broken image
            isLoading: false,
            hasError: true,
            isUsingFallback: true
          });
        };
        
        fallbackImg.src = fallback;
      } else {
        // Không có fallback hoặc fallback cũng lỗi
        setImageState(prev => ({
          ...prev,
          isLoading: false,
          hasError: true,
          isUsingFallback: !src
        }));
      }
    };
    
    img.onload = handleLoad;
    img.onerror = handleError;
    
    // Load ảnh gốc trước, nếu không có thì load fallback
    img.src = src || fallback;
    
    // Cleanup function
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallback]);

  return imageState;
}

export default useImageWithFallback;