function Profile() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Thông tin cá nhân</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Họ và tên
            </label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              defaultValue="Nguyễn Văn A"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Tên người dùng
            </label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              defaultValue="nguyenvana"
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            defaultValue="nguyenvana@example.com"
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Số điện thoại
          </label>
          <input
            type="tel"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            defaultValue="0123456789"
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Địa chỉ
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            defaultValue="123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh"
          />
        </div>
        <div className="flex justify-end">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
