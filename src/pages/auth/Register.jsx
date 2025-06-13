import { useState, useEffect } from "react";
import AuthComponent, { Form, AnimatedInput, showAlert } from "./AuthComponent";
import {useAuth} from "~/hooks";

function Register() {
  return <AuthComponent children={<FormRegister />} />;
}

function FormRegister() {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  });
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

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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
    
    // Kiểm tra mật khẩu
    if (!formData.password) {
      showAlert("error", "Lỗi", "Mật khẩu không được để trống");
      return false;
    } else if (formData.password.length < 6) {
      showAlert("error", "Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
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
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
            }
          />

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
