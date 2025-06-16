import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';
import { apiServices } from "~/api";

// Fallback image nếu API không trả về hình ảnh hoặc ảnh bị lỗi
const FALLBACK_IMAGE = "/assets/home/demo/demo.jpg";

function SuggestProducts({ categoryId, productId }) {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Hàm lấy sản phẩm liên quan
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        let categoryProducts = [];
        let similarProducts = [];
        let allProducts = [];
        
        
        // Lấy song song các loại sản phẩm để tối ưu thời gian
        const fetchPromises = [];
        
        // 1. Lấy sản phẩm theo danh mục nếu có categoryId
        if (categoryId) {
          fetchPromises.push(
            apiServices.products.getProductsByCategory(categoryId, 0, 6)
              .then(data => {
                if (data && data.content) {
                  categoryProducts = data.content.filter(p => p.id !== productId); // Loại bỏ sản phẩm hiện tại
                } else if (Array.isArray(data)) {
                  categoryProducts = data.filter(p => p.id !== productId).slice(0, 6);
                }
              })
              .catch(error => {
              })
          );
        }
        
        // 2. Lấy tất cả sản phẩm (dự phòng nếu không có sản phẩm theo danh mục)
        fetchPromises.push(
          apiServices.products.getProducts(0, 10)
            .then(data => {
              if (data && data.content) {
                allProducts = data.content.filter(p => p.id !== productId); // Loại bỏ sản phẩm hiện tại
              } else if (Array.isArray(data)) {
                allProducts = data.filter(p => p.id !== productId).slice(0, 10);
              }
            })
            .catch(error => {
            })
        );
        
        // 3. Lấy sản phẩm tương đồng bằng transformer nếu có productId
        if (productId) {
          fetchPromises.push(
            apiServices.products.getSimilarProducts(productId, 6)
              .then(data => {
                if (data && data.content) {
                  similarProducts = data.content;
                } else if (Array.isArray(data)) {
                  similarProducts = data.slice(0, 6);
                }
              })
              .catch(error => {
              })
          );
        }
        
        // Đợi tất cả các promise hoàn thành
        await Promise.all(fetchPromises);
        
        // Chiến lược kết hợp sản phẩm:
        // 1. Ưu tiên sản phẩm tương đồng từ transformer
        // 2. Bổ sung bằng sản phẩm cùng danh mục
        // 3. Nếu vẫn thiếu, bổ sung bằng sản phẩm ngẫu nhiên
        
        // Bắt đầu với sản phẩm tương đồng
        let combinedProducts = [...similarProducts];
        
        // Thêm sản phẩm theo danh mục nếu chưa đủ 6 sản phẩm
        if (combinedProducts.length < 6) {
          categoryProducts.forEach(product => {
            if (!combinedProducts.some(p => p.id === product.id) && combinedProducts.length < 6) {
              combinedProducts.push(product);
            }
          });
        }
        
        // Nếu vẫn chưa đủ 6 sản phẩm, thêm từ danh sách tất cả sản phẩm
        if (combinedProducts.length < 6) {
          allProducts.forEach(product => {
            if (!combinedProducts.some(p => p.id === product.id) && combinedProducts.length < 6) {
              combinedProducts.push(product);
            }
          });
        }
        
        
        // Đảm bảo không hiển thị sản phẩm hiện tại
        combinedProducts = combinedProducts.filter(product => product.id !== productId);
        
        // Giới hạn tổng số sản phẩm là 6
        setRelatedProducts(combinedProducts.slice(0, 6));
        setLoading(false);
      } catch (error) {
        setLoading(false);
        
        // Nếu có lỗi, thử lấy sản phẩm ngẫu nhiên
        try {
          const randomProducts = await apiServices.products.getProducts(0, 6);
          if (randomProducts && (randomProducts.content || Array.isArray(randomProducts))) {
            const products = randomProducts.content || randomProducts;
            // Loại bỏ sản phẩm hiện tại nếu có
            const filteredProducts = products.filter(p => p.id !== productId);
            setRelatedProducts(filteredProducts.slice(0, 6));
          } else {
            setRelatedProducts([]);
          }
        } catch (fallbackError) {
          setRelatedProducts([]);
        }
      }
    };

    fetchRelatedProducts();
  }, [categoryId, productId]);

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
          const firstImage = product.imageReview ?? FALLBACK_IMAGE;
          
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
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_IMAGE;
                  }}
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
  categoryId: PropTypes.string,
  productId: PropTypes.string
};

export default SuggestProducts;