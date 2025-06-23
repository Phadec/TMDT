import { useState, useEffect } from "react";
import AuthComponent, { Form, AnimatedInput, showAlert } from "./AuthComponent";
import {useAuth} from "~/hooks";
import { motion } from "framer-motion";

function Register() {
  return <AuthComponent children={<FormRegister />} />;
}

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

function FormRegister() {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phone: "",
    password: "",
    confirmPassword: "",
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
  const { register, loading, error, registerSuccess, clearErrors } = useAuth();

  // Xóa lỗi cũ khi component mount
  useEffect(() => {
    clearErrors();
  }, [clearErrors]);
  
  // Hiển thị lỗi từ API bằng Swal nếu có
  useEffect(() => {
    if (error) {
      showAlert(
        "error",
        "Đăng ký thất bại",
        error?.message || "Có lỗi xảy ra khi đăng ký."
      );
    }
  }, [error]);

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

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Kiểm tra độ mạnh mật khẩu khi người dùng nhập
    if (name === 'password') {
      const strengthResult = checkPasswordStrength(value);
      setPasswordStrength({
        score: strengthResult.score,
        feedback: strengthResult.feedback,
        color: strengthResult.color
      });
      setPasswordRequirements(strengthResult.requirements);
    }
  };

  // Xác thực form trước khi submit
  const validateForm = () => {
    // Kiểm tra email
    if (!formData.email) {
      showAlert("error", "Lỗi", "Email không được để trống");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      showAlert("error", "Lỗi", "Email không đúng định dạng");
      return false;
    }
    
    // Kiểm tra họ tên
    if (!formData.fullName) {
      showAlert("error", "Lỗi", "Họ tên không được để trống");
      return false;
    } else if (formData.fullName.length < 2) {
      showAlert("error", "Lỗi", "Họ tên phải có ít nhất 2 ký tự");
      return false;
    }

    // Kiểm tra số điện thoại
    if (!formData.phone) {
      showAlert("error", "Lỗi", "Số điện thoại không được để trống");
      return false;
    } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      showAlert("error", "Lỗi", "Số điện thoại phải có 10-11 chữ số");
      return false;
    }
    
    // Kiểm tra mật khẩu mạnh
    if (!formData.password) {
      showAlert("error", "Lỗi", "Mật khẩu không được để trống");
      return false;
    }

    const passwordCheck = checkPasswordStrength(formData.password);
    if (passwordCheck.score < 5) {
      showAlert("error", "Lỗi", "Mật khẩu phải thỏa mãn TẤT CẢ các yêu cầu: ít nhất 6 ký tự, có chữ thường, chữ hoa, số và ký tự đặc biệt");
      return false;
    }
    
    // Kiểm tra xác nhận mật khẩu
    if (formData.password !== formData.confirmPassword) {
      showAlert("error", "Lỗi", "Mật khẩu xác nhận không khớp");
      return false;
    }
    
    return true;
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra form trước khi gửi
    if (!validateForm()) {
      return;
    }
    
    try {
      // Chuẩn bị dữ liệu để gửi API
      const userData = {
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        password: formData.password,
      };
      
      // Gọi hàm register từ useAuth hook
      await register(userData);
    } catch (err) {
      console.error("Register error:", err);
      // Hiển thị lỗi bằng Swal nếu có lỗi không được xử lý bởi authSlice
      showAlert(
        "error",
        "Đăng ký thất bại",
        err?.message || "Có lỗi xảy ra khi đăng ký."
      );
    }
  };

  return (
    <Form
      title="Tạo tài khoản để mua sắm"
      formInput={
        <>
          <AnimatedInput
            label="Địa chỉ email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
            }
          />

          <AnimatedInput
            label="Họ và tên"
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            }
          />

          <AnimatedInput
            label="Số điện thoại"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            }
          />

          <div>
            <AnimatedInput
              label="Mật khẩu"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
            />
            <PasswordStrengthIndicator strength={passwordStrength} requirements={passwordRequirements} />
          </div>

          <AnimatedInput
            label="Xác nhận mật khẩu"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            }
          />
        </>
      }
      onSubmit={handleSubmit}
      isSubmitting={loading}
    />
  );
}

export default Register;
