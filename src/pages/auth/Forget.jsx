import { useState, useEffect } from "react";
import AuthComponent, { Form, AnimatedInput, showAlert } from "./AuthComponent";
import { clientApi, commonApi } from "~/api/api.jsx";

// Hàm tạo UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

function Forget() {
  return <AuthComponent children={<FormForget />} />;
}

function FormForget() {
  const [formData, setFormData] = useState({
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cập nhật state khi người dùng nhập liệu
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

    return true;
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra form trước khi gửi
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Kiểm tra email có tồn tại hay không
      const checkEmailResponse = await clientApi.get(`/auth/contain-email?email=${encodeURIComponent(formData.email.trim())}`);
      
      // Với interceptor, nếu thành công (code=200) thì response sẽ là data trực tiếp
      if (checkEmailResponse && checkEmailResponse.id) {
        // Tạo UUID mới cho mật khẩu
        const newPassword = generateUUID();
        
        // Tạo nội dung email HTML
        const htmlContent = `
          <!DOCTYPE html>
          <html lang="vi">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mật khẩu mới của Chợ Việt</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
              }
              .container {
                background-color: #ffffff;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #e74c3c;
              }
              .logo {
                font-size: 28px;
                font-weight: bold;
                color: #e74c3c;
                margin-bottom: 10px;
              }
              .title {
                font-size: 24px;
                color: #2c3e50;
                margin-bottom: 20px;
              }
              .content {
                font-size: 16px;
                margin-bottom: 25px;
                text-align: center;
              }
              .password-box {
                background-color: #f8f9fa;
                border: 2px dashed #e74c3c;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                margin: 20px 0;
              }
              .password {
                font-size: 20px;
                font-weight: bold;
                color: #e74c3c;
                font-family: 'Courier New', monospace;
                letter-spacing: 1px;
              }
              .note {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                font-size: 14px;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                font-size: 14px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🛒 Chợ Việt</div>
                <div class="title">Mật khẩu mới của Chợ Việt</div>
              </div>
              
              <div class="content">
                <p>Xin chào <strong>${checkEmailResponse.fullname || checkEmailResponse.name || 'Khách hàng'}</strong>,</p>
                <p>Chúng tôi đã tạo mật khẩu mới cho tài khoản của bạn theo yêu cầu.</p>
              </div>
              
              <div class="password-box">
                <p style="margin: 0 0 10px 0; font-size: 16px; color: #666;">Mật khẩu mới của bạn:</p>
                <div class="password">${newPassword}</div>
              </div>
              
              <div class="note">
                <strong>⚠️ Lưu ý quan trọng:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Vui lòng đăng nhập và đổi mật khẩu ngay sau khi nhận được email này</li>
                  <li>Không chia sẻ mật khẩu này với bất kỳ ai</li>
                  <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng liên hệ với chúng tôi ngay</li>
                </ul>
              </div>
              
              <div class="footer">
                <p>Trân trọng,<br><strong>Đội ngũ Chợ Việt</strong></p>
                <p style="font-size: 12px; color: #999;">
                  Email này được gửi tự động, vui lòng không trả lời email này.
                </p>
              </div>
            </div>
          </body>
          </html>
        `;

        // Gửi email với nội dung HTML
        const emailData = {
          name: checkEmailResponse.fullname || checkEmailResponse.name || 'Khách hàng',
          email: formData.email.trim(),
          phone: checkEmailResponse.phone || '',
          title: 'Mật khẩu mới của Chợ Việt',
          content: htmlContent
        };

        await commonApi.post('/verify/send-email', emailData);

        // Cập nhật password trong database
        const updateProfileData = {
          personId: checkEmailResponse.id,
          name: "",
          email: "",
          phone: "",
          addresses: [],
          password: newPassword
        };

        await clientApi.post('/profile/update-profile', updateProfileData);
        
        // Hiển thị thông báo thành công
        showAlert(
          "success",
          "Thành công",
          "Mật khẩu mới đã được tạo và gửi đến email của bạn. Vui lòng kiểm tra email và đăng nhập với mật khẩu mới."
        );
        
        // Reset form
        setFormData({ email: "" });
      } else {
        // Email không tồn tại
        showAlert(
          "error",
          "Email không tồn tại",
          "Email này chưa được đăng ký trong hệ thống. Vui lòng kiểm tra lại hoặc đăng ký tài khoản mới."
        );
      }
    } catch (error) {
      console.error('Error in forgot password process:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại sau.';
      
      // Kiểm tra nếu lỗi từ API kiểm tra email
      if (error.status === 404 || (error.data && error.data.message && error.data.message.includes('not found'))) {
        errorMessage = 'Email này chưa được đăng ký trong hệ thống. Vui lòng kiểm tra lại hoặc đăng ký tài khoản mới.';
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      }
      
      showAlert("error", "Lỗi", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      title="Khôi phục mật khẩu"
      isShow3LoginButton={false}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitButtonText="Gửi yêu cầu"
      formInput={
        <>
          <AnimatedInput
            label="Nhập email đã đăng ký"
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
          
          <div className="text-sm text-gray-600 mt-2">
            <p>Nhập email đã đăng ký và chúng tôi sẽ gửi hướng dẫn lấy lại mật khẩu cho bạn.</p>
          </div>
        </>
      }
    />
  );
}

export default Forget;
