import { Home } from "~/pages/Home";
import { Products } from "~/pages/Products";
import { Policy } from "~/pages/Policy";
import { Connect } from "~/pages/Connect";
import { ProductDetail } from "~/pages/ProductDetail";
import { Login, Register, Forget } from "~/pages/Auth";
import { User } from "~/pages/User";
import { Cart } from "~/pages/Cart";
import { PUBLIC_URL, PRIVATE_URL } from "~/path";
import { path } from "framer-motion/client";

// Được phép xem dù không đăng nhập
const publicRoutes = [
  {
    path: PUBLIC_URL.HOME,
    element: Home,
  },
  {
    path: PUBLIC_URL.PRODUCTS,
    element: Products,
  },
  {
    path: PUBLIC_URL.POLICY,
    element: Policy,
  },
  {
    path: PUBLIC_URL.CONNECT,
    element: Connect,
  },
  {
    path: PUBLIC_URL.PRODUCT_DETIAL,
    element: ProductDetail,
  },
  {
    path: PUBLIC_URL.LOGIN,
    element: Login,
  },
  {
    path: PUBLIC_URL.REGISTER,
    element: Register,
  },
  {
    path: PUBLIC_URL.FORGET,
    element: Forget,
  },
];

// Chỉ được xem khi đã đăng nhập
const privateRoutes = [
  {
    path: PRIVATE_URL.USER,
    element: User,
  },
  {
    path: PRIVATE_URL.CART,
    element: Cart,
  }
];

// Chỉ admin mới được xem
const adminRoute = [];

// Những cá nhân theo quyền: kiểm tra bài viết, kiểm tra thống kê, seo, bảo trì,
const userRole = [];

// Chỉ người bán mới được xem
const sellRoute = [];

export { publicRoutes, privateRoutes };

/**
 * Sau này khi cần cấu hình dựa vào cấu trúc đã có
 */
