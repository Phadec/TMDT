import { useState, useEffect } from 'react';
import { getProxyImageUrl } from '~/utils/imageProxy';

/**
 * Custom hook để quản lý việc load ảnh
 * @param {string} imageUrl - URL ảnh gốc
 * @returns {Object} - { src, loading, error, retry }
 */
export const useImageLoader = (imageUrl) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [src, setSrc] = useState('');

  const loadImage = () => {
    if (!imageUrl) {
      setLoading(false);
      setError(true);
      return;
    }

    setLoading(true);
    setError(false);
    
    const proxyUrl = getProxyImageUrl(imageUrl);
    const img = new Image();
    
    img.onload = () => {
      setSrc(proxyUrl);
      setLoading(false);
      setError(false);
    };
    
    img.onerror = () => {
      setLoading(false);
      setError(true);
      setSrc('https://via.placeholder.com/150?text=Error');
    };
    
    img.src = proxyUrl;
  };

  useEffect(() => {
    loadImage();
  }, [imageUrl]);

  const retry = () => {
    loadImage();
  };

  return { src, loading, error, retry };
};

/**
 * Custom hook để quản lý việc load nhiều ảnh
 * @param {string[]} imageUrls - Mảng URL ảnh
 * @returns {Object} - { images, loading, errors, retryAll }
 */
export const useMultipleImageLoader = (imageUrls = []) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  const loadImages = () => {
    if (!imageUrls || imageUrls.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrors([]);
    
    const imagePromises = imageUrls.map((url, index) => {
      return new Promise((resolve) => {
        if (!url) {
          resolve({ index, src: 'https://via.placeholder.com/150?text=No+Image', error: true });
          return;
        }

        const proxyUrl = getProxyImageUrl(url);
        const img = new Image();
        
        img.onload = () => {
          resolve({ index, src: proxyUrl, error: false });
        };
        
        img.onerror = () => {
          resolve({ index, src: 'https://via.placeholder.com/150?text=Error', error: true });
        };
        
        img.src = proxyUrl;
      });
    });

    Promise.all(imagePromises).then((results) => {
      const loadedImages = results.map(result => result.src);
      const imageErrors = results.filter(result => result.error).map(result => result.index);
      
      setImages(loadedImages);
      setErrors(imageErrors);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadImages();
  }, [JSON.stringify(imageUrls)]);

  const retryAll = () => {
    loadImages();
  };

  return { images, loading, errors, retryAll };
};