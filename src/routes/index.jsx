import { Home } from "~/pages/Home";
import { PUBLIC_URL } from "../path";

// Được phép xem dù không đăng nhập
const publicRoutes = [
  {
    path: PUBLIC_URL.HOME,
    element: Home,
  },
];

// Chỉ được xem khi đã đăng nhập
const privaetRoutes = [];

// Chỉ admin mới được xem
const adminRoute = [];

// Chỉ người bán mới được xem
const sellRoute = [];

export { publicRoutes, privaetRoutes };

/**
 * Sau này khi cần cấu hình dựa vào cấu trúc đã có
 */
