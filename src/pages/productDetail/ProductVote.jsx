import { useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { cva } from 'class-variance-authority';

const reviewItem = cva(['cursor-pointer', 'p-3', 'mb-3', 'rounded-lg', 'transition-all', 'transform'], {
  variants: {
    active: {
      true: 'bg-blue-500 text-white shadow-lg',
      false: 'bg-white hover:scale-105 hover:rotate-3d',
    },
  },
  defaultVariants: {
    active: false,
  },
});

// Dữ liệu đánh giá giả lập (có thể thay thế bằng API gọi)
const reviews = [
  {
    title: "Đánh giá sản phẩm 1",
    content: "Chi tiết đánh giá sản phẩm 1...",
    rating: 4,
    img: "https://placehold.co/50",
    type: "product",
    trustPoints: 120,
  },
  {
    title: "Đánh giá sản phẩm 2",
    content: "Chi tiết đánh giá sản phẩm 2...",
    rating: 5,
    img: "https://placehold.co/50",
    type: "product",
    trustPoints: 250,
  },
  {
    title: "Đánh giá người bán 1",
    content: "Chi tiết đánh giá người bán 1...",
    rating: 3,
    img: "https://placehold.co/50",
    type: "seller",
    trustPoints: 90,
  },
  {
    title: "Đánh giá người bán 2",
    content: "Chi tiết đánh giá người bán 2...",
    rating: 2,
    img: "https://placehold.co/50",
    type: "seller",
    trustPoints: 50,
  },
  {
    title: "Đánh giá sản phẩm 3",
    content: "Chi tiết đánh giá sản phẩm 3...",
    rating: 3,
    img: "https://placehold.co/50",
    type: "product",
    trustPoints: 200,
  },
  {
    title: "Đánh giá người bán 3",
    content: "Chi tiết đánh giá người bán 3...",
    rating: 5,
    img: "https://placehold.co/50",
    type: "seller",
    trustPoints: 300,
  },
];

function ProductVote() {
  // State lưu trữ chỉ mục của tab hiện tại và lọc theo thể loại
  const [selectedTab, setSelectedTab] = useState(0);
  const [filterRating, setFilterRating] = useState(0); // Lọc theo sao
  const [filterType, setFilterType] = useState("all"); // Lọc theo thể loại (product/seller/all)

  // Lọc các đánh giá theo điểm sao và thể loại
  const filteredReviews = reviews.filter(
    (review) =>
      (filterType === "all" || review.type === filterType) &&
      review.rating >= filterRating
  );

  // Hàm để render sao
  const renderStars = (rating) => {
    let stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        i < rating ? (
          <StarIcon key={i} className="text-yellow-500 w-5 h-5" />
        ) : (
          <StarIcon key={i} className="text-gray-300 w-5 h-5" />
        )
      );
    }
    return stars;
  };

  return (
    <div className="flex flex-col md:flex-row">
      {/* Phần bên trái - Danh sách các đánh giá */}
      <div className="w-full md:w-1/3 rounded-md bg-gray-100 p-4 h-80 sm:h-auto transform transition-transform duration-500 ease-in-out">
        <h2 className="font-bold text-xl mb-4">Đánh giá sản phẩm</h2>

        {/* Bộ lọc thể loại đánh giá */}
        <div className="mb-4">
          <label htmlFor="filterType" className="font-medium">
            Lọc theo thể loại:
          </label>
          <select
            id="filterType"
            className="ml-2 p-2 border rounded-lg"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="product">Đánh giá sản phẩm</option>
            <option value="seller">Đánh giá người bán</option>
          </select>
        </div>

        {/* Bộ lọc sao */}
        <div className="mb-4">
          <label htmlFor="filterRating" className="font-medium">
            Lọc theo sao:
          </label>
          <select
            id="filterRating"
            className="ml-2 p-2 border rounded-lg"
            value={filterRating}
            onChange={(e) => setFilterRating(Number(e.target.value))}
          >
            <option value={0}>Tất cả</option>
            <option value={1}>1 sao</option>
            <option value={2}>2 sao</option>
            <option value={3}>3 sao</option>
            <option value={4}>4 sao</option>
            <option value={5}>5 sao</option>
          </select>
        </div>

        {/* Danh sách đánh giá đã lọc */}
        <div className="overflow-y-scroll max-h-[calc(100vh-27rem)]">
          {filteredReviews.map((review, index) => (
            <div
                key={index}
                className={reviewItem({ active: selectedTab === index })}
                onClick={() => setSelectedTab(index)}
            >
              <div className="flex items-center">
                <img
                  src={review.img}
                  alt={review.title}
                  className="w-12 h-12 rounded-full mr-3"
                />
                <div>
                  <div className="font-semibold">{review.title}</div>
                  <div className="text-sm flex flex-row">
                    {renderStars(review.rating)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {review.type === "product"
                      ? "Đánh giá sản phẩm"
                      : "Đánh giá người bán"}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Điểm tin cậy: {review.trustPoints}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phần bên phải - Chi tiết đánh giá */}
      <div className="w-full md:w-2/3 p-4 mt-20">
        <h3 className="font-bold text-xl mb-4">Chi tiết đánh giá</h3>
        <div className="border p-6 rounded-lg bg-white shadow-lg">
          <h4 className="font-semibold text-lg">
            {filteredReviews[selectedTab]?.title}
          </h4>
          <div className="text-sm flex flex-row">
            {renderStars(filteredReviews[selectedTab]?.rating)}
          </div>
          <div className="text-sm text-gray-500">
            {filteredReviews[selectedTab]?.type === "product"
              ? "Đánh giá sản phẩm"
              : "Đánh giá người bán"}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Điểm tin cậy: {filteredReviews[selectedTab]?.trustPoints}
          </div>
          <p>{filteredReviews[selectedTab]?.content}</p>
        </div>
      </div>
    </div>
  );
}

export default ProductVote;
