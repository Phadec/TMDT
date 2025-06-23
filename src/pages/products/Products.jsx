import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cva } from "class-variance-authority";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ShoppingCartIcon, CreditCardIcon } from "@heroicons/react/24/solid";
import Swal from "sweetalert2";
import { Tool } from "~/components/items";

import { Search } from "~/components/items";
import { apiServices } from "~/api";
import { commonUrl } from "~/api";
import { useCart } from "~/contexts/CartContext";

// Fallback image nếu API không trả về hình ảnh
const FALLBACK_IMAGE = "/assets/home/demo/demo.jpg";

// Mảng các kiểu dáng tag ngẫu nhiên
const tagStyles = [
  "bg-blue-100 text-blue-800 border border-blue-300",
  "bg-green-100 text-green-800 border border-green-300",
  "bg-yellow-100 text-yellow-800 border border-yellow-300",
  "bg-red-100 text-red-800 border border-red-300",
  "bg-purple-100 text-purple-800 border border-purple-300",
  "bg-pink-100 text-pink-800 border border-pink-300",
  "bg-indigo-100 text-indigo-800 border border-indigo-300",
  "bg-gray-100 text-gray-800 border border-gray-300",
];

// Hàm tạo tag từ chuỗi mô tả, tách theo ký tự xuống dòng (\n)
const renderTags = (description) => {
  if (!description) return null;

  return description.split("\n").map((tag, index) => {
    if (!tag.trim()) return null;

    // Chọn kiểu dáng ngẫu nhiên cho mỗi tag
    const randomStyle = tagStyles[Math.floor(Math.random() * tagStyles.length)];

    return (
      <span
        key={index}
        className={`text-xs px-2 py-1 rounded-full ${randomStyle}`}
      >
        {tag.trim()}
      </span>
    );
  });
};

const paginationButtonStyles = cva(
  "px-4 py-2 rounded-lg font-semibold border transition",
  {
    variants: {
      state: {
        active: "bg-purple-600 text-white border-purple-600",
        inactive:
          "bg-white text-purple-600 border-purple-300 hover:bg-purple-100",
      },
    },
    defaultVariants: {
      state: "inactive",
    },
  }
);

