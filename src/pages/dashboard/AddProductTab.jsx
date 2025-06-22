import React, { useRef, useEffect, useState } from 'react';
import Tagify from '@yaireo/tagify';
import '@yaireo/tagify/dist/tagify.css';
import Swal from 'sweetalert2';
import ImageUploader from './ImageUploader';

// Add Product Form Component
const AddProductForm = () => {
  const tagifyRef = useRef(null);
  const tagifyInstance = useRef(null);
  
  // State management
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (tagifyRef.current) {
      // Khởi tạo Tagify
      tagifyInstance.current = new Tagify(tagifyRef.current, {
        maxTags: 4, // Tối đa 4 thẻ
        placeholder: 'Nhập thẻ sản phẩm và nhấn Enter',
        dropdown: {
          enabled: 0 // Tắt dropdown suggestions
        },
        validate: function(tagData) {
          // Kiểm tra độ dài unicode
          const tagLength = [...tagData.value].length; // Đếm ký tự unicode chính xác
          return tagLength <= 20; // Tối đa 20 ký tự
        },
        transformTag: function(tagData) {
          // Cắt bớt nếu quá dài
          const maxLength = 20;
          if ([...tagData.value].length > maxLength) {
            tagData.value = [...tagData.value].slice(0, maxLength).join('');
          }
        },
        hooks: {
          beforeTagAdd: function(e) {
            const tagLength = [...e.detail.data.value].length;
            if (tagLength > 20) {
              e.preventDefault();
              return false;
            }
          }
        }
      });
    }

    return () => {
      if (tagifyInstance.current) {
        tagifyInstance.current.destroy();
      }
    };
  }, []);

  const handleGetTags = () => {
    if (tagifyInstance.current) {
      const tags = tagifyInstance.current.value;
      console.log('Current tags:', tags);
      return tags;
    }
    return [];
  };

  const handleImagesChange = (newImages) => {
    setImages(newImages);
  };
  return (
    <div className="p-4 bg-white shadow-sm rounded-xl md:p-6">
      <h2 className="mb-4 text-xl font-semibold">Đăng sản phẩm mới</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Nhập tên sản phẩm"
              />
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Giá <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₫</span>
                <input
                  type="number"
                  className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Thẻ sản phẩm
                <span className="ml-1 text-xs text-gray-500">(Tối đa 4 thẻ, mỗi thẻ không quá 20 ký tự)</span>
              </label>
              <div className="relative">
                <input
                  ref={tagifyRef}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập thẻ sản phẩm"
                />
              </div>
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Danh mục
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Chọn danh mục</option>
                <option value="electronics">Điện tử</option>
                <option value="clothing">Thời trang</option>
                <option value="home">Đồ gia dụng</option>
                <option value="beauty">Làm đẹp</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Địa chỉ
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="5"
                placeholder="Nhập đại chỉ lấy hàng"
              ></textarea>
            </div>

             <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Mô tả sản phẩm
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="5"
                placeholder="Nhập mô tả chi tiết về sản phẩm"
              ></textarea>
            </div>
          </div>
          
          <div className="space-y-4">
            <ImageUploader 
              images={images}
              onImagesChange={handleImagesChange}
              maxImages={15}
              minImages={10}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
            Hủy
          </button>
          <button 
            onClick={() => {
              if (images.length < 10) {
                Swal.fire({
                  icon: 'warning',
                  title: 'Chưa đủ ảnh',
                  text: `Cần ít nhất 10 ảnh sản phẩm để đăng bán. Bạn còn thiếu ${10 - images.length} ảnh.`,
                  confirmButtonColor: '#3B82F6',
                  confirmButtonText: 'Thêm ảnh ngay'
                });
                return;
              }
              
              const tags = handleGetTags();
              console.log('Images:', images);
              console.log('Tags:', tags);
              
              // Show success message
              Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Sản phẩm đã được đăng thành công!',
                confirmButtonColor: '#10B981',
                timer: 2000,
                showConfirmButton: false
              });
              
              // Xử lý submit form ở đây
            }}
            className={`px-6 py-3 font-medium text-white transition-all duration-300 rounded-lg ${
              images.length >= 10 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 shadow-lg hover:shadow-xl' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={images.length < 10}
          >
            {images.length >= 10 ? (
              <>
                <svg className="inline w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Đăng sản phẩm
              </>
            ) : (
              <>
                <svg className="inline w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Cần {10 - images.length} ảnh nữa
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;