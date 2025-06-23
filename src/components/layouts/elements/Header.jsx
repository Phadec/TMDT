import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  ShoppingBagIcon,
  ArrowLeftEndOnRectangleIcon,
  ArrowRightEndOnRectangleIcon,
  ChatBubbleLeftEllipsisIcon,
  BookOpenIcon,
  UserCircleIcon,
  ShoppingCartIcon,
  ChartBarIcon
} from "@heroicons/react/24/solid";
import Swal from "sweetalert2";

import { PUBLIC_URL, PRIVATE_URL } from "~/path";
import { useAuth } from "~/hooks/useAuth";
import { useCart } from "~/contexts/CartContext";

// Các mục menu công khai (hiển thị cho tất cả người dùng)
const publicNavItems = [
  {
    icon: HomeIcon,
    url: PUBLIC_URL.HOME,
    label: "Trang chủ",
  },
  {
    icon: ShoppingBagIcon,
    url: PUBLIC_URL.PRODUCTS,
    label: "Sản phẩm",
  },
  {
    icon: BookOpenIcon,
    url: PUBLIC_URL.POLICY,
    label: "Chính sách",
  },
  {
    icon: ChatBubbleLeftEllipsisIcon,
    url: PUBLIC_URL.CONNECT,
    label: "Liên hệ",
  },
  {
    icon: ArrowLeftEndOnRectangleIcon,
    url: PUBLIC_URL.LOGIN,
    label: "Đăng nhập",
  },
];

// Các mục menu chỉ hiển thị khi đã đăng nhập
const privateNavItems = [
  {
    icon: UserCircleIcon,
    url: PRIVATE_URL.CUSTOMER,
    label: "Tài khoản",
  },
  {
    icon: ShoppingCartIcon,
    url: PRIVATE_URL.CART,
    label: "Giỏ hàng",
  },
  {
    icon: ChartBarIcon,
    url: PRIVATE_URL.DASHBOARD,
    label: "Bán hàng",
  },
];

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const { cartItemCount } = useCart();
  const isSeller = user?.isSeller || user?.seller || false;

  const handleLogout = async () => {
    await logout();
  };

  const handleDashboardClick = (e) => {
    e.preventDefault();
    
    if (!isSeller) {
      Swal.fire({
        title: "Chưa phải người bán",
        text: "Bạn cần đăng ký làm người bán để truy cập dashboard bán hàng",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Đi đến trang cá nhân",
        cancelButtonText: "Đóng",
        customClass: {
          confirmButton: "px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700",
          cancelButton: "px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
        }
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(PRIVATE_URL.CUSTOMER);
        }
      });
    } else {
      navigate(PRIVATE_URL.DASHBOARD);
    }
  };

  return (
    <header
      className={`
        fixed z-50 px-2 py-4 mb-2 rounded-full backdrop-blur-md shadow-lg
        bg-gradient-to-b from-white/30 via-white/20 to-white/10 border border-white/20
        flex justify-center w-fit 
        sm:w-14 sm:top-1/2 sm:left-0 sm:transform sm:-translate-y-1/2 sm:ml-3
        bottom-0 left-1/2 transform -translate-x-1/2 sm:translate-x-0 sm:bottom-auto
      `}
    >
      <nav>
        <ul className="flex flex-row items-center justify-center gap-4 sm:flex-col">
          {/* Hiển thị các mục menu công khai */}
          {publicNavItems.map((item, index) => {
            const isActive = location.pathname === item.url;
            
            // Ẩn menu "Đăng nhập" nếu đã đăng nhập
            if (item.url === PUBLIC_URL.LOGIN && isAuthenticated) {
              return null;
            }
            
            return (
              <li key={`public-${index}`} className="relative group">
                <Link
                  to={item.url}
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 
                    ${
                      isActive
                        ? "bg-white text-primary shadow-md scale-110"
                        : "bg-white/80 text-gray-700 hover:bg-white hover:text-blue-600"
                    }`}
                >
                  <item.icon className="w-6 h-6" />
                </Link>
                <span
                  className="absolute hidden sm:left-full sm:top-1/2 sm:-translate-y-1/2 sm:ml-2 sm:whitespace-nowrap sm:bg-gray-900 sm:text-white sm:text-xs sm:px-2 sm:py-1 sm:rounded sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity sm:duration-200 sm:shadow-md sm:inline"
                >
                  {item.label}
                </span>
              </li>
            );
          })}
          
          {/* Hiển thị các mục menu riêng tư khi đã đăng nhập */}
          {isAuthenticated && privateNavItems.map((item, index) => {
            const isActive = location.pathname === item.url;
            const isCartIcon = item.url === PRIVATE_URL.CART;
            const isDashboardIcon = item.url === PRIVATE_URL.DASHBOARD;
            
            return (
              <li key={`private-${index}`} className="relative group">
                {isDashboardIcon ? (
                  <button
                    onClick={handleDashboardClick}
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 relative
                      ${
                        isActive && isSeller
                          ? "bg-white text-primary shadow-md scale-110"
                          : !isSeller
                          ? "bg-white/60 text-gray-500 hover:bg-white/80 hover:text-gray-600"
                          : "bg-white/80 text-gray-700 hover:bg-white hover:text-blue-600"
                      }`}
                  >
                    <item.icon className={`w-6 h-6 ${isSeller ? "text-secondary-light" : "text-gray-500"}`} />
                  </button>
                ) : (
                  <Link
                    to={item.url}
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 relative
                      ${
                        isActive
                          ? "bg-white text-primary shadow-md scale-110"
                          : "bg-white/80 text-gray-700 hover:bg-white hover:text-blue-600"
                      }`}
                  >
                    <item.icon className="w-6 h-6" />
                    {/* Badge số lượng cho icon giỏ hàng */}
                    {isCartIcon && cartItemCount > 0 && (
                      <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full shadow-md -top-1 -right-1">
                        {cartItemCount > 99 ? '99+' : cartItemCount}
                      </span>
                    )}
                  </Link>
                )}
                <span
                  className="absolute hidden sm:left-full sm:top-1/2 sm:-translate-y-1/2 sm:ml-2 sm:whitespace-nowrap sm:bg-gray-900 sm:text-white sm:text-xs sm:px-2 sm:py-1 sm:rounded sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity sm:duration-200 sm:shadow-md sm:inline"
                >
                  {item.label}
                  {isDashboardIcon && !isSeller && " (Chưa đăng ký)"}
                  {isCartIcon && cartItemCount > 0 && ` (${cartItemCount})`}
                </span>
              </li>
            );
          })}
          
          {/* Nút đăng xuất - chỉ hiển thị khi đã đăng nhập */}
          {isAuthenticated && (
            <li className="relative group">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-10 h-10 text-gray-700 transition-all duration-300 rounded-full bg-white/80 hover:bg-red-100 hover:text-red-600"
              >
                <ArrowRightEndOnRectangleIcon className="w-6 h-6" />
              </button>
              <span
                className="absolute hidden sm:left-full sm:top-1/2 sm:-translate-y-1/2 sm:ml-2 sm:whitespace-nowrap sm:bg-gray-900 sm:text-white sm:text-xs sm:px-2 sm:py-1 sm:rounded sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity sm:duration-200 sm:shadow-md sm:inline"
              >
                Đăng xuất
              </span>
            </li>
          )}
      
        </ul>
      </nav>
    </header>
  );
}

export default Header;
