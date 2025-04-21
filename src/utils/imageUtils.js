import heroBackground from '../assets/images/hero-background.jpg';

// Default image paths
const DEFAULT_IMAGES = {
  heroBackground,
  placeholder: '/images/placeholder.jpg',
  defaultAvatar: '/images/default-avatar.png',
  categoryPlaceholder: '/images/category-placeholder.jpg'
};

export const getImageUrl = (imagePath, defaultImage = 'placeholder') => {
  if (!imagePath) {
    return DEFAULT_IMAGES[defaultImage];
  }
  return imagePath;
};

export default DEFAULT_IMAGES;
