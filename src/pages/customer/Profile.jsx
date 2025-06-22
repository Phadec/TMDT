import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";

import { inputStyles } from "./Setting.jsx";
import { clientApi } from "~/api/api.jsx";
import { useAuth } from "~/hooks";
import { updateUserData } from "~/store/slices/authCustomerSlice.jsx";
import FaceVerificationModal from "~/components/FaceVerificationModal.jsx";
import { ghnService } from "~/services/ghnService.js";
import "~/styles/swal-custom.css";

function Profile({ onProfileDataChange }) {
  const [profileData, setProfileData] = useState({
    fullname: "",
    email: "",
    phone: "",
    userType: "",
    createdAt: "",
    addresses: "",
    status: "",
    // Thêm các trường địa chỉ mới
    province: "",
    district: "",
    ward: "",
    provinceId: "",
    districtId: "",
    wardCode: "",
    streetAddress: "", // Thêm trường số nhà, đường
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSellerRegistering, setIsSellerRegistering] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [showFaceVerification, setShowFaceVerification] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [originalData, setOriginalData] = useState({}); // Lưu dữ liệu gốc để so sánh
  
  // State cho địa chỉ
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch();

  // Lấy thông tin profile khi component mount hoặc user thay đổi
  useEffect(() => {
    if (user && isAuthenticated) {
      fetchProfileData();
      loadProvinces(); // Load danh sách tỉnh/thành phố
    } else if (isAuthenticated && !user) {
      // Nếu authenticated nhưng chưa có user data, set loading
      setLoading(true);
    } else if (!isAuthenticated) {
      // Nếu chưa authenticated, set error
      setError("Bạn cần đăng nhập để xem thông tin cá nhân");
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  // Load danh sách tỉnh/thành phố
  const loadProvinces = async () => {
    try {
      setLoadingProvinces(true);
      const provincesData = await ghnService.getProvinces();
      setProvinces(provincesData || []);
    } catch (error) {
      console.error('Error loading provinces:', error);
    } finally {
      setLoadingProvinces(false);
    }
  };

  // Load danh sách quận/huyện khi chọn tỉnh
  const loadDistricts = async (provinceId) => {
    if (!provinceId) {
      setDistricts([]);
      setWards([]);
      return;
    }

    try {
      setLoadingDistricts(true);
      const districtsData = await ghnService.getDistricts(provinceId);
      setDistricts(districtsData || []);
      setWards([]); // Reset wards khi thay đổi tỉnh
    } catch (error) {
      console.error('Error loading districts:', error);
      setDistricts([]);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Load danh sách phường/xã khi chọn quận/huyện
  const loadWards = async (districtId) => {
    if (!districtId) {
      setWards([]);
      return;
    }

    try {
      setLoadingWards(true);
      const wardsData = await ghnService.getWards(districtId);
      setWards(wardsData || []);
    } catch (error) {
      console.error('Error loading wards:', error);
      setWards([]);
    } finally {
      setLoadingWards(false);
    }
  };

  // Gọi callback khi profileData thay đổi
  useEffect(() => {
    if (onProfileDataChange && profileData.fullname) {
      onProfileDataChange(profileData);
    }
  }, [profileData, onProfileDataChange]);

  // Tự động cập nhật địa chỉ chi tiết khi có dữ liệu địa chỉ
  useEffect(() => {
    if (profileData.streetAddress || profileData.ward || profileData.district || profileData.province) {
      const fullAddress = updateFullAddress(
        profileData.streetAddress,
        profileData.ward,
        profileData.district,
        profileData.province
      );
      if (fullAddress !== profileData.addresses) {
        setProfileData(prev => ({
          ...prev,
          addresses: fullAddress
        }));
      }
    }
  }, [profileData.streetAddress, profileData.ward, profileData.district, profileData.province]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      const personId = user?.id;

      if (!personId) {
        setError("Không tìm thấy ID người dùng");
        setLoading(false);
        return;
      }

      // Gọi API để lấy thông tin profile
      const response = await clientApi.post("/profile/view", {
        personId: personId,
      });

      if (response && response.data) {
        const userData = response.data;
        const isSellerValue = userData.seller || false;
        
        const profileInfo = {
          fullname: userData.fullName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          userType: isSellerValue ? "Người bán" : "Khách hàng",
          createdAt: userData.createdAt || "",
          addresses: userData.addresses || "",
          status: userData.status || "",
          // Thêm các trường địa chỉ mới
          province: userData.province || "",
          district: userData.district || "",
          ward: userData.ward || "",
          provinceId: userData.provinceId || "",
          districtId: userData.districtId || "",
          wardCode: userData.wardCode || "",
          streetAddress: userData.streetAddress || "", // Thêm trường số nhà, đường
        };
        
        setIsSeller(isSellerValue);
        setProfileData(profileInfo);
        // Lưu dữ liệu gốc để so sánh khi cập nhật
        setOriginalData({
          fullname: profileInfo.fullname,
          email: profileInfo.email,
          phone: profileInfo.phone,
          addresses: profileInfo.addresses,
          streetAddress: profileInfo.streetAddress,
        });
        setError(null);
      } else if (response) {
        // Fallback cho trường hợp response không có data wrapper
        const isSellerValue = response.seller || false;
        
        const profileInfo = {
          fullname: response.fullName || "",
          email: response.email || "",
          phone: response.phone || "",
          userType: isSellerValue ? "Người bán" : "Khách hàng",
          createdAt: response.createdAt || "",
          addresses: response.addresses || "",
          status: response.status || "",
          // Thêm các trường địa chỉ mới
          province: response.province || "",
          district: response.district || "",
          ward: response.ward || "",
          provinceId: response.provinceId || "",
          districtId: response.districtId || "",
          wardCode: response.wardCode || "",
          streetAddress: response.streetAddress || "", // Thêm trường số nhà, đường
        };
        
        setIsSeller(isSellerValue);
        setProfileData(profileInfo);
        // Lưu dữ liệu gốc để so sánh khi cập nhật
        setOriginalData({
          fullname: profileInfo.fullname,
          email: profileInfo.email,
          phone: profileInfo.phone,
          addresses: profileInfo.addresses,
          streetAddress: profileInfo.streetAddress,
        });
        setError(null);
      } else {
        setError("Không thể lấy thông tin profile");
      }
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi lấy thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      const personId = user?.id;
      if (!personId) {
        setError("Không tìm thấy ID người dùng");
        return;
      }

      // 1. Validation: Kiểm tra các trường không được bỏ trống nếu trước đó đã có dữ liệu
      const validationErrors = [];

      // Kiểm tra họ và tên
      if (!profileData.fullname || !profileData.fullname.trim()) {
        if (originalData.fullname && originalData.fullname.trim()) {
          validationErrors.push("Họ và tên không được để trống");
        } else {
          validationErrors.push("Vui lòng nhập họ và tên");
        }
      }

      // Kiểm tra email
      if (!profileData.email || !profileData.email.trim()) {
        if (originalData.email && originalData.email.trim()) {
          validationErrors.push("Email không được để trống");
        } else {
          validationErrors.push("Vui lòng nhập email");
        }
      } else {
        // Kiểm tra format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profileData.email.trim())) {
          validationErrors.push("Email không đúng định dạng");
        }
      }

      // Kiểm tra số điện thoại
      if (!profileData.phone || !profileData.phone.trim()) {
        if (originalData.phone && originalData.phone.trim()) {
          validationErrors.push("Số điện thoại không được để trống");
        } else {
          validationErrors.push("Vui lòng nhập số điện thoại");
        }
      } else {
        // Kiểm tra format số điện thoại (10-11 số)
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(profileData.phone.trim().replace(/\s/g, ''))) {
          validationErrors.push("Số điện thoại phải có 10-11 chữ số");
        }
      }

      // Kiểm tra địa chỉ - chỉ cần kiểm tra số nhà, đường vì địa chỉ chi tiết tự động tạo
      if (profileData.provinceId || profileData.districtId || profileData.wardCode) {
        if (!profileData.streetAddress || !profileData.streetAddress.trim()) {
          validationErrors.push("Vui lòng nhập số nhà, tên đường");
        }
      }

      // Hiển thị lỗi validation nếu có
      if (validationErrors.length > 0) {
        await Swal.fire({
          icon: "warning",
          title: "Thông tin không hợp lệ",
          html: `
            <div class="text-left">
              <p class="mb-2">Vui lòng kiểm tra lại:</p>
              <ul class="text-sm list-disc list-inside space-y-1">
                ${validationErrors.map(error => `<li>${error}</li>`).join('')}
              </ul>
            </div>
          `,
          confirmButtonText: "OK",
        });
        return;
      }

      // 2. Kiểm tra có thay đổi hay không
      const hasChanges = (
        (profileData.fullname || '').trim() !== (originalData.fullname || '').trim() ||
        (profileData.email || '').trim() !== (originalData.email || '').trim() ||
        (profileData.phone || '').trim() !== (originalData.phone || '').trim() ||
        (profileData.addresses || '').trim() !== (originalData.addresses || '').trim() ||
        (profileData.streetAddress || '').trim() !== (originalData.streetAddress || '').trim()
      );

      if (!hasChanges) {
        await Swal.fire({
          icon: "info",
          title: "Không có thay đổi",
          text: "Bạn chưa thay đổi thông tin nào. Vui lòng chỉnh sửa thông tin trước khi lưu.",
          confirmButtonText: "OK",
        });
        return;
      }

      // 3. Gọi API để cập nhật thông tin profile
      const response = await clientApi.post("/profile/update-profile", {
        personId: personId,
        name: (profileData.fullname || '').trim(),
        email: (profileData.email || '').trim(),
        phone: (profileData.phone || '').trim(),
        address: (profileData.addresses || '').trim(),
        streetAddress: (profileData.streetAddress || '').trim(),
        province: profileData.province,
        district: profileData.district,
        ward: profileData.ward,
        provinceId: profileData.provinceId,
        districtId: profileData.districtId,
        wardCode: profileData.wardCode
      });

      console.log("Update profile response:", response);

      // Kiểm tra response - nếu có response thì coi là thành công (vì DB đã update)
      if (response !== null && response !== undefined) {
        // Hiển thị thông báo thành công
        await Swal.fire({
          icon: "success",
          title: "Cập nhật thành công!",
          html: `
            <div class="text-left">
              <p class="mb-3">${response.message || "Thông tin cá nhân đã được cập nhật thành công."}</p>
              <div class="bg-green-50 border border-green-200 rounded p-3">
                <p class="text-sm"><strong>Thông tin đã cập nhật:</strong></p>
                <ul class="text-sm mt-1 space-y-1">
                  <li>• Họ và tên: ${profileData.fullname}</li>
                  <li>• Email: ${profileData.email}</li>
                  <li>• Số điện thoại: ${profileData.phone}</li>
                  <li>• Địa chỉ: ${profileData.addresses || 'Chưa cập nhật'}</li>
                </ul>
              </div>
            </div>
          `,
          confirmButtonText: "OK",
          confirmButtonColor: "#16a34a",
          customClass: {
            popup: 'swal-wide'
          }
        });
        
        // Cập nhật userData trong localStorage và Redux store
        const updatedUserData = {
          fullname: (profileData.fullname || '').trim(),
          phone: (profileData.phone || '').trim(),
          address: (profileData.addresses || '').trim(),
          name: (profileData.fullname || '').trim(), // Đồng bộ name với fullname
        };
        
        dispatch(updateUserData(updatedUserData));
        
        // Tải lại thông tin profile để đảm bảo dữ liệu mới nhất
        await fetchProfileData();
      } else {
        // Chỉ hiển thị lỗi khi thực sự không có response
        console.log("No response received");
        setError("Không nhận được phản hồi từ server");
        
        await Swal.fire({
          icon: "error",
          title: "Cập nhật thất bại",
          text: "Không nhận được phản hồi từ server. Vui lòng thử lại sau.",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật profile:", err);
      setError(err.message || "Có lỗi xảy ra khi cập nhật thông tin");
      
      // Hiển thị thông báo lỗi
      await Swal.fire({
        icon: "error",
        title: "Cập nhật thất bại",
        text: err.message || "Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại sau.",
        confirmButtonText: "OK",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegisterAsSeller = async () => {
    // Hiển thị dialog xác nhận
    const result = await Swal.fire({
      title: "Đăng ký làm người bán?",
      html: `
        <div class="text-left">
          <p class="mb-3">Để đăng ký làm người bán, bạn cần thực hiện xác thực khuôn mặt để đảm bảo tính xác thực của tài khoản.</p>
          <div class="bg-blue-50 border border-blue-200 rounded p-3">
            <p class="text-sm"><strong>Quy trình xác thực gồm:</strong></p>
            <ul class="text-sm mt-2 list-disc list-inside space-y-1">
              <li>Tải lên ảnh CMND/CCCD/Hộ chiếu</li>
              <li>Chụp ảnh selfie hiện tại</li>
              <li>Hệ thống tự động so sánh và xác thực</li>
            </ul>
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d33",
      confirmButtonText: "Bắt đầu xác thực",
      cancelButtonText: "Hủy",
      customClass: {
        popup: 'swal-wide'
      }
    });

    if (!result.isConfirmed) {
      return;
    }

    // Hiển thị component xác thực khuôn mặt
    setShowFaceVerification(true);
  };

  const handleFaceVerificationComplete = async (verificationResult) => {
    setShowFaceVerification(false);
    
    if (!verificationResult.success) {
      return; // User already got error message from FaceVerification component
    }

    try {
      setIsSellerRegistering(true);
      setError(null);

      const personId = user?.id;
      if (!personId) {
        setError("Không tìm thấy ID người dùng");
        return;
      }

      // Gọi API để đăng ký làm người bán với dữ liệu xác thực
      const response = await clientApi.post("/profile/register-seller", {
        personId: personId,
        faceVerification: {
          similarity: verificationResult.similarity,
          confidence: verificationResult.confidence,
          isHighConfidence: verificationResult.isHighConfidence,
          verifiedAt: new Date().toISOString(),
          verificationData: verificationResult.verificationData
        }
      });

      if (response) {
        // Cập nhật state local
        setIsSeller(true);
        setProfileData((prev) => ({
          ...prev,
          userType: "Người bán",
        }));

        // Hiển thị thông báo thành công với thông tin xác thực
        await Swal.fire({
          icon: "success",
          title: "Đăng ký thành công!",
          html: `
            <div class="text-left">
              <p class="mb-3">🎉 Chúc mừng! Bạn đã trở thành người bán được xác thực.</p>
              <div class="bg-green-50 border border-green-200 rounded p-3 mb-3">
                <p class="text-sm"><strong>Thông tin xác thực:</strong></p>
                <ul class="text-sm mt-1 space-y-1">
                  <li>• Độ tương đồng: ${verificationResult.similarity.toFixed(2)}%</li>
                  <li>• Mức độ tin cậy: ${verificationResult.confidence}</li>
                  <li>• Trạng thái: Đã xác thực thành công</li>
                </ul>
              </div>
              <p class="text-sm text-gray-600">Bạn có thể bắt đầu đăng bán sản phẩm ngay bây giờ!</p>
            </div>
          `,
          confirmButtonText: "Tuyệt vời!",
          confirmButtonColor: "#16a34a",
          customClass: {
            popup: 'swal-wide'
          }
        });
      } else {
        setError("Không thể đăng ký làm người bán");
      }
    } catch (err) {
      console.error("Lỗi khi đăng ký làm người bán:", err);
      setError(err.message || "Có lỗi xảy ra khi đăng ký làm người bán");
      
      // Hiển thị thông báo lỗi
      await Swal.fire({
        icon: "error",
        title: "Đăng ký thất bại",
        text: err.message || "Có lỗi xảy ra khi đăng ký làm người bán. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSellerRegistering(false);
    }
  };

  const handleFaceVerificationCancel = () => {
    setShowFaceVerification(false);
  };

  // Hàm tự động cập nhật địa chỉ chi tiết
  const updateFullAddress = (streetAddress, ward, district, province) => {
    const addressParts = [streetAddress, ward, district, province].filter(Boolean);
    return addressParts.join(', ');
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Xử lý thay đổi địa chỉ
      if (field === 'provinceId') {
        const selectedProvince = provinces.find(p => p.ProvinceID === parseInt(value));
        newData.provinceId = value;
        newData.province = selectedProvince ? selectedProvince.ProvinceName : '';
        newData.districtId = ''; // Reset district
        newData.district = '';
        newData.wardCode = ''; // Reset ward
        newData.ward = '';
        // Cập nhật địa chỉ chi tiết
        newData.addresses = updateFullAddress(newData.streetAddress, '', '', newData.province);
        loadDistricts(value);
      } else if (field === 'districtId') {
        const selectedDistrict = districts.find(d => d.DistrictID === parseInt(value));
        newData.districtId = value;
        newData.district = selectedDistrict ? selectedDistrict.DistrictName : '';
        newData.wardCode = ''; // Reset ward
        newData.ward = '';
        // Cập nhật địa chỉ chi tiết
        newData.addresses = updateFullAddress(newData.streetAddress, '', newData.district, newData.province);
        loadWards(value);
      } else if (field === 'wardCode') {
        const selectedWard = wards.find(w => w.WardCode === value);
        newData.wardCode = value;
        newData.ward = selectedWard ? selectedWard.WardName : '';
        // Cập nhật địa chỉ chi tiết
        newData.addresses = updateFullAddress(newData.streetAddress, newData.ward, newData.district, newData.province);
      } else if (field === 'streetAddress') {
        // Cập nhật địa chỉ chi tiết khi thay đổi số nhà, đường
        newData.addresses = updateFullAddress(value, newData.ward, newData.district, newData.province);
      }

      return newData;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Đang tải thông tin...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>Lỗi: {error}</p>
        <button
          onClick={fetchProfileData}
          className="px-4 py-2 mt-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }



  return (
    <div>
      <h2 className="section-title">Thông tin cá nhân</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Họ và tên</label>
            <input
              type="text"
              className={inputStyles()}
              value={profileData.fullname}
              onChange={(e) => handleInputChange("fullname", e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Chức nghiệp</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                className={inputStyles()}
                value={profileData.userType}
                readOnly
                disabled
              />
              {/* Badge cho người bán */}
              {isSeller && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Đã xác minh
                </span>
              )}
            </div>
          </div>
        </div>
        <div>
          <label className="form-label">Email</label>
          <input
            type="email"
            className={inputStyles()}
            value={profileData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">Số điện thoại</label>
          <input
            type="tel"
            className={inputStyles()}
            value={profileData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Ngày tạo tài khoản</label>
            <input
              type="text"
              className={inputStyles()}
              value={
                profileData.createdAt
                  ? new Date(profileData.createdAt).toLocaleDateString("vi-VN")
                  : ""
              }
              readOnly
              disabled
            />
          </div>
          <div>
            <label className="form-label">Trạng thái tài khoản</label>
            <div className="flex items-center gap-2">
              {profileData.status === 'ACTIVE' && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Đang hoạt động
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Địa chỉ chi tiết */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Địa chỉ</h3>
          
          {/* Tỉnh/Thành phố */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Tỉnh/Thành phố *</label>
              <select
                className={inputStyles()}
                value={profileData.provinceId}
                onChange={(e) => handleInputChange("provinceId", e.target.value)}
                disabled={loadingProvinces}
              >
                <option value="">
                  {loadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"}
                </option>
                {provinces.map((province) => (
                  <option key={province.ProvinceID} value={province.ProvinceID}>
                    {province.ProvinceName}
                  </option>
                ))}
              </select>
            </div>

            {/* Quận/Huyện */}
            <div>
              <label className="form-label">Quận/Huyện *</label>
              <select
                className={inputStyles()}
                value={profileData.districtId}
                onChange={(e) => handleInputChange("districtId", e.target.value)}
                disabled={loadingDistricts || !profileData.provinceId}
              >
                <option value="">
                  {loadingDistricts ? "Đang tải..." : "Chọn quận/huyện"}
                </option>
                {districts.map((district) => (
                  <option key={district.DistrictID} value={district.DistrictID}>
                    {district.DistrictName}
                  </option>
                ))}
              </select>
            </div>

            {/* Phường/Xã */}
            <div>
              <label className="form-label">Phường/Xã *</label>
              <select
                className={inputStyles()}
                value={profileData.wardCode}
                onChange={(e) => handleInputChange("wardCode", e.target.value)}
                disabled={loadingWards || !profileData.districtId}
              >
                <option value="">
                  {loadingWards ? "Đang tải..." : "Chọn phường/xã"}
                </option>
                {wards.map((ward) => (
                  <option key={ward.WardCode} value={ward.WardCode}>
                    {ward.WardName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Số nhà, đường */}
          <div>
            <label className="form-label">Số nhà, tên đường *</label>
            <input
              type="text"
              className={inputStyles()}
              placeholder="Ví dụ: 123 Nguyễn Văn A, Khu phố 1..."
              value={profileData.streetAddress}
              onChange={(e) => handleInputChange("streetAddress", e.target.value)}
            />
          </div>

          {/* Địa chỉ chi tiết - Tự động tạo và disable */}
          <div>
            <label className="form-label">Địa chỉ chi tiết</label>
            <textarea
              className={`${inputStyles()} bg-gray-100 cursor-not-allowed`}
              value={profileData.addresses}
              readOnly
              disabled
              rows={3}
            />
          </div>

          {/* Hiển thị địa chỉ đầy đủ */}
          {profileData.addresses && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="form-label text-blue-800">Địa chỉ hoàn chỉnh:</label>
              <p className="text-sm text-blue-700 mt-1 font-medium">
                {profileData.addresses}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          {/* Nút đăng ký làm người bán nếu chưa phải seller */}
          {!isSeller && (
            <button
              onClick={handleRegisterAsSeller}
              disabled={isSellerRegistering || showFaceVerification}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSellerRegistering ? (
                <>
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : showFaceVerification ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                  Đang xác thực...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.414-4.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Đăng ký làm người bán (Xác thực AI)
                </>
              )}
            </button>
          )}
          
          {/* Placeholder div khi là seller để giữ layout */}
          {isSeller && <div></div>}
          
          <button
            onClick={handleSaveChanges}
            disabled={isSaving || loading}
            className="inline-flex items-center px-4 py-2 font-bold text-white transition-colors duration-200 bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang lưu...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
        
        {/* Thông tin hướng dẫn cho người chưa phải seller */}
        {!isSeller && (
          <div className="mt-4 space-y-3">
            <div className="p-4 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-green-50">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.414-4.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <div>
                  <h4 className="mb-2 font-semibold text-gray-900">Đăng ký làm người bán với công nghệ AI</h4>
                  <p className="mb-3 text-sm text-gray-700">
                    Trở thành người bán được xác thực để đăng bán sản phẩm trên hệ thống với quy trình xác thực tự động bằng AI.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Xác thực danh tính bằng CMND/CCCD/Hộ chiếu
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      So sánh khuôn mặt tự động với công nghệ FPT AI
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Bảo mật thông tin cá nhân tuyệt đối
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Quy trình hoàn tất trong vài phút
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal xác thực khuôn mặt */}
      <FaceVerificationModal
        isOpen={showFaceVerification}
        onClose={handleFaceVerificationCancel}
        onVerificationComplete={handleFaceVerificationComplete}
      />
    </div>
  );
}

export default Profile;
