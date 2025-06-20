import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PUBLIC_URL, ADMIN_URL } from '~/path';

/**
 * Bảo vệ các routes yêu cầu authentication và kiểm tra quyền truy cập
 * Chuyển hướng người dùng chưa đăng nhập đến trang đăng nhập
 * Chuyển hướng người dùng không có quyền đến trang 404
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Component con được bảo vệ
 * @param {string} props.requiredRole - Quyền cần thiết để truy cập route (nếu có)
 * @returns {React.ReactNode} - Component con nếu đã xác thực và có quyền, hoặc Navigate đến trang đăng nhập/404
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated: isCustomerAuth, user } = useSelector((state) => state.auth);
  const { isAuthenticated: isAdminAuth, admin } = useSelector((state) => state.authAdmin);
  const location = useLocation();

  // Kiểm tra authentication dựa trên required role
  let isAuthenticated, currentUser;

  if (requiredRole === 'ADMIN') {
    isAuthenticated = isAdminAuth;
    currentUser = admin;
  } else {
    isAuthenticated = isCustomerAuth;  
    currentUser = user;
  }

  // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập phù hợp
  if (!isAuthenticated) {    // Lưu đường dẫn hiện tại để chuyển hướng lại sau khi đăng nhập
    const loginUrl = requiredRole === 'ADMIN' ? ADMIN_URL.LOGIN : PUBLIC_URL.LOGIN;
    return <Navigate to={loginUrl} state={{ from: location.pathname }} replace />;
  }  // Nếu route yêu cầu quyền cụ thể và người dùng không có quyền đó
  if (requiredRole && currentUser) {
    // Các cách khác nhau để lấy role từ user object
    const userRole = currentUser.role || 
                    currentUser.user?.role || 
                    (requiredRole === 'ADMIN' && isAdminAuth ? 'ADMIN' : null);
    
    // Debug log
    console.log('ProtectedRoute Debug:');
    console.log('requiredRole:', requiredRole);
    console.log('currentUser:', currentUser);
    console.log('userRole:', userRole);
    console.log('isAdminAuth:', isAdminAuth);
    console.log('isCustomerAuth:', isCustomerAuth);
    
    if (!userRole || userRole !== requiredRole) {
      console.log('Access denied - role mismatch');
      // Chuyển hướng đến trang 404 khi không có quyền truy cập
      return <Navigate to={PUBLIC_URL.NOT_FOUND} replace />;
    }
  }

  return children;
};

/**
 * Bảo vệ các routes chỉ dành cho người dùng chưa đăng nhập
 * (như trang đăng nhập, đăng ký) để ngăn người dùng đã đăng nhập truy cập
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Component con
 * @returns {React.ReactNode} - Component con nếu chưa xác thực, hoặc Navigate đến trang chủ
 */
export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated: isCustomerAuth } = useSelector((state) => state.auth);
  const { isAuthenticated: isAdminAuth } = useSelector((state) => state.authAdmin);
  
  if (isCustomerAuth) {
    // Nếu customer đã đăng nhập, chuyển hướng đến trang chủ
    return <Navigate to={PUBLIC_URL.HOME} replace />;
  }
  
  if (isAdminAuth) {
    // Nếu admin đã đăng nhập, chuyển hướng đến admin dashboard
    return <Navigate to={ADMIN_URL.DASHBOARD} replace />;
  }

  return children;
};

export default ProtectedRoute;