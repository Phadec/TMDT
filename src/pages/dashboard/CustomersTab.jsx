// Customer Card Component
export const CustomerCard = ({ item }) => {
  return (
    <div
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div>
          <div className="font-medium">Khách hàng #{item}</div>
          <div className="text-sm text-gray-500">
            khachhang{item}@example.com
          </div>
        </div>
      </div>
      <div className="text-sm text-gray-600">
        <div className="flex justify-between mb-1">
          <span>Đơn hàng:</span>
          <span className="font-medium">{item + 3}</span>
        </div>
        <div className="flex justify-between">
          <span>Tổng chi tiêu:</span>
          <span className="font-medium">
            ₫{(item * 250000).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

// Customers Tab Component
const CustomersTab = () => {
  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Quản lý khách hàng</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <CustomerCard key={item} item={item} />
        ))}
      </div>
    </div>
  );
};

export default CustomersTab;