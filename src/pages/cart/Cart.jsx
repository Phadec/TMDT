import { NotiSale, CardGridProduct } from "~/components/items";
import { ShoppingCartIcon, FunnelIcon, AdjustmentsHorizontalIcon, ChevronDownIcon, TrashIcon, CreditCardIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { buttonVariant, inputVariant, containerVariant, tagVariant } from "./cartVariant"; // Import CVA
import { apiServices } from "~/api";
import { useCart } from "~/contexts/CartContext";

function Cart() {
  const navigate = useNavigate();
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
  
  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  // Hàm xử lý chọn tất cả (chỉ cho trang hiện tại)
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      // Thêm tất cả items trong trang hiện tại vào selectedItems
      const currentPageIds = currentItems.map(item => item.productId);
      setSelectedItems(prev => {
        const newSelected = [...prev];
        currentPageIds.forEach(id => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      });
    } else {
      // Xóa tất cả items trong trang hiện tại khỏi selectedItems
      const currentPageIds = currentItems.map(item => item.productId);
      setSelectedItems(prev => prev.filter(id => !currentPageIds.includes(id)));
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

  // Tính toán phân trang
  const totalPages = Math.ceil(cartItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = cartItems.slice(startIndex, endIndex);

  // Cập nhật selectAll khi selectedItems thay đổi (chỉ cho trang hiện tại)
  useEffect(() => {
    if (currentItems.length > 0) {
      const currentPageIds = currentItems.map(item => item.productId);
      const allCurrentPageSelected = currentPageIds.every(id => selectedItems.includes(id));
      setSelectAll(allCurrentPageSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedItems, currentItems]);

  // Hàm chuyển trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Reset selected items khi chuyển trang để tránh confusion
    setSelectedItems([]);
    setSelectAll(false);
  };

  // Reset về trang 1 khi cartItems thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [cartItems.length]);

  // Hàm chuyển đến trang thanh toán
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Giỏ hàng trống',
        text: 'Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.',
        confirmButtonText: 'Tiếp tục mua sắm'
      }).then(() => {
        navigate('/products');
      });
      return;
    }

    if (selectedItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Chưa chọn sản phẩm',
        text: 'Vui lòng chọn ít nhất một sản phẩm để thanh toán.',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!isAuthenticated) {
      Swal.fire({
        icon: 'info',
        title: 'Cần đăng nhập',
        text: 'Vui lòng đăng nhập để tiếp tục thanh toán.',
        showCancelButton: true,
        confirmButtonText: 'Đăng nhập',
        cancelButtonText: 'Hủy'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }

    // Lấy thông tin các sản phẩm đã chọn
    const selectedProducts = cartItems.filter(item => selectedItems.includes(item.productId));
    
    // Lưu thông tin sản phẩm đã chọn vào localStorage để truyền sang trang checkout
    localStorage.setItem('selectedCheckoutItems', JSON.stringify(selectedProducts));
    
    navigate('/checkout');
  };

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
        
        // Kiểm tra và điều chỉnh trang hiện tại nếu cần
        const newTotalPages = Math.ceil((cartItems.length - selectedItems.length) / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
        
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
          {/* Tính năng nhanh */}
          <div className="flex justify-between items-center px-2">
            <div className="text-sm">
              <input 
                type="checkbox" 
                className="mr-2" 
                checked={selectAll}
                onChange={(e) => handleSelectAll(e.target.checked)}
              /> 
              Chọn tất cả trang này ({currentItems.filter(item => selectedItems.includes(item.productId)).length}/{currentItems.length})
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
                {currentItems.map((item, index) => (
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
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Hiển thị {startIndex + 1}-{Math.min(endIndex, cartItems.length)} trong tổng số {cartItems.length} sản phẩm
                      </div>
                      <div className="flex space-x-2">
                        {/* Previous button */}
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-purple-600 border border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          Trước
                        </button>
                        
                        {/* Page numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-purple-600 border border-purple-300 hover:bg-purple-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        
                        {/* Next button */}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === totalPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-purple-600 border border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          Sau
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cart summary */}
                <div className="p-6 bg-gradient-to-r from-gray-50 to-purple-50 border-t border-gray-200">
                  <div className="space-y-4">
                    {/* Thông tin tổng tiền */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                        <span className="text-2xl font-bold text-purple-600">
                          {cartItems.reduce((total, item) => total + Number(item.price || 0), 0).toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                            minimumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Nút thanh toán */}
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => navigate('/products')}
                        className="flex-1 px-4 py-3 bg-white text-purple-600 font-medium rounded-lg border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-colors duration-200 text-center"
                      >
                        Tiếp tục mua sắm
                      </button>
                      
                      <button 
                        onClick={handleCheckout}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center group shadow-lg"
                      >
                        <CreditCardIcon className="w-4 h-4 mr-1" />
                        Thanh toán
                        <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                      </button>
                    </div>

                    {/* Thông tin bảo mật */}
                    <div className="text-center">
                      <p className="text-xs text-gray-500">
                        🔒 Thanh toán an toàn và bảo mật
                      </p>
                    </div>
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