import { 
  Home, 
  Products, 
  Policy, 
  Connect, 
  ProductDetail, 
  Login, 
  Register, 
  Forget, 
  Customer, 
  Cart, 
  Checkout, 
  NotFound, 
  Dashboard, 
  DashboardAdmin, 
  LoginAdmin 
} from "~/pages";
import { VNPayReturn } from "~/pages/checkout";
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
    {
    path: ADMIN_URL.LOGIN,
    element: LoginAdmin,
    layout: EmptyLayout,
    publicOnly: true, // Chỉ cho phép người dùng chưa đăng nhập truy cập
  },
];

// Chỉ được xem khi đã đăng nhập
const privateRoutes = [
  {
    path: PRIVATE_URL.CUSTOMER,
    element: Customer,
  },
  {
    path: PRIVATE_URL.CART,
    element: Cart,
  },
  {
    path: PRIVATE_URL.CHECKOUT,
    element: Checkout,
  },
  {
    path: PRIVATE_URL.VNPAY_RETURN,
    element: VNPayReturn,
  },
  {
    path: PRIVATE_URL.DASHBOARD,
    element: Dashboard,
    layout: DashboardLayout
  },
];

// Chỉ admin mới được xem
const adminRoute = [
  {
    path: ADMIN_URL.DASHBOARD,
    element: DashboardAdmin,
    layout: DashboardLayout,
    requiredRole: 'ADMIN', // Yêu cầu quyền admin
  },

  
];

export { publicRoutes, privateRoutes, adminRoute };

/**
 * Sau này khi cần cấu hình dựa vào cấu trúc đã có
 */
