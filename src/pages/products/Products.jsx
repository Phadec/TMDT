import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { Search } from "~/components/items";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Trạng thái cho bộ lọc và tìm kiếm
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [condition, setCondition] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Trạng thái cho AI chat
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "ai",
      content: "Xin chào! Tôi có thể giúp gì cho bạn về các sản phẩm?",
    },
  ]);
  const chatEndRef = useRef(null);

  // Lấy danh sách sản phẩm và danh mục khi component được tải
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productsData = [
          {
            id: 1,
            title: "Sản phẩm 1",
            price: 100000,
            location: "Hà Nội",
            condition: "NEW",
            images: ["https://via.placeholder.com/300x200"],
            categoryId: 1,
          },
          {
            id: 1,
            title: "Sản phẩm 1",
            price: 100000,
            location: "Hà Nội",
            condition: "NEW",
            images: ["https://via.placeholder.com/300x200"],
            categoryId: 1,
          },
          {
            id: 1,
            title: "Sản phẩm 1",
            price: 100000,
            location: "Hà Nội",
            condition: "NEW",
            images: ["https://via.placeholder.com/300x200"],
            categoryId: 1,
          },
          {
            id: 1,
            title: "Sản phẩm 1",
            price: 100000,
            location: "Hà Nội",
            condition: "NEW",
            images: ["https://via.placeholder.com/300x200"],
            categoryId: 1,
          },
        ];
        const categoriesData = [
          { id: 1, name: "Điện thoại" },
          { id: 2, name: "Máy tính" },
          { id: 3, name: "Đồ gia dụng" },
          { id: 4, name: "Thời trang" },
          { id: 5, name: "Thể thao" },
        ];

        setProducts(productsData);
        setCategories(categoriesData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cuộn xuống cuối cuộc trò chuyện khi có tin nhắn mới
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    // Thực hiện tìm kiếm dựa trên searchQuery
    // Trong thực tế, bạn sẽ gọi API tìm kiếm ở đây
    console.log("Searching for:", searchQuery);

    // Giả lập kết quả tìm kiếm bằng cách lọc sản phẩm hiện tại
    const filteredProducts = products.filter((product) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setProducts(filteredProducts);
  };

  // Xử lý lọc sản phẩm
  const applyFilters = () => {
    setLoading(true);

    // Trong thực tế, bạn sẽ gọi API với các tham số lọc
    // Ví dụ: productService.getFilteredProductsByCategory({ categoryId, minPrice, maxPrice, condition, sortBy })

    // Giả lập việc lọc bằng cách đợi một chút và hiển thị lại tất cả sản phẩm
    setTimeout(async () => {
      try {
        let filteredProducts = await productService.getProducts(0, 20);

        // Lọc theo danh mục nếu có
        if (selectedCategory) {
          filteredProducts = filteredProducts.filter(
            (product) => product.categoryId === selectedCategory
          );
        }

        // Lọc theo giá nếu có
        if (priceRange.min) {
          filteredProducts = filteredProducts.filter(
            (product) => product.price >= Number(priceRange.min)
          );
        }

        if (priceRange.max) {
          filteredProducts = filteredProducts.filter(
            (product) => product.price <= Number(priceRange.max)
          );
        }

        // Lọc theo tình trạng nếu không phải "all"
        if (condition !== "all") {
          filteredProducts = filteredProducts.filter(
            (product) => product.condition === condition
          );
        }

        // Sắp xếp sản phẩm
        switch (sortBy) {
          case "price_asc":
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
          case "price_desc":
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
          case "popular":
            filteredProducts.sort((a, b) => b.views - a.views);
            break;
          case "newest":
          default:
            filteredProducts.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            break;
        }

        setProducts(filteredProducts);
        setLoading(false);
      } catch (err) {
        console.error("Error applying filters:", err);
        setError("Có lỗi xảy ra khi lọc sản phẩm. Vui lòng thử lại sau.");
        setLoading(false);
      }
    }, 500);
  };

  // Xử lý gửi tin nhắn đến AI
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!aiMessage.trim()) return;

    // Thêm tin nhắn của người dùng vào cuộc trò chuyện
    setChatMessages([...chatMessages, { sender: "user", content: aiMessage }]);

    // Xử lý phản hồi từ AI (giả lập)
    setTimeout(() => {
      let response;
      const lowerMsg = aiMessage.toLowerCase();

      if (lowerMsg.includes("giá") || lowerMsg.includes("price")) {
        response =
          "Bạn có thể sử dụng bộ lọc giá ở bên trái để tìm sản phẩm trong khoảng giá mong muốn.";
      } else if (
        lowerMsg.includes("danh mục") ||
        lowerMsg.includes("category")
      ) {
        response =
          "Chúng tôi có nhiều danh mục sản phẩm khác nhau. Bạn có thể chọn danh mục từ menu bên trái.";
      } else if (lowerMsg.includes("mới") || lowerMsg.includes("new")) {
        response =
          'Để xem sản phẩm mới nhất, bạn có thể chọn sắp xếp theo "Mới nhất" từ menu sắp xếp.';
      } else {
        response =
          "Tôi có thể giúp bạn tìm kiếm sản phẩm, lọc theo giá, danh mục hoặc tình trạng. Bạn cần hỗ trợ gì?";
      }

      setChatMessages((prev) => [...prev, { sender: "ai", content: response }]);
    }, 1000);

    // Xóa tin nhắn đã nhập
    setAiMessage("");
  };

  // Hiển thị thông báo lỗi nếu có
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Lỗi!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Khám phá sản phẩm</h1>

      <Search />

      <div className="flex flex-col md:flex-row gap-8">
        {/* Bộ lọc bên trái */}
        <div className="w-full md:w-1/4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Bộ lọc</h2>

            {/* Lọc theo danh mục */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Lọc theo giá */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Khoảng giá
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Từ"
                  className="w-1/2 p-2 border border-gray-300 rounded-md"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, min: e.target.value })
                  }
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Đến"
                  className="w-1/2 p-2 border border-gray-300 rounded-md"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, max: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Lọc theo tình trạng */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tình trạng
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="NEW">Mới</option>
                <option value="LIKE_NEW">Như mới</option>
                <option value="GOOD">Tốt</option>
                <option value="FAIR">Khá</option>
                <option value="POOR">Kém</option>
              </select>
            </div>

            {/* Sắp xếp */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sắp xếp theo
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="popular">Phổ biến nhất</option>
              </select>
            </div>

            {/* Nút áp dụng bộ lọc */}
            <button
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
              onClick={applyFilters}
            >
              Áp dụng
            </button>
          </div>

          {/* Nút mở chat với AI */}
          <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
            <button
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition duration-200 flex items-center justify-center gap-2"
              onClick={() => setShowAIChat(!showAIChat)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                  clipRule="evenodd"
                />
              </svg>
              {showAIChat ? "Đóng trò chuyện AI" : "Trò chuyện với AI"}
            </button>
          </div>
        </div>

        {/* Danh sách sản phẩm bên phải */}
        <div className="w-full md:w-3/4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {products.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                  <p className="text-gray-500 text-lg">
                    Không tìm thấy sản phẩm nào phù hợp với tiêu chí tìm kiếm.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200"
                    >
                      <Link to={`/product/${product.id}`}>
                        <div className="h-48 overflow-hidden">
                          <img
                            src={
                              product.images && product.images.length > 0
                                ? product.images[0]
                                : "https://via.placeholder.com/300x200"
                            }
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                            {product.title}
                          </h3>
                          <p className="text-red-600 font-bold mb-2">
                            {product.price.toLocaleString("vi-VN")} đ
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                              {product.location}
                            </span>
                            <span className="text-sm text-gray-500">
                              {product.condition}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Chat với AI */}
      {showAIChat && (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50">
          <div className="bg-purple-600 text-white p-3 flex justify-between items-center">
            <h3 className="font-semibold">AI Trợ lý</h3>
            <button onClick={() => setShowAIChat(false)} className="text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="h-80 overflow-y-auto p-3 bg-gray-50">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 ${
                  msg.sender === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block p-2 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none"
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
              />
              <button
                type="submit"
                className="bg-purple-600 text-white p-2 rounded-r-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Products;
