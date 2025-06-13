import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cva } from 'class-variance-authority';

import { ChatWithAI, Search } from "~/components/items";
import { Tool } from "~/components/items";
import apiServices from "~/api/services";

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
  const perPage = 6;
  
  // State cho chat
  const [chatFilter, setChatFilter] = useState("");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  // Fetch sản phẩm khi component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Hàm fetch sản phẩm từ API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Gọi API lấy danh sách sản phẩm
      const response = await apiServices.products.getProducts(0, 100); // Lấy nhiều sản phẩm để xử lý phân trang ở client
      
      // Kiểm tra và xử lý response
      if (response && Array.isArray(response.items) && response.items.length > 0) {
        // Chuẩn hóa dữ liệu sản phẩm
        const normalizedProducts = response.items.map(product => ({
          id: product.id || Math.random().toString(36).substr(2, 9),
          name: product.name || 'Sản phẩm không tên',
          price: product.price ? `${product.price.toLocaleString('vi-VN')}đ` : 'Liên hệ',
          image: product.imageUrl || FALLBACK_IMAGE,
          location: product.location || 'Không xác định',
          condition: product.condition || 'Mới',
          category: product.category || 'Khác',
        }));
        
        setAllProducts(normalizedProducts);
        setProducts(normalizedProducts);
      } else {
        // Nếu không có dữ liệu hoặc dữ liệu không đúng định dạng
        setError("Không có sản phẩm nào. Vui lòng thử lại sau.");
        setAllProducts([]);
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
      setAllProducts([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý lọc sản phẩm từ chat
  const handleChatFilter = () => {
    if (!chatFilter.trim()) {
      setProducts(allProducts);
      setPage(1);
      return;
    }
    
    const filtered = allProducts.filter((p) =>
      p.name.toLowerCase().includes(chatFilter.toLowerCase()) ||
      p.category.toLowerCase().includes(chatFilter.toLowerCase()) ||
      p.condition.toLowerCase().includes(chatFilter.toLowerCase()) ||
      p.location.toLowerCase().includes(chatFilter.toLowerCase())
    );
    
    setProducts(filtered);
    setPage(1);
  };

  // Xử lý lọc sản phẩm từ Tool component
  const handleFilterProducts = (filters, viewMode, priceRange) => {
    console.log("Filters:", filters);
    console.log("View Mode:", viewMode);
    console.log("Price Range:", priceRange);

    // Bắt đầu với tất cả sản phẩm
    let filtered = [...allProducts];
    
    // Lọc theo các tiêu chí nếu có
    if (filters) {
      // Lọc theo danh mục
      if (filters.category) {
        filtered = filtered.filter(product => 
          product.category && product.category.toLowerCase().includes(filters.category.toLowerCase())
        );
      }
      
      // Lọc theo tình trạng
      if (filters.condition) {
        filtered = filtered.filter(product => 
          product.condition && product.condition.toLowerCase() === filters.condition.toLowerCase()
        );
      }
      
      // Lọc theo địa điểm
      if (filters.location) {
        filtered = filtered.filter(product => 
          product.location && product.location.toLowerCase().includes(filters.location.toLowerCase())
        );
      }
    }
    
    // Lọc theo khoảng giá nếu có
    if (priceRange && priceRange.length === 2) {
      filtered = filtered.filter(product => {
        // Chuyển đổi giá từ string sang number
        const priceValue = parseFloat(product.price.replace(/[^\d]/g, ''));
        return priceValue >= priceRange[0] && priceValue <= priceRange[1];
      });
    }

    // Đặt lại trang về 1 khi lọc
    setPage(1);

    // Cập nhật danh sách sản phẩm
    setProducts(filtered);
  };

  // Tính toán sản phẩm cho trang hiện tại
  const paginatedProducts = products.slice(
    (page - 1) * perPage,
    page * perPage
  );
  
  // Tính tổng số trang
  const totalPages = Math.ceil(products.length / perPage);

  return (
    <div className="min-h-screen px-4 py-6 pt-12 w-90 sm:px-8 lg:px-14 bg-gradient-to-br from-purple-100 via-white to-indigo-100">
      {/* Thanh công cụ lọc */}
      <Tool onFilterChange={handleFilterProducts} />

      <div>
        {/* Thanh tìm kiếm bằng AI */}
        <Search />
      </div>

      {/* Phân mục sản phẩm */}
      <div className="min-h-screen gap-6 p-6 bg-gradient-to-br from-purple-100 via-white to-indigo-100 md:flex">
        {/* Chat Section - Desktop */}
        <div className="flex-1 max-w-[40%]">
          <ChatWithAI />
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
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={paginationButtonStyles({ state: page === i + 1 ? 'active' : 'inactive' })}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}