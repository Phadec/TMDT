// Product Item Component
export const ProductItem = ({ item }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-48 bg-gray-200 relative">
        {/* Placeholder for product image */}
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Đang bán
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 truncate">Sản phẩm #{item}</h3>
        <p className="text-indigo-600 font-medium mb-2">₫{(item * 100000).toLocaleString()}</p>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Tồn kho: {item * 10}</span>
          <span>Đã bán: {item * 5}</span>
        </div>
        <div className="mt-3 flex space-x-2">
          <button className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
            Sửa
          </button>
          <button className="flex-1 px-3 py-1.5 text-xs border border-red-300 rounded text-red-700 hover:bg-red-50">
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

// Pagination Component
export const Pagination = () => {
  return (
    <nav className="flex items-center space-x-1">
      <button className="px-3 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-50">
        Trước
      </button>
      <button className="px-3 py-1 rounded bg-indigo-600 text-white">1</button>
      <button className="px-3 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-50">2</button>
      <button className="px-3 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-50">3</button>
      <button className="px-3 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-50">
        Sau
      </button>
    </nav>
  );
};

// Manage Products Tab Component
const ManageProductsTab = () => {
  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Quản lý sản phẩm</h2>
        <div className="flex space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Tất cả danh mục</option>
            <option value="electronics">Điện tử</option>
            <option value="clothing">Thời trang</option>
            <option value="home">Đồ gia dụng</option>
            <option value="beauty">Làm đẹp</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <ProductItem key={item} item={item} />
        ))}
      </div>
      
      <div className="mt-6 flex justify-center">
        <Pagination />
      </div>
    </div>
  );
};

export default ManageProductsTab;