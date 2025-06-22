import { NotiSale, CardGridProduct } from "~/components/items";
import { ShoppingCartIcon, FunnelIcon, AdjustmentsHorizontalIcon, ChevronDownIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Swal from 'sweetalert2';
import { buttonVariant, inputVariant, containerVariant, tagVariant } from "./cartVariant"; // Import CVA
import { apiServices } from "~/api";
import { useCart } from "~/contexts/CartContext";

function Cart() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { removeFromCart, removeFromCartOnly, refreshCart } = useCart(); // Sử dụng CartContext
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [sortBy, setSortBy] = useState("relevance");
  
  // State cho giỏ hàng
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartId, setCartId] = useState(null);
  
  // State cho checkbox
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Lấy dữ liệu giỏ hàng khi component mount
  useEffect(() => {
    const storedCartId = localStorage.getItem('cartId');
    if (storedCartId && isAuthenticated) {
      setCartId(storedCartId);
      fetchCartItems(storedCartId);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Hàm lấy dữ liệu giỏ hàng từ API
  const fetchCartItems = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiServices.cart.getCartItems(id);
      
      if (response && Array.isArray(response)) {
        setCartItems(response);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setError('Không thể tải giỏ hàng. Vui lòng thử lại sau.');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xóa sản phẩm khỏi giỏ hàng
  const handleRemoveFromCart = async (productId) => {
    if (!cartId) return;

    try {
      // Hiển thị xác nhận xóa
      const result = await Swal.fire({
        title: 'Xác nhận xóa',
        text: 'Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        // Sử dụng removeFromCart từ CartContext để tự động update số lượng
        const response = await removeFromCart(cartId, productId);
        
        if (response) {
          // Cập nhật danh sách giỏ hàng local
          if (Array.isArray(response)) {
            setCartItems(response);
          } else {
            // Nếu API không trả về danh sách mới, fetch lại
            await fetchCartItems(cartId);
          }
          
          // Xóa sản phẩm khỏi selectedItems nếu có
          setSelectedItems(prev => prev.filter(id => id !== productId));
          
          Swal.fire({
            icon: 'success',
            title: 'Đã xóa!',
            text: 'Sản phẩm đã được xóa khỏi giỏ hàng.',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        }
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Không thể xóa sản phẩm. Vui lòng thử lại.',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }
  };

  // Hàm xử lý chọn tất cả
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedItems(cartItems.map(item => item.productId));
    } else {
      setSelectedItems([]);
    }
  };

  // Hàm xử lý chọn từng item
  const handleSelectItem = (productId, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, productId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== productId));
      setSelectAll(false);
    }
  };

  // Cập nhật selectAll khi selectedItems thay đổi
  useEffect(() => {
    if (cartItems.length > 0 && selectedItems.length === cartItems.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedItems, cartItems]);

  // Hàm xóa các sản phẩm đã chọn
  const handleRemoveSelectedItems = async () => {
    if (selectedItems.length === 0) return;

    try {
      const result = await Swal.fire({
        title: 'Xác nhận xóa',
        text: `Bạn có chắc chắn muốn xóa ${selectedItems.length} sản phẩm đã chọn?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        // Xóa từng sản phẩm đã chọn mà không tự động refresh từng lần
        for (const productId of selectedItems) {
          await removeFromCartOnly(cartId, productId);
        }
        
        // Refresh cart local và context một lần duy nhất sau khi xóa hết
        await fetchCartItems(cartId);
        await refreshCart(); // Cập nhật số lượng trong context
        setSelectedItems([]);
        setSelectAll(false);
        
        Swal.fire({
          icon: 'success',
          title: 'Đã xóa!',
          text: `Đã xóa ${selectedItems.length} sản phẩm khỏi giỏ hàng.`,
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      }
    } catch (error) {
      console.error('Error removing selected items:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Không thể xóa sản phẩm. Vui lòng thử lại.',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }
  };
  return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white text-gray-800 mx-20 my-10">
        {/* Thanh thông báo */}
        <NotiSale />

        <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
          {/* Bộ lọc nâng cao */}
          <div className={containerVariant({type: 'filter'})}>
            {/* Phần header của bộ lọc */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-indigo-600" />
                <h3 className="font-medium text-gray-800">Bộ lọc sản phẩm</h3>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                      type="text"
                      placeholder="Tìm sản phẩm..."
                      className={inputVariant({ type: 'text' })}
                  />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={buttonVariant({ intent: 'filter' })}
                >
                  <AdjustmentsHorizontalIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Tùy chọn lọc</span>
                  <ChevronDownIcon className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Phần mở rộng của bộ lọc */}
            {showFilters && (
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Lọc theo danh mục */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Danh mục</h4>
                      <div className="space-y-1">
                        {['all', 'electronics', 'clothing', 'books', 'home'].map((category) => (
                            <div key={category} className="flex items-center">
                              <input
                                  type="radio"
                                  id={`category-${category}`}
                                  name="category"
                                  checked={selectedCategory === category}
                                  onChange={() => setSelectedCategory(category)}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700 capitalize">
                                {category === 'all' ? 'Tất cả' :
                                    category === 'electronics' ? 'Điện tử' :
                                        category === 'clothing' ? 'Quần áo' :
                                            category === 'books' ? 'Sách' : 'Đồ gia dụng'}
                              </label>
                            </div>
                        ))}
                      </div>
                    </div>

                    {/* Lọc theo giá */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Khoảng giá</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{priceRange[0].toLocaleString()}₫</span>
                          <span>{priceRange[1].toLocaleString()}₫</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1000000"
                            step="50000"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                            className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex space-x-2">
                          <button
                              className={buttonVariant({ intent: 'price', active: priceRange[1] <= 200000 })}
                              onClick={() => setPriceRange([0, 200000])}
                          >
                            &lt; 200K
                          </button>
                          <button
                              className={buttonVariant({ intent: 'price', active: priceRange[1] > 200000 && priceRange[1] <= 500000 })}
                              onClick={() => setPriceRange([200000, 500000])}
                          >
                            200K - 500K
                          </button>
                          <button
                              className={buttonVariant({ intent: 'price', active: priceRange[1] > 500000 })}
                              onClick={() => setPriceRange([500000, 1000000])}
                          >
                            &gt; 500K
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Sắp xếp */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Sắp xếp theo</h4>
                      <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className={inputVariant({ type: 'select' })}
                      >
                        <option value="relevance">Phù hợp nhất</option>
                        <option value="price-asc">Giá: Thấp đến cao</option>
                        <option value="price-desc">Giá: Cao đến thấp</option>
                        <option value="newest">Mới nhất</option>
                        <option value="popular">Phổ biến nhất</option>
                      </select>
                    </div>
                  </div>

                  {/* Nút áp dụng và đặt lại */}
                  <div className="flex justify-end mt-4 space-x-2">
                    <button className={buttonVariant({intent: 'secondary'})}>
                      Đặt lại
                    </button>
                    <button className={buttonVariant({intent: 'primary'})}>
                      Áp dụng
                    </button>
                  </div>
                </div>
            )}

            {/* Thanh trạng thái lọc */}
            <div className={containerVariant({type: 'status'})}>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Hiển thị: <b>{cartItems.length}</b> sản phẩm</span>
                {selectedCategory !== 'all' && (
                    <div className={tagVariant()}>
                      Danh mục: {selectedCategory === 'electronics' ? 'Điện tử' :
                        selectedCategory === 'clothing' ? 'Quần áo' :
                            selectedCategory === 'books' ? 'Sách' : 'Đồ gia dụng'}
                      <button className="ml-1 text-gray-500 hover:text-gray-700">×</button>
                    </div>
                )}
                {priceRange[1] < 1000000 && (
                    <div className={tagVariant()}>
                      Giá: {priceRange[0].toLocaleString()}₫ - {priceRange[1].toLocaleString()}₫
                      <button className="ml-1 text-gray-500 hover:text-gray-700">×</button>
                    </div>
                )}
              </div>
              <div className="flex space-x-4">
                <button className={buttonVariant({ intent: 'tag', active: selectedCategory === 'all' })}>
                  Tất cả
                </button>
                <button className={buttonVariant({intent: 'tag'})}> 
                  Đã lưu
                </button>
              </div>
            </div>
          </div>

          {/* Tính năng nhanh */}
          <div className="flex justify-between items-center px-2">
            <div className="text-sm">
              <input 
                type="checkbox" 
                className="mr-2" 
                checked={selectAll}
                onChange={(e) => handleSelectAll(e.target.checked)}
              /> 
              Chọn tất cả ({selectedItems.length}/{cartItems.length})
            </div>
            <button 
              className={`text-sm ${selectedItems.length > 0 ? 'text-red-500 hover:text-red-700' : 'text-gray-400 cursor-not-allowed'}`}
              onClick={handleRemoveSelectedItems}
              disabled={selectedItems.length === 0}
            >
              Xóa sản phẩm đã chọn ({selectedItems.length})
            </button>
          </div>

          {/* Danh sách sản phẩm trong giỏ hàng */}
          <div className="bg-white rounded-lg shadow-sm">
            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">Đang tải giỏ hàng...</span>
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="text-center py-12">
                <div className="text-red-600 mb-4">{error}</div>
                <button 
                  onClick={() => cartId && fetchCartItems(cartId)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Empty cart */}
            {!loading && !error && cartItems.length === 0 && (
              <div className="text-center py-12">
                <ShoppingCartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Giỏ hàng trống</h3>
                <p className="text-gray-500 mb-4">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
                <button 
                  onClick={() => window.location.href = '/products'}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            )}

            {/* Cart items */}
            {!loading && !error && cartItems.length > 0 && (
              <div className="divide-y divide-gray-200">
                {cartItems.map((item, index) => (
                  <div key={`${item.productId}-${index}`} className="p-6 flex items-center space-x-4">
                    {/* Checkbox */}
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      checked={selectedItems.includes(item.productId)}
                      onChange={(e) => handleSelectItem(item.productId, e.target.checked)}
                    />
                    
                    {/* Product image placeholder */}
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <ShoppingCartIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    
                    {/* Product info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">Mã sản phẩm: {item.productId}</p>
                      <div className="mt-2">
                        <span className="text-lg font-semibold text-purple-600">
                          {Number(item.price).toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                            minimumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                    </div>
                    

                    
                    {/* Remove button */}
                    <button 
                      onClick={() => handleRemoveFromCart(item.productId)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa sản phẩm"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                
                {/* Cart summary */}
                <div className="p-6 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-medium">Tổng cộng:</span>
                    <span className="text-xl font-bold text-purple-600">
                      {cartItems.reduce((total, item) => total + Number(item.price || 0), 0).toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        minimumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                  <div className="flex space-x-4">
                    <button className="flex-1 px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                      Cập nhật giỏ hàng
                    </button>
                    <button className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      Thanh toán
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
  );
}

export default Cart;