import { useState, useEffect, useCallback } from 'react';
import { adminServices } from '../api';

/**
 * Custom hook đơn giản để quản lý dữ liệu trang Overview
 */
export const useSimpleOverviewData = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalRevenue: 0,
    pendingReports: 0
  });
  

  const [newUsers, setNewUsers] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  // Hàm fetch dữ liệu đơn giản
  const fetchData = useCallback(async () => {
    console.log('Starting to fetch data...');
    setLoading(true);
    setError(null);

    // Set timeout để tránh loading vô hạn
    const timeout = setTimeout(() => {
      console.log('Timeout reached, using fallback data');
      setFallbackData();
      setLoading(false);
    }, 5000);

    try {
      // Thử gọi API dashboard overview trước
      console.log('Fetching dashboard overview...');
      try {
        const overviewResponse = await adminServices.analytics.getDashboardOverview();
        console.log('Dashboard overview response:', overviewResponse);
        
        if (overviewResponse) {
          clearTimeout(timeout);
          
          // Cập nhật stats từ dashboard overview
          setStats({
            totalUsers: overviewResponse.totalUsers || 0,
            totalPosts: overviewResponse.totalProducts || 0,
            totalRevenue: overviewResponse.totalRevenue || 0,
            pendingReports: overviewResponse.pendingReports || 0
          });

          // Nếu có dữ liệu users và products từ overview
          if (overviewResponse.recentUsers && Array.isArray(overviewResponse.recentUsers)) {
            const newUsersArray = overviewResponse.recentUsers.map(user => ({
              id: user.id,
              name: user.fullName || user.username || user.email || 'Unknown User',
              username: user.username,
              email: user.email,
              avatar: user.avatar,
              createdAt: user.createdAt || user.createDate || new Date().toISOString()
            }));
            setNewUsers(newUsersArray);
          }

          if (overviewResponse.recentProducts && Array.isArray(overviewResponse.recentProducts)) {
            const recentPostsArray = overviewResponse.recentProducts.map(product => ({
              id: product.id,
              title: product.name || 'Unnamed Product',
              image: product.images && product.images.length > 0 ? product.images[0] : null,
              createdAt: product.createdAt || product.createDate || new Date().toISOString(),
              status: product.status || 'APPROVED'
            }));
            setRecentPosts(recentPostsArray);
          }

          setLoading(false);
          return;
        }
      } catch (overviewError) {
        console.log('Dashboard overview API failed, trying individual APIs...');
      }

      // Fallback: Thử gọi API users riêng lẻ
      console.log('Fetching users...');
      const usersResponse = await adminServices.users.getAll(0, 10);
      console.log('Users response:', usersResponse);
      
      if (usersResponse) {
        clearTimeout(timeout);
        
        // Xử lý dữ liệu users
        const totalUsers = usersResponse.totalElements || usersResponse.content?.length || 0;
        
        setStats(prev => ({
          ...prev,
          totalUsers
        }));

        // Lấy users mới nhất
        if (usersResponse.content && Array.isArray(usersResponse.content)) {
          const newUsersArray = usersResponse.content
            .slice(0, 5)
            .map(user => ({
              id: user.id,
              name: user.fullName || user.username || user.email || 'Unknown User',
              username: user.username,
              email: user.email,
              avatar: user.avatar,
              createdAt: user.createdAt || user.createDate || new Date().toISOString()
            }));
          
          setNewUsers(newUsersArray);
        }

        // Thử lấy products
        try {
          console.log('Fetching products...');
          const productsResponse = await adminServices.products.getAll(0, 10);
          console.log('Products response:', productsResponse);
          
          if (productsResponse) {
            const totalPosts = productsResponse.totalElements || productsResponse.content?.length || 0;
            
            setStats(prev => ({
              ...prev,
              totalPosts
            }));

            // Lấy products mới nhất
            if (productsResponse.content && Array.isArray(productsResponse.content)) {
              const recentPostsArray = productsResponse.content
                .slice(0, 5)
                .map(product => ({
                  id: product.id,
                  title: product.name || 'Unnamed Product',
                  image: product.images && product.images.length > 0 ? product.images[0] : null,
                  createdAt: product.createdAt || product.createDate || new Date().toISOString(),
                  status: product.status || 'APPROVED'
                }));
              
              setRecentPosts(recentPostsArray);
            }
          }
        } catch (productError) {
          console.log('Products API failed, using partial data');
        }

        setLoading(false);
      }
      
    } catch (error) {
      clearTimeout(timeout);
      console.error('API Error:', error);
      setError(error.message || 'Có lỗi xảy ra khi tải dữ liệu');
      setFallbackData();
      setLoading(false);
    }
  }, []);

  // Hàm set dữ liệu mẫu
  const setFallbackData = () => {
    setStats({
      totalUsers: 1250,
      totalPosts: 3456,
      totalRevenue: 45600000,
      pendingReports: 12
    });

    setNewUsers([
      { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', createdAt: new Date().toISOString() },
      { id: 2, name: 'Trần Thị B', email: 'tranthib@example.com', createdAt: new Date().toISOString() },
      { id: 3, name: 'Lê Văn C', email: 'levanc@example.com', createdAt: new Date().toISOString() },
      { id: 4, name: 'Phạm Thị D', email: 'phamthid@example.com', createdAt: new Date().toISOString() },
      { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@example.com', createdAt: new Date().toISOString() }
    ]);

    setRecentPosts([
      { id: 1, title: 'Áo thun nam cao cấp', status: 'APPROVED', createdAt: new Date().toISOString() },
      { id: 2, title: 'Quần jean nữ thời trang', status: 'PENDING', createdAt: new Date().toISOString() },
      { id: 3, title: 'Giày thể thao nam', status: 'APPROVED', createdAt: new Date().toISOString() },
      { id: 4, title: 'Túi xách nữ da thật', status: 'APPROVED', createdAt: new Date().toISOString() },
      { id: 5, title: 'Đồng hồ thông minh', status: 'PENDING', createdAt: new Date().toISOString() }
    ]);


  };

  // Hàm refresh dữ liệu
  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    stats,
    newUsers,
    recentPosts,
    loading,
    error,
    refreshData
  };
};