import { useState } from 'react';
import { cva } from 'class-variance-authority';

const formInput = cva(
    ['py-3', 'px-4', 'block', 'w-full', 'shadow-sm', 'focus:ring-indigo-500', 'focus:border-indigo-500', 'border-gray-300', 'rounded-md'],
    {
      variants: {
        border: {
          default: 'border',
          none: '',
        },
      },
      defaultVariants: {
        border: 'none',
      },
    }
);

const socialLink = cva(
    ['text-gray-500', 'hover:text-indigo-600', 'transition-colors', 'duration-300'],
    {
      variants: {
        hoverColor: {
          indigo: 'hover:text-indigo-600',
          gray: 'hover:text-gray-600',
        },
      },
      defaultVariants: {
        hoverColor: 'indigo',
      },
    }
);

const subHeading = cva(
    ['text-lg', 'font-medium', 'text-gray-900'],
    {
      variants: {
        size: {
          lg: 'text-lg',
          base: '',
        },
      },
      defaultVariants: {
        size: 'lg',
      },
    }
);

function Connect() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Giả lập gửi form thành công
    setFormStatus({
      submitted: true,
      success: true,
      message: 'Cảm ơn bạn! Chúng tôi đã nhận được thông tin và sẽ liên hệ lại trong thời gian sớm nhất.'
    });
    
    // Reset form sau khi gửi thành công
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 100);
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-indigo-600 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" 
            alt="Contact background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 mix-blend-multiply" />
        </div>
        
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">Liên Hệ Với Chúng Tôi</h1>
          <p className="mt-6 max-w-3xl text-xl">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy để lại thông tin và chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông Tin Liên Hệ</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 text-indigo-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className={subHeading()}>Địa Chỉ</h3>
                    <p className="mt-1 text-gray-600">
                      123 Đường Nguyễn Văn Linh<br />
                      Quận 7, TP. Hồ Chí Minh<br />
                      Việt Nam
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 text-indigo-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className={subHeading()}>Điện Thoại</h3>
                    <p className="mt-1 text-gray-600">
                      +84 (0) 28 1234 5678<br />
                      +84 (0) 901 234 567
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 text-indigo-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className={subHeading()}>Email</h3>
                    <p className="mt-1 text-gray-600">
                      info@example.com<br />
                      support@example.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 text-indigo-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className={subHeading()}>Giờ Làm Việc</h3>
                    <p className="mt-1 text-gray-600">
                      Thứ Hai - Thứ Sáu: 8:00 - 17:00<br />
                      Thứ Bảy: 8:00 - 12:00<br />
                      Chủ Nhật: Đóng cửa
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Kết Nối Với Chúng Tôi</h3>
                <div className="flex space-x-4">
                  <a href="#" className={socialLink()}>
                    <span className="sr-only">Facebook</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className={socialLink()}>
                    <span className="sr-only">Instagram</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className={socialLink()}>
                    <span className="sr-only">Twitter</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a href="#" className={socialLink()}>
                    <span className="sr-only">YouTube</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Gửi Tin Nhắn</h2>
              
              {formStatus.submitted && (
                <div className={`mb-6 p-4 rounded-md ${formStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {formStatus.message}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className={formInput()}
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className={formInput()}
                        placeholder="example@gmail.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Số điện thoại
                    </label>
                    <div className="mt-1">
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={formInput()}
                        placeholder="0901234567"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                      Chủ đề <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className={formInput()}
                      >
                        <option value="">-- Chọn chủ đề --</option>
                        <option value="general">Thông tin chung</option>
                        <option value="support">Hỗ trợ kỹ thuật</option>
                        <option value="billing">Thanh toán & Đơn hàng</option>
                        <option value="partnership">Hợp tác kinh doanh</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Nội dung tin nhắn <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className={formInput({ border: 'default' })}
                      placeholder="Nhập nội dung tin nhắn của bạn tại đây..."
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="privacy-policy"
                    name="privacy-policy"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="privacy-policy" className="ml-2 block text-sm text-gray-700">
                    Tôi đồng ý với <a href="#" className="text-indigo-600 hover:text-indigo-500">chính sách bảo mật</a> của website
                  </label>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
                  >
                    Gửi tin nhắn
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="relative h-96">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.0444663545397!2d106.69758571474945!3d10.732145992347592!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f9023a3a85d%3A0xdee5c99a7b02feab!2sNguyen%20Van%20Linh%2C%20Ho%20Chi%20Minh%20City%2C%20Vietnam!5e0!3m2!1sen!2s!4v1650010000000!5m2!1sen!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps"
              className="absolute inset-0"
            ></iframe>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Câu Hỏi Thường Gặp</h2>
          <p className="mt-4 text-lg text-gray-600">
            Những câu hỏi phổ biến nhất mà chúng tôi nhận được từ khách hàng
          </p>
        </div>

        <div className="mt-12 space-y-6 divide-y divide-gray-200">
          <div className="pt-6">
            <div className="text-lg">
              <h3 className="font-medium text-gray-900">Làm thế nào để theo dõi đơn hàng của tôi?</h3>
            </div>
            <div className="mt-2 text-base text-gray-600">
              <p>
                Bạn có thể theo dõi đơn hàng bằng cách đăng nhập vào tài khoản của mình và truy cập vào mục "Đơn hàng của tôi". Tại đây, bạn sẽ thấy trạng thái hiện tại của đơn hàng và thông tin vận chuyển.
              </p>
            </div>
          </div>

          <div className="pt-6">
            <div className="text-lg">
              <h3 className="font-medium text-gray-900">Chính sách đổi trả hàng như thế nào?</h3>
            </div>
            <div className="mt-2 text-base text-gray-600">
              <p>
                Chúng tôi chấp nhận đổi trả hàng trong vòng 30 ngày kể từ ngày mua hàng. Sản phẩm phải còn nguyên vẹn, chưa qua sử dụng và còn đầy đủ bao bì, nhãn mác. Vui lòng liên hệ với bộ phận chăm sóc khách hàng để được hướng dẫn quy trình đổi trả.
              </p>
            </div>
          </div>

          <div className="pt-6">
            <div className="text-lg">
              <h3 className="font-medium text-gray-900">Các phương thức thanh toán được chấp nhận?</h3>
            </div>
            <div className="mt-2 text-base text-gray-600">
              <p>
                Chúng tôi chấp nhận nhiều phương thức thanh toán khác nhau bao gồm: thẻ tín dụng/ghi nợ (Visa, MasterCard, JCB), chuyển khoản ngân hàng, ví điện tử (MoMo, ZaloPay, VNPay) và thanh toán khi nhận hàng (COD).
              </p>
            </div>
          </div>

          <div className="pt-6">
            <div className="text-lg">
              <h3 className="font-medium text-gray-900">Thời gian giao hàng là bao lâu?</h3>
            </div>
            <div className="mt-2 text-base text-gray-600">
              <p>
                Thời gian giao hàng phụ thuộc vào khu vực của bạn. Thông thường, đơn hàng sẽ được giao trong vòng 2-5 ngày làm việc đối với khu vực thành phố lớn và 5-7 ngày làm việc đối với các khu vực khác.
              </p>
            </div>
          </div>

          <div className="pt-6">
            <div className="text-lg">
              <h3 className="font-medium text-gray-900">Làm thế nào để tạo tài khoản trên website?</h3>
            </div>
            <div className="mt-2 text-base text-gray-600">
              <p>
                Bạn có thể tạo tài khoản bằng cách nhấp vào nút "Đăng ký" ở góc trên bên phải của trang web. Sau đó, điền thông tin cá nhân của bạn và tạo mật khẩu. Bạn cũng có thể đăng ký nhanh bằng tài khoản Google hoặc Facebook.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-base text-gray-600">
            Không tìm thấy câu trả lời cho câu hỏi của bạn?{' '}
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
              Liên hệ với bộ phận hỗ trợ
            </a>
          </p>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-indigo-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 py-10 px-6 sm:py-16 sm:px-12 lg:flex lg:items-center lg:p-20">
            <div className="lg:w-0 lg:flex-1">
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                Đăng ký nhận thông tin
              </h2>
              <p className="mt-4 max-w-3xl text-lg text-indigo-100">
                Đăng ký để nhận thông tin mới nhất về sản phẩm, khuyến mãi và các sự kiện đặc biệt.
              </p>
            </div>
            <div className="mt-12 sm:w-full sm:max-w-md lg:mt-0 lg:ml-8 lg:flex-1">
              <form className="sm:flex">
                <label htmlFor="email-address" className="sr-only">
                  Địa chỉ email
                </label>
                <input
                  id="email-address"
                  name="email-address"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full rounded-md border-white px-5 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700"
                  placeholder="Nhập địa chỉ email"
                />
                <button
                  type="submit"
                  className="mt-3 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-800 px-5 py-3 text-base font-medium text-white hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700 sm:mt-0 sm:ml-3 sm:w-auto sm:flex-shrink-0"
                >
                  Đăng ký
                </button>
              </form>
              <p className="mt-3 text-sm text-indigo-100">
                Chúng tôi tôn trọng quyền riêng tư của bạn. Xem{' '}
                <a href="#" className="font-medium text-white underline">
                  Chính sách bảo mật
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Connect;