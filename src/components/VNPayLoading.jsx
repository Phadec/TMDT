import React from 'react';

const VNPayLoading = ({ isVisible, message = "Đang chuyển hướng đến VNPay..." }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center shadow-2xl">
        {/* VNPay Logo */}
        <div className="mb-4">
          <img 
            src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png" 
            alt="VNPay" 
            className="h-12 mx-auto"
          />
        </div>
        
        {/* Loading Spinner */}
        <div className="mb-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        </div>
        
        {/* Message */}
        <p className="text-gray-700 font-medium mb-2">{message}</p>
        <p className="text-sm text-gray-500">Vui lòng không đóng trình duyệt...</p>
        
        {/* Progress Bar */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
        </div>
      </div>
    </div>
  );
};

export default VNPayLoading;