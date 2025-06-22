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
   * Xử lý kết quả trả về từ VNPay (client-side processing)
   * @param {Object} queryParams - Query parameters từ VNPay return URL
   * @returns {Object} - Kết quả xử lý
   */
  handlePaymentReturn: (queryParams) => {
    // Đơn giản hóa - chỉ kiểm tra response code
    const paymentStatus = {
      success: false,
      code: queryParams['vnp_ResponseCode'],
      message: 'Giao dịch thất bại',
      orderId: queryParams['vnp_TxnRef'],
      amount: queryParams['vnp_Amount'],
      transactionNo: queryParams['vnp_TransactionNo'],
      bankCode: queryParams['vnp_BankCode'],
      payDate: queryParams['vnp_PayDate']
    };

    if (queryParams['vnp_ResponseCode'] === '00') {
      paymentStatus.success = true;
      paymentStatus.message = 'Giao dịch thành công';
    }

    return paymentStatus;
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
  redirectToPayment: (paymentData) => {
    try {
      // Tạo form ẩn để POST đến backend endpoint có sẵn
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'http://localhost:8888/order/create_payment_url'; // Sử dụng endpoint có sẵn
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
      form.submit();
      
      // Cleanup
      document.body.removeChild(form);
    } catch (error) {
      console.error('Error redirecting to VNPay:', error);
      throw error;
    }
  }
};

export default vnpayService;