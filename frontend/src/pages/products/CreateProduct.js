import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './ProductForm.css';

const CreateProduct = () => {
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: '',
    condition: 'NEW',
    location: '',
    negotiable: false,
    images: [],
    quantity: 1 // Add default quantity
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/create-product' } } });
      return;
    }
    
    fetchCategories();
  }, [isAuthenticated, navigate]);

  const fetchCategories = async () => {
    try {
      const response = await api.graphql(`
        query {
          availableCategories {
            id
            name
            level
            parentName
          }
        }
      `);
      
      // Add defensive check
      if (response.data && response.data.data) {
        setCategories(response.data.data.availableCategories || []);
      } else {
        console.warn('Unexpected API response format:', response);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Không thể tải danh mục sản phẩm');
      setCategories([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    if (files.length + imagePreviewUrls.length > 5) {
      toast.error('Bạn chỉ có thể tải lên tối đa 5 ảnh');
      return;
    }
    
    setUploadingImages(true);
    
    try {
      // In a real application, you would upload these to your server or cloud storage
      // For this example, we're just creating local URLs
      const newImageUrls = [];
      
      for (const file of files) {
        // Mock upload (in a real app, you'd upload to a server)
        const imageUrl = await uploadImageMock(file);
        newImageUrls.push(imageUrl);
      }
      
      setFormData({
        ...formData,
        images: [...formData.images, ...newImageUrls]
      });
      
      setImagePreviewUrls([...imagePreviewUrls, ...newImageUrls]);
      
      if (errors.images) {
        setErrors({ ...errors, images: null });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setUploadingImages(false);
    }
  };

  // Mock function to simulate image upload
  const uploadImageMock = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Simulate network delay
        setTimeout(() => {
          resolve(reader.result);
        }, 500);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    
    const newPreviews = [...imagePreviewUrls];
    newPreviews.splice(index, 1);
    
    setFormData({ ...formData, images: newImages });
    setImagePreviewUrls(newPreviews);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Tiêu đề phải có ít nhất 10 ký tự';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả sản phẩm';
    } else if (formData.description.length < 30) {
      newErrors.description = 'Mô tả phải có ít nhất 30 ký tự';
    }
    
    if (!formData.price) {
      newErrors.price = 'Vui lòng nhập giá';
    } else if (isNaN(formData.price) || formData.price <= 0) {
      newErrors.price = 'Giá phải là số dương';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Vui lòng chọn danh mục';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Vui lòng nhập địa điểm';
    }
    
    if (formData.images.length === 0) {
      newErrors.images = 'Vui lòng tải lên ít nhất 1 ảnh';
    }

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Vui lòng nhập số lượng hợp lệ (ít nhất là 1)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Create a cleaned input object
      const productInput = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        condition: formData.condition,
        images: formData.images,
        location: formData.location,
        negotiable: formData.negotiable,
        quantity: parseInt(formData.quantity || 1) // Ensure quantity is an integer
      };
      
      // Log the input to help with debugging
      console.log('Creating product with data:', productInput);
      
      const response = await api.graphql(`
        mutation CreateProduct($input: ProductInput!) {
          createProduct(input: $input) {
            id
            title
            quantity
          }
        }
      `, {
        input: productInput
      });
      
      console.log('Create product response:', response);
      
      if (response.data.errors) {
        console.error('GraphQL errors:', response.data.errors);
        const errorMessage = response.data.errors[0]?.message || 'Unknown error occurred';
        toast.error(`Đã xảy ra lỗi khi đăng tin: ${errorMessage}`);
        return;
      }
      
      const createdProduct = response.data.data.createProduct;
      
      toast.success('Đăng tin thành công!');
      navigate(`/products/${createdProduct.id}`);
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Đã xảy ra lỗi khi đăng tin. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form-container">
      <h1>Đăng tin mới</h1>
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="title">Tiêu đề <span className="required">*</span></label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={errors.title ? 'error' : ''}
            maxLength="100"
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
          <span className="character-count">{formData.title.length}/100</span>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Mô tả <span className="required">*</span></label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={errors.description ? 'error' : ''}
            rows="8"
            maxLength="2000"
          ></textarea>
          {errors.description && <span className="error-message">{errors.description}</span>}
          <span className="character-count">{formData.description.length}/2000</span>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Giá (VNĐ) <span className="required">*</span></label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={errors.price ? 'error' : ''}
              min="0"
              step="1000"
            />
            {errors.price && <span className="error-message">{errors.price}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Số lượng <span className="required">*</span></label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className={errors.quantity ? 'error' : ''}
              min="1"
              max="9999"
            />
            {errors.quantity && <span className="error-message">{errors.quantity}</span>}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="categoryId">Danh mục <span className="required">*</span></label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className={errors.categoryId ? 'error' : ''}
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.level > 1 ? '\u00A0\u00A0\u00A0\u00A0' : ''}
                  {category.name} 
                  {category.parentName ? ` (${category.parentName})` : ''}
                </option>
              ))}
            </select>
            {errors.categoryId && <span className="error-message">{errors.categoryId}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="condition">Tình trạng <span className="required">*</span></label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
            >
              <option value="NEW">Mới</option>
              <option value="LIKE_NEW">Như mới</option>
              <option value="GOOD">Tốt</option>
              <option value="FAIR">Khá</option>
              <option value="POOR">Kém</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="location">Địa điểm <span className="required">*</span></label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={errors.location ? 'error' : ''}
            placeholder="Nhập địa điểm (ví dụ: Quận 1, TP.HCM)"
          />
          {errors.location && <span className="error-message">{errors.location}</span>}
        </div>
        
        <div className="form-group">
          <label>Hình ảnh <span className="required">*</span> (tối đa 5 ảnh)</label>
          <div className="image-upload-container">
            <div 
              className={`image-upload-area ${errors.images ? 'error' : ''}`}
              onClick={() => document.getElementById('image-upload').click()}
            >
              <input
                type="file"
                id="image-upload"
                onChange={handleImageChange}
                multiple
                accept="image/*"
                style={{ display: 'none' }}
              />
              <div className="upload-icon">
                <i className="fa fa-cloud-upload"></i>
              </div>
              <p>Nhấp để tải ảnh lên hoặc kéo thả ảnh vào đây</p>
            </div>
            
            {uploadingImages && (
              <div className="uploading-indicator">
                <div className="spinner"></div>
                <p>Đang tải ảnh lên...</p>
              </div>
            )}
            
            {imagePreviewUrls.length > 0 && (
              <div className="image-preview-container">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="image-preview">
                    <img src={url} alt={`Preview ${index}`} />
                    <button 
                      type="button" 
                      className="remove-image-btn"
                      onClick={() => removeImage(index)}
                    >
                      <i className="fa fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {errors.images && <span className="error-message">{errors.images}</span>}
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/')}
          >
            Hủy
          </button>
          
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || uploadingImages}
          >
            {loading ? 'Đang xử lý...' : 'Đăng tin'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;
