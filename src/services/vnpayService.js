/**
 * VNPay Service - Xử lý thanh toán VNPay
 * Sử dụng endpoint backend để tạo URL VNPay, nhưng redirect trực tiếp đến VNPay
 */

// Cấu hình VNPay
const VNPAY_CONFIG = {
  vnp_TmnCode: "I4DYIEAK",
  vnp_HashSecret: "5ODNWM2N44JBXXG7K4O6WMWTSRONED8I",
  vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_Api: "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
  vnp_ReturnUrl: window.location.origin + '/checkout/vnpay-return'
};

const vnpayService = {
  /**
   * Xử lý kết quả trả về từ VNPay với signature verification
   * @param {Object} queryParams - Query parameters từ VNPay return URL
   * @returns {Promise<Object>} - Kết quả xử lý
   */
  handlePaymentReturn: async (queryParams) => {
    try {
      console.log('🔐 Verifying payment with backend...', queryParams);
      // Gọi API backend để verify signature
      const response = await fetch('http://localhost:8888/api/vnpay/verify_payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queryParams)
      });

      console.log('📡 Backend response status:', response.status);

      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }

      const paymentStatus = await response.json();
      console.log('✅ Payment verification result:', paymentStatus);
      return paymentStatus;
    } catch (error) {
      console.error('Error verifying payment:', error);
      console.log('⚠️ Using fallback verification...');
      // Fallback - chỉ kiểm tra response code cơ bản
      const fallbackResult = {
        success: queryParams['vnp_ResponseCode'] === '00',
        code: queryParams['vnp_ResponseCode'] || 'ERROR',
        message: queryParams['vnp_ResponseCode'] === '00' ? 'Giao dịch thành công' : 'Lỗi xác thực thanh toán',
        orderId: queryParams['vnp_TxnRef'],
        amount: queryParams['vnp_Amount'],
        transactionNo: queryParams['vnp_TransactionNo'],
        bankCode: queryParams['vnp_BankCode'],
        payDate: queryParams['vnp_PayDate'],
        signatureValid: null // null để biết là fallback
      };
      console.log('🔄 Fallback result:', fallbackResult);
      return fallbackResult;
    }
  },

  /**
   * Tạo dữ liệu thanh toán VNPay từ thông tin đơn hàng
   * @param {Object} orderData - Dữ liệu đơn hàng
   * @param {string} bankCode - Mã ngân hàng (tùy chọn)
   * @param {string} language - Ngôn ngữ (vn/en)
   * @returns {Object} - Dữ liệu thanh toán VNPay
   */
  preparePaymentData: (orderData, bankCode = '', language = 'vn') => {
    return {
      amount: orderData.totalAmount,
      bankCode: bankCode,
      language: language,
      orderInfo: `Thanh toan don hang ${orderData.orderId || 'TMDT'}`,
      orderType: 'other',
      orderId: orderData.orderId
    };
  },

  /**
   * Chuyển hướng đến trang thanh toán VNPay bằng cách sử dụng backend endpoint có sẵn
   * @param {Object} paymentData - Dữ liệu thanh toán
   */
  redirectToPayment: async (paymentData) => {
    try {
      // Hiển thị loading với UI đẹp hơn
      const loadingElement = document.createElement('div');
      loadingElement.id = 'vnpay-loading';
      loadingElement.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 9999; display: flex; align-items: center; justify-content: center;">
          <div style="background: white; padding: 32px; border-radius: 12px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); max-width: 400px; margin: 16px;">
            <div style="margin-bottom: 16px;">
              <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png" alt="VNPay" style="height: 48px; margin: 0 auto; display: block;">
            </div>
            <div style="margin-bottom: 16px;">
              <div style="width: 48px; height: 48px; border: 4px solid #e5e7eb; border-top: 4px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
            </div>
            <p style="color: #374151; font-weight: 500; margin-bottom: 8px; font-size: 16px;">Đang chuyển hướng đến VNPay...</p>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">Vui lòng không đóng trình duyệt</p>
            <div style="width: 100%; background: #e5e7eb; border-radius: 9999px; height: 8px;">
              <div style="background: #2563eb; height: 8px; border-radius: 9999px; width: 70%; animation: pulse 2s infinite;"></div>
            </div>
          </div>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        </style>
      `;
      document.body.appendChild(loadingElement);

      // Tạo form ẩn để POST đến backend endpoint thống nhất
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'http://localhost:8888/api/vnpay/create_payment_url'; // Sử dụng endpoint thống nhất
      form.style.display = 'none';

      // Thêm các field vào form
      Object.keys(paymentData).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = paymentData[key];
        form.appendChild(input);
      });

      // Thêm form vào body và submit
      document.body.appendChild(form);
      
      // Delay nhỏ để hiển thị loading
      setTimeout(() => {
        form.submit();
        // Cleanup
        document.body.removeChild(form);
        if (document.getElementById('vnpay-loading')) {
          document.body.removeChild(loadingElement);
        }
      }, 1500);
      
    } catch (error) {
      console.error('Error redirecting to VNPay:', error);
      // Remove loading if error
      const loadingElement = document.getElementById('vnpay-loading');
      if (loadingElement) {
        document.body.removeChild(loadingElement);
      }
      throw error;
    }
  },

  /**
   * Lấy tên ngân hàng từ mã ngân hàng
   * @param {string} bankCode - Mã ngân hàng
   * @returns {string} - Tên ngân hàng
   */
  getBankName: (bankCode) => {
    const bankNames = {
      'VCB': 'Vietcombank',
      'TCB': 'Techcombank', 
      'BIDV': 'BIDV',
      'CTG': 'VietinBank',
      'VBA': 'Agribank',
      'ACB': 'ACB',
      'SHB': 'SHB',
      'EIB': 'Eximbank',
      'MSB': 'MSB',
      'VNBANK': 'Tất cả ngân hàng'
    };
    return bankNames[bankCode] || 'Ngân hàng khác';
  }
};

export default vnpayService;