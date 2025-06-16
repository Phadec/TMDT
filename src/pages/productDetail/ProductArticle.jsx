import { useState } from "react";
import { getImageFromAssets } from "~/utils/imageUtils";
import { cva } from "class-variance-authority";
import PropTypes from "prop-types";

const detailImage = cva(["w-full", "h-full", "object-cover"], {
  variants: {
    rounded: {
      xl: "rounded-2xl",
    },
    shadow: {
      lg: "shadow-lg hover:shadow-2xl",
    },
    transform: {
      true: "transform hover:scale-105 transition duration-300 ease-in-out",
      false: "",
    },
  },
  defaultVariants: {
    rounded: "xl",
    shadow: "lg",
    transform: true,
  },
});

function ProductArticle({ productData }) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Mảng các màu sắc cho tag
  const tagColors = [
    { bg: "bg-blue-100", text: "text-blue-700", hover: "hover:bg-blue-200" },
    { bg: "bg-green-100", text: "text-green-700", hover: "hover:bg-green-200" },
    { bg: "bg-red-100", text: "text-red-700", hover: "hover:bg-red-200" },
    {
      bg: "bg-purple-100",
      text: "text-purple-700",
      hover: "hover:bg-purple-200",
    },
    {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      hover: "hover:bg-yellow-200",
    },
    { bg: "bg-pink-100", text: "text-pink-700", hover: "hover:bg-pink-200" },
    {
      bg: "bg-indigo-100",
      text: "text-indigo-700",
      hover: "hover:bg-indigo-200",
    },
    { bg: "bg-teal-100", text: "text-teal-700", hover: "hover:bg-teal-200" },
    {
      bg: "bg-orange-100",
      text: "text-orange-700",
      hover: "hover:bg-orange-200",
    },
    { bg: "bg-cyan-100", text: "text-cyan-700", hover: "hover:bg-cyan-200" },
  ];

  // Hàm hiển thị các tag từ shortDes
  const renderShortDesTags = () => {
    if (!productData?.shortDes) {
      return (
        <span className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full">
          Mô tả ngắn gọn
        </span>
      );
    }

    return productData.shortDes.split("\n").map((tag, index) => {
      // Chọn màu ngẫu nhiên từ mảng tagColors
      const randomColor =
        tagColors[Math.floor(Math.random() * tagColors.length)];

      return (
        <span
          key={index}
          className={`px-3 py-1 text-sm font-medium ${randomColor.text} transition-colors ${randomColor.bg} rounded-full ${randomColor.hover}`}
        >
          {tag}
        </span>
      );
    });
  };

  return (
    <div className="p-4 my-10 space-y-6 bg-white shadow-md rounded-xl">
      {/* Phần đầu: Tên sản phẩm + mô tả ngắn */}
      <div>
        <h1 className="text-[40px] lg:text-[72px] p-6 font-extrabold mb-10 text-center bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg animate-pulse">
          🎉 {productData ? productData.name : "Tên sản phẩm"}
        </h1>

        <div className="flex flex-wrap gap-2 mt-2">{renderShortDesTags()}</div>
        <p className="mt-2 text-gray-700"></p>
      </div>

      {/* Phần 3D (Demo mô hình sản phẩm) */}
      {/* <div className="flex items-center justify-center bg-gray-100 rounded-lg shadow-inner aspect-video">
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
          <p className="italic text-gray-500">
            [Vùng hiển thị 3D – mô hình Concept Car 038]
          </p>
        </iframe>
      </div> */}

      {/* Dạng 2 cột */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Cột 1: Thông tin người bán */}
        <div className="flex items-center space-x-4">
          <img
            src={getImageFromAssets("2.jpg", "productDetail")}
            alt="Avatar người bán"
            className="object-cover rounded-full w-14 h-14"
          />
          <div>
            <p className="text-lg font-semibold text-gray-900">Nguyễn Văn A</p>
            <p className="text-sm text-gray-600">
              TP. HCM · Online 2 giờ trước
            </p>
          </div>
        </div>

        {/* Cột 2: Đánh giá AI */}
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="mb-2 font-medium text-gray-800 text-md">
            Đánh giá nhanh từ AI
          </h3>
          <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
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
              {productData
                ? productData.description?.substring(0, 200)
                : "Mô tả chi tiết nhưng không hết"}
            </p>
            {!showFullDescription && (
              <button
                onClick={() => setShowFullDescription(true)}
                className="flex items-center mt-2 text-sm font-medium text-blue-600 hover:underline focus:outline-none"
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
                {productData
                  ? productData.description?.substring(200)
                  : "Phần còn lại"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

ProductArticle.propTypes = {
  productData: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    shortDes: PropTypes.string,
    brand: PropTypes.object,
    productCategory: PropTypes.object,
    specs: PropTypes.object,
    status: PropTypes.string,
    variant: PropTypes.object,
  }),
};

export default ProductArticle;
