import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { StarIcon } from "@heroicons/react/24/solid";
import { cva } from 'class-variance-authority';
import { apiServices } from "~/api";

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

function ProductVote() {
  const { id } = useParams(); // Lấy id sản phẩm từ URL
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State lưu trữ chỉ mục của tab hiện tại và lọc theo sao
  const [selectedTab, setSelectedTab] = useState(0);
  const [filterRating, setFilterRating] = useState(0); // Lọc theo sao

  // Fetch reviews khi component mount hoặc khi id thay đổi
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await apiServices.products.getProductReviews(id);
        
        // Kiểm tra cấu trúc dữ liệu trả về và đảm bảo reviews là một mảng
        if (data && Array.isArray(data)) {
          setReviews(data);
        } else if (data && data.content && Array.isArray(data.content)) {
          // Nếu API trả về dạng phân trang { content: [...], totalPages: X, ... }
          setReviews(data.content);
        } else if (data && typeof data === 'object') {
          // Nếu API trả về một đối tượng khác, thử tìm mảng đánh giá
          const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            setReviews(possibleArrays[0]);
          } else {
            setReviews([]);
          }
        } else {
          setReviews([]);
        }
        setLoading(false);
      } catch (err) {
        setError("Không thể tải đánh giá sản phẩm. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  // Đảm bảo reviews luôn là một mảng trước khi lọc
  const reviewsArray = Array.isArray(reviews) ? reviews : [];
  
  // Kiểm tra và chuẩn hóa dữ liệu đánh giá theo cấu trúc mới
  const validReviews = reviewsArray.map(review => {
    // Đảm bảo mỗi review có các trường cần thiết theo cấu trúc mới
    return {
      id: review.id || "",
      productId: review.productId || "",
      customerId: review.customerId || "",
      customerName: review.customerName || "Khách hàng ẩn danh",
      content: review.content || "Không có nội dung",
      rating: typeof review.rating === 'number' ? review.rating : 0,
      createdAt: review.createdAt || null,
      updatedAt: review.updatedAt || null
    };
  });
  
  // Lọc các đánh giá chỉ theo điểm sao
  const filteredReviews = validReviews.filter(
    (review) => review.rating >= filterRating
  );

  // Hàm để render sao
  const renderStars = (rating) => {
    let stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        i < rating ? (
          <StarIcon key={i} className="w-5 h-5 text-yellow-500" />
        ) : (
          <StarIcon key={i} className="w-5 h-5 text-gray-300" />
        )
      );
    }
    return stars;
  };

  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Hiển thị thông báo lỗi
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-red-500">
          <p className="text-lg font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  // Hiển thị thông báo khi không có đánh giá
  if (validReviews.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg font-semibold">Sản phẩm này chưa có đánh giá nào.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row">
      {/* Phần bên trái - Danh sách các đánh giá */}
      <div className="w-full p-4 transition-transform duration-500 ease-in-out transform bg-gray-100 rounded-md md:w-1/3 h-80 sm:h-auto">
        <h2 className="mb-4 text-xl font-bold">Đánh giá sản phẩm</h2>
        
        {/* Bộ lọc sao */}
        <div className="mb-4">
          <label htmlFor="filterRating" className="font-medium">
            Lọc theo sao:
          </label>
          <select
            id="filterRating"
            className="p-2 ml-2 border rounded-lg"
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
                  src="https://placehold.co/50"
                  alt={review.customerName}
                  className="w-12 h-12 mr-3 rounded-full"
                />
                <div>
                  <div className="text-lg font-semibold">{review.customerName}</div>
                  <div className="flex flex-row text-sm">
                    {renderStars(review.rating)}
                  </div>
                  <div className="mt-1 text-sm text-white-500">
                    {review.createdAt 
                      ? new Date(review.createdAt).toLocaleDateString('vi-VN', {year: 'numeric', month: 'short', day: 'numeric'})
                      : "Ngày không xác định"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phần bên phải - Chi tiết đánh giá */}
      <div className="w-full p-4 mt-20 md:w-2/3">
        <h3 className="mb-4 text-xl font-bold">Chi tiết đánh giá</h3>
        {filteredReviews.length > 0 ? (
          <div className="p-6 bg-white border rounded-lg shadow-lg">
            <h4 className="text-xl font-bold text-blue-600">
              {filteredReviews[selectedTab]?.customerName}
            </h4>
            <div className="flex flex-row mt-2 text-sm">
              {renderStars(filteredReviews[selectedTab]?.rating)}
            </div>
            <div className="p-4 mt-6 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-lg text-gray-800">{filteredReviews[selectedTab]?.content}</p>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Đánh giá vào: {
                (() => {
                  try {
                    return filteredReviews[selectedTab]?.createdAt 
                      ? new Date(filteredReviews[selectedTab]?.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : "Không xác định";
                  } catch (e) {
                    return "Không xác định";
                  }
                })()
              }
            </div>
            {filteredReviews[selectedTab]?.updatedAt && (
              <div className="mt-1 text-sm text-gray-500">
                Cập nhật vào: {
                  (() => {
                    try {
                      return new Date(filteredReviews[selectedTab]?.updatedAt).toLocaleDateString('vi-VN', {
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    } catch (e) {
                      return "Không xác định";
                    }
                  })()
                }
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500 bg-white border rounded-lg shadow-lg">
            Không có đánh giá nào phù hợp với bộ lọc.
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductVote;