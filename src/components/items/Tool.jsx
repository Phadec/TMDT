import { Category } from "./index";
import { useState, useEffect, useRef } from "react";

function Tool() {
  const [activeSection, setActiveSection] = useState(null);
  const toolRef = useRef(null);

  const toggleSection = (section) => {
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
    }
  };

  // Xử lý click bên ngoài để đóng tab đang mở
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        toolRef.current &&
        !toolRef.current.contains(event.target) &&
        activeSection !== null
      ) {
        setActiveSection(null);
      }
    }

    // Thêm event listener khi component được mount
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup event listener khi component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeSection]);

  return (
    <div
      ref={toolRef}
      className="fixed right-0 top-1/3 z-50 flex flex-col items-end gap-3"
    >
      {/* Danh mục */}
      <div className="flex items-end">
        <button
          onClick={() => toggleSection("category")}
          className={`flex items-center rounded-l-lg lg:py-3 lg:px-4 px-1 py-1 transform transition-all duration-300 ${
            activeSection === "category"
              ? "bg-indigo-600 text-white translate-x-1 shadow-[0_10px_20px_rgba(79,70,229,0.4)]"
              : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:translate-x-1 shadow-[0_5px_15px_rgba(79,70,229,0.3)]"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
        </button>

        {activeSection === "category" && (
          <div className="bg-white rounded-l-lg p-4 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] w-72 border-l-4 border-indigo-600 transform transition-all duration-300">
            <h3 className="text-indigo-700 font-bold mb-3 text-lg">
              Danh mục sản phẩm
            </h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              <Category />
            </div>
          </div>
        )}
      </div>

      {/* Nhà bán tiêu biểu */}
      <div className="flex items-end">
        <button
          onClick={() => toggleSection("seller")}
          className={`flex items-center rounded-l-lg lg:py-3 lg:px-4 px-1 py-1 transform transition-all duration-300 ${
            activeSection === "seller"
              ? "bg-teal-600 text-white translate-x-1 shadow-[0_10px_20px_rgba(13,148,136,0.4)]"
              : "bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:translate-x-1 shadow-[0_5px_15px_rgba(13,148,136,0.3)]"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </button>

        {activeSection === "seller" && (
          <div className="bg-white rounded-l-lg p-4 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] w-72 border-l-4 border-teal-600 transform transition-all duration-300">
            <h3 className="text-teal-700 font-bold mb-3 text-lg">
              Nhà bán tiêu biểu
            </h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              <BestSeller />
            </div>
          </div>
        )}
      </div>

      {/* Tính năng khác */}
      <div className="flex items-end">
        <button
          onClick={() => toggleSection("features")}
          className={`flex items-center rounded-l-lg lg:py-3 lg:px-4 px-1 py-1 transform transition-all duration-300 ${
            activeSection === "features"
              ? "bg-amber-600 text-white translate-x-1 shadow-[0_10px_20px_rgba(217,119,6,0.4)]"
              : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:translate-x-1 shadow-[0_5px_15px_rgba(217,119,6,0.3)]"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
        </button>

        {activeSection === "features" && (
          <div className="bg-white rounded-l-lg p-4 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] w-72 border-l-4 border-amber-600 transform transition-all duration-300">
            <h3 className="text-amber-700 font-bold mb-3 text-lg">
              Tính năng hỗ trợ
            </h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              <OtherFeature />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BestSeller() {
  return (
    <div className="space-y-2">
      <div className="flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors duration-200">
        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mr-3">
          <span className="text-teal-600 font-bold">S1</span>
        </div>
        <div>
          <p className="font-medium text-gray-800">Shop ABC</p>
          <p className="text-xs text-gray-500">⭐⭐⭐⭐⭐ (128)</p>
        </div>
      </div>

      <div className="flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors duration-200">
        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mr-3">
          <span className="text-teal-600 font-bold">S2</span>
        </div>
        <div>
          <p className="font-medium text-gray-800">Shop XYZ</p>
          <p className="text-xs text-gray-500">⭐⭐⭐⭐ (96)</p>
        </div>
      </div>

      <div className="flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors duration-200">
        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mr-3">
          <span className="text-teal-600 font-bold">S3</span>
        </div>
        <div>
          <p className="font-medium text-gray-800">Shop 123</p>
          <p className="text-xs text-gray-500">⭐⭐⭐⭐⭐ (215)</p>
        </div>
      </div>
    </div>
  );
}

function OtherFeature() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button className="flex flex-col items-center justify-center bg-white p-3 rounded-lg border border-gray-200 hover:bg-amber-50 hover:border-amber-200 transition-colors duration-200 shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-amber-500 mb-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span className="text-xs font-medium text-gray-700">Tìm kiếm</span>
      </button>

      <button className="flex flex-col items-center justify-center bg-white p-3 rounded-lg border border-gray-200 hover:bg-amber-50 hover:border-amber-200 transition-colors duration-200 shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-amber-500 mb-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <span className="text-xs font-medium text-gray-700">So sánh</span>
      </button>

      <button className="flex flex-col items-center justify-center bg-white p-3 rounded-lg border border-gray-200 hover:bg-amber-50 hover:border-amber-200 transition-colors duration-200 shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-amber-500 mb-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
          />
        </svg>
        <span className="text-xs font-medium text-gray-700">Lọc giá</span>
      </button>

      <button className="flex flex-col items-center justify-center bg-white p-3 rounded-lg border border-gray-200 hover:bg-amber-50 hover:border-amber-200 transition-colors duration-200 shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-amber-500 mb-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-xs font-medium text-gray-700">Lịch</span>
      </button>
    </div>
  );
}

export default Tool;
