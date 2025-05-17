import Swal from 'sweetalert2';
import { createRoot } from 'react-dom/client';
import Category from './Category';
import BestSeller from './BestSeller';
import OtherFeature from './OtherFeature';

function Tool() {
  // Hiển thị danh mục sản phẩm trong SweetAlert
  const showCategory = () => {
    Swal.fire({
      title: '<h3 class="text-indigo-700 font-bold text-lg">Danh mục sản phẩm</h3>',
      html: '<div id="category-container" class="bg-gray-50 p-3 rounded-lg"></div>',
      width: 'auto',
      padding: '1rem',
      showConfirmButton: false,
      showCloseButton: true,
      customClass: {
        container: 'swal-container',
        popup: 'rounded-lg min-w-[60%] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] border-l-4 border-indigo-600',
        closeButton: 'focus:outline-none',
        htmlContainer: 'p-0 m-0'
      },
      didOpen: () => {
        // Render Category component vào container
        const categoryContainer = document.getElementById('category-container');
        if (categoryContainer) {
          // Sử dụng createRoot để render component vào container
          const root = createRoot(categoryContainer);
          root.render(<Category />);
        }
      }
    });
  };

  // Hiển thị nhà bán tiêu biểu trong SweetAlert
  const showBestSeller = () => {
    Swal.fire({
      title: '<h3 class="text-teal-700 font-bold text-lg">Nhà bán tiêu biểu</h3>',
      html: '<div id="bestseller-container" class="bg-gray-50 p-3 rounded-lg"></div>',
      width: 'auto',
      padding: '1rem',
      showConfirmButton: false,
      showCloseButton: true,
      customClass: {
        container: 'swal-container',
        popup: 'rounded-lg min-w-[60%] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] border-l-4 border-teal-600',
        closeButton: 'focus:outline-none',
        htmlContainer: 'p-0 m-0'
      },
      didOpen: () => {
        // Render BestSeller component vào container
        const bestsellerContainer = document.getElementById('bestseller-container');
        if (bestsellerContainer) {
          const root = createRoot(bestsellerContainer);
          root.render(<BestSeller />);
        }
      }
    });
  };

  // Hiển thị tính năng khác trong SweetAlert
  const showFeatures = () => {
    Swal.fire({
      title: '<h3 class="text-amber-700 font-bold text-lg">Tính năng hỗ trợ</h3>',
      html: '<div id="features-container" class="bg-gray-50 p-3 rounded-lg w-full"></div>',
      width: 'auto',
      padding: '1rem',
      showConfirmButton: false,
      showCloseButton: true,
      customClass: {
        container: 'swal-container',
        popup: 'rounded-lg min-w-[60%] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] border-l-4 border-amber-600',
        closeButton: 'focus:outline-none',
        htmlContainer: 'p-0 m-0'
      },
      didOpen: () => {
        // Render OtherFeature component vào container
        const featuresContainer = document.getElementById('features-container');
        if (featuresContainer) {
          const root = createRoot(featuresContainer);
          root.render(<OtherFeature />);
        }
      }
    });
  };

  return (
    <div className="fixed right-0 top-24 z-50 flex flex-col items-end gap-3">
      {/* Danh mục */}
      <div>
        <button
          onClick={showCategory}
          className="flex items-center rounded-l-lg lg:py-3 lg:px-4 px-1 py-1 transform transition-all duration-300 bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:translate-x-1 shadow-[0_5px_15px_rgba(79,70,229,0.3)]"
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
      </div>

      {/* Nhà bán tiêu biểu */}
      <div>
        <button
          onClick={showBestSeller}
          className="flex items-center rounded-l-lg lg:py-3 lg:px-4 px-1 py-1 transform transition-all duration-300 bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:translate-x-1 shadow-[0_5px_15px_rgba(13,148,136,0.3)]"
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
      </div>

      {/* Tính năng khác */}
      <div>
        <button
          onClick={showFeatures}
          className="flex items-center rounded-l-lg lg:py-3 lg:px-4 px-1 py-1 transform transition-all duration-300 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:translate-x-1 shadow-[0_5px_15px_rgba(217,119,6,0.3)]"
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
      </div>
    </div>
  );
}

export default Tool;