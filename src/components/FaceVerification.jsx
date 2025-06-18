import React, { useState, useRef } from 'react';
import Swal from 'sweetalert2';
import fptEkycService from '../services/fptEkycService';

const FaceVerification = ({ onVerificationComplete, onCancel }) => {
  const [idCardImage, setIdCardImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [idCardPreview, setIdCardPreview] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: Upload ID card, 2: Take selfie, 3: Processing
  
  const idCardInputRef = useRef(null);
  const selfieInputRef = useRef(null);

  const handleIdCardUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validation = fptEkycService.validateImageFile(file);
    if (!validation.isValid) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi file ảnh',
        text: validation.message,
      });
      return;
    }

    setIdCardImage(file);
    setIdCardPreview(URL.createObjectURL(file));
  };

  const handleSelfieUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validation = fptEkycService.validateImageFile(file);
    if (!validation.isValid) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi file ảnh',
        text: validation.message,
      });
      return;
    }

    setSelfieImage(file);
    setSelfiePreview(URL.createObjectURL(file));
  };

  const handleNextStep = () => {
    if (step === 1 && idCardImage) {
      setStep(2);
    }
  };

  const handlePreviousStep = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleVerify = async () => {
    if (!idCardImage || !selfieImage) {
      Swal.fire({
        icon: 'warning',
        title: 'Thiếu ảnh',
        text: 'Vui lòng tải lên cả ảnh CMND/CCCD và ảnh selfie',
      });
      return;
    }

    try {
      setIsProcessing(true);
      setStep(3);

      // Gọi API FPT eKYC để so sánh khuôn mặt
      const comparisonResult = await fptEkycService.comparefaces(idCardImage, selfieImage);
      
      // Xác thực kết quả
      const validation = fptEkycService.validateFaceComparison(comparisonResult);

      if (validation.isValid) {
        // Xác thực thành công
        await Swal.fire({
          icon: 'success',
          title: 'Xác thực thành công!',
          html: `
            <div class="text-left">
              <p><strong>Độ tương đồng:</strong> ${validation.similarity.toFixed(2)}%</p>
              <p><strong>Mức độ tin cậy:</strong> ${validation.confidence}</p>
              <p class="mt-2">${validation.message}</p>
            </div>
          `,
          confirmButtonText: 'Tiếp tục',
          confirmButtonColor: '#16a34a',
        });

        // Gọi callback với kết quả xác thực
        onVerificationComplete && onVerificationComplete({
          success: true,
          similarity: validation.similarity,
          confidence: validation.confidence,
          isHighConfidence: validation.isHighConfidence,
          verificationData: comparisonResult
        });
      } else {
        // Xác thực thất bại
        await Swal.fire({
          icon: 'error',
          title: 'Xác thực thất bại',
          html: `
            <div class="text-left">
              <p><strong>Độ tương đồng:</strong> ${validation.similarity.toFixed(2)}%</p>
              <p><strong>Mức độ tin cậy:</strong> ${validation.confidence}</p>
              <p class="mt-2 text-red-600">${validation.message}</p>
            </div>
          `,
          confirmButtonText: 'Thử lại',
          confirmButtonColor: '#dc2626',
        });

        // Reset để thử lại
        setStep(1);
        setIdCardImage(null);
        setSelfieImage(null);
        setIdCardPreview(null);
        setSelfiePreview(null);
      }
    } catch (error) {
      console.error('Lỗi xác thực khuôn mặt:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Lỗi hệ thống',
        text: error.message || 'Có lỗi xảy ra trong quá trình xác thức. Vui lòng thử lại sau.',
      });
      
      // Reset để thử lại
      setStep(1);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStep1 = () => (
    <div className="text-center">
      <div className="mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-1 0V3a2 2 0 00-2-2H9a2 2 0 00-2 2v3m1 0h4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Bước 1: Tải ảnh CMND/CCCD</h3>
        <p className="text-gray-600 mb-4">Vui lòng tải lên ảnh mặt trước của CMND/CCCD/Hộ chiếu</p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
        {idCardPreview ? (
          <div className="relative">
            <img
              src={idCardPreview}
              alt="CMND/CCCD"
              className="max-w-full h-48 mx-auto object-contain rounded"
            />
            <button
              onClick={() => {
                setIdCardImage(null);
                setIdCardPreview(null);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="text-gray-500 mb-2">Nhấn để chọn ảnh CMND/CCCD</p>
            <p className="text-sm text-gray-400">Định dạng: JPG, PNG. Tối đa 5MB</p>
          </div>
        )}
        <input
          ref={idCardInputRef}
          type="file"
          accept="image/*"
          onChange={handleIdCardUpload}
          className="hidden"
        />
        <button
          onClick={() => idCardInputRef.current?.click()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {idCardImage ? 'Thay đổi ảnh' : 'Chọn ảnh'}
        </button>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Hủy
        </button>
        <button
          onClick={handleNextStep}
          disabled={!idCardImage}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Tiếp theo
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="text-center">
      <div className="mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Bước 2: Chụp ảnh selfie</h3>
        <p className="text-gray-600 mb-4">Vui lòng chụp ảnh selfie rõ nét để so sánh với ảnh CMND/CCCD</p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
        {selfiePreview ? (
          <div className="relative">
            <img
              src={selfiePreview}
              alt="Selfie"
              className="max-w-full h-48 mx-auto object-contain rounded"
            />
            <button
              onClick={() => {
                setSelfieImage(null);
                setSelfiePreview(null);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-gray-500 mb-2">Nhấn để chụp ảnh selfie</p>
            <p className="text-sm text-gray-400">Đảm bảo khuôn mặt rõ nét và đủ sáng</p>
          </div>
        )}
        <input
          ref={selfieInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleSelfieUpload}
          className="hidden"
        />
        <button
          onClick={() => selfieInputRef.current?.click()}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {selfieImage ? 'Chụp lại' : 'Chụp ảnh'}
        </button>
      </div>

      <div className="flex justify-between">
        <button
          onClick={handlePreviousStep}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Quay lại
        </button>
        <button
          onClick={handleVerify}
          disabled={!selfieImage}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Xác thực
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center">
      <div className="mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-yellow-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Đang xác thực...</h3>
        <p className="text-gray-600 mb-4">Vui lòng đợi trong khi hệ thống xác thực khuôn mặt của bạn</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-blue-200 rounded w-3/4"></div>
              <div className="h-4 bg-blue-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Xác thực khuôn mặt</h2>
          <div className="flex space-x-2">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-3 h-3 rounded-full ${
                  step >= stepNumber ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.168 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Lưu ý quan trọng:</p>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>Đảm bảo ảnh rõ nét và đủ sáng</li>
                <li>Khuôn mặt phải rõ ràng và không bị che khuất</li>
                <li>Thông tin cá nhân sẽ được bảo mật tuyệt đối</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
};

export default FaceVerification;