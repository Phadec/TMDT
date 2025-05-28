# API Framework Documentation

This API framework provides a structured way to interact with backend services using Axios. It includes authentication, error handling, and common API operations.

## Structure

- `axiosConfig.js` - Base Axios configuration with interceptors
- `authService.js` - Authentication-related API calls
- `apiService.js` - Generic API methods (GET, POST, PUT, etc.)
- `userService.js` - User-related API calls
- `index.js` - Exports all services

## Usage

### Import Services

```jsx
import { authService, apiService, userService } from '../api';
```

### Authentication

```jsx
// Login
try {
  const response = await authService.login('user@example.com', 'password');
  console.log('Logged in user:', response.user);
} catch (error) {
  console.error('Login failed:', error);
}

// Check if user is authenticated
const isLoggedIn = authService.isAuthenticated();

// Get current user
const currentUser = authService.getCurrentUser();

// Logout
authService.logout();
```

### Making API Requests

```jsx
// GET request
try {
  const products = await apiService.get('/products', { category: 'electronics' });
  console.log('Products:', products);
} catch (error) {
  console.error('Error fetching products:', error);
}

// POST request
try {
  const newProduct = await apiService.post('/products', {
    name: 'New Product',
    price: 99.99,
    description: 'Product description'
  });
  console.log('Created product:', newProduct);
} catch (error) {
  console.error('Error creating product:', error);
}

// PUT request
try {
  const updatedProduct = await apiService.put('/products/123', {
    price: 89.99
  });
  console.log('Updated product:', updatedProduct);
} catch (error) {
  console.error('Error updating product:', error);
}

// DELETE request
try {
  await apiService.delete('/products/123');
  console.log('Product deleted successfully');
} catch (error) {
  console.error('Error deleting product:', error);
}

// File upload
try {
  const formData = new FormData();
  formData.append('image', fileObject);
  
  const response = await apiService.uploadFiles('/upload', formData, (progress) => {
    console.log(`Upload progress: ${progress}%`);
  });
  
  console.log('Upload response:', response);
} catch (error) {
  console.error('Upload failed:', error);
}
```

### User Operations

```jsx
// Get user profile
try {
  const profile = await userService.getProfile();
  console.log('User profile:', profile);
} catch (error) {
  console.error('Error fetching profile:', error);
}

// Update profile
try {
  const updatedProfile = await userService.updateProfile({
    name: 'New Name',
    phone: '123-456-7890'
  });
  console.log('Updated profile:', updatedProfile);
} catch (error) {
  console.error('Error updating profile:', error);
}

// Change password
try {
  await userService.changePassword('currentPassword', 'newPassword');
  console.log('Password changed successfully');
} catch (error) {
  console.error('Error changing password:', error);
}

// Upload avatar
try {
  const response = await userService.uploadAvatar(fileObject, (progress) => {
    console.log(`Avatar upload progress: ${progress}%`);
  });
  console.log('Avatar URL:', response.avatar_url);
} catch (error) {
  console.error('Error uploading avatar:', error);
}
```

## Configuration

The API base URL is configured in `axiosConfig.js`. By default, it uses the `VITE_API_BASE_URL` environment variable or falls back to `http://localhost:8000/api`.

To change the base URL, add the following to your `.env` file:

```
VITE_API_BASE_URL=https://api.example.com
```

## Error Handling

The API framework includes built-in error handling:

1. Automatically adds authentication tokens to requests
2. Handles 401 Unauthorized errors (redirects to login)
3. Provides detailed error information

Example error handling:

```jsx
try {
  await apiService.get('/protected-resource');
} catch (error) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Error status:', error.response.status);
    console.error('Error data:', error.response.data);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error message:', error.message);
  }
}
```