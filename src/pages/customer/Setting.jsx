import { cva } from "class-variance-authority";

export const inputStyles = cva('shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline', {
  variants: {},
  defaultVariants: {},
});
const checkboxLabelStyles = cva('ml-2 block text-sm text-gray-900', {
  variants: {},
  defaultVariants: {},
});

const checkboxStyles = cva('h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded', {
  variants: {},
  defaultVariants: {},
});

function Setting() {
  return (
    <div>
      <h2 className="section-title">Cài đặt</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Bảo mật</h3>
          <div className="space-y-3">
            <div>
              <label className="form-label">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                className={inputStyles()}
              />
            </div>
            <div>
              <label className="form-label">
                Mật khẩu mới
              </label>
              <input
                type="password"
                className={inputStyles()}
              />
            </div>
            <div>
              <label className="form-label">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                className={inputStyles()}
              />
            </div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline-button">
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
                className={checkboxStyles()}
                defaultChecked
              />
              <label
                htmlFor="email-notifications"
                className={checkboxLabelStyles()}
              >
                Nhận thông báo qua email
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="sms-notifications"
                type="checkbox"
                className={checkboxStyles()}
                defaultChecked
              />
              <label
                htmlFor="sms-notifications"
                className={checkboxLabelStyles()}
              >
                Nhận thông báo qua SMS
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="marketing-notifications"
                type="checkbox"
                className={checkboxStyles()}
              />
              <label
                htmlFor="marketing-notifications"
                className={checkboxLabelStyles()}
              >
                Nhận thông tin khuyến mãi
              </label>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button className={inputStyles()}>
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
}

export default Setting;
