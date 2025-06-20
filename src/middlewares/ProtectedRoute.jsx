import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PUBLIC_URL } from '~/path';

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
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
  if (!isAuthenticated) {
    // Lưu đường dẫn hiện tại để chuyển hướng lại sau khi đăng nhập
    return <Navigate to={PUBLIC_URL.LOGIN} state={{ from: location.pathname }} replace />;
  }

  // Nếu route yêu cầu quyền cụ thể và người dùng không có quyền đó
  if (requiredRole && (!user.role || user.role !== requiredRole)) {
    // Chuyển hướng đến trang 404 khi không có quyền truy cập
    return <Navigate to={PUBLIC_URL.NOT_FOUND} replace />;
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
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  if (isAuthenticated) {
    // Nếu đã đăng nhập, chuyển hướng đến trang chủ
    return <Navigate to={PUBLIC_URL.HOME} replace />;
  }

  return children;
};

export default ProtectedRoute;