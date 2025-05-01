import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ShoppingBagIcon,
  ArrowLeftEndOnRectangleIcon,
  ChatBubbleLeftEllipsisIcon,
  BookOpenIcon,
} from "@heroicons/react/24/solid";

import { PUBLIC_URL } from "~/path";

const navItems = [
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

function Header() {
  const location = useLocation();

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
        <ul className="flex flex-row sm:flex-col items-center justify-center gap-4">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.url;
            return (
              <li key={index} className="group relative">
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
                  className="absolute sm:left-full sm:top-1/2 sm:-translate-y-1/2 sm:ml-2 
                                sm:whitespace-nowrap sm:bg-gray-900 sm:text-white sm:text-xs sm:px-2 sm:py-1 sm:rounded 
                                sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity sm:duration-200 sm:shadow-md
                                hidden sm:inline"
                >
                  {item.label}
                </span>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
