const PUBLIC_URL = {
  HOME: "/",
  PRODUCTS: "/products",
  POLICY: "/policy",
  CONNECT: "/connect",
  PRODUCT_DETIAL: "/products/:id",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGET: "/forget",
  NOT_FOUND: "/not-found",
};

const PRIVATE_URL = {
  CUSTOMER: "/account",
  CART: "/cart",
  DASHBOARD: "/dashboard"
};

const ADMIN_URL = {
  DASHBOARD: "/admin/dashboard",
  LOGIN:"/admin/login",
};

export { PUBLIC_URL, PRIVATE_URL, ADMIN_URL };