export default function Products() {
  const navigate = useNavigate(); // Hook để điều hướng trang
  const { user, isAuthenticated } = useSelector((state) => state.auth); // Lấy thông tin user từ Redux
  const { addToCart, checkProductInCart } = useCart(); // Hook để quản lý giỏ hàng

  // State cho dữ liệu sản phẩm
  const [products, setProducts] = useState([]); // Sản phẩm từ API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);

  // State cho phân trang
  const [page, setPage] = useState(1);
  const perPage = 15; // Số sản phẩm trên mỗi trang, phù hợp với cấu hình server
  const [totalPages, setTotalPages] = useState(0); // Tổng số trang từ server

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
      const response = await apiServices.products.getProducts(
        pageIndex,
        perPage
      );

      // Kiểm tra và xử lý response theo cấu trúc thực tế từ server
      if (
        response &&
        response.content &&
        Array.isArray(response.content) &&
        response.content.length > 0
      ) {
        // Chuẩn hóa dữ liệu sản phẩm
        const normalizedProducts = response.content.map((product) => ({
          id: product.id || Math.random().toString(36).substring(2, 11),
          name: product.name || "Sản phẩm không tên",
          shortDescription: product.shortDes || "Không có mô tả",
          review: product.imageReview || FALLBACK_IMAGE,
          price:
            product.price && product.price > 0
              ? `${Number(product.price).toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  minimumFractionDigits: 0,
                })}`
              : "Liên hệ để biết thêm thông tin",
          location: product.location || "Không xác định",
          condition: product.status || "Mới",
          category: product.productCategory.name || "Khác",
        }));

        // Cập nhật danh sách sản phẩm
        setProducts(normalizedProducts);

        // Cập nhật thông tin phân trang từ server
        if (response.totalPages) {
          setTotalPages(response.totalPages);
        }
      } else {
        // Nếu không có dữ liệu hoặc dữ liệu không đúng định dạng
        setError("Không có sản phẩm nào. Vui lòng thử lại sau.");
        setProducts([]);
      }
    } catch (err) {
      setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Sản phẩm hiển thị là những sản phẩm đã được lấy từ server cho trang hiện tại
  const paginatedProducts = products;

  // Hàm xử lý khi người dùng click vào sản phẩm
  const handleProductClick = (productId) => {
    // Lưu vào localStorage
    try {
      const key = "recentlyViewedIds";
      let ids = localStorage.getItem(key);
      let idArr = ids ? ids.split(",").filter(Boolean) : [];
      // Đưa id lên đầu, loại bỏ nếu đã có
      idArr = [productId, ...idArr.filter(id => id !== String(productId))];
      // Giới hạn số lượng id nếu muốn (ví dụ 20)
      if (idArr.length > 20) idArr = idArr.slice(0, 20);
      localStorage.setItem(key, idArr.join(","));
    } catch (e) {
      // Không làm gì nếu localStorage lỗi
    }
    navigate(commonUrl.product.detail(productId));
  };

  // Hàm xử lý thêm vào giỏ hàng
  const handleAddToCart = async (e, product) => {
    e.stopPropagation(); // Ngăn không cho click event bubble up

    // Kiểm tra đăng nhập
    if (!isAuthenticated || !user) {
      Swal.fire({
        icon: "warning",
        title: "Chưa đăng nhập",
        text: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng",
        showCancelButton: true,
        confirmButtonText: "Đăng nhập",
        cancelButtonText: "Hủy",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }

    try {
      setCartLoading(true);
      
      // Kiểm tra sản phẩm đã tồn tại trong giỏ hàng chưa
      const isProductInCart = await checkProductInCart(product.id);
      
      if (isProductInCart) {
        // Hiển thị thông báo sản phẩm đã có trong giỏ hàng
        Swal.fire({
          icon: 'info',
          title: 'Sản phẩm đã có trong giỏ hàng',
          text: `"${product.name}" đã có trong giỏ hàng của bạn. Bạn có muốn xem giỏ hàng không?`,
          showCancelButton: true,
          confirmButtonText: 'Xem giỏ hàng',
          cancelButtonText: 'Tiếp tục mua sắm'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/cart');
          }
        });
        return;
      }
      // Tạo dữ liệu sản phẩm và khách hàng
      const productData = {
        customer: {
          id: user.id || user.customerId,
          name: user.name || user.fullName || "Khách hàng",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
        },
        product: [
          {
            productId: product.id,
            name: product.name,
            price: product.price.replace(/[^\d]/g, "") || "0", // Loại bỏ ký tự không phải số
          },
        ],
      };

      // Gọi API thêm vào giỏ hàng với cartId tự động quản lý (TTL 30 ngày)
      const response = await addToCart(productData);

      if (response) {
        // Hiển thị toast thành công
        Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: `Đã thêm "${product.name}" vào giỏ hàng!`,
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text:
          error.message ||
          "Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.",
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    } finally {
      setCartLoading(false);
    }
  };

  // Hàm xử lý thanh toán ngay
  const handleBuyNow = (e, product) => {
    e.stopPropagation(); // Ngăn không cho click event bubble up
    // TODO: Implement buy now logic
    console.log("Mua ngay:", product);
    // Có thể chuyển hướng đến trang thanh toán hoặc mở modal thanh toán
    alert(`Chuyển đến trang thanh toán cho "${product.name}"`);
  };

  return (
    <div className="min-h-screen px-4 py-6 pt-12 w-90 sm:px-8 lg:px-14 bg-gradient-to-br from-purple-100 via-white to-indigo-100">
      <div>
        {/* Thanh tìm kiếm bằng AI */}
        <Search />
      </div>

      <div className="">
        <Tool />
      </div>

      {/* Phân mục sản phẩm */}
      <div className="min-h-screen p-6 bg-gradient-to-br from-purple-100 via-white to-indigo-100">
        {/* Products Section */}
        <div className="w-full">
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 auto-rows-fr">
              {paginatedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.03 }}
                  className="flex flex-col h-full overflow-hidden transition bg-white border border-gray-200 shadow-md cursor-pointer rounded-3xl hover:shadow-xl"
                  onClick={() => handleProductClick(product.id)}
                >
                  <img
                    src={product.review}
                    alt={product.name}
                    className="object-cover w-full h-48"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_IMAGE;
                    }}
                  />
                  <div className="flex flex-col flex-grow p-4">
                    <div className="flex items-center justify-between px-4 py-2 mb-4 transition-shadow duration-200 bg-white rounded-lg shadow-sm hover:shadow-md">
                      <h3 className="flex-grow text-base font-semibold text-gray-800 line-clamp-2">
                        {product.name}
                      </h3>
                      <span className="px-3 py-1 ml-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-full shadow-sm whitespace-nowrap">
                        {product.category}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2 min-h-[2rem]">
                      {renderTags(product.shortDescription)}
                    </div>
                    <div className="mt-auto">
                      <p className="mb-1 font-semibold text-purple-700">
                        Giá: {product.price}
                      </p>
                      <p className="mb-3 text-sm text-gray-500">
                        📍 {product.location} | 🛠️ {product.condition}
                      </p>

                      {/* Action buttons */}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={cartLoading}
                          className="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 bg-purple-600 rounded-lg shadow-sm hover:bg-purple-700 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Thêm vào giỏ hàng"
                        >
                          {cartLoading ? (
                            <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                          ) : (
                            <ShoppingCartIcon className="w-4 h-4" />
                          )}
                          <span className="hidden sm:inline">
                            {cartLoading ? "Đang thêm..." : "Giỏ hàng"}
                          </span>
                        </button>

                        <button
                          onClick={(e) => handleBuyNow(e, product)}
                          className="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 bg-green-600 rounded-lg shadow-sm hover:bg-green-700 hover:shadow-md"
                          title="Mua ngay"
                        >
                          <CreditCardIcon className="w-4 h-4" />
                          <span className="hidden sm:inline">Mua ngay</span>
                        </button>
                      </div>
                    </div>
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
                      className={paginationButtonStyles({ state: "inactive" })}
                    >
                      1
                    </button>
                  );

                  // Hiển thị dấu ... nếu không liền kề với trang đầu
                  if (startPage > 2) {
                    pageButtons.push(
                      <span key="ellipsis1" className="px-2 py-1">
                        ...
                      </span>
                    );
                  }
                }

                // Các nút trang chính
                for (let i = startPage; i <= endPage; i++) {
                  pageButtons.push(
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={paginationButtonStyles({
                        state: page === i ? "active" : "inactive",
                      })}
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
                      <span key="ellipsis2" className="px-2 py-1">
                        ...
                      </span>
                    );
                  }

                  pageButtons.push(
                    <button
                      key={totalPages}
                      onClick={() => setPage(totalPages)}
                      className={paginationButtonStyles({ state: "inactive" })}
                    >
                      {totalPages}
                    </button>
                  );
                }

                return pageButtons;
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
