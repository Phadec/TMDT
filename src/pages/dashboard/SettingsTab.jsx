// Settings Tab Component
const SettingsTab = () => {
  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Cài đặt</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">
              Thông tin cửa hàng
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên cửa hàng
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  defaultValue="Cửa hàng của tôi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  defaultValue="cuahang@example.com"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Thông báo</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  Thông báo đơn hàng mới
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  Thông báo tin nhắn
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;