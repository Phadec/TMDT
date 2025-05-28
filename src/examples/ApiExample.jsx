import { useState, useEffect } from 'react';
import { authService, apiService, userService } from '../api';

/**
 * Example component demonstrating how to use the API services
 */
const ApiExample = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Example of fetching user profile
  const fetchUserProfile = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        setError('Bạn cần đăng nhập để xem thông tin này');
        return;
      }
      
      // Fetch user profile
      const userData = await userService.getProfile();
      setUser(userData);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err.response?.data?.message || 'Không thể tải thông tin người dùng');
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        authService.logout();
        // Redirect to login page
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  // Example of making a generic API call
  const fetchExampleData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Make a GET request to an example endpoint
      const data = await apiService.get('/example-endpoint', { 
        param1: 'value1',
        param2: 'value2'
      });
      
      console.log('Example data:', data);
      // Process data as needed
      
    } catch (err) {
      console.error('Error fetching example data:', err);
      setError(err.response?.data?.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Example of logging out
  const handleLogout = () => {
    authService.logout();
    setUser(null);
    // Redirect to login page
    window.location.href = '/login';
  };

  // Load user data on component mount
  useEffect(() => {
    // Check if user is already authenticated
    if (authService.isAuthenticated()) {
      fetchUserProfile();
    }
  }, []);

  return (
    <div className="max-w-md p-6 mx-auto bg-white shadow-md rounded-xl">
      <h2 className="mb-4 text-xl font-bold">API Example</h2>
      
      {error && (
        <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="py-4 text-center">Loading...</div>
      ) : (
        <>
          {user ? (
            <div className="mb-4">
              <h3 className="font-semibold">User Profile</h3>
              <p>Name: {user.name}</p>
              <p>Email: {user.email}</p>
              {/* Display other user data as needed */}
            </div>
          ) : (
            <div className="mb-4">
              <p>Please log in to view your profile</p>
            </div>
          )}
          
          <div className="flex flex-col space-y-2">
            {!user && (
              <button 
                onClick={() => window.location.href = '/login'}
                className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Login
              </button>
            )}
            
            {user && (
              <button 
                onClick={handleLogout}
                className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
              >
                Logout
              </button>
            )}
            
            <button 
              onClick={fetchUserProfile}
              className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
            >
              Fetch Profile
            </button>
            
            <button 
              onClick={fetchExampleData}
              className="px-4 py-2 text-white bg-purple-500 rounded hover:bg-purple-600"
            >
              Fetch Example Data
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ApiExample;