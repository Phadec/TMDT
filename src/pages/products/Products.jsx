import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cva } from 'class-variance-authority';

import { ChatWithAI, Search } from "~/components/items";
import { Tool } from "~/components/items";

const dummyProducts = Array.from({ length: 21 }).map((_, i) => ({
  id: i + 1,
  name: `Sản phẩm ${i + 1}`,
  price: `${(Math.random() * 10 + 1).toFixed(3)}.000đ`,
  image: "/assets/home/demo/demo.jpg",
  location: "Hồ Chí Minh",
  condition: i % 2 === 0 ? "Mới" : "Đã sử dụng",
}));

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
  const [chatFilter, setChatFilter] = useState("");
  const [products, setProducts] = useState(dummyProducts);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 6;

  const handleChatFilter = () => {
    const filtered = dummyProducts.filter((p) =>
      p.name.toLowerCase().includes(chatFilter.toLowerCase())
    );
    setProducts(filtered);
    setPage(1);
  };

  const paginatedProducts = products.slice(
    (page - 1) * perPage,
    page * perPage
  );
  const totalPages = Math.ceil(products.length / perPage);

  // Xử lý lọc sản phẩm từ Tool component
  const handleFilterProducts = (filters, viewMode, priceRange) => {
    // Trong thực tế, bạn sẽ áp dụng các bộ lọc này vào dữ liệu sản phẩm
    // Đây chỉ là ví dụ đơn giản
    console.log("Filters:", filters);
    console.log("View Mode:", viewMode);
    console.log("Price Range:", priceRange);

    // Giả lập việc lọc sản phẩm
    let filtered = [...dummyProducts];

    // Đặt lại trang về 1 khi lọc
    setPage(1);

    // Cập nhật danh sách sản phẩm
    setProducts(filtered);
  };

  return (
    <div className="min-h-screen w-90 pt-12 px-4 sm:px-8 lg:px-14 py-6 bg-gradient-to-br from-purple-100 via-white to-indigo-100">
      {/* Thanh công cụ lọc */}
      <Tool onFilterChange={handleFilterProducts} />

      <div>
        {/* Thanh tìm kiếm bằng AI */}
        <Search />
      </div>

      {/* Phân mục sản phẩm */}
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-indigo-100 p-6 md:flex gap-6">
        {/* Chat Section - Desktop */}
        <div className="flex-1">
          <ChatWithAI />
        </div>

        {/* Products Section */}
        <div className="flex-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedProducts.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-3xl shadow-md overflow-hidden border border-gray-200 hover:shadow-xl transition"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-48 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-purple-700 font-semibold mb-1">
                    {product.price}
                  </p>
                  <p className="text-sm text-gray-500">
                    📍 {product.location} | 🛠️ {product.condition}
                  </p>
                </div>
              </motion.div>
            ))}
            {products.length === 0 && (
              <p className="text-center text-gray-500 col-span-full">
                Không tìm thấy sản phẩm phù hợp 😢
              </p>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2 flex-wrap">
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
