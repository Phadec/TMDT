import React, { useRef, useEffect } from 'react';
import Tagify from '@yaireo/tagify';
import '@yaireo/tagify/dist/tagify.css';

// Add Product Form Component
const AddProductForm = () => {
  const tagifyRef = useRef(null);
  const tagifyInstance = useRef(null);

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
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Hình ảnh sản phẩm
              </label>
              <div className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 border-dashed rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">Kéo thả hoặc nhấp để tải lên</p>
                <input type="file" className="hidden" />
                <button className="px-3 py-1 mt-2 text-sm text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50">
                  Chọn file
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
            Hủy
          </button>
          <button 
            onClick={() => {
              const tags = handleGetTags();
              // Xử lý submit form ở đây
            }}
            className="px-4 py-2 text-white transition-colors bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Đăng sản phẩm
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;