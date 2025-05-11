import { inputStyles} from './Setting.jsx';

function Profile() {
  return (
    <div>
      <h2 className="section-title">Thông tin cá nhân</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">
              Họ và tên
            </label>
            <input
              type="text"
              className={inputStyles()}
              defaultValue="Nguyễn Văn A"
            />
          </div>
          <div>
            <label className="form-label">
              Tên người dùng
            </label>
            <input
              type="text"
              className={inputStyles()}
              defaultValue="nguyenvana"
            />
          </div>
        </div>
        <div>
          <label className="form-label">
            Email
          </label>
          <input
            type="email"
            className={inputStyles()}
            defaultValue="nguyenvana@example.com"
          />
        </div>
        <div>
          <label className="form-label">
            Số điện thoại
          </label>
          <input
            type="tel"
            className={inputStyles()}
            defaultValue="0123456789"
          />
        </div>
        <div>
          <label className="form-label">
            Địa chỉ
          </label>
          <textarea
            className={inputStyles()}
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
