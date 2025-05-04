import { useState } from "react";
import { getImageFromAssets } from "~/utils/imageUtils";

function ProductArticle() {
  const [showFullDescription, setShowFullDescription] = useState(false);

  return (
    <div className="p-4 bg-white shadow-md rounded-xl space-y-6 my-10">
      {/* Phần đầu: Tên sản phẩm + mô tả ngắn */}
      <div>
        <h1 className="text-[30px] lg:text-[50px] font-bold text-gray-900 mb-10 text-center">
          🎉 Tai nghe Bluetooth X100 🎉
        </h1>
        <p className="text-gray-700 mt-2">
          Âm thanh chất lượng cao, kết nối nhanh, thiết kế gọn nhẹ – lựa chọn lý
          tưởng cho mọi nhu cầu nghe nhạc.
        </p>
      </div>

      {/* Phần 3D (Demo mô hình sản phẩm) */}
      <div className="aspect-video bg-gray-100 rounded-lg shadow-inner flex items-center justify-center">
        <iframe
          className="w-full h-full"
          src="https://sketchfab.com/models/0b4ca2a15ba7478db2a42ac9f0e687bf/embed"
          title="FREE Concept Car 038 - public domain (CC0)"
          frameBorder="0"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          xr-spatial-tracking="true"
          webkitallowfullscreen="true"
          mozallowfullscreen="true"
          allowFullScreen 
        >
          <p className="text-gray-500 italic">
            [Vùng hiển thị 3D – mô hình Concept Car 038]
          </p>
        </iframe>
      </div>

      {/* Dạng 2 cột */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột 1: Thông tin người bán */}
        <div className="flex items-center space-x-4">
          <img
            src={getImageFromAssets("2.jpg", "productDetail")}
            alt="Avatar người bán"
            className="w-14 h-14 rounded-full object-cover"
          />
          <div>
            <p className="text-lg font-semibold text-gray-900">Nguyễn Văn A</p>
            <p className="text-sm text-gray-600">
              TP. HCM · Online 2 giờ trước
            </p>
          </div>
        </div>

        {/* Cột 2: Đánh giá AI */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-md font-medium text-gray-800 mb-2">
            Đánh giá nhanh từ AI
          </h3>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Độ tin cậy người bán: Cao</li>
            <li>Chất lượng mô tả: Chính xác, chi tiết</li>
            <li>Tương tác người dùng: Tốt</li>
          </ul>
        </div>
      </div>

      {/* Thông tin bài viết sản phẩm – ẩn/hiện */}
      <div className="pt-4 border-t">
        <div className="text-gray-800">
          {/* Mô tả ngắn (xem trước) */}
          <div
            className={`text-gray-800 transition-all duration-500 ${
              showFullDescription ? "opacity-100" : "opacity-70"
            }`}
          >
            <p>
              Thiết kế tai nghe ôm sát tai, đem lại cảm giác thoải mái ngay cả
              khi sử dụng liên tục trong nhiều giờ. Chất liệu nhựa ABS kết hợp
              kim loại nhẹ giúp sản phẩm vừa bền, vừa tinh tế.
            </p>
            {!showFullDescription && (
              <button
                onClick={() => setShowFullDescription(true)}
                className="flex items-center text-sm font-medium text-blue-600 hover:underline focus:outline-none mt-2"
              >
                <span>Xem thêm mô tả</span>
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Mô tả đầy đủ */}
          {showFullDescription && (
            <div className="mt-4 space-y-4">
              <p>
                Chất lượng âm thanh vượt trội với driver 40mm, dải tần rộng, hỗ
                trợ âm bass sâu và treble trong trẻo. Tối ưu cho cả nghe nhạc,
                chơi game và học online.
              </p>
              <p>
                Sản phẩm có khả năng chống nước chuẩn IPX4, dễ dàng sử dụng
                ngoài trời hoặc khi luyện tập thể thao. Hỗ trợ kết nối Bluetooth
                5.2 với độ trễ cực thấp.
              </p>
              <div className="flex justify-center my-6">
                <div className="w-[40%] aspect-square">
                  <img
                    src={getImageFromAssets("1.jpg", "productDetail")}
                    alt="Chi tiết sản phẩm"
                    className="w-full h-full object-cover rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition duration-300 ease-in-out"
                  />
                </div>
              </div>
              <p>
                Đi kèm hộp sạc thông minh, có thể sạc đầy tai nghe trong vòng 1
                giờ. Sản phẩm tương thích tốt với hầu hết smartphone, laptop,
                máy tính bảng.
              </p>
              <p>
                Chính sách bảo hành lên đến 12 tháng, hỗ trợ đổi mới trong vòng
                7 ngày nếu sản phẩm bị lỗi từ nhà sản xuất.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductArticle;
