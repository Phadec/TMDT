import { Home } from "~/pages/Home";
import { Products } from "~/pages/Products";
import { Policy } from "~/pages/Policy";
import { Connect } from "~/pages/Connect";
import { ProductDetail } from "~/pages/ProductDetail";

import { PUBLIC_URL } from "../path";

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
  }
];

// Chỉ được xem khi đã đăng nhập
const privaetRoutes = [];

// Chỉ admin mới được xem
const adminRoute = [];

// Những cá nhân theo quyền: kiểm tra bài viết, kiểm tra thống kê, seo, bảo trì,
const userRole = [];

// Chỉ người bán mới được xem
const sellRoute = [];

export { publicRoutes, privaetRoutes };

/**
 * Sau này khi cần cấu hình dựa vào cấu trúc đã có
 */
