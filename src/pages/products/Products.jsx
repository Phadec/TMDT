import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cva } from 'class-variance-authority';

import { ChatWithAI, Search } from "~/components/items";
import {apiServices} from "~/api";

// Fallback image nếu API không trả về hình ảnh
const FALLBACK_IMAGE = "/assets/home/demo/demo.jpg";

const paginationButtonStyles = cva(
  'px-4 py-2 rounded-lg font-semibold border transition',
  {
    variants: {
      state: {
        active: 'bg-purple-600 text-white border-purple-600',
        inactive: 'bg-white text-purple-600 border-purple-300 hover:bg-purple-100',
      },
    },
    defaultVariants: {
      state: 'inactive',
    },
  }
);

export default function Products() {
  // State cho dữ liệu sản phẩm
  const [allProducts, setAllProducts] = useState([]); // Lưu trữ tất cả sản phẩm
  const [products, setProducts] = useState([]); // Sản phẩm đã lọc
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho phân trang
  const [page, setPage] = useState(1);
  const perPage = 15; // Số sản phẩm trên mỗi trang, phù hợp với cấu hình server
  const [totalPages, setTotalPages] = useState(0); // Tổng số trang từ server
  
  // State cho mobile chat
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  // Fetch sản phẩm khi component mount hoặc khi trang thay đổi
  useEffect(() => {
    fetchProducts(page - 1); // API sử dụng page bắt đầu từ 0
  }, [page]);

  // Hàm fetch sản phẩm từ API với phân trang
  const fetchProducts = async (pageIndex = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      // Gọi API lấy danh sách sản phẩm với phân trang
      const response = await apiServices.products.getProducts(pageIndex, perPage);
      
      console.log("API Response:", response); // Log để debug cấu trúc dữ liệu
      
      // Kiểm tra và xử lý response theo cấu trúc thực tế từ server
      if (response && response.content && Array.isArray(response.content) && response.content.length > 0) {
        // Chuẩn hóa dữ liệu sản phẩm
        const normalizedProducts = response.content.map(product => ({
          id: product.id || Math.random().toString(36).substr(2, 9),
          name: product.name || 'Sản phẩm không tên',
          price: product.price ? `${product.price.toLocaleString('vi-VN')}đ` : 'Liên hệ',
          image: product.images && product.images.length > 0 ? product.images[0] : FALLBACK_IMAGE,
          location: product.location || 'Không xác định',
          condition: product.status || 'Mới',
          category: product.productCategory || 'Khác',
        }));
        
        // Cập nhật danh sách sản phẩm
        setProducts(normalizedProducts);
        
        // Lưu trữ tất cả sản phẩm đã tải (cho AI filter)
        if (pageIndex === 0) {
          // Nếu là trang đầu tiên, reset danh sách
          setAllProducts(normalizedProducts);
        }
        
        // Cập nhật thông tin phân trang từ server
        if (response.totalPages) {
          setTotalPages(response.totalPages);
        }
      } else {
        // Nếu không có dữ liệu hoặc dữ liệu không đúng định dạng
        setError("Không có sản phẩm nào. Vui lòng thử lại sau.");
        setProducts([]);
        if (pageIndex === 0) {
          setAllProducts([]);
        }
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
      setProducts([]);
      if (pageIndex === 0) {
        setAllProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Xử lý lọc sản phẩm từ AI (sẽ được xử lý bởi component ChatWithAI)
  // Hàm này có thể được gọi từ component ChatWithAI để cập nhật danh sách sản phẩm
  const updateProductsFromAI = (filteredProducts) => {
    if (Array.isArray(filteredProducts) && filteredProducts.length > 0) {
      setProducts(filteredProducts);
    } else {
      setProducts(allProducts); // Nếu không có kết quả lọc, hiển thị tất cả sản phẩm
    }
    setPage(1); // Reset về trang đầu tiên khi lọc
  };

  // Sản phẩm hiển thị là những sản phẩm đã được lấy từ server cho trang hiện tại
  const paginatedProducts = products;

  return (
    <div className="min-h-screen px-4 py-6 pt-12 w-90 sm:px-8 lg:px-14 bg-gradient-to-br from-purple-100 via-white to-indigo-100">
      <div>
        {/* Thanh tìm kiếm bằng AI */}
        <Search />
      </div>

      {/* Phân mục sản phẩm */}
      <div className="min-h-screen gap-6 p-6 bg-gradient-to-br from-purple-100 via-white to-indigo-100 md:flex">
        {/* Chat Section - Desktop */}
        <div className="flex-1 max-w-[40%]">
          <ChatWithAI onFilterResults={updateProductsFromAI} products={allProducts} />
        </div>

        {/* Products Section */}
        <div className="flex-2">
          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center w-full h-64">
              <div className="w-16 h-16 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="p-4 text-center text-red-600 bg-red-100 rounded-lg">
              <p>{error}</p>
              <button 
                onClick={fetchProducts}
                className="px-4 py-2 mt-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Products grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.03 }}
                  className="overflow-hidden transition bg-white border border-gray-200 shadow-md rounded-3xl hover:shadow-xl"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full h-48"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_IMAGE;
                    }}
                  />
                  <div className="p-4">
                    <h3 className="mb-1 text-lg font-bold text-gray-800">
                      {product.name}
                    </h3>
                    <p className="mb-1 font-semibold text-purple-700">
                      {product.price}
                    </p>
                    <p className="text-sm text-gray-500">
                      📍 {product.location} | 🛠️ {product.condition}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {products.length === 0 && !loading && (
                <p className="text-center text-gray-500 col-span-full">
                  Không tìm thấy sản phẩm phù hợp 😢
                </p>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {/* Nút Previous */}
              {page > 1 && (
                <button
                  onClick={() => setPage(page - 1)}
                  className={paginationButtonStyles({ state: 'inactive' })}
                >
                  &laquo; Trước
                </button>
              )}
              
              {/* Hiển thị các nút trang */}
              {(() => {
                const pageButtons = [];
                let startPage = Math.max(1, page - 2);
                let endPage = Math.min(totalPages, page + 2);
                
                // Đảm bảo luôn hiển thị 5 nút nếu có đủ trang
                if (endPage - startPage < 4 && totalPages > 5) {
                  if (startPage === 1) {
                    endPage = Math.min(5, totalPages);
                  } else if (endPage === totalPages) {
                    startPage = Math.max(1, totalPages - 4);
                  }
                }
                
                // Nút trang đầu tiên
                if (startPage > 1) {
                  pageButtons.push(
                    <button
                      key={1}
                      onClick={() => setPage(1)}
                      className={paginationButtonStyles({ state: 'inactive' })}
                    >
                      1
                    </button>
                  );
                  
                  // Hiển thị dấu ... nếu không liền kề với trang đầu
                  if (startPage > 2) {
                    pageButtons.push(
                      <span key="ellipsis1" className="px-2 py-1">...</span>
                    );
                  }
                }
                
                // Các nút trang chính
                for (let i = startPage; i <= endPage; i++) {
                  pageButtons.push(
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={paginationButtonStyles({ state: page === i ? 'active' : 'inactive' })}
                    >
                      {i}
                    </button>
                  );
                }
                
                // Nút trang cuối cùng
                if (endPage < totalPages) {
                  // Hiển thị dấu ... nếu không liền kề với trang cuối
                  if (endPage < totalPages - 1) {
                    pageButtons.push(
                      <span key="ellipsis2" className="px-2 py-1">...</span>
                    );
                  }
                  
                  pageButtons.push(
                    <button
                      key={totalPages}
                      onClick={() => setPage(totalPages)}
                      className={paginationButtonStyles({ state: 'inactive' })}
                    >
                      {totalPages}
                    </button>
                  );
                }
                
                return pageButtons;
              })()}
              
              {/* Nút Next */}
              {page < totalPages && (
                <button
                  onClick={() => setPage(page + 1)}
                  className={paginationButtonStyles({ state: 'inactive' })}
                >
                  Tiếp &raquo;
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}