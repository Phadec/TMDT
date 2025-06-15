import { Home } from "~/pages/Home";
import { Products } from "~/pages/Products";
import { Policy } from "~/pages/Policy";
import { Connect } from "~/pages/Connect";
import { ProductDetail } from "~/pages/ProductDetail";
import { Login, Register, Forget } from "~/pages/Auth";
import { User } from "~/pages/User";
import { Cart } from "~/pages/Cart";
import { NotFound } from "~/pages/NotFound";
import { Dashboard } from "~/pages/Dashboard";
import { Dashboard as DashboardAdmin } from "~/pages/admin";

import { PUBLIC_URL, PRIVATE_URL, ADMIN_URL } from "~/path";
import { EmptyLayout, DashboardLayout } from "~/components/layouts";

// Được phép xem dù không đăng nhập
const publicRoutes = [
  {
    path: PUBLIC_URL.NOT_FOUND,
    element: NotFound,
    layout: EmptyLayout,
  },
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
    publicOnly: true,
  },
  {
    path: PUBLIC_URL.REGISTER,
    element: Register,
    publicOnly: true,
  },
  {
    path: PUBLIC_URL.FORGET,
    element: Forget,
    publicOnly: true,
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
  },
  {
    path: PRIVATE_URL.DASHBOARD,
    element: Dashboard,
    layout: DashboardLayout,
    requiredRole: 'SELLER', // Yêu cầu quyền người bán
  },
];

// Chỉ admin mới được xem
const adminRoute = [
  {
    path: ADMIN_URL.DASHBOARD,
    element: DashboardAdmin,
    layout: DashboardLayout,
    requiredRole: 'ADMIN', // Yêu cầu quyền admin
  }
];

export { publicRoutes, privateRoutes, adminRoute };

/**
 * Sau này khi cần cấu hình dựa vào cấu trúc đã có
 */
