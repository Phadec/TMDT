import React, { useRef, useEffect, useState } from 'react';
import Tagify from '@yaireo/tagify';
import '@yaireo/tagify/dist/tagify.css';
import Swal from 'sweetalert2';
import ImageUploader from './ImageUploader';
import { useCohereChat } from '~/hooks/useCohere';
import { handleContent } from '~/promt';
import { commonApi, commonUrl } from '~/api';

// Add Product Form Component
const AddProductForm = () => {
  const tagifyRef = useRef(null);
  const tagifyInstance = useRef(null);
  const addressDebounceRef = useRef(null);
  
  // State management
  const [images, setImages] = useState([]);
  const [address, setAddress] = useState('');
  const [addressValid, setAddressValid] = useState(true);
  const [checkingAddress, setCheckingAddress] = useState(false);
  // Thêm state cho validation
  const [productName, setProductName] = useState('');
  const [productNameError, setProductNameError] = useState('');
  const [price, setPrice] = useState('');
  const [priceError, setPriceError] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [category, setCategory] = useState('');
  // Thêm state cho danh mục
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loading, setLoading] = useState(false);
  // Thêm hook cohere
  const { sendMessage } = useCohereChat();

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
      return tags;
    }
    return [];
  };

  const handleImagesChange = (newImages) => {
    setImages(newImages);
  };

  // Debounce kiểm tra địa chỉ realtime, chỉ gọi API khi người dùng ngưng nhập đủ lâu
  useEffect(() => {
    if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current);
    if (!address.trim()) {
      setAddressValid(true);
      setCheckingAddress(false);
      return;
    }
    addressDebounceRef.current = setTimeout(() => {
      checkAddress(address);
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // Hàm kiểm tra địa chỉ với LocationIQ (dùng search API, không phải reverse)
  const checkAddress = React.useCallback(async (addr) => {
    if (!addr.trim()) {
      setAddressValid(true);
      setCheckingAddress(false);
      return;
    }
    setCheckingAddress(true);
    try {
      const apiKey = import.meta.env.VITE_LOCATION;
      if (!apiKey) {
        setAddressValid(false);
        Swal.fire({
          icon: 'error',
          title: 'Thiếu API Key',
          text: 'Không tìm thấy API key cho LocationIQ. Vui lòng kiểm tra cấu hình.',
          confirmButtonColor: '#EF4444'
        });
        setCheckingAddress(false);
        return;
      }
      const url = `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(addr)}&format=json&`;
      const resp = await fetch(url);
      if (!resp.ok) {
        setAddressValid(false);
        Swal.fire({
          icon: 'error',
          title: 'Đại chỉ không phù hợp',
          text: 'Không tìm thấy địa chỉ này. Vui lòng kiểm tra lại.',
          confirmButtonColor: '#EF4444'
        });
        setCheckingAddress(false);
        return;
      }
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) {
        setAddressValid(true);
        Swal.fire({
          icon: 'success',
          title: 'Địa chỉ hợp lệ',
          text: 'Địa chỉ bạn nhập đã tồn tại trên bản đồ.',
          confirmButtonColor: '#10B981',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        setAddressValid(false);
        Swal.fire({
          icon: 'error',
          title: 'Địa chỉ không hợp lệ',
          text: 'Không tìm thấy địa chỉ này. Vui lòng kiểm tra lại.',
          confirmButtonColor: '#EF4444'
        });
      }
    } catch (e) {
      setAddressValid(false);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi kiểm tra địa chỉ',
        text: 'Không thể kiểm tra địa chỉ. Vui lòng thử lại.',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setCheckingAddress(false);
    }
  }, []);

  // Hàm kiểm tra ký tự unicode và ký tự lạ cho tên sản phẩm
  const validateProductName = (name) => {
    const chars = [...name.trim()];
    // Không ký tự đặc biệt ngoài chữ, số, khoảng trắng, dấu tiếng Việt
    const valid = /^[\p{L}\p{N}\s]+$/u.test(name);
    if (!valid) return 'Tên sản phẩm chỉ được chứa chữ, số và khoảng trắng.';
    if (chars.length < 10) return 'Tên sản phẩm phải có ít nhất 10 ký tự.';
    if (chars.length > 50) return 'Tên sản phẩm không được vượt quá 50 ký tự.';
    return '';
  };

  // Hàm kiểm tra giá
  const validatePrice = (val) => {
    if (!val || isNaN(val)) return 'Giá sản phẩm không hợp lệ.';
    if (Number(val) < 20000) return 'Giá sản phẩm tối thiểu là 20.000₫.';
    return '';
  };

  // Hàm kiểm tra mô tả (tối đa 1000 từ)
  const validateDescription = (desc) => {
    const wordCount = desc.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > 1000) return 'Mô tả sản phẩm không được vượt quá 1000 từ.';
    return '';
  };

  // Lấy danh mục từ API khi mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await commonApi.get(commonUrl.category.getAll);
        // Đảm bảo categories luôn là mảng
        let arr = [];
        // console.log('Categories response:', res);
        if (Array.isArray(res)) arr = res;
        else if (res.data && Array.isArray(res.data.categories)) arr = res.data.categories;
        setCategories(arr);
      } catch (e) {
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  productNameError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập tên sản phẩm"
                value={productName}
                onChange={e => {
                  setProductName(e.target.value);
                  setProductNameError(validateProductName(e.target.value));
                }}
                onBlur={e => setProductNameError(validateProductName(e.target.value))}
                maxLength={60}
              />
              <div className="mt-1 text-xs text-gray-500">
                Tối thiểu 10 ký tự, tối đa 50 ký tự. Chỉ chữ, số và khoảng trắng.
              </div>
              {productNameError && (
                <p className="mt-1 text-xs text-red-500">{productNameError}</p>
              )}
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Giá <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₫</span>
                <input
                  type="number"
                  className={`w-full px-3 py-2 pl-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    priceError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  value={price}
                  min={20000}
                  onChange={e => {
                    setPrice(e.target.value);
                    setPriceError(validatePrice(e.target.value));
                  }}
                  onBlur={e => setPriceError(validatePrice(e.target.value))}
                />
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Giá tối thiểu: 20.000₫
              </div>
              {priceError && (
                <p className="mt-1 text-xs text-red-500">{priceError}</p>
              )}
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
                  placeholder="Nhập thẻ sản phẩm và nhấn enter"
                />
              </div>
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Danh mục
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={category}
                onChange={e => setCategory(e.target.value)}
                disabled={loadingCategories}
              >
                <option value="">Chọn danh mục</option>
                {(Array.isArray(categories) ? categories : []).map(cat => (
                  <option key={cat.id || cat._id || cat.value} value={cat.id || cat._id || cat.value}>
                    {cat.name || cat.label}
                  </option>
                ))}
              </select>
              {loadingCategories && (
                <div className="mt-1 text-xs text-gray-500">Đang tải danh mục...</div>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Địa chỉ
              </label>
              <textarea
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  addressValid ? 'border-gray-300' : 'border-red-500'
                }`}
                rows="5"
                placeholder="Nhập đại chỉ lấy hàng"
                value={address}
                onChange={e => setAddress(e.target.value)}
              ></textarea>
              {!addressValid && (
                <p className="mt-1 text-xs text-red-500">Địa chỉ không hợp lệ hoặc không tìm thấy.</p>
              )}
            </div>

             <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Mô tả sản phẩm
              </label>
              <div className="flex items-start gap-2">
                <textarea
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    descriptionError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  rows="5"
                  placeholder="Nhập mô tả chi tiết về sản phẩm"
                  value={description}
                  onChange={e => {
                    setDescription(e.target.value);
                    setDescriptionError(validateDescription(e.target.value));
                  }}
                  onBlur={e => setDescriptionError(validateDescription(e.target.value))}
                  maxLength={10000}
                ></textarea>
                {/* Nút đánh giá AI */}
                <button
                  type="button"
                  className="px-3 py-2 ml-2 text-xs text-white transition-all rounded-md shadow bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  onClick={async () => {
                    if (!description.trim()) {
                      Swal.fire({
                        icon: 'warning',
                        title: 'Chưa có mô tả',
                        text: 'Vui lòng nhập mô tả sản phẩm để AI đánh giá.',
                        confirmButtonColor: '#3B82F6'
                      });
                      return;
                    }
                    try {
                      await sendMessage(handleContent(description));
                    } catch (e) {
                      // lỗi đã được xử lý trong hook
                    }
                  }}
                  style={{ minWidth: 90 }}
                >
                  Đánh giá mô tả AI
                </button>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Tối đa 1000 từ.
              </div>
              {descriptionError && (
                <p className="mt-1 text-xs text-red-500">{descriptionError}</p>
              )}
              <div className="mt-1 text-xs text-right text-gray-500">
                {description.trim().split(/\s+/).filter(Boolean).length} / 1000 từ
              </div>
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
            onClick={async () => {
              // Kiểm tra lại trước khi submit
              const nameErr = validateProductName(productName);
              const priceErr = validatePrice(price);
              const descErr = validateDescription(description);
              setProductNameError(nameErr);
              setPriceError(priceErr);
              setDescriptionError(descErr);
              if (nameErr || priceErr || descErr) {
                Swal.fire({
                  icon: 'error',
                  title: 'Thông tin chưa hợp lệ',
                  text: 'Vui lòng kiểm tra lại các trường thông tin sản phẩm.',
                  confirmButtonColor: '#EF4444'
                });
                return;
              }
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
              if (!addressValid) {
                Swal.fire({
                  icon: 'error',
                  title: 'Địa chỉ không hợp lệ',
                  text: 'Vui lòng nhập địa chỉ hợp lệ.',
                  confirmButtonColor: '#EF4444'
                });
                return;
              }
              const tags = handleGetTags();
              
              // Xử lý submit form ở đây
              try {
                setLoading(true);
                // Chuẩn bị dữ liệu gửi lên server (multipart/form-data)
                const formData = new FormData();
                formData.append('name', productName);
                formData.append('price', Number(price));
                formData.append('description', description);
                formData.append('address', address);
                formData.append('category', category);
                // Thêm tags (nếu có)
                if (tags && tags.length > 0) {
                  tags.forEach(tag => formData.append('tags', tag.value));
                }
                // Thêm ảnh (dạng file)
                images.forEach(img => {
                  if (img.file) {
                    formData.append('images', img.file, img.name);
                  }
                });

                await commonApi.post(commonUrl.product.upload, formData, {
                  headers: {
                    'Content-Type': 'multipart/form-data'
                  }
                });

                Swal.fire({
                  icon: 'success',
                  title: 'Thành công!',
                  text: 'Sản phẩm đã được đăng thành công!',
                  confirmButtonColor: '#10B981',
                  timer: 2000,
                  showConfirmButton: false
                });
                // Reset form nếu muốn
                setProductName('');
                setPrice('');
                setDescription('');
                setImages([]);
                setAddress('');
                setCategory('');
                if (tagifyInstance.current) tagifyInstance.current.removeAllTags();
              } catch (err) {
                Swal.fire({
                  icon: 'error',
                  title: 'Lỗi',
                  text: err?.message || 'Không thể đăng sản phẩm. Vui lòng thử lại.',
                  confirmButtonColor: '#EF4444'
                });
              } finally {
                setLoading(false);
              }
            }}
            className={`px-6 py-3 font-medium text-white transition-all duration-300 rounded-lg ${
              images.length >= 10 && !productNameError && !priceError && !descriptionError
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 shadow-lg hover:shadow-xl' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={
              loading ||
              images.length < 10 ||
              !addressValid ||
              checkingAddress ||
              !!productNameError ||
              !!priceError ||
              !!descriptionError
            }
          >
            {loading ? (
              <>
                <svg className="inline w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Đang đăng sản phẩm...
              </>
            ) : images.length >= 10 ? (
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