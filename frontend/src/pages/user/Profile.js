import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const { currentUser, isAuthenticated, updateProfile } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    avatar: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        phoneNumber: currentUser.phoneNumber || '',
        avatar: currentUser.avatar || ''
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận file ảnh định dạng JPEG, PNG');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 2MB');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Import userService để upload avatar
      const userService = require('../../services/userService').default;
      
      // Upload file lên server
      const result = await userService.updateAvatar(file);
      
      // Kiểm tra kết quả trả về từ REST API
      if (result && (result.avatar || result.url)) {
        // Cập nhật avatar trong form data với URL từ server
        setFormData({
          ...formData,
          avatar: result.avatar || result.url
        });
        toast.success('Cập nhật ảnh đại diện thành công');
        
        // Cập nhật thông tin người dùng nếu cần
        if (updateProfile) {
          await updateProfile({...formData, avatar: result.avatar || result.url});
        }
      } else {
        throw new Error('Không nhận được dữ liệu avatar từ server');
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      toast.error('Không thể tải ảnh lên: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Vui lòng nhập họ';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Vui lòng nhập tên';
    }
    
    if (formData.phoneNumber && !/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Sử dụng context method để cập nhật thông tin người dùng
      await updateProfile(formData);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Không thể cập nhật thông tin. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Thông tin tài khoản</h1>
      </div>
      
      <div className="profile-content">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            <img 
              src={formData.avatar || '/images/default-avatar.png'} 
              alt={currentUser.username}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/default-avatar.png';
              }}
            />
            
            {isEditing && (
              <div className="avatar-upload">
                <label htmlFor="avatar-input" className="avatar-upload-label">
                  <i className="fas fa-camera"></i>
                  {isUploading ? 'Đang tải lên...' : 'Thay đổi ảnh'}
                </label>
                <input 
                  type="file" 
                  id="avatar-input" 
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isUploading}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>
          
          <div className="profile-username">@{currentUser.username}</div>
          
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="stat-label">Đã tham gia:</span>
              <span className="stat-value">
                {new Date(currentUser.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            
            <div className="profile-stat">
              <span className="stat-label">Email:</span>
              <span className="stat-value">{currentUser.email}</span>
            </div>
            
            {currentUser.emailVerified ? (
              <div className="profile-verified">
                <i className="fas fa-check-circle"></i> Đã xác thực email
              </div>
            ) : (
              <div className="profile-not-verified">
                <i className="fas fa-exclamation-circle"></i> Chưa xác thực email
              </div>
            )}
          </div>
        </div>
        
        <div className="profile-details-section">
          <div className="profile-actions">
            {!isEditing ? (
              <button 
                className="btn-secondary"
                onClick={() => setIsEditing(true)}
              >
                <i className="fas fa-edit"></i> Chỉnh sửa thông tin
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      firstName: currentUser.firstName || '',
                      lastName: currentUser.lastName || '',
                      phoneNumber: currentUser.phoneNumber || '',
                      avatar: currentUser.avatar || ''
                    });
                    setErrors({});
                  }}
                  disabled={loading}
                >
                  Hủy
                </button>
                
                <button 
                  className="btn-primary"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            )}
          </div>
          
          <form className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">Họ</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Tên</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="phoneNumber">Số điện thoại</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={!isEditing || loading}
                className={errors.phoneNumber ? 'error' : ''}
                placeholder="Nhập số điện thoại (tùy chọn)"
              />
              {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="disabled-input"
              />
              <span className="field-note">Email không thể thay đổi</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
