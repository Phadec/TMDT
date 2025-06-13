import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';
import { apiServices } from "~/api";

function SuggestProducts({ categoryId }) {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Hàm lấy sản phẩm liên quan
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        let data;
        
        if (categoryId) {
          // Nếu có categoryId, lấy sản phẩm theo danh mục
          data = await apiServices.products.getProductsByCategory(categoryId, 0, 6);
        } else {
          // Nếu không có categoryId, lấy tất cả sản phẩm
          data = await apiServices.products.getProducts(0, 6);
        }
        
        // Kiểm tra dữ liệu trả về
        if (data && data.content) {
          setRelatedProducts(data.content);
        } else if (Array.isArray(data)) {
          setRelatedProducts(data.slice(0, 6)); // Giới hạn 6 sản phẩm
        } else {
          setRelatedProducts([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm liên quan:", error);
        setLoading(false);
        setRelatedProducts([]);
      }
    };

    fetchRelatedProducts();
  }, [categoryId]);

  // Hiển thị skeleton loading khi đang tải dữ liệu
  if (loading) {
    return (
      <div className="p-6">
        <h2 className="mb-4 text-2xl font-bold">Sản phẩm liên quan</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="p-4 bg-white rounded-lg shadow-lg">
              <div className="w-full h-48 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="mt-4">
                <div className="w-3/4 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-full h-4 mt-2 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-1/2 h-4 mt-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-full h-10 mt-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Nếu không có sản phẩm liên quan hoặc có lỗi
  if (!relatedProducts || relatedProducts.length === 0) {
    return (
      <div className="p-6">
        <h2 className="mb-4 text-2xl font-bold">Sản phẩm liên quan</h2>
        <p className="py-8 text-center text-gray-500">Không có sản phẩm liên quan.</p>
      </div>
    );
  }

  // Hiển thị sản phẩm từ API
  return (
    <div className="p-6">
      <h2 className="mb-4 text-2xl font-bold">Sản phẩm liên quan</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {relatedProducts.map((product) => {
          // Lấy ảnh đầu tiên từ danh sách ảnh (nếu có)
          const firstImage = product.images && Object.values(product.images)[0] 
            ? Object.values(product.images)[0] 
            : "https://placehold.co/150";
          
          // Lấy giá từ variant (nếu có)
          const price = product.variant && product.variant.price 
            ? product.variant.price 
            : "Liên hệ";

          return (
            <div
              key={product.id}
              className="p-4 transition-all bg-white rounded-lg shadow-lg hover:shadow-xl"
            >
              <Link to={`/product/${product.id}`}>
                <img
                  src={firstImage}
                  alt={product.name}
                  className="object-cover w-full h-48 rounded-md"
                />
                <div className="mt-4">
                  <h3 className="text-xl font-semibold">{product.name}</h3>
                  <p className="mt-2 text-gray-600 line-clamp-2">
                    {product.description || "Không có mô tả"}
                  </p>
                  <p className="mt-3 text-lg font-bold">{price}</p>
                </div>
              </Link>
              <button className="w-full px-6 py-2 mt-4 text-white transition-all bg-blue-500 rounded-md hover:bg-blue-600">
                Thêm vào giỏ
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

SuggestProducts.propTypes = {
  categoryId: PropTypes.string
};

export default SuggestProducts;