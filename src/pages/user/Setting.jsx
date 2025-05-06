function Setting() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Cài đặt</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Bảo mật</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Mật khẩu mới
              </label>
              <input
                type="password"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Đổi mật khẩu
            </button>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Thông báo</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                id="email-notifications"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                defaultChecked
              />
              <label
                htmlFor="email-notifications"
                className="ml-2 block text-sm text-gray-900"
              >
                Nhận thông báo qua email
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="sms-notifications"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                defaultChecked
              />
              <label
                htmlFor="sms-notifications"
                className="ml-2 block text-sm text-gray-900"
              >
                Nhận thông báo qua SMS
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="marketing-notifications"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="marketing-notifications"
                className="ml-2 block text-sm text-gray-900"
              >
                Nhận thông tin khuyến mãi
              </label>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
}

export default Setting;
