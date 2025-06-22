import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import Swal from 'sweetalert2';
import vnpayService from '~/services/vnpayService';
import { apiServices } from '~/api';
import { useCart } from '~/contexts/CartContext';
import { getOrCreateCartId } from '~/utils/cartUtils';

function VNPayReturn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const { clearCart, removeFromCartOnly, fetchCartItemCount } = useCart();

  // Hàm xóa chỉ những sản phẩm đã đặt hàng khỏi giỏ hàng
  const removeOrderedItemsFromCart = async (orderedItems) => {
    try {
      const cartId = getOrCreateCartId();
      
      // Xóa từng sản phẩm đã đặt hàng khỏi giỏ hàng
      for (const item of orderedItems) {
        const productId = item.productId || item.id;
        if (productId) {
          await removeFromCartOnly(cartId, productId);
        }
      }
      
      // Refresh lại giỏ hàng sau khi xóa xong tất cả
      await fetchCartItemCount();
      
      console.log('✅ Đã xóa các sản phẩm đã đặt hàng khỏi giỏ hàng');
    } catch (error) {
      console.error('❌ Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error);
      // Không throw error để không ảnh hưởng đến flow thanh toán thành công
    }
  };

  // Hàm xử lý thanh toán thành công
  const handleSuccessfulPayment = async (paymentResult) => {
    try {
      // Lấy thông tin đơn hàng đã lưu từ localStorage
      const pendingOrderData = localStorage.getItem('pendingOrder');
      
      if (pendingOrderData) {
        const orderData = JSON.parse(pendingOrderData);
        
        // Cập nhật thông tin thanh toán vào đơn hàng
        const finalOrderData = {
          ...orderData,
          paymentStatus: 'PAID',
          paymentMethod: 'VNPAY',
          paymentInfo: {
            transactionId: paymentResult.transactionNo,
            bankCode: paymentResult.bankCode,
            payDate: paymentResult.payDate,
            amount: paymentResult.amount
          },
          status: 'CONFIRMED', // Đặt trạng thái đơn hàng là đã xác nhận
          createdAt: new Date().toISOString()
        };

        // Gọi API tạo đơn hàng
        await apiServices.order.createOrder(finalOrderData);
        
        // Xóa chỉ những sản phẩm đã đặt hàng khỏi giỏ hàng
        if (orderData.items && Array.isArray(orderData.items)) {
          await removeOrderedItemsFromCart(orderData.items);
        }
        
        // Xóa thông tin đơn hàng tạm thời
        localStorage.removeItem('pendingOrder');
        localStorage.removeItem('selectedCheckoutItems');
        
        // Hiển thị thông báo thành công
        Swal.fire({
          icon: 'success',
          title: 'Thanh toán thành công!',
          text: 'Đơn hàng của bạn đã được tạo và thanh toán thành công.',
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

  useEffect(() => {
    const handlePaymentReturn = async () => {
      try {
        // Lấy tất cả query parameters
        const queryParams = {};
        for (let [key, value] of searchParams.entries()) {
          queryParams[key] = value;
        }

        // Xử lý kết quả thanh toán
        const result = await vnpayService.handlePaymentReturn(queryParams);
        setPaymentResult(result);

        // Hiển thị thông báo dựa trên kết quả
        if (result.code === '00') {
          // Thanh toán thành công - Tạo đơn hàng
          await handleSuccessfulPayment(result);
        } else {
          // Thanh toán thất bại
          Swal.fire({
            icon: 'error',
            title: 'Thanh toán thất bại!',
            text: getErrorMessage(result.code),
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

    handlePaymentReturn();
  }, [searchParams, navigate, clearCart]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Đang xử lý kết quả thanh toán...</h3>
          <p className="text-gray-500">Vui lòng đợi trong giây lát</p>
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
                  <p><strong>Thời gian:</strong> {new Date().toLocaleString('vi-VN')}</p>
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