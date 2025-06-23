import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  CreditCardIcon, 
  MapPinIcon, 
  UserIcon, 
  PhoneIcon,
  EnvelopeIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/solid";
import Swal from 'sweetalert2';
import { apiServices } from "~/api";
import { useCart } from "~/contexts/CartContext";
import vnpayService from "~/services/vnpayService";
import { ghnService } from "~/services/ghnService";
import { getOrCreateCartId, removeOrderedItemsFromCart as removeOrderedItemsUtil } from "~/utils/cartUtils";

function Checkout() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { clearCart, removeFromCartOnly, fetchCartItemCount } = useCart();
  
  // State cho giỏ hàng
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // State cho shipping fee
  const [shippingFee, setShippingFee] = useState(0);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  
  // State cho discount
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState({ code: '', percentage: 0 });
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  
  // State cho thông tin người bán
  const [sellerInfo, setSellerInfo] = useState({
    address: '',
    districtId: '',
    wardCode: ''
  });
  
  // State cho địa chỉ GHN
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  
  // State cho thông tin địa chỉ đã parse
  const [parsedAddress, setParsedAddress] = useState({
    provinceName: '',
    districtName: '',
    wardName: '',
    provinceId: '',
    districtId: '',
    wardCode: ''
  });
  
  // State cho thông tin thanh toán
  const [checkoutData, setCheckoutData] = useState({
    // Thông tin giao hàng
    fullName: '',
    email: '',
    phone: '',
    address: '',
    provinceId: '',
    provinceName: '',
    districtId: '',
    districtName: '',
    wardCode: '',
    wardName: '',
    note: '',
    
    // Phương thức thanh toán
    paymentMethod: 'cod', // cod, bank_transfer, credit_card, vnpay
    
    // Thông tin VNPay
    bankCode: '', // Mã ngân hàng cho VNPay
    
    // Thông tin thẻ tín dụng (nếu chọn)
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  // State cho danh sách địa chỉ
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0); // Always select the first address by default

  // Lấy thông tin user từ localStorage và điền vào form
  useEffect(() => {
    const loadUserDataFromStorage = () => {
      try {
        // Lấy thông tin từ localStorage với key 'userData'
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          console.log('DEBUG userData.addresses:', userData.address);
          
          // Lưu danh sách địa chỉ
          if (Array.isArray(userData?.address) && userData.address.length > 0) {
            setUserAddresses(userData.address);
            setSelectedAddressIndex(0);
            setCheckoutData(prev => ({
              ...prev,
              address: userData.address[0]
            }));
          } else if (typeof userData?.address === 'string' && userData.address.trim()) {
            setUserAddresses([userData.address]);
            setSelectedAddressIndex(0);
            setCheckoutData(prev => ({
              ...prev,
              address: userData.address
            }));
          }
          
          // Điền thông tin từ localStorage vào form checkout
          setCheckoutData(prev => ({
            ...prev,
            fullName: userData?.fullname || userData?.name || userData?.fullName || '',
            email: userData?.email || '',
            phone: userData?.phone || '',
            provinceId: userData?.provinceId || '',
            provinceName: userData?.provinceName || '',
            districtId: userData?.districtId || '',
            districtName: userData?.districtName || '',
            wardCode: userData?.wardCode || '',
            wardName: userData?.wardName || '',
          }));
        }
      } catch (error) {
        console.error('Error loading user data from localStorage:', error);
      }
    };

    // Gọi hàm load dữ liệu khi component mount
    loadUserDataFromStorage();

    // Lắng nghe sự kiện focus để cập nhật dữ liệu khi user quay lại trang
    const handleFocus = () => {
      loadUserDataFromStorage();
    };

    window.addEventListener('focus', handleFocus);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Cập nhật thông tin user khi user từ Redux thay đổi (fallback)
  useEffect(() => {
    if (user && (!checkoutData.fullName && !checkoutData.email && !checkoutData.phone)) {
      setCheckoutData(prev => ({
        ...prev,
        fullName: user?.fullName || user?.name || prev.fullName,
        email: user?.email || prev.email,
        phone: user?.phone || prev.phone,
        address: user?.address || (Array.isArray(user?.addresses) ? user.addresses.join(', ') : user?.addresses || prev.address),
        provinceId: user?.provinceId || prev.provinceId,
        provinceName: user?.provinceName || prev.provinceName,
        districtId: user?.districtId || prev.districtId,
        districtName: user?.districtName || prev.districtName,
        wardCode: user?.wardCode || prev.wardCode,
        wardName: user?.wardName || prev.wardName,
      }));
    }
  }, [user, checkoutData.fullName, checkoutData.email, checkoutData.phone]);

  // Lấy dữ liệu sản phẩm đã chọn từ cart và thông tin người bán
  useEffect(() => {
    const fetchSelectedItems = async () => {
      try {
        // Lấy sản phẩm đã chọn từ localStorage
        const selectedItemsData = localStorage.getItem('selectedCheckoutItems');
        
        if (selectedItemsData) {
          const selectedProducts = JSON.parse(selectedItemsData);
          if (Array.isArray(selectedProducts) && selectedProducts.length > 0) {
            setCartItems(selectedProducts);
            
            // Lấy thông tin chi tiết sản phẩm đầu tiên để có thông tin người bán
            const firstProduct = selectedProducts[0];
            if (firstProduct && (firstProduct.productId || firstProduct.id)) {
              try {
                const productId = firstProduct.productId || firstProduct.id;
                
                const productDetail = await apiServices.products.getProductWithSellerInfo(productId);
                
                
                if (productDetail) {
                  console.log('Product data:', productDetail);
                  if (productDetail.customer) {
                    console.log('Customer info:', productDetail.customer);
                    // Lấy địa chỉ từ customer.addresses (luôn lấy vị trí 0 nếu là mảng)
                    let sellerAddress = '';
                    if (Array.isArray(productDetail.customer.addresses) && productDetail.customer.addresses.length > 0) {
                      sellerAddress = productDetail.customer.addresses[0];
                    } else if (typeof productDetail.customer.addresses === 'string') {
                      sellerAddress = productDetail.customer.addresses;
                    }
                    console.log('Raw seller address:', sellerAddress);
                    if (sellerAddress) {
                      // Kiểm tra xem địa chỉ có đúng format Việt Nam không (có dấu phẩy)
                      if (sellerAddress.includes(',') && sellerAddress.split(',').length >= 3) {
                        console.log('Address has Vietnamese format, parsing...');
                        
                        // Parse địa chỉ người bán để lấy district_id và ward_code
                        const parsedSellerAddress = await ghnService.parseAddressToGHNIds(sellerAddress);
                        console.log('Parsed seller address result:', parsedSellerAddress);
                        
                        if (parsedSellerAddress) {
                          setSellerInfo({
                            address: sellerAddress,
                            districtId: parsedSellerAddress.districtId,
                            wardCode: parsedSellerAddress.wardCode
                          });
                          console.log('✅ Successfully set seller info:', {
                            address: sellerAddress,
                            districtId: parsedSellerAddress.districtId,
                            wardCode: parsedSellerAddress.wardCode
                          });
                          return; // Exit early on success
                        } else {
                          console.warn('❌ Failed to parse Vietnamese address format');
                        }
                      } else {
                        console.warn('❌ Address not in Vietnamese format (missing commas or insufficient parts):', sellerAddress);
                      }
                    } else {
                      console.warn('❌ Seller address is empty or null');
                    }
                  } else {
                    console.warn('❌ No customer info in product data');
                  }
                } else {
                  console.warn('❌ No product data in response');
                }
                
                // Fallback: sử dụng địa chỉ mặc định
                console.warn('🔄 Using default seller address');
                setSellerInfo({
                  address: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM",
                  districtId: "1454", // Quận 1, TP.HCM
                  wardCode: "21211" // Phường Bến Nghé, Quận 1
                });
                
              } catch (error) {
                console.error('❌ Error fetching product detail:', error);
                // Fallback: sử dụng địa chỉ mặc định
                setSellerInfo({
                  address: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM",
                  districtId: "1454", // Quận 1, TP.HCM
                  wardCode: "21211" // Phường Bến Nghé, Quận 1
                });
              }
            }
          } else {
            // Nếu không có sản phẩm đã chọn, quay về cart
            Swal.fire({
              icon: 'warning',
              title: 'Không có sản phẩm được chọn',
              text: 'Vui lòng chọn sản phẩm từ giỏ hàng để thanh toán.',
              confirmButtonText: 'Quay lại giỏ hàng'
            }).then(() => {
              navigate('/cart');
            });
          }
        } else {
          // Nếu không có dữ liệu, quay về cart
          Swal.fire({
            icon: 'warning',
            title: 'Không có sản phẩm được chọn',
            text: 'Vui lòng chọn sản phẩm từ giỏ hàng để thanh toán.',
            confirmButtonText: 'Quay lại giỏ hàng'
          }).then(() => {
            navigate('/cart');
          });
        }
      } catch (error) {
        console.error('Error loading selected items:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Không thể tải thông tin sản phẩm đã chọn.',
          confirmButtonText: 'Quay lại giỏ hàng'
        }).then(() => {
          navigate('/cart');
        });
      } finally {
        setLoading(false);
      }
    };

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchSelectedItems();
  }, [isAuthenticated, navigate]);

  // Tính tổng tiền
  const totalAmount = cartItems.reduce((total, item) => total + Number(item.price || 0), 0);
  const discountAmount = discount.percentage > 0 ? (totalAmount * discount.percentage / 100) : 0;
  const finalAmount = totalAmount - discountAmount + shippingFee;

  // Function để parse địa chỉ
  const parseAddress = (addressInput) => {
    if (!addressInput) return null;
    let addressString = addressInput;
    if (Array.isArray(addressInput)) {
      if (selectedAddressIndex >= 0 && addressInput[selectedAddressIndex]) {
        addressString = addressInput[selectedAddressIndex];
      } else {
        addressString = addressInput[0];
      }
    }
    if (typeof addressString !== 'string') return null;
    const parts = addressString.split(',').map(part => part.trim());
    if (parts.length < 1) return null;
    // Always use the last 3 parts if available, otherwise fill with empty string
    const provinceName = parts[parts.length - 1] || '';
    const districtName = parts[parts.length - 2] || '';
    const wardName = parts[parts.length - 3] || '';
    return {
      provinceName,
      districtName,
      wardName
    };
  };

  // Function để tìm ID từ tên địa chỉ
  const findLocationIds = async (parsedAddr) => {
    try {
      // Tìm province ID từ danh sách provinces đã load
      const province = provinces.find(p => 
        p.ProvinceName.toLowerCase().includes(parsedAddr.provinceName.toLowerCase()) ||
        parsedAddr.provinceName.toLowerCase().includes(p.ProvinceName.toLowerCase())
      );
      
      if (!province) {
        console.error('Không tìm thấy tỉnh:', parsedAddr.provinceName);
        return;
      }

      // Load districts cho province này
      const currentDistricts = await ghnService.getDistricts(province.ProvinceID);
      
      // Tìm district ID
      const district = currentDistricts.find(d => 
        d.DistrictName.toLowerCase().includes(parsedAddr.districtName.toLowerCase()) ||
        parsedAddr.districtName.toLowerCase().includes(d.DistrictName.toLowerCase())
      );
      
      if (!district) {
        console.error('Không tìm thấy quận/huyện:', parsedAddr.districtName);
        return;
      }

      // Load wards cho district này
      const currentWards = await ghnService.getWards(district.DistrictID);
      
      // Tìm ward code
      const ward = currentWards.find(w => 
        w.WardName.toLowerCase().includes(parsedAddr.wardName.toLowerCase()) ||
        parsedAddr.wardName.toLowerCase().includes(w.WardName.toLowerCase())
      );
      
      if (!ward) {
        console.error('Không tìm thấy phường/xã:', parsedAddr.wardName);
        return;
      }

      // Cập nhật parsed address với IDs
      setParsedAddress({
        provinceName: province.ProvinceName,
        districtName: district.DistrictName,
        wardName: ward.WardName,
        provinceId: province.ProvinceID.toString(),
        districtId: district.DistrictID.toString(),
        wardCode: ward.WardCode
      });

      // Cập nhật checkout data
      setCheckoutData(prev => ({
        ...prev,
        provinceId: province.ProvinceID.toString(),
        provinceName: province.ProvinceName,
        districtId: district.DistrictID.toString(),
        districtName: district.DistrictName,
        wardCode: ward.WardCode,
        wardName: ward.WardName
      }));
      
    } catch (error) {
      console.error('Error finding location IDs:', error);
    }
  };

  // API GHN functions
  const fetchProvinces = async () => {
    try {
      setLoadingProvinces(true);
      const response = await ghnService.getProvinces();
      setProvinces(response);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      // Fallback: sử dụng mock data nếu GHN API không hoạt động
      setProvinces([
        { ProvinceID: 252, ProvinceName: "Cà Mau" },
        { ProvinceID: 201, ProvinceName: "Hồ Chí Minh" },
        { ProvinceID: 203, ProvinceName: "Hà Nội" }
      ]);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const fetchDistricts = async (provinceId) => {
    try {
      setLoadingDistricts(true);
      const response = await ghnService.getDistricts(provinceId);
      setDistricts(response);
    } catch (error) {
      console.error('Error fetching districts:', error);
      // Fallback: mock data cho Cà Mau
      if (provinceId == 252) {
        setDistricts([
          { DistrictID: 1782, DistrictName: "Huyện Thới Bình" },
          { DistrictID: 1783, DistrictName: "Huyện Cái Nước" }
        ]);
      }
    } finally {
      setLoadingDistricts(false);
    }
  };

  const fetchWards = async (districtId) => {
    try {
      setLoadingWards(true);
      const response = await ghnService.getWards(districtId);
      setWards(response);
    } catch (error) {
      console.error('Error fetching wards:', error);
      // Fallback: mock data cho Huyện Thới Bình
      if (districtId == 1782) {
        setWards([
          { WardCode: "610208", WardName: "Xã Tân Lộc Đông" },
          { WardCode: "610209", WardName: "Xã Thới Bình" }
        ]);
      }
    } finally {
      setLoadingWards(false);
    }
  };

  // Load provinces khi component mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  // Parse địa chỉ khi có dữ liệu address
  useEffect(() => {
    if (userAddresses.length > 0 && provinces.length > 0) {
      const addressToParse = userAddresses[selectedAddressIndex] || '';
      const parsed = parseAddress(addressToParse);
      if (parsed) {
        findLocationIds(parsed);
      }
    }
  }, [userAddresses, selectedAddressIndex, provinces.length]);

  // Không cần load districts và wards tự động nữa vì sẽ parse từ địa chỉ

  // Tính phí ship khi có đủ thông tin địa chỉ và sản phẩm
  useEffect(() => {
    const calculateShipping = async () => {
      if (
        parsedAddress.districtId && 
        parsedAddress.wardCode && 
        cartItems.length > 0 &&
        sellerInfo.districtId &&
        sellerInfo.wardCode
      ) {
        try {
          setCalculatingShipping(true);
          
          const shippingData = {
            insurance_value: totalAmount, // Giá sản phẩm không tính giảm giá
            from_district_id: parseInt(sellerInfo.districtId), // Quận của người bán (từ API)
            from_ward_code: sellerInfo.wardCode, // Phường của người bán (từ API)
            to_district_id: parseInt(parsedAddress.districtId),
            to_ward_code: parsedAddress.wardCode,
            height: cartItems[0]?.height || 50,
            length: cartItems[0]?.length || 20,
            weight: cartItems[0]?.weight || 200,
            width: cartItems[0]?.width || 20,
          };

          console.log('Calculating shipping with seller info:', {
            from_district_id: shippingData.from_district_id,
            from_ward_code: shippingData.from_ward_code,
            to_district_id: shippingData.to_district_id,
            to_ward_code: shippingData.to_ward_code,
            seller_address: sellerInfo.address
          });

          const feeResponse = await ghnService.calculateShippingFee(shippingData);
          setShippingFee(feeResponse.total || 0);
        } catch (error) {
          console.error('Error calculating shipping fee:', error);
          
          // Kiểm tra nếu là lỗi 401 (Unauthorized)
          if (error.response?.status === 401) {
            console.warn('GHN API token không hợp lệ, sử dụng phí ship mặc định');
          }
          
          // Fallback: tính phí ship theo khoảng cách (mock)
          const mockShippingFee = totalAmount > 500000 ? 0 : 35000; // Miễn phí ship cho đơn hàng trên 500k
          setShippingFee(mockShippingFee);
        } finally {
          setCalculatingShipping(false);
        }
      }
    };

    calculateShipping();
  }, [parsedAddress.districtId, parsedAddress.wardCode, cartItems, totalAmount, sellerInfo.districtId, sellerInfo.wardCode]);

  // Function để apply discount code
  const applyDiscountCode = async () => {
    if (!discountCode.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Vui lòng nhập mã giảm giá',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    try {
      setApplyingDiscount(true);
      
      // Mock discount codes - trong thực tế sẽ call API
      const mockDiscounts = {
        'NEWUSER10': { code: 'NEWUSER10', percentage: 10 },
        'SALE20': { code: 'SALE20', percentage: 20 },
        'VIP30': { code: 'VIP30', percentage: 30 }
      };

      const foundDiscount = mockDiscounts[discountCode.toUpperCase()];
      
      if (foundDiscount) {
        setDiscount(foundDiscount);
        Swal.fire({
          icon: 'success',
          title: 'Áp dụng mã giảm giá thành công!',
          text: `Bạn được giảm ${foundDiscount.percentage}%`,
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Mã giảm giá không hợp lệ',
          text: 'Vui lòng kiểm tra lại mã giảm giá',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error applying discount:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Không thể áp dụng mã giảm giá. Vui lòng thử lại.',
        timer: 2000,
        showConfirmButton: false
      });
    } finally {
      setApplyingDiscount(false);
    }
  };

  // Function để remove discount
  const removeDiscount = () => {
    setDiscount({ code: '', percentage: 0 });
    setDiscountCode('');
  };

  // Cập nhật thông tin trong localStorage (tùy chọn)
  const updateUserDataInStorage = (field, value) => {
    try {
      const userDataString = localStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        
        // Mapping field names để phù hợp với cấu trúc userData
        const fieldMapping = {
          'fullName': 'fullname',
          'phone': 'phone',
          'address': 'address'
        };
        
        const storageField = fieldMapping[field] || field;
        userData[storageField] = value;
        
        localStorage.setItem('userData', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error updating user data in localStorage:', error);
    }
  };

  // Xử lý thay đổi địa chỉ từ dropdown
  const handleAddressChange = (index) => {
    setSelectedAddressIndex(index);
    // Chọn địa chỉ có sẵn
    const selectedAddress = userAddresses[index];
    setCheckoutData(prev => ({
      ...prev,
      address: selectedAddress
    }));
  };

  // Xử lý thay đổi input
  const handleInputChange = (field, value, additionalData = {}) => {
    setCheckoutData(prev => {
      const newData = {
        ...prev,
        [field]: value,
        ...additionalData
      };
      // Tự động điền tên trên thẻ khi chọn phương thức thanh toán bằng thẻ tín dụng
      if (field === 'paymentMethod' && value === 'credit_card' && !prev.cardName && prev.fullName) {
        newData.cardName = prev.fullName.toUpperCase();
      }
      // Nếu thay đổi địa chỉ thủ công, đặt selectedAddressIndex = -1
      if (field === 'address') {
        setSelectedAddressIndex(-1);
      }
      // Cập nhật thông tin quan trọng vào localStorage (tùy chọn)
      if (["fullName", "phone", "address"].includes(field) && value && typeof value === 'string' && value.trim()) {
        updateUserDataInStorage(field, value.trim());
      }
      return newData;
    });
  };

  // Validate form
  const validateForm = () => {
    const required = ['fullName', 'email', 'phone', 'address'];
    for (let field of required) {
      if (!checkoutData[field] || (typeof checkoutData[field] === 'string' && !checkoutData[field].trim())) {
        return false;
      }
    }
    
    if (checkoutData.paymentMethod === 'credit_card') {
      const cardRequired = ['cardNumber', 'cardName', 'expiryDate', 'cvv'];
      for (let field of cardRequired) {
        if (!checkoutData[field].trim()) {
          return false;
        }
      }
    }
    
    return true;
  };

  // Hàm lấy địa chỉ được chọn (đảm bảo là string)
  const getSelectedAddress = () => {
    let selectedAddress = checkoutData.address;
    console.log('DEBUG - checkoutData.address:', checkoutData.address);
    console.log('DEBUG - selectedAddressIndex:', selectedAddressIndex);
    console.log('DEBUG - userAddresses:', userAddresses);
    
    if (Array.isArray(checkoutData.address)) {
      // Nếu là array, lấy địa chỉ được chọn hoặc địa chỉ đầu tiên
      selectedAddress = selectedAddressIndex >= 0 && selectedAddressIndex < checkoutData.address.length 
        ? checkoutData.address[selectedAddressIndex] 
        : checkoutData.address[0];
    } else if (selectedAddressIndex >= 0 && userAddresses.length > 0) {
      // Nếu có địa chỉ được chọn từ dropdown
      selectedAddress = userAddresses[selectedAddressIndex];
    }
    
    console.log('DEBUG - Final selectedAddress:', selectedAddress);
    console.log('DEBUG - selectedAddress type:', typeof selectedAddress);
    
    // Đảm bảo selectedAddress là string
    if (typeof selectedAddress !== 'string') {
      console.error('ERROR - selectedAddress is not a string:', selectedAddress);
      throw new Error('Địa chỉ giao hàng không hợp lệ');
    }
    
    if (!selectedAddress || selectedAddress.trim() === '') {
      console.error('ERROR - selectedAddress is empty');
      throw new Error('Vui lòng chọn địa chỉ giao hàng');
    }
    
    return selectedAddress;
  };

  // Hàm xóa chỉ những sản phẩm đã đặt hàng khỏi giỏ hàng
  const removeOrderedItemsFromCart = async (orderedItems) => {
    return await removeOrderedItemsUtil(orderedItems, removeFromCartOnly, fetchCartItemCount, 'đặt hàng');
  };

  // Xử lý đặt hàng
  const handleSubmitOrder = async () => {
    if (!validateForm()) {
      navigate('/account');
      return;
    }

    try {
      setSubmitting(true);
      
      // Lấy địa chỉ được chọn
      const selectedAddress = getSelectedAddress();
      
      // Tạo đơn hàng
      const orderData = {
        items: cartItems,
        shippingInfo: {
          fullName: checkoutData.fullName,
          email: checkoutData.email,
          phone: checkoutData.phone,
          address: selectedAddress, // Sử dụng địa chỉ được chọn
          provinceId: checkoutData.provinceId,
          provinceName: checkoutData.provinceName,
          districtId: checkoutData.districtId,
          districtName: checkoutData.districtName,
          wardCode: checkoutData.wardCode,
          wardName: checkoutData.wardName,
          note: checkoutData.note
        },
        paymentMethod: checkoutData.paymentMethod,
        totalAmount: finalAmount,
        shippingFee: shippingFee,
        sellerAddress: sellerInfo.address, // Thêm địa chỉ người bán
        orderId: `TMDT${Date.now()}` // Tạo mã đơn hàng unique
      };

      // Xử lý theo phương thức thanh toán
      if (checkoutData.paymentMethod === 'vnpay') {
        // Thanh toán qua VNPay
        const paymentData = vnpayService.preparePaymentData(
          orderData, 
          checkoutData.bankCode || '', // Sử dụng bankCode đã chọn
          'vn'
        );
        
        // Lưu thông tin đơn hàng vào localStorage để xử lý sau khi thanh toán
        localStorage.setItem('pendingOrder', JSON.stringify(orderData));
        
        // Chuyển hướng đến VNPay
        await vnpayService.redirectToPayment(paymentData);
        
      } else if (checkoutData.paymentMethod === 'bank_transfer') {
        // Thanh toán qua VNPay (legacy)
        const paymentData = vnpayService.preparePaymentData(orderData, 'VNBANK', 'vn');
        
        // Lưu thông tin đơn hàng vào localStorage để xử lý sau khi thanh toán
        localStorage.setItem('pendingOrder', JSON.stringify(orderData));
        
        // Chuyển hướng đến VNPay
        await vnpayService.redirectToPayment(paymentData);
        
      } else if (checkoutData.paymentMethod === 'cod') {
        // Thanh toán khi nhận hàng - Format theo yêu cầu mới
        const product = cartItems[0]; // Chỉ một sản phẩm duy nhất
        
        const codOrderData = {
          customer: {
            id: user?.id || "user_id",
            name: user?.fullName || user?.name || checkoutData.fullName,
            email: user?.email || checkoutData.email,
            phone: user?.phone || checkoutData.phone,
          },
          fullName: checkoutData.fullName,
          phone: checkoutData.phone,
          fee: finalAmount.toString(),
          discount: discount.percentage > 0 ? {
            code: discount.code,
            percentage: discount.percentage
          } : null,
          product: {
            id: product?.productId || product?.id || "88",
            name: product?.name || "quan jean",
            price: product?.price?.toString() || "200000"
          },
          address: {
            from_address: sellerInfo.address || "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM", // Địa chỉ người bán (từ API)
            to_address: selectedAddress // Địa chỉ người mua được chọn (đảm bảo là string)
          },
          payment: {
            transaction: "COD",
            method: "",
            status: "Pending",
            createdAt: new Date().toISOString()
          },
          status: "READY_TO_PICK"
        };
        
        // Gọi API tạo đơn hàng
        await apiServices.order.createOrder(codOrderData);
        
        // Xóa chỉ những sản phẩm đã đặt hàng khỏi giỏ hàng
        await removeOrderedItemsFromCart(cartItems);
        
        // Xóa dữ liệu checkout
        localStorage.removeItem('selectedCheckoutItems');
        
        // Hiển thị thông báo thành công
        Swal.fire({
          icon: 'success',
          title: 'Đặt hàng thành công!',
          html: `
            <div class="text-left">
              <p class="mb-2">Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất.</p>
              <p class="text-sm text-gray-600">Sản phẩm đã đặt hàng đã được xóa khỏi giỏ hàng của bạn.</p>
            </div>
          `,
          confirmButtonText: 'Về trang chủ'
        }).then(() => {
          navigate('/');
        });
      }
      
    } catch (error) {
      console.error('Error creating order:', error);
      Swal.fire({
        icon: 'error',
        title: 'Đặt hàng thất bại',
        text: 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Đang tải thông tin...</span>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Giỏ hàng trống</h3>
          <p className="text-gray-500 mb-4">Không có sản phẩm nào để thanh toán</p>
          <button 
            onClick={() => navigate('/products')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Quay lại giỏ hàng
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
          <p className="text-gray-600 mt-2">Vui lòng điền đầy đủ thông tin để hoàn tất đơn hàng</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form thông tin */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thông tin giao hàng */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MapPinIcon className="w-6 h-6 text-purple-600 mr-2" />
                Thông tin giao hàng
              </h2>
              
              {/* Thông báo thông tin tự động điền */}
              {(checkoutData.fullName || checkoutData.email || checkoutData.phone) && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">Bạn có thể chỉnh sửa địa chỉ nếu cần.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={checkoutData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <div className="relative">
                    <PhoneIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={checkoutData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={checkoutData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Nhập địa chỉ email"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ *
                  </label>
                  
                  {userAddresses.length > 0 && (
                    <div className="mb-3">
                      <select
                        value={selectedAddressIndex}
                        onChange={(e) => handleAddressChange(parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      >
                        {userAddresses.map((address, index) => (
                          <option key={index} value={index}>
                            {address}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={checkoutData.note}
                    onChange={(e) => handleInputChange('note', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ghi chú thêm cho đơn hàng (tùy chọn)"
                  />
                </div>
              </div>
            </div>

            {/* Mã giảm giá */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Mã giảm giá
              </h2>
              
              {discount.percentage > 0 ? (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                    <div>
                      <p className="font-medium text-green-800">Mã "{discount.code}" đã được áp dụng</p>
                      <p className="text-sm text-green-600">Giảm {discount.percentage}% tổng giá trị đơn hàng</p>
                    </div>
                  </div>
                  <button
                    onClick={removeDiscount}
                    className="text-red-500 hover:text-red-700 font-medium text-sm"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nhập mã giảm giá (VD: NEWUSER10)"
                  />
                  <button
                    onClick={applyDiscountCode}
                    disabled={applyingDiscount || !discountCode.trim()}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {applyingDiscount ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Đang áp dụng...
                      </>
                    ) : (
                      'Áp dụng'
                    )}
                  </button>
                </div>
              )}
              
              <div className="mt-3 text-sm text-gray-500">
                <p>Mã giảm giá có sẵn: NEWUSER10 (10%), SALE20 (20%), VIP30 (30%)</p>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCardIcon className="w-6 h-6 text-purple-600 mr-2" />
                Phương thức thanh toán
              </h2>
              
              <div className="space-y-4">
                {/* COD */}
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={checkoutData.paymentMethod === 'cod'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">Thanh toán khi nhận hàng (COD)</div>
                    <div className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</div>
                  </div>
                </label>
                
                {/* VNPay */}
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="vnpay"
                    checked={checkoutData.paymentMethod === 'vnpay'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-medium text-gray-900 flex items-center">
                      <span>Thanh toán qua VNPay</span>
                      <img 
                        src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png" 
                        alt="VNPay" 
                        className="h-6 ml-2"
                      />
                    </div>
                    <div className="text-sm text-gray-500">Thanh toán an toàn qua cổng VNPay</div>
                  </div>
                </label>
                
                
                
              
              </div>
              
              {/* Chọn ngân hàng VNPay */}
              {checkoutData.paymentMethod === 'vnpay' && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Chọn ngân hàng thanh toán</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {/* Tất cả ngân hàng */}
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-white bg-white">
                      <input
                        type="radio"
                        name="bankCode"
                        value=""
                        checked={!checkoutData.bankCode}
                        onChange={(e) => handleInputChange('bankCode', e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-2 text-sm font-medium text-gray-900">Tất cả ngân hàng</div>
                    </label>
                    
                    {/* Vietcombank */}
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-white bg-white">
                      <input
                        type="radio"
                        name="bankCode"
                        value="VCB"
                        checked={checkoutData.bankCode === 'VCB'}
                        onChange={(e) => handleInputChange('bankCode', e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-2 text-sm font-medium text-gray-900">Vietcombank</div>
                    </label>
                    
                    {/* Techcombank */}
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-white bg-white">
                      <input
                        type="radio"
                        name="bankCode"
                        value="TCB"
                        checked={checkoutData.bankCode === 'TCB'}
                        onChange={(e) => handleInputChange('bankCode', e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-2 text-sm font-medium text-gray-900">Techcombank</div>
                    </label>
                    
                    {/* BIDV */}
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-white bg-white">
                      <input
                        type="radio"
                        name="bankCode"
                        value="BIDV"
                        checked={checkoutData.bankCode === 'BIDV'}
                        onChange={(e) => handleInputChange('bankCode', e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-2 text-sm font-medium text-gray-900">BIDV</div>
                    </label>
                    
                    {/* VietinBank */}
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-white bg-white">
                      <input
                        type="radio"
                        name="bankCode"
                        value="CTG"
                        checked={checkoutData.bankCode === 'CTG'}
                        onChange={(e) => handleInputChange('bankCode', e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-2 text-sm font-medium text-gray-900">VietinBank</div>
                    </label>
                    
                    {/* Agribank */}
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-white bg-white">
                      <input
                        type="radio"
                        name="bankCode"
                        value="VBA"
                        checked={checkoutData.bankCode === 'VBA'}
                        onChange={(e) => handleInputChange('bankCode', e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-2 text-sm font-medium text-gray-900">Agribank</div>
                    </label>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    * Bạn sẽ được chuyển hướng đến trang thanh toán của ngân hàng đã chọn
                  </div>
                </div>
              )}
              
              {/* Form thẻ tín dụng */}
              {checkoutData.paymentMethod === 'credit_card' && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số thẻ *
                      </label>
                      <input
                        type="text"
                        value={checkoutData.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên trên thẻ *
                      </label>
                      <input
                        type="text"
                        value={checkoutData.cardName}
                        onChange={(e) => handleInputChange('cardName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="NGUYEN VAN A"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày hết hạn *
                      </label>
                      <input
                        type="text"
                        value={checkoutData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="MM/YY"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        value={checkoutData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
              
              {/* Danh sách sản phẩm */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item, index) => (
                  <div key={`${item.productId}-${index}`} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <ShoppingBagIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</h4>
                      <p className="text-sm text-purple-600 font-semibold">
                        {Number(item.price).toLocaleString('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                          minimumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Tính toán */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính ({cartItems.length} sản phẩm)</span>
                  <span className="font-medium">
                    {totalAmount.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                      minimumFractionDigits: 0,
                    })}
                  </span>
                </div>
                
                {/* Discount */}
                {discount.percentage > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Giảm giá ({discount.code})</span>
                    <span className="font-medium text-green-600">
                      -{discountAmount.toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        minimumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center">
                    Phí vận chuyển
                    {calculatingShipping && (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin ml-2"></div>
                    )}
                  </span>
                  <span className={`font-medium ${shippingFee === 0 ? 'text-green-600' : ''}`}>
                    {calculatingShipping ? 'Đang tính...' : (
                      shippingFee === 0 ? 'Miễn phí' : shippingFee.toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        minimumFractionDigits: 0,
                      })
                    )}
                  </span>
                </div>
                
                {!calculatingShipping && shippingFee > 0 && parsedAddress.districtId && parsedAddress.wardCode && (
                  <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    📦 Phí vận chuyển được tính theo GHN từ <strong>{sellerInfo.address || "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM"}</strong> đến {parsedAddress.wardName}, {parsedAddress.districtName}, {parsedAddress.provinceName}
          
                  </div>
                )}
                
                {!parsedAddress.districtId || !parsedAddress.wardCode ? (
                  <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                    ⚠️ Vui lòng nhập địa chỉ đầy đủ theo định dạng: Số nhà, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố
                  </div>
                ) : null}
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Tổng cộng</span>
                    <span className="text-lg font-bold text-purple-600">
                      {finalAmount.toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        minimumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Nút đặt hàng */}
              <button
                onClick={handleSubmitOrder}
                disabled={submitting}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Đặt hàng ngay
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-3">
                Bằng cách đặt hàng, bạn đồng ý với{' '}
                <a href="/policy" className="text-purple-600 hover:underline">
                  Điều khoản sử dụng
                </a>{' '}
                của chúng tôi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;