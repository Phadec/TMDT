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
        <h1 className="text-[40px] lg:text-[72px] leading-[1.2] p-8 font-extrabold mb-10 text-center bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg animate-pulse">
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
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="mb-3 font-medium text-gray-800 text-md">
            Thông tin người bán
          </h3>
          <div className="flex items-start space-x-4">
            <img
              src={getImageFromAssets("2.jpg", "productDetail")}
              alt="Avatar người bán"
              className="object-cover rounded-full w-14 h-14"
            />
            <div className="flex-1 space-y-2">
              <p className="text-lg font-semibold text-gray-900">
                {productData?.customer?.fullName ?? "Họ tên người dùng"}
              </p>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  <span>{productData?.customer?.email ?? "Email không có"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{productData?.customer?.phone ?? "Số điện thoại không có"}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="flex-1">{productData?.customer?.addresses ?? "Địa chỉ không có"}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Nút liên hệ người bán */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <button 
              onClick={() => {
                const phone = productData?.customer?.phone;
                if (phone && phone !== "Số điện thoại không có") {
                  window.open(`tel:${phone}`, '_self');
                } else {
                  alert('Số điện thoại người bán không có sẵn');
                }
              }}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>Liên hệ người bán</span>
              </div>
            </button>
          </div>
        </div>

        {/* Cột 2: Thống kê người bán */}
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="mb-3 font-medium text-gray-800 text-md">
            Thống kê người bán
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Đánh giá trung bình:</span>
              <div className="flex items-center space-x-1">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">4.8</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sản phẩm đã bán:</span>
              <span className="text-sm font-medium text-gray-700">127</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tỷ lệ phản hồi:</span>
              <span className="text-sm font-medium text-green-600">98%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Thời gian phản hồi:</span>
              <span className="text-sm font-medium text-gray-700">&lt; 2 giờ</span>
            </div>
          </div>
          
          {/* Badge xác thực */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-green-600">Người bán đã xác thực</span>
            </div>
          </div>
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
    customer: PropTypes.shape({
      fullName: PropTypes.string,
      email: PropTypes.string,
      phone: PropTypes.string,
      addresses: PropTypes.string,
    }),
  }),
};

export default ProductArticle;
