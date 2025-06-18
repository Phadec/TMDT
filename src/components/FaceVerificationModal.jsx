import React from 'react';
import FaceVerification from './FaceVerification';

const FaceVerificationModal = ({ isOpen, onClose, onVerificationComplete }) => {
  if (!isOpen) return null;

  const handleVerificationComplete = (result) => {
    onVerificationComplete && onVerificationComplete(result);
  };

  const handleCancel = () => {
    onClose && onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 face-verification-modal">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto face-verification-content">
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Xác thực khuôn mặt</h2>
          <button
            onClick={handleCancel}
            className="p-2 text-gray-400 rounded-full hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label="Đóng modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <FaceVerification 
            onVerificationComplete={handleVerificationComplete}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default FaceVerificationModal;