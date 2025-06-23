import { useState, useEffect } from "react";
import { Save, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";

function SettingsPanel() {  // State cho các cài đặt hệ thống
  const [settings, setSettings] = useState({
    chung: {
      siteName: "Chợ Rao Vặt Online",
      siteDescription: "Nền tảng mua bán, rao vặt trực tuyến hàng đầu Việt Nam",
      contactEmail: "support@example.com",
      contactPhone: "1900 1234",
      logo: "/logo.png",
      favicon: "/favicon.ico",
      maintenanceMode: false
    },
    baiviet: {
      requireApproval: true,
      maxImagesPerPost: 10,
      maxPostsPerUser: 20,
      postExpiryDays: 30,
      allowedCategories: ["Điện tử", "Thời trang", "Bất động sản", "Xe cộ", "Đồ gia dụng", "Việc làm", "Dịch vụ"],
      bannedKeywords: ["lừa đảo", "ma túy", "vũ khí", "cờ bạc"]
    },
    nguoidung: {
      requireEmailVerification: true,
      requirePhoneVerification: true,
      allowUserRegistration: true,
      defaultUserRole: "user",
      autoDeleteInactiveUsers: false,
      inactiveUserDays: 365
    },
    baomat: {
      recaptchaEnabled: true,
      recaptchaKey: "6LcXXXXXXXXXXXXXXXXXXXXX",
      maxLoginAttempts: 5,
      lockoutTime: 30,
      passwordMinLength: 8,
      passwordRequireSpecialChar: true,
      passwordRequireNumber: true,
      passwordRequireUppercase: true
    },
    thanhtoan: {
      currency: "VND",
      paymentGateways: ["VNPay", "MoMo", "ZaloPay", "Banking"],
      featuredPostPrice: 50000,
      highlightedPostPrice: 30000,
      urgentPostPrice: 40000
    },
    thongbao: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      adminEmailForReports: "admin@example.com"
    }
  });

  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("chung");

  // Xử lý thay đổi cài đặt
  const handleChange = (section, field, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    });
  };

  // Xử lý lưu cài đặt
  const handleSaveSettings = () => {
    setLoading(true);
    // Giả lập API call để lưu cài đặt
    setTimeout(() => {
      setLoading(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  // Xử lý reset cài đặt
  const handleResetSettings = () => {
    if (window.confirm("Bạn có chắc chắn muốn khôi phục cài đặt mặc định?")) {
      setLoading(true);
      // Giả lập API call để reset cài đặt
      setTimeout(() => {
        // Đây sẽ là API call để lấy cài đặt mặc định
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      {/* Sidebar cài đặt */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">Danh mục cài đặt</h3>
          </div>          <div className="p-2">
            <nav className="space-y-1">
              {Object.keys(settings).map((section) => {
                const sectionNames = {
                  chung: "Cài đặt chung",
                  baiviet: "Cài đặt bài viết",
                  nguoidung: "Cài đặt người dùng",
                  baomat: "Cài đặt bảo mật",
                  thanhtoan: "Cài đặt thanh toán",
                  thongbao: "Cài đặt thông báo"
                };
                
                return (
                  <button
                    key={section}
                    className={`w-full px-3 py-2 text-left rounded-lg ${
                      activeTab === section
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setActiveTab(section)}
                  >
                    <span>{sectionNames[section]}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Nội dung cài đặt */}
      <div className="lg:col-span-3">        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {activeTab === "chung" && "Cài đặt chung"}
              {activeTab === "baiviet" && "Cài đặt bài viết"}
              {activeTab === "nguoidung" && "Cài đặt người dùng"}
              {activeTab === "baomat" && "Cài đặt bảo mật"}
              {activeTab === "thanhtoan" && "Cài đặt thanh toán"}
              {activeTab === "thongbao" && "Cài đặt thông báo"}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleResetSettings}
                className="flex items-center px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                disabled={loading}
              >
                <RefreshCw size={18} className="mr-1" />
                Khôi phục mặc định
              </button>
              <button
                onClick={handleSaveSettings}
                className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw size={18} className="mr-1 animate-spin" />
                ) : (
                  <Save size={18} className="mr-1" />
                )}
                Lưu cài đặt
              </button>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3 mb-4 text-green-700 bg-green-100 rounded-lg">
              <p className="flex items-center">
                <CheckCircle size={18} className="mr-2" />
                Cài đặt đã được lưu thành công!
              </p>
            </div>
          )}          {/* Cài đặt chung */}
          {activeTab === "chung" && (
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Tên trang web</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={settings.chung.siteName}
                  onChange={(e) => handleChange("chung", "siteName", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Mô tả trang web</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={settings.chung.siteDescription}
                  onChange={(e) => handleChange("chung", "siteDescription", e.target.value)}
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Email liên hệ</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={settings.chung.contactEmail}
                    onChange={(e) => handleChange("chung", "contactEmail", e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Số điện thoại liên hệ</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={settings.chung.contactPhone}
                    onChange={(e) => handleChange("chung", "contactPhone", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Logo</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={settings.chung.logo}
                      onChange={(e) => handleChange("chung", "logo", e.target.value)}
                    />
                    <button className="px-3 py-2 text-white bg-indigo-600 rounded-lg">Tải lên</button>
                  </div>
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Favicon</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={settings.chung.favicon}
                      onChange={(e) => handleChange("chung", "favicon", e.target.value)}
                    />
                    <button className="px-3 py-2 text-white bg-indigo-600 rounded-lg">Tải lên</button>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={settings.chung.maintenanceMode}
                    onChange={(e) => handleChange("chung", "maintenanceMode", e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Chế độ bảo trì</span>
                </label>
                {settings.chung.maintenanceMode && (
                  <div className="p-3 mt-2 text-yellow-700 bg-yellow-100 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle size={18} className="mr-2" />
                      <p className="text-sm">Khi bật chế độ bảo trì, người dùng sẽ không thể truy cập trang web.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}          {/* Cài đặt bài đăng */}
          {activeTab === "baiviet" && (
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={settings.baiviet.requireApproval}
                    onChange={(e) => handleChange("baiviet", "requireApproval", e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Yêu cầu phê duyệt bài đăng</span>
                </label>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Số ảnh tối đa mỗi bài</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={settings.baiviet.maxImagesPerPost}
                    onChange={(e) => handleChange("baiviet", "maxImagesPerPost", parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Số bài đăng tối đa mỗi người</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={settings.baiviet.maxPostsPerUser}
                    onChange={(e) => handleChange("baiviet", "maxPostsPerUser", parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Thời gian hết hạn (ngày)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={settings.baiviet.postExpiryDays}
                    onChange={(e) => handleChange("baiviet", "postExpiryDays", parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Danh mục cho phép</label>
                <div className="p-3 border border-gray-300 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {settings.baiviet.allowedCategories.map((category, index) => (
                      <div key={index} className="flex items-center px-3 py-1 bg-gray-100 rounded-full">
                        <span>{category}</span>
                        <button
                          className="ml-2 text-gray-500 hover:text-red-500"
                          onClick={() => {
                            const newCategories = [...settings.baiviet.allowedCategories];
                            newCategories.splice(index, 1);
                            handleChange("baiviet", "allowedCategories", newCategories);
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex mt-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Thêm danh mục mới"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.target.value.trim()) {
                          handleChange("baiviet", "allowedCategories", [
                            ...settings.baiviet.allowedCategories,
                            e.target.value.trim()
                          ]);
                          e.target.value = "";
                        }
                      }}
                    />
                    <button
                      className="px-3 py-2 text-white bg-indigo-600 rounded-r-lg"
                      onClick={(e) => {
                        const input = e.target.previousSibling;
                        if (input.value.trim()) {
                          handleChange("baiviet", "allowedCategories", [
                            ...settings.baiviet.allowedCategories,
                            input.value.trim()
                          ]);
                          input.value = "";
                        }
                      }}
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Từ khóa bị cấm</label>
                <div className="p-3 border border-gray-300 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {settings.baiviet.bannedKeywords.map((keyword, index) => (
                      <div key={index} className="flex items-center px-3 py-1 bg-gray-100 rounded-full">
                        <span>{keyword}</span>
                        <button
                          className="ml-2 text-gray-500 hover:text-red-500"
                          onClick={() => {
                            const newKeywords = [...settings.baiviet.bannedKeywords];
                            newKeywords.splice(index, 1);
                            handleChange("baiviet", "bannedKeywords", newKeywords);
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex mt-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Thêm từ khóa cấm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.target.value.trim()) {
                          handleChange("baiviet", "bannedKeywords", [
                            ...settings.baiviet.bannedKeywords,
                            e.target.value.trim()
                          ]);
                          e.target.value = "";
                        }
                      }}
                    />
                    <button
                      className="px-3 py-2 text-white bg-indigo-600 rounded-r-lg"
                      onClick={(e) => {
                        const input = e.target.previousSibling;
                        if (input.value.trim()) {
                          handleChange("baiviet", "bannedKeywords", [
                            ...settings.baiviet.bannedKeywords,
                            input.value.trim()
                          ]);
                          input.value = "";
                        }
                      }}
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}          {/* Cài đặt người dùng */}
          {activeTab === "nguoidung" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      checked={settings.nguoidung.requireEmailVerification}
                      onChange={(e) => handleChange("nguoidung", "requireEmailVerification", e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-700">Yêu cầu xác thực email</span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      checked={settings.nguoidung.requirePhoneVerification}
                      onChange={(e) => handleChange("nguoidung", "requirePhoneVerification", e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-700">Yêu cầu xác thực số điện thoại</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={settings.nguoidung.allowUserRegistration}
                    onChange={(e) => handleChange("nguoidung", "allowUserRegistration", e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Cho phép đăng ký tài khoản mới</span>
                </label>
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Vai trò mặc định cho người dùng mới</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={settings.nguoidung.defaultUserRole}
                  onChange={(e) => handleChange("nguoidung", "defaultUserRole", e.target.value)}
                >
                  <option value="user">Người dùng thường</option>
                  <option value="seller">Người bán</option>
                  <option value="moderator">Người kiểm duyệt</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={settings.nguoidung.autoDeleteInactiveUsers}
                    onChange={(e) => handleChange("nguoidung", "autoDeleteInactiveUsers", e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Tự động xóa tài khoản không hoạt động</span>
                </label>
              </div>
              
              {settings.nguoidung.autoDeleteInactiveUsers && (
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Thời gian không hoạt động (ngày)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={settings.nguoidung.inactiveUserDays}
                    onChange={(e) => handleChange("nguoidung", "inactiveUserDays", parseInt(e.target.value))}
                  />
                </div>
              )}
            </div>
          )}          {/* Cài đặt bảo mật */}
          {activeTab === "baomat" && (
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={settings.baomat.recaptchaEnabled}
                    onChange={(e) => handleChange("baomat", "recaptchaEnabled", e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Bật Google reCAPTCHA</span>
                </label>
              </div>
              
              {settings.baomat.recaptchaEnabled && (
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">reCAPTCHA Site Key</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={settings.baomat.recaptchaKey}
                    onChange={(e) => handleChange("baomat", "recaptchaKey", e.target.value)}
                  />
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Số lần đăng nhập tối đa</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={settings.baomat.maxLoginAttempts}
                    onChange={(e) => handleChange("baomat", "maxLoginAttempts", parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Thời gian khóa (phút)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={settings.baomat.lockoutTime}
                    onChange={(e) => handleChange("baomat", "lockoutTime", parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-700">Yêu cầu mật khẩu</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block mb-1 text-sm text-gray-700">Độ dài tối thiểu</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={settings.baomat.passwordMinLength}
                      onChange={(e) => handleChange("baomat", "passwordMinLength", parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        checked={settings.baomat.passwordRequireSpecialChar}
                        onChange={(e) => handleChange("baomat", "passwordRequireSpecialChar", e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700">Yêu cầu ký tự đặc biệt</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        checked={settings.baomat.passwordRequireNumber}
                        onChange={(e) => handleChange("baomat", "passwordRequireNumber", e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700">Yêu cầu số</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        checked={settings.baomat.passwordRequireUppercase}
                        onChange={(e) => handleChange("baomat", "passwordRequireUppercase", e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700">Yêu cầu chữ hoa</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}          {/* Cài đặt thanh toán */}
          {activeTab === "thanhtoan" && (
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Đơn vị tiền tệ</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={settings.thanhtoan.currency}
                  onChange={(e) => handleChange("thanhtoan", "currency", e.target.value)}
                >
                  <option value="VND">VND - Việt Nam Đồng</option>
                  <option value="USD">USD - US Dollar</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Cổng thanh toán</label>
                <div className="space-y-2">
                  {["VNPay", "MoMo", "ZaloPay", "Banking"].map((gateway) => (
                    <label key={gateway} className="flex items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        checked={settings.thanhtoan.paymentGateways.includes(gateway)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleChange("thanhtoan", "paymentGateways", [...settings.thanhtoan.paymentGateways, gateway]);
                          } else {
                            handleChange(
                              "thanhtoan",
                              "paymentGateways",
                              settings.thanhtoan.paymentGateways.filter(g => g !== gateway)
                            );
                          }
                        }}
                      />
                      <span className="ml-2 text-sm text-gray-700">{gateway}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-700">Giá dịch vụ đăng tin</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="block mb-1 text-sm text-gray-700">Tin nổi bật (VND)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={settings.thanhtoan.featuredPostPrice}
                      onChange={(e) => handleChange("thanhtoan", "featuredPostPrice", parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-sm text-gray-700">Tin được đánh dấu (VND)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={settings.thanhtoan.highlightedPostPrice}
                      onChange={(e) => handleChange("thanhtoan", "highlightedPostPrice", parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-sm text-gray-700">Tin gấp (VND)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={settings.thanhtoan.urgentPostPrice}
                      onChange={(e) => handleChange("thanhtoan", "urgentPostPrice", parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}          {/* Cài đặt thông báo */}
          {activeTab === "thongbao" && (
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={settings.thongbao.emailNotifications}
                    onChange={(e) => handleChange("thongbao", "emailNotifications", e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Gửi thông báo qua email</span>
                </label>
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={settings.thongbao.pushNotifications}
                    onChange={(e) => handleChange("thongbao", "pushNotifications", e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Gửi thông báo đẩy</span>
                </label>
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={settings.thongbao.smsNotifications}
                    onChange={(e) => handleChange("thongbao", "smsNotifications", e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Gửi thông báo qua SMS</span>
                </label>
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Email admin nhận báo cáo</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={settings.thongbao.adminEmailForReports}
                  onChange={(e) => handleChange("thongbao", "adminEmailForReports", e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;