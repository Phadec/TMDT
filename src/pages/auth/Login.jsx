import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import AuthComponent, { Form, AnimatedInput } from "./AuthComponent";
import { useAuth } from "~/hooks";
import { PUBLIC_URL } from "~/path";

function Login() {
  return <AuthComponent children={<FormLogin />} />;
}

function FormLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const { login, loading, error, clearErrors } = useAuth();
  const location = useLocation();

  // Lấy địa chỉ redirect sau khi đăng nhập thành công (nếu có)
  const from = location.state?.from || PUBLIC_URL.HOME;

  // Xóa lỗi cũ khi component mount
  useEffect(() => {
    clearErrors();
  }, [clearErrors]);

  // Cập nhật state khi người dùng nhập liệu
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Xóa lỗi của trường đang nhập
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  // Xác thực form trước khi submit
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Kiểm tra email
    if (!formData.email) {
      errors.email = "Email không được để trống";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email không đúng định dạng";
      isValid = false;
    }

    // Kiểm tra mật khẩu
    if (!formData.password) {
      errors.password = "Mật khẩu không được để trống";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra form trước khi gửi
    if (!validateForm()) {
      return;
    }

    try {
      // Gọi hàm login từ useAuth hook
      await login(formData);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <Form
      title="Đăng nhập tài khoản"
      formInput={
        <>
          <AnimatedInput
            label="Email"
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
          {formErrors.email && (
            <div className="mb-2 -mt-4 text-sm text-red-500">
              {formErrors.email}
            </div>
          )}

          <AnimatedInput
            label="Password"
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
          {formErrors.password && (
            <div className="mb-2 -mt-4 text-sm text-red-500">
              {formErrors.password}
            </div>
          )}

          {/* Hiển thị thông báo lỗi từ API nếu có */}
          {error && (
            <div className="p-2 mt-2 mb-4 text-sm text-red-500 border border-red-200 rounded-md bg-red-50">
              {error.message || "Có lỗi xảy ra khi đăng nhập."}
            </div>
          )}
        </>
      }
      onSubmit={handleSubmit}
      isSubmitting={loading}
    />
  );
}

export default Login;
