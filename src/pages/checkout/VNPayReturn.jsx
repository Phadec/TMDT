import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import Swal from 'sweetalert2';
import vnpayService from '~/services/vnpayService';
import { apiServices } from '~/api';
import { useCart } from '~/contexts/CartContext';
import { getOrCreateCartId, removeOrderedItemsFromCart as removeOrderedItemsUtil } from '~/utils/cartUtils';

function VNPayReturn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const [orderProcessed, setOrderProcessed] = useState(false); // Flag để tránh gọi API nhiều lần
  const processingRef = useRef(false); // Ref để tránh gọi API nhiều lần trong React StrictMode
  const { clearCart, removeFromCartOnly, fetchCartItemCount } = useCart();

  // Hàm xóa chỉ những sản phẩm đã đặt hàng khỏi giỏ hàng
  const removeOrderedItemsFromCart = async (orderedItems) => {
    return await removeOrderedItemsUtil(orderedItems, removeFromCartOnly, fetchCartItemCount, 'thanh toán');
  };

  // Hàm xử lý thanh toán thành công
  const handleSuccessfulPayment = async (paymentResult) => {
    // Kiểm tra xem đã xử lý đơn hàng chưa (dùng cả state và ref)
    if (orderProcessed || processingRef.current) {
      console.log('⚠️ Order already processed, skipping...', { orderProcessed, processingRef: processingRef.current });
      return;
    }
    
    try {
      console.log('🚀 Starting handleSuccessfulPayment...');
      setOrderProcessed(true); // Đánh dấu đã bắt đầu xử lý
      processingRef.current = true; // Đánh dấu bằng ref
      
      // Lấy thông tin đơn hàng đã lưu từ localStorage
      const pendingOrderData = localStorage.getItem('pendingOrder');
      console.log('📦 Pending Order Data:', pendingOrderData);
      
      // Kiểm tra xem giao dịch này đã được xử lý chưa bằng transaction ID
      const transactionId = paymentResult.transactionNo || paymentResult.vnp_TransactionNo;
      const processedTransactions = JSON.parse(localStorage.getItem('processedTransactions') || '[]');
      
      if (transactionId && processedTransactions.includes(transactionId)) {
        console.log('⚠️ Transaction already processed:', transactionId);
        return;
      }
      
      if (pendingOrderData) {
        // Đánh dấu transaction đã được xử lý
        if (transactionId) {
          processedTransactions.push(transactionId);
          localStorage.setItem('processedTransactions', JSON.stringify(processedTransactions));
        }
        const orderData = JSON.parse(pendingOrderData);
        
        // Lấy thông tin user từ localStorage
        const userDataString = localStorage.getItem('userData');
        const userData = userDataString ? JSON.parse(userDataString) : {};
        
        // Lấy sản phẩm đầu tiên (chỉ hỗ trợ 1 sản phẩm)
        const product = orderData.items && orderData.items.length > 0 ? orderData.items[0] : null;
        
        if (!product) {
          throw new Error('Không tìm thấy thông tin sản phẩm trong đơn hàng');
        }
        
        // Chuyển đổi format dữ liệu theo yêu cầu API mới
        const finalOrderData = {
          customer: {
            _id: userData?.id || userData?._id || "user_id",
            id: userData?.id || userData?._id || "user_id", // Thêm trường id
            email: orderData.shippingInfo?.email || userData?.email || "",
            phone: orderData.shippingInfo?.phone || userData?.phone || "",
            isSeller: userData?.isSeller || false,
            fullName: orderData.shippingInfo?.fullName || userData?.fullName || userData?.name || ""
          },
          product: {
            id: product.productId || product.id || "",
            name: product.name || "",
            price: product.price?.toString() || "0"
          },
          fee: orderData.totalAmount || 0,
          address: {
            from_address: orderData.sellerAddress || "669 Nguyễn Thị Minh Khai, Xã Ia Sao, Huyện Ia Grai, Gia Lai", // Địa chỉ người bán
            to_address: Array.isArray(orderData.shippingInfo?.address) 
              ? orderData.shippingInfo.address[0] 
              : orderData.shippingInfo?.address || ""
          },
          payment: {
            transaction: "online", // Thay đổi từ "VNPAY" thành "online"
            method: "vnpay", // Thay đổi từ bankCode thành "vnpay"
            status: "PAID",
            transactionId: paymentResult.transactionNo || "",
            payDate: paymentResult.payDate || "",
            amount: paymentResult.amount || orderData.totalAmount
          },
          status: "READY_TO_PICK",
          createdAt: new Date().toISOString()
        };

        // Thêm delay nhỏ để tránh race condition
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Gọi API tạo đơn hàng
        console.log('📝 Creating order with data:', finalOrderData);
        const orderResponse = await apiServices.order.createOrder(finalOrderData);
        console.log('✅ Order created successfully:', orderResponse);
        
        // Xóa chỉ những sản phẩm đã đặt hàng khỏi giỏ hàng
        if (orderData.items && Array.isArray(orderData.items)) {
          console.log('🗑️ Removing items from cart:', orderData.items);
          await removeOrderedItemsFromCart(orderData.items);
          console.log('✅ Items removed from cart successfully');
        }
        
        // Xóa thông tin đơn hàng tạm thời
        localStorage.removeItem('pendingOrder');
        localStorage.removeItem('selectedCheckoutItems');
        localStorage.removeItem('orderProcessedFlag');
        
        // Hiển thị thông báo thành công
        Swal.fire({
          icon: 'success',
          title: 'Thanh toán thành công!',
          html: `
            <div class="text-left">
              <p class="mb-2">Đơn hàng của bạn đã được tạo và thanh toán thành công.</p>
              <p class="text-sm text-gray-600">Sản phẩm đã thanh toán đã được xóa khỏi giỏ hàng của bạn.</p>
            </div>
          `,
          confirmButtonText: 'Về trang chủ'
        }).then(() => {
          navigate('/');
        });
      } else {
        // Nếu không có thông tin đơn hàng, chỉ hiển thị thông báo thanh toán thành công
        Swal.fire({
          icon: 'success',
          title: 'Thanh toán thành công!',
          text: 'Giao dịch của bạn đã được xử lý thành công.',
          confirmButtonText: 'Về trang chủ'
        }).then(() => {
          navigate('/');
        });
      }
    } catch (error) {
      console.error('Error creating order after successful payment:', error);
      setOrderProcessed(false); // Reset flag nếu có lỗi
      processingRef.current = false; // Reset ref flag
      
      // Xóa transaction ID khỏi danh sách đã xử lý nếu có lỗi
      const transactionId = paymentResult.transactionNo || paymentResult.vnp_TransactionNo;
      if (transactionId) {
        const processedTransactions = JSON.parse(localStorage.getItem('processedTransactions') || '[]');
        const updatedTransactions = processedTransactions.filter(id => id !== transactionId);
        localStorage.setItem('processedTransactions', JSON.stringify(updatedTransactions));
      }
      
      // Hiển thị thông báo lỗi nhưng vẫn thông báo thanh toán thành công
      Swal.fire({
        icon: 'warning',
        title: 'Thanh toán thành công!',
        text: 'Thanh toán đã thành công nhưng có lỗi khi tạo đơn hàng. Vui lòng liên hệ hỗ trợ.',
        confirmButtonText: 'Về trang chủ'
      }).then(() => {
        navigate('/');
      });
    }
  };

  // Hàm lấy thông báo lỗi dựa trên mã lỗi VNPay
  const getErrorMessage = (code) => {
    const errorMessages = {
      '01': 'Giao dịch chưa hoàn tất',
      '02': 'Giao dịch bị lỗi',
      '04': 'Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)',
      '05': 'VNPAY đang xử lý giao dịch này (GD hoàn tiền)',
      '06': 'VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)',
      '07': 'Giao dịch bị nghi ngờ gian lận',
      '09': 'GD Hoàn trả bị từ chối',
      '10': 'Đã giao hàng',
      '11': 'Đã hủy (GD bị hủy)',
      '12': 'Đã hoàn trả một phần',
      '13': 'Đã hoàn trả toàn bộ',
      '20': 'Đã thanh toán',
      '21': 'Đã hoàn trả (GD bị hủy)',
      '22': 'Đã giao hàng',
      '24': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
      '97': 'Chữ ký không hợp lệ',
      '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
    };

    return errorMessages[code] || 'Giao dịch không thành công. Vui lòng thử lại.';
  };

  // Hàm xử lý kết quả thanh toán return
  const handlePaymentReturn = async (testParams = null) => {
    try {
      // Lấy tất cả query parameters
      const queryParams = testParams || {};
      if (!testParams) {
        for (let [key, value] of searchParams.entries()) {
          queryParams[key] = value;
        }
      }

      console.log('🔍 Processing payment return...', queryParams);

      // Xử lý kết quả thanh toán
      const result = await vnpayService.handlePaymentReturn(queryParams);
      console.log('🔍 VNPay Payment Result:', result);
      console.log('🔍 Query Params:', queryParams);
      setPaymentResult(result);

      // Hiển thị thông báo dựa trên kết quả
      if (result.code === '00') {
        console.log('✅ Payment successful, processing order...');
        console.log('🔍 Order processed flag:', orderProcessed);
        // Thanh toán thành công - Tạo đơn hàng (bỏ kiểm tra signatureValid tạm thời để debug)
        await handleSuccessfulPayment(result);
      } else {
        // Thanh toán thất bại hoặc signature không hợp lệ
        const errorMessage = result.signatureValid === false 
          ? 'Chữ ký không hợp lệ. Giao dịch có thể đã bị can thiệp.'
          : getErrorMessage(result.code);
          
        Swal.fire({
          icon: 'error',
          title: 'Thanh toán thất bại!',
          text: errorMessage,
          confirmButtonText: 'Thử lại'
        }).then(() => {
          navigate('/checkout');
        });
      }
    } catch (error) {
      console.error('Error handling payment return:', error);
      setPaymentResult({ code: 'ERROR', message: 'Có lỗi xảy ra khi xử lý kết quả thanh toán' });
      
      Swal.fire({
        icon: 'error',
        title: 'Lỗi hệ thống!',
        text: 'Có lỗi xảy ra khi xử lý kết quả thanh toán. Vui lòng liên hệ hỗ trợ.',
        confirmButtonText: 'Về trang chủ'
      }).then(() => {
        navigate('/');
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handlePaymentReturn();
    
    // Cleanup function
    return () => {
      console.log('🧹 VNPayReturn component unmounting, cleaning up...');
      processingRef.current = false;
    };
  }, []); // Chỉ chạy một lần khi component mount

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Đang xử lý kết quả thanh toán...</h3>
          <p className="text-gray-500">Vui lòng đợi trong giây lát</p>
          
          {/* Test button for debugging */}
          <div className="mt-4">
            <button 
              onClick={() => {
                console.log('🧪 Testing payment success flow...');
                
                // Reset các flags trước khi test
                setOrderProcessed(false);
                processingRef.current = false;
                localStorage.removeItem('processedTransactions');
                
                // Tạo test data cho pendingOrder (format cũ để test chuyển đổi)
                const testOrderData = {
                  orderId: 'TEST_ORDER_123',
                  totalAmount: 100000,
                  items: [
                    {
                      productId: 'test_product_1',
                      name: 'Test Product',
                      quantity: 1,
                      price: 100000
                    }
                  ],
                  shippingInfo: {
                    fullName: 'Test Customer',
                    email: 'test@example.com',
                    phone: '0123456789',
                    address: 'Test Address, Test Ward, Test District, Test Province'
                  },
                  sellerAddress: '669 Nguyễn Thị Minh Khai, Xã Ia Sao, Huyện Ia Grai, Gia Lai'
                };
                
                localStorage.setItem('pendingOrder', JSON.stringify(testOrderData));
                console.log('💾 Test order data saved to localStorage');
                
                // Tạo test userData theo format thực tế
                const testUserData = {
                  token: "test_token",
                  userType: "CUSTOMER",
                  id: "bd2176bd-2f11-46b3-80c3-e3ffe945a136",
                  email: "c@gmail.com",
                  fullname: "asdas",
                  phone: "12321312321",
                  name: "asdas",
                  roleName: null,
                  permission: null,
                  createdAt: "2025-06-23T09:59:39.500922",
                  address: ["asasq, Xã Rạng Đông, Huyện Tuần Giáo, Điện Biên","ádasd, Phường Hoài Tân, Thị xã Hoài Nhơn, Bình Định"],
                  isSeller: false
                };
                localStorage.setItem('userData', JSON.stringify(testUserData));
                console.log('💾 Test user data saved to localStorage');
                
                const testParams = {
                  vnp_ResponseCode: '00',
                  vnp_TxnRef: 'TEST_ORDER_123',
                  vnp_Amount: '100000',
                  vnp_TransactionNo: 'TEST_TXN_456',
                  vnp_BankCode: 'VCB',
                  vnp_PayDate: '20241201120000'
                };
                handlePaymentReturn(testParams);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              🧪 Test Success Flow
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          {paymentResult?.code === '00' ? (
            <>
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h1>
              <p className="text-gray-600 mb-6">
                Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đã được xử lý thành công.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="text-sm text-green-800">
                  <p><strong>Mã giao dịch:</strong> {searchParams.get('vnp_TxnRef')}</p>
                  <p><strong>Số tiền:</strong> {Number(searchParams.get('vnp_Amount')) / 100} VND</p>
                  <p><strong>Ngân hàng:</strong> {vnpayService.getBankName(searchParams.get('vnp_BankCode'))}</p>
                  <p><strong>Mã giao dịch ngân hàng:</strong> {searchParams.get('vnp_TransactionNo')}</p>
                  <p><strong>Thời gian:</strong> {searchParams.get('vnp_PayDate') ? 
                    new Date(
                      searchParams.get('vnp_PayDate').substring(0,4) + '-' +
                      searchParams.get('vnp_PayDate').substring(4,6) + '-' +
                      searchParams.get('vnp_PayDate').substring(6,8) + ' ' +
                      searchParams.get('vnp_PayDate').substring(8,10) + ':' +
                      searchParams.get('vnp_PayDate').substring(10,12) + ':' +
                      searchParams.get('vnp_PayDate').substring(12,14)
                    ).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN')
                  }</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thất bại!</h1>
              <p className="text-gray-600 mb-6">
                {getErrorMessage(paymentResult?.code || searchParams.get('vnp_ResponseCode'))}
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="text-sm text-red-800">
                  <p><strong>Mã lỗi:</strong> {paymentResult?.code || searchParams.get('vnp_ResponseCode')}</p>
                  <p><strong>Mã giao dịch:</strong> {searchParams.get('vnp_TxnRef')}</p>
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
            >
              Về trang chủ
            </button>
            
            {paymentResult?.code !== '00' && (
              <button
                onClick={() => navigate('/checkout')}
                className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Thử lại
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VNPayReturn;