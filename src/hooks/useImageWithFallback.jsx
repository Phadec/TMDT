import { useState, useEffect } from 'react';
import { getDemoImageUrl } from '~/utils/imageUtils';

/**
 * Custom hook để xử lý việc load ảnh với fallback tự động
 * @param {string} imageUrl - URL của ảnh cần load
 * @param {string} fallbackUrl - URL fallback (mặc định là demo.jpg)
 * @returns {object} { src, isLoading, hasError }
 */
export function useImageWithFallback(imageUrl, fallbackUrl = null) {
  const [src, setSrc] = useState(imageUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setSrc(fallbackUrl || getDemoImageUrl());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    setSrc(imageUrl);

    // Tạo một Image object để test xem ảnh có load được không
    const img = new Image();
    
    img.onload = () => {
      setIsLoading(false);
      setHasError(false);
    };
    
    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
      // Nếu lỗi, chuyển sang demo.jpg
      setSrc(fallbackUrl || getDemoImageUrl());
    };
    
    img.src = imageUrl;

    // Cleanup function
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl, fallbackUrl]);

  return { src, isLoading, hasError };
}

/**
 * Custom hook đặc biệt cho ImageProxy - tự động retry với demo.jpg nếu proxy fail
 * @param {string} originalUrl - URL gốc của ảnh
 * @returns {object} { src, isLoading, hasError, isUsingFallback }
 */
export function useProxyImageWithFallback(originalUrl) {
  const [src, setSrc] = useState(originalUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  useEffect(() => {
    if (!originalUrl) {
      setSrc(getDemoImageUrl());
      setIsUsingFallback(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    setIsUsingFallback(false);
    setSrc(originalUrl);

    // Tạo một Image object để test xem ảnh có load được không
    const img = new Image();
    
    img.onload = () => {
      setIsLoading(false);
      setHasError(false);
    };
    
    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
      setIsUsingFallback(true);
      // Nếu ImageProxy lỗi, chuyển sang demo.jpg
      setSrc(getDemoImageUrl());
      
      // Log để debug - chỉ log khi là external URL thật sự fail
      if (originalUrl.includes('/api/v1/common/image-proxy/image')) {
        console.warn(`ImageProxy failed to load image, using demo.jpg as fallback`);
      } else {
        console.warn(`Failed to load image: ${originalUrl}, using demo.jpg as fallback`);
      }
    };
    
    img.src = originalUrl;

    // Cleanup function
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [originalUrl]);

  return { src, isLoading, hasError, isUsingFallback };
}