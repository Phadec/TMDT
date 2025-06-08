import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PUBLIC_URL } from '~/path';

/**
 * Bảo vệ các routes yêu cầu authentication
 * Chuyển hướng người dùng chưa đăng nhập đến trang đăng nhập
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Component con được bảo vệ
 * @returns {React.ReactNode} - Component con nếu đã xác thực, hoặc Navigate đến trang đăng nhập
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Lưu đường dẫn hiện tại để chuyển hướng lại sau khi đăng nhập
    return <Navigate to={PUBLIC_URL.LOGIN} state={{ from: location.pathname }} replace />;
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