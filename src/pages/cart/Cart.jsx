import { NotiSale, CardGridProduct } from "~/components/items";
import { ShoppingCartIcon, FunnelIcon, AdjustmentsHorizontalIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { buttonVariant, inputVariant, containerVariant, tagVariant } from "./cartVariant"; // Import CVA

function Cart() {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [sortBy, setSortBy] = useState("relevance");
  return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white text-gray-800 mx-20 my-10">
        {/* Thanh thông báo */}
        <NotiSale />

        <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
          {/* Bộ lọc nâng cao */}
          <div className={containerVariant({type: 'filter'})}>
            {/* Phần header của bộ lọc */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-indigo-600" />
                <h3 className="font-medium text-gray-800">Bộ lọc sản phẩm</h3>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                      type="text"
                      placeholder="Tìm sản phẩm..."
                      className={inputVariant({ type: 'text' })}
                  />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={buttonVariant({ intent: 'filter' })}
                >
                  <AdjustmentsHorizontalIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Tùy chọn lọc</span>
                  <ChevronDownIcon className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Phần mở rộng của bộ lọc */}
            {showFilters && (
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Lọc theo danh mục */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Danh mục</h4>
                      <div className="space-y-1">
                        {['all', 'electronics', 'clothing', 'books', 'home'].map((category) => (
                            <div key={category} className="flex items-center">
                              <input
                                  type="radio"
                                  id={`category-${category}`}
                                  name="category"
                                  checked={selectedCategory === category}
                                  onChange={() => setSelectedCategory(category)}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700 capitalize">
                                {category === 'all' ? 'Tất cả' :
                                    category === 'electronics' ? 'Điện tử' :
                                        category === 'clothing' ? 'Quần áo' :
                                            category === 'books' ? 'Sách' : 'Đồ gia dụng'}
                              </label>
                            </div>
                        ))}
                      </div>
                    </div>

                    {/* Lọc theo giá */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Khoảng giá</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{priceRange[0].toLocaleString()}₫</span>
                          <span>{priceRange[1].toLocaleString()}₫</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1000000"
                            step="50000"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                            className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex space-x-2">
                          <button
                              className={buttonVariant({ intent: 'price', active: priceRange[1] <= 200000 })}
                              onClick={() => setPriceRange([0, 200000])}
                          >
                            &lt; 200K
                          </button>
                          <button
                              className={buttonVariant({ intent: 'price', active: priceRange[1] > 200000 && priceRange[1] <= 500000 })}
                              onClick={() => setPriceRange([200000, 500000])}
                          >
                            200K - 500K
                          </button>
                          <button
                              className={buttonVariant({ intent: 'price', active: priceRange[1] > 500000 })}
                              onClick={() => setPriceRange([500000, 1000000])}
                          >
                            &gt; 500K
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Sắp xếp */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Sắp xếp theo</h4>
                      <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className={inputVariant({ type: 'select' })}
                      >
                        <option value="relevance">Phù hợp nhất</option>
                        <option value="price-asc">Giá: Thấp đến cao</option>
                        <option value="price-desc">Giá: Cao đến thấp</option>
                        <option value="newest">Mới nhất</option>
                        <option value="popular">Phổ biến nhất</option>
                      </select>
                    </div>
                  </div>

                  {/* Nút áp dụng và đặt lại */}
                  <div className="flex justify-end mt-4 space-x-2">
                    <button className={buttonVariant({intent: 'secondary'})}>
                      Đặt lại
                    </button>
                    <button className={buttonVariant({intent: 'primary'})}>
                      Áp dụng
                    </button>
                  </div>
                </div>
            )}

            {/* Thanh trạng thái lọc */}
            <div className={containerVariant({type: 'status'})}>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Hiển thị: <b>18</b> sản phẩm</span>
                {selectedCategory !== 'all' && (
                    <div className={tagVariant()}>
                      Danh mục: {selectedCategory === 'electronics' ? 'Điện tử' :
                        selectedCategory === 'clothing' ? 'Quần áo' :
                            selectedCategory === 'books' ? 'Sách' : 'Đồ gia dụng'}
                      <button className="ml-1 text-gray-500 hover:text-gray-700">×</button>
                    </div>
                )}
                {priceRange[1] < 1000000 && (
                    <div className={tagVariant()}>
                      Giá: {priceRange[0].toLocaleString()}₫ - {priceRange[1].toLocaleString()}₫
                      <button className="ml-1 text-gray-500 hover:text-gray-700">×</button>
                    </div>
                )}
              </div>
              <div className="flex space-x-4">
                <button className={buttonVariant({ intent: 'tag', active: selectedCategory === 'all' })}>
                  Tất cả
                </button>
                <button className={buttonVariant({intent: 'tag'})}> 
                  Đã lưu
                </button>
              </div>
            </div>
          </div>

          {/* Tính năng nhanh */}
          <div className="flex justify-between items-center px-2">
            <div className="text-sm">
              <input type="checkbox" className="mr-2" /> Chọn tất cả
            </div>
            <button className="text-red-500 text-sm">Xóa sản phẩm đã chọn</button>
          </div>

          {/* Danh sách sản phẩm */}
          <CardGridProduct icon={<ShoppingCartIcon className="h-6 w-6 text-red-500" />} />

        </div>
      </div>
  );
}

export default Cart;