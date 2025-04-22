import { useState } from "react";

import { getImageFromAssets } from "~/utils/imageUtils";

const bestProduct = [
  {
    id: 1,
    name: "Tai nghe không dây XYZ",
    image: "img1_.jpg",
    level: "trending",
    tags: ["Theo trend", "Phù hợp"],
    price: "1.290.000đ",
  },
  {
    id: 2,
    name: "Giày thể thao ABC",
    image: "img1_.jpg",
    level: "discount",
    tags: ["Đang giảm giá", "Lượt mua cao"],
    price: "890.000đ",
  },
  {
    id: 3,
    name: "Balo thời trang DEF",
    image: "img1_.jpg",
    level: "new",
    tags: ["Sản phẩm mới"],
    price: "620.000đ",
  },
  {
    id: 4,
    name: "Tai nghe không dây XYZ",
    image: "img1_.jpg",
    level: "trending",
    tags: ["Theo trend", "Phù hợp"],
    price: "1.290.000đ",
  },
  {
    id: 5,
    name: "Giày thể thao ABC",
    image: "img1_.jpg",
    level: "discount",
    tags: ["Đang giảm giá", "Lượt mua cao"],
    price: "890.000đ",
  },
  {
    id: 6,
    name: "Balo thời trang DEF",
    image: "img1_.jpg",
    level: "new",
    tags: ["Sản phẩm mới"],
    price: "620.000đ",
  },
  {
    id: 7,
    name: "Tai nghe không dây XYZ",
    image: "img1_.jpg",
    level: "trending",
    tags: ["Theo trend", "Phù hợp"],
    price: "1.290.000đ",
  },
  {
    id: 8,
    name: "Giày thể thao ABC",
    image: "img1_.jpg",
    level: "discount",
    tags: ["Đang giảm giá", "Lượt mua cao"],
    price: "890.000đ",
  },
  {
    id: 9,
    name: "Balo thời trang DEF",
    image: "img1_.jpg",
    level: "new",
    tags: ["Sản phẩm mới"],
    price: "620.000đ",
  },
];

const levelColors = {
  trending: "border-secondary-light",
  ads: "border-warning",
  discount: "border-success",
  hot: "border-danger",
  new: "border-primary-light",
  match: "border-info",
};

function BestProduct() {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <section className="min-h-screen pb-16 lg:px-24 md:px-10 px-4 bg-surface-light text-content-primary">
      {/* Thanh tìm kiếm bằng AI */}
      <div className="w-90 mb-10">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Search with AI"
            className="w-full p-4 pl-12 pr-4 rounded-xl text-black text-lg bg-transparent border-2 border-white focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-xl shadow-blue-500/50 transition-transform transform hover:scale-105 ease-in-out"
          />
        </div>
      </div>

      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        🔥 Gợi ý hôm nay
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {bestProduct.map((product) => (
          <div
            key={product.id}
            className={`rounded-lg  overflow-hidden shadow-md transition-transform hover:scale-105 hover:shadow-lg border-l-4 ${
              levelColors[product.level] || "border-border"
            } bg-surface-white`}
          >
            <img
              src={getImageFromAssets(product.image, "home/carousel")}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 space-y-2">
              <h3 className="text-lg font-semibold text-content-primary">
                {product.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 rounded-full bg-surface-light text-content-secondary border border-border"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-xl font-bold text-secondary">
                {product.price}
              </p>
              <button className="w-full mt-2 py-2 rounded-md bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition duration-fast">
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default BestProduct;
