import { cva } from "class-variance-authority";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ShoppingBagIcon,
  ArrowLeftEndOnRectangleIcon,
  ChatBubbleLeftEllipsisIcon,
  BookOpenIcon,
} from "@heroicons/react/24/solid";

import { PUBLIC_URL } from "~/path";

const header = cva(
  "fixed top-1/2 left-0 transform -translate-y-1/2 z-50 ml-3 px-2 py-4 rounded-full backdrop-blur-md shadow-lg",
  {
    variants: {
      size: {
        small: "w-10",
        large: "w-14",
      },
    },
    defaultVariants: {
      size: "large",
    },
  }
);

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
    url: PUBLIC_URL.CONTACT,
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
      className={`${header()} bg-gradient-to-b from-white/30 via-white/20 to-white/10 border border-white/20`}
    >
      <nav>
        <ul className="flex flex-col items-center justify-center gap-4">
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
                <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md">
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
