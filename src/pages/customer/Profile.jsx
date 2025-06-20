import { useState, useEffect } from "react";
import Swal from "sweetalert2";

import { inputStyles } from "./Setting.jsx";
import { clientApi } from "~/api/api.jsx";
import { useAuth } from "~/hooks";
import FaceVerificationModal from "~/components/FaceVerificationModal.jsx";
import "~/styles/swal-custom.css";

function Profile() {
  const [profileData, setProfileData] = useState({
    fullname: "",
    email: "",
    phone: "",
    userType: "",
    createdAt: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSellerRegistering, setIsSellerRegistering] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [showFaceVerification, setShowFaceVerification] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Lấy thông tin profile khi component mount hoặc user thay đổi
  useEffect(() => {
    if (user && isAuthenticated) {
      fetchProfileData();
    } else if (isAuthenticated && !user) {
      // Nếu authenticated nhưng chưa có user data, set loading
      setLoading(true);
    } else if (!isAuthenticated) {
      // Nếu chưa authenticated, set error
      setError("Bạn cần đăng nhập để xem thông tin cá nhân");
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      const personId = user?.id;

      if (!personId) {
        setError("Không tìm thấy ID người dùng");
        setLoading(false);
        return;
      }

      // Gọi API để lấy thông tin profile
      const response = await clientApi.post("/profile/view", {
        personId: personId,
      });

      if (response) {
        const isSellerValue = response.seller || false;
        
        setIsSeller(isSellerValue);
        setProfileData({
          fullname: response.fullName || "",
          email: response.email || "",
          phone: response.phone || "",
          userType: isSellerValue ? "Người bán" : "Khách hàng",
          createdAt: response.createdAt || "",
        });
        setError(null);
      } else {
        setError("Không thể lấy thông tin profile");
      }
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi lấy thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    // TODO: Implement save changes functionality
    console.log("Saving changes:", profileData);
  };

  const handleRegisterAsSeller = async () => {
    // Hiển thị dialog xác nhận
    const result = await Swal.fire({
      title: "Đăng ký làm người bán?",
      html: `
        <div class="text-left">
          <p class="mb-3">Để đăng ký làm người bán, bạn cần thực hiện xác thực khuôn mặt để đảm bảo tính xác thực của tài khoản.</p>
          <div class="bg-blue-50 border border-blue-200 rounded p-3">
            <p class="text-sm"><strong>Quy trình xác thực gồm:</strong></p>
            <ul class="text-sm mt-2 list-disc list-inside space-y-1">
              <li>Tải lên ảnh CMND/CCCD/Hộ chiếu</li>
              <li>Chụp ảnh selfie hiện tại</li>
              <li>Hệ thống tự động so sánh và xác thực</li>
            </ul>
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d33",
      confirmButtonText: "Bắt đầu xác thực",
      cancelButtonText: "Hủy",
      customClass: {
        popup: 'swal-wide'
      }
    });

    if (!result.isConfirmed) {
      return;
    }

    // Hiển thị component xác thực khuôn mặt
    setShowFaceVerification(true);
  };

  const handleFaceVerificationComplete = async (verificationResult) => {
    setShowFaceVerification(false);
    
    if (!verificationResult.success) {
      return; // User already got error message from FaceVerification component
    }

    try {
      setIsSellerRegistering(true);
      setError(null);

      const personId = user?.id;
      if (!personId) {
        setError("Không tìm thấy ID người dùng");
        return;
      }

      // Gọi API để đăng ký làm người bán với dữ liệu xác thực
      const response = await clientApi.post("/profile/register-seller", {
        personId: personId,
        faceVerification: {
          similarity: verificationResult.similarity,
          confidence: verificationResult.confidence,
          isHighConfidence: verificationResult.isHighConfidence,
          verifiedAt: new Date().toISOString(),
          verificationData: verificationResult.verificationData
        }
      });

      if (response) {
        // Cập nhật state local
        setIsSeller(true);
        setProfileData((prev) => ({
          ...prev,
          userType: "Người bán",
        }));

        // Hiển thị thông báo thành công với thông tin xác thực
        await Swal.fire({
          icon: "success",
          title: "Đăng ký thành công!",
          html: `
            <div class="text-left">
              <p class="mb-3">🎉 Chúc mừng! Bạn đã trở thành người bán được xác thực.</p>
              <div class="bg-green-50 border border-green-200 rounded p-3 mb-3">
                <p class="text-sm"><strong>Thông tin xác thực:</strong></p>
                <ul class="text-sm mt-1 space-y-1">
                  <li>• Độ tương đồng: ${verificationResult.similarity.toFixed(2)}%</li>
                  <li>• Mức độ tin cậy: ${verificationResult.confidence}</li>
                  <li>• Trạng thái: Đã xác thực thành công</li>
                </ul>
              </div>
              <p class="text-sm text-gray-600">Bạn có thể bắt đầu đăng bán sản phẩm ngay bây giờ!</p>
            </div>
          `,
          confirmButtonText: "Tuyệt vời!",
          confirmButtonColor: "#16a34a",
          customClass: {
            popup: 'swal-wide'
          }
        });
      } else {
        setError("Không thể đăng ký làm người bán");
      }
    } catch (err) {
      console.error("Lỗi khi đăng ký làm người bán:", err);
      setError(err.message || "Có lỗi xảy ra khi đăng ký làm người bán");
      
      // Hiển thị thông báo lỗi
      await Swal.fire({
        icon: "error",
        title: "Đăng ký thất bại",
        text: err.message || "Có lỗi xảy ra khi đăng ký làm người bán. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSellerRegistering(false);
    }
  };

  const handleFaceVerificationCancel = () => {
    setShowFaceVerification(false);
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Đang tải thông tin...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>Lỗi: {error}</p>
        <button
          onClick={fetchProfileData}
          className="px-4 py-2 mt-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }



  return (
    <div>
      <h2 className="section-title">Thông tin cá nhân</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Họ và tên</label>
            <input
              type="text"
              className={inputStyles()}
              value={profileData.fullname}
              onChange={(e) => handleInputChange("fullname", e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Chức nghiệp</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                className={inputStyles()}
                value={profileData.userType}
                readOnly
                disabled
              />
              {/* Badge cho người bán */}
              {isSeller && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Đã xác minh
                </span>
              )}
            </div>
          </div>
        </div>
        <div>
          <label className="form-label">Email</label>
          <input
            type="email"
            className={inputStyles()}
            value={profileData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">Số điện thoại</label>
          <input
            type="tel"
            className={inputStyles()}
            value={profileData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">Ngày tạo tài khoản</label>
          <input
            type="text"
            className={inputStyles()}
            value={
              profileData.createdAt
                ? new Date(profileData.createdAt).toLocaleDateString("vi-VN")
                : ""
            }
            readOnly
            disabled
          />
        </div>
        <div>
          <label className="form-label">Địa chỉ</label>
          <textarea
            className={inputStyles()}
            placeholder="Nhập địa chỉ của bạn"
          />
        </div>
        <div className="flex items-center justify-between">
          {/* Nút đăng ký làm người bán nếu chưa phải seller */}
          {!isSeller && (
            <button
              onClick={handleRegisterAsSeller}
              disabled={isSellerRegistering || showFaceVerification}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSellerRegistering ? (
                <>
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : showFaceVerification ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                  Đang xác thực...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.414-4.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Đăng ký làm người bán (Xác thực AI)
                </>
              )}
            </button>
          )}
          
          {/* Placeholder div khi là seller để giữ layout */}
          {isSeller && <div></div>}
          
          <button
            onClick={handleSaveChanges}
            className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
          >
            Lưu thay đổi
          </button>
        </div>
        
        {/* Thông tin hướng dẫn cho người chưa phải seller */}
        {!isSeller && (
          <div className="mt-4 space-y-3">
            <div className="p-4 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-green-50">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.414-4.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <div>
                  <h4 className="mb-2 font-semibold text-gray-900">Đăng ký làm người bán với công nghệ AI</h4>
                  <p className="mb-3 text-sm text-gray-700">
                    Trở thành người bán được xác thực để đăng bán sản phẩm trên hệ thống với quy trình xác thực tự động bằng AI.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Xác thực danh tính bằng CMND/CCCD/Hộ chiếu
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      So sánh khuôn mặt tự động với công nghệ FPT AI
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Bảo mật thông tin cá nhân tuyệt đối
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Quy trình hoàn tất trong vài phút
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal xác thực khuôn mặt */}
      <FaceVerificationModal
        isOpen={showFaceVerification}
        onClose={handleFaceVerificationCancel}
        onVerificationComplete={handleFaceVerificationComplete}
      />
    </div>
  );
}

export default Profile;
