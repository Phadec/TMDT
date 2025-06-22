import { cva } from "class-variance-authority";
import { useState } from "react";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { clientApi, commonApi } from "~/api/api.jsx";
import { useAuth } from "~/hooks";
import "~/styles/swal-custom.css";

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

// Component hiển thị độ mạnh mật khẩu
function PasswordStrengthIndicator({ strength, requirements }) {
  const getWidthPercentage = () => {
    return (strength.score / 5) * 100;
  };

  // Luôn hiển thị requirements để người dùng biết yêu cầu

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-600">Yêu cầu mật khẩu:</span>
        <span className="text-xs font-medium" style={{ color: strength.color }}>
          {strength.feedback}
        </span>
      </div>
      
      {/* Thanh tiến trình */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <motion.div
          className="h-2 rounded-full transition-all duration-300"
          style={{ backgroundColor: strength.color }}
          initial={{ width: 0 }}
          animate={{ width: `${getWidthPercentage()}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      {/* Các chấm chỉ báo */}
      <div className="flex justify-between mb-3">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`w-2 h-1 rounded-full ${
              level <= strength.score ? 'opacity-100' : 'opacity-30'
            }`}
            style={{ backgroundColor: strength.color }}
          />
        ))}
      </div>

      {/* Danh sách yêu cầu */}
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <motion.div
            key={index}
            className="flex items-center text-xs"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.div
              className={`w-3 h-3 rounded-full mr-2 flex items-center justify-center`}
              style={{ backgroundColor: req.met ? '#10b981' : '#ef4444' }}
              animate={{ scale: req.met ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {req.met ? (
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </motion.div>
            <span className={req.met ? 'text-green-600' : 'text-red-500'}>
              {req.text}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Setting() {
  const { user } = useAuth();
  const [passwordData, setPasswordData] = useState({
    email: "",
    oldPassword: "",
    newPassword: "",
    reNewPassword: ""
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
    color: "#ef4444"
  });
  const [passwordRequirements, setPasswordRequirements] = useState([
    { text: "Ít nhất 6 ký tự", met: false },
    { text: "Có chữ thường (a-z)", met: false },
    { text: "Có chữ hoa (A-Z)", met: false },
    { text: "Có số (0-9)", met: false },
    { text: "Có ký tự đặc biệt (!@#$...)", met: false }
  ]);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Kiểm tra độ mạnh mật khẩu
  const checkPasswordStrength = (password) => {
    let score = 0;
    let feedback = "";
    let color = "#ef4444"; // red

    // Kiểm tra từng yêu cầu
    const hasLength = password.length >= 6;
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    // Cập nhật requirements
    const newRequirements = [
      { text: "Ít nhất 6 ký tự", met: hasLength },
      { text: "Có chữ thường (a-z)", met: hasLowercase },
      { text: "Có chữ hoa (A-Z)", met: hasUppercase },
      { text: "Có số (0-9)", met: hasNumber },
      { text: "Có ký tự đặc biệt (!@#$...)", met: hasSpecialChar }
    ];

    // Tính điểm
    if (hasLength) score += 1;
    if (hasLowercase) score += 1;
    if (hasUppercase) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecialChar) score += 1;

    // Xác định màu sắc và feedback dựa trên điểm
    if (password.length === 0) {
      feedback = "";
      color = "#ef4444";
    } else if (score <= 2) {
      color = "#ef4444"; // red
      feedback = "Mật khẩu yếu - Cần thêm yêu cầu";
    } else if (score === 3) {
      color = "#f59e0b"; // yellow
      feedback = "Mật khẩu trung bình - Cần thêm yêu cầu";
    } else if (score === 4) {
      color = "#f59e0b"; // yellow
      feedback = "Gần hoàn thành - Cần thêm 1 yêu cầu";
    } else if (score === 5) {
      color = "#10b981"; // green
      feedback = "Mật khẩu hợp lệ ✓";
    }

    return { score, feedback, color, requirements: newRequirements };
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));

    // Kiểm tra độ mạnh mật khẩu khi người dùng nhập mật khẩu mới
    if (field === 'newPassword') {
      const strengthResult = checkPasswordStrength(value);
      setPasswordStrength({
        score: strengthResult.score,
        feedback: strengthResult.feedback,
        color: strengthResult.color
      });
      setPasswordRequirements(strengthResult.requirements);
    }
  };

  const handleChangePassword = async () => {
    try {
      setIsChangingPassword(true);

      // Validation
      const validationErrors = [];

      if (!passwordData.email || !passwordData.email.trim()) {
        validationErrors.push("Email không được để trống");
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(passwordData.email.trim())) {
          validationErrors.push("Email không đúng định dạng");
        }
      }

      if (!passwordData.oldPassword || !passwordData.oldPassword.trim()) {
        validationErrors.push("Mật khẩu hiện tại không được để trống");
      }

      if (!passwordData.newPassword || !passwordData.newPassword.trim()) {
        validationErrors.push("Mật khẩu mới không được để trống");
      } else {
        const passwordCheck = checkPasswordStrength(passwordData.newPassword);
        if (passwordCheck.score < 5) {
          validationErrors.push("Mật khẩu mới phải thỏa mãn TẤT CẢ các yêu cầu: ít nhất 6 ký tự, có chữ thường, chữ hoa, số và ký tự đặc biệt");
        }
      }

      if (!passwordData.reNewPassword || !passwordData.reNewPassword.trim()) {
        validationErrors.push("Xác nhận mật khẩu không được để trống");
      }

      if (passwordData.newPassword !== passwordData.reNewPassword) {
        validationErrors.push("Mật khẩu mới và xác nhận mật khẩu không khớp");
      }

      if (validationErrors.length > 0) {
        await Swal.fire({
          icon: "warning",
          title: "Thông tin không hợp lệ",
          html: `
            <div class="text-left">
              <p class="mb-2">Vui lòng kiểm tra lại:</p>
              <ul class="text-sm list-disc list-inside space-y-1">
                ${validationErrors.map(error => `<li>${error}</li>`).join('')}
              </ul>
            </div>
          `,
          confirmButtonText: "OK",
        });
        return;
      }

      // Call API
      const response = await clientApi.put("/auth/change", {
        userId: user?.id,
        email: passwordData.email.trim(),
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        reNewPassword: passwordData.reNewPassword
      });

      console.log("Change password response:", response);

      if (response) {
        // Get message from response or use default
        const successMessage = response.data?.message || "Đổi mật khẩu thành công!";
        
        await Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: successMessage,
          confirmButtonText: "OK",
          confirmButtonColor: "#16a34a"
        });

        // Reset form after successful change
        setPasswordData({
          email: "",
          oldPassword: "",
          newPassword: "",
          reNewPassword: ""
        });
        
        // Reset password strength
        setPasswordStrength({
          score: 0,
          feedback: "",
          color: "#ef4444"
        });
        setPasswordRequirements([
          { text: "Ít nhất 6 ký tự", met: false },
          { text: "Có chữ thường (a-z)", met: false },
          { text: "Có chữ hoa (A-Z)", met: false },
          { text: "Có số (0-9)", met: false },
          { text: "Có ký tự đặc biệt (!@#$...)", met: false }
        ]);
      } else {
        await Swal.fire({
          icon: "error",
          title: "Đổi mật khẩu thất bại",
          text: "Không nhận được phản hồi từ server. Vui lòng thử lại sau.",
          confirmButtonText: "OK"
        });
      }

    } catch (err) {
      console.error("Lỗi khi đổi mật khẩu:", err);
      
      // Show error message from API response or generic error
      const errorMessage = err.response?.data?.message || err.message || "Có lỗi xảy ra khi đổi mật khẩu";
      
      await Swal.fire({
        icon: "error",
        title: "Đổi mật khẩu thất bại",
        text: errorMessage,
        confirmButtonText: "OK"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div>
      <h2 className="section-title">Cài đặt</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Bảo mật</h3>
          <div className="space-y-3">
            <div>
              <label className="form-label">
                Email
              </label>
              <input
                type="email"
                value={passwordData.email}
                onChange={(e) => handlePasswordChange('email', e.target.value)}
                className={inputStyles()}
                placeholder="Nhập email của bạn"
              />
            </div>
            <div>
              <label className="form-label">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) => handlePasswordChange('oldPassword', e.target.value)}
                className={inputStyles()}
                placeholder="Nhập mật khẩu hiện tại"
              />
            </div>
            <div>
              <label className="form-label">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                className={inputStyles()}
                placeholder="Nhập mật khẩu mới"
              />
              <PasswordStrengthIndicator strength={passwordStrength} requirements={passwordRequirements} />
            </div>
            <div>
              <label className="form-label">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                value={passwordData.reNewPassword}
                onChange={(e) => handlePasswordChange('reNewPassword', e.target.value)}
                className={inputStyles()}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
            <button 
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline-button ${
                isChangingPassword ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isChangingPassword ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Setting;
