// Add Product Form Component
const AddProductForm = () => {
  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Đăng sản phẩm mới</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Nhập tên sản phẩm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₫</span>
                <input
                  type="number"
                  className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Chọn danh mục</option>
                <option value="electronics">Điện tử</option>
                <option value="clothing">Thời trang</option>
                <option value="home">Đồ gia dụng</option>
                <option value="beauty">Làm đẹp</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hình ảnh sản phẩm
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">Kéo thả hoặc nhấp để tải lên</p>
                <input type="file" className="hidden" />
                <button className="mt-2 px-3 py-1 text-sm text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50">
                  Chọn file
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả sản phẩm
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="5"
                placeholder="Nhập mô tả chi tiết về sản phẩm"
              ></textarea>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            Hủy
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
            Đăng sản phẩm
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;