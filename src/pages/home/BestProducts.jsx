import { useState, useEffect } from "react";

import { getImageFromAssets, getSafeImageUrl } from "~/utils/imageUtils";
import { Search } from "~/components/items";
import { cva } from 'class-variance-authority';
import { cardImage } from './Demo.jsx';
import { apiServices } from "~/api";
import { getTopRecentlyViewed, recentlyViewedIdsToString } from "~/utils/recentlyViewedUtils";

const productCard = cva(['rounded-lg', 'overflow-hidden', 'shadow-md', 'transition-transform', 'hover:scale-105', 'hover:shadow-lg', 'border-l-4', 'bg-surface-white'], {
  variants: {
    level: {
      trending: '',
      discount: '',
      new: '',
      default: 'border-border',
    },
  },
  defaultVariants: {
    level: 'default',
  },
});

const productTag = cva(['text-xs', 'px-2', 'py-1', 'rounded-full', 'bg-surface-light', 'border', 'border-border'], {
  variants: {
    color: {
      secondary: 'text-content-secondary',
      primary: '',
    },
  },
  defaultVariants: {
    color: 'secondary',
  },
});

/**
 * Sản phẩm theo mục:
 * + Hành vi người dùng - no
 * + Sản phẩm theo trend
 * + Sản phẩm được đẩy
 * + Sản phẩm đang giảm giá
 * + Sản phẩm mới
 */
const bestProduct = [
];

const levelColors = {
  trending: "border-secondary-light",
  ads: "border-warning",
  discount: "border-success",
  hot: "border-danger",
  new: "border-primary-light",
  match: "border-info",
};

// Helper functions để xử lý dữ liệu sản phẩm
const determineProductLevel = (product) => {
  // Logic để xác định level dựa trên thuộc tính sản phẩm
  if (product.isNew) return 'new';
  if (product.isOnSale || product.discount > 0) return 'discount';
  if (product.isTrending || product.viewCount > 1000) return 'trending';
  return 'default';
};

const generateProductTags = (product) => {
  const tags = [];
  if (product.isNew) tags.push("Sản phẩm mới");
  if (product.isOnSale || product.discount > 0) tags.push("Đang giảm giá");
  if (product.isTrending) tags.push("Theo trend");
  if (product.rating >= 4.5) tags.push("Đánh giá cao");
  if (product.soldCount > 100) tags.push("Lượt mua cao");
  
  // Nếu không có tags nào, trả về tags mặc định
  if (tags.length === 0) {
    tags.push("Phù hợp", "Chất lượng");
  }
  
  return tags;
};

const formatPrice = (price) => {
  if (!price) return "Liên hệ";
  
  // Nếu price đã là string và có định dạng đúng, trả về luôn
  if (typeof price === 'string' && price.includes('đ')) {
    return price;
  }
  
  // Nếu là số, format thành tiền tệ VND
  if (typeof price === 'number') {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  }
  
  return price.toString() + 'đ';
};

function BestProduct() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  // Lấy dữ liệu sản phẩm gợi ý hôm nay từ API
  useEffect(() => {
    const fetchTodayRecommendations = async () => {
      try {
        setLoading(true);
        
        // Lấy recently viewed từ localStorage và chuyển thành string
        const recentlyViewedIds = getTopRecentlyViewed(9);
        const recentlyViewedString = recentlyViewedIdsToString(recentlyViewedIds);
        
        
        // Gọi API getTodayRecommendations
        const todayProducts = await apiServices.products.getTodayRecommendations(recentlyViewedString);
        
        // Validate response
        if (todayProducts && Array.isArray(todayProducts) && todayProducts.length > 0) {
          console.log(`Successfully loaded ${todayProducts.length} today recommendation products`);
          setProducts(todayProducts);
        } else {
          console.warn('Empty or invalid response from today recommendations, using fallback');
          // Use static fallback data
          setProducts(bestProduct.slice(0, 9));
        }
        
      } catch (error) {
        console.error('Error loading today recommendations:', error);
        console.error('Error type:', error.constructor.name);
        console.error('Error stack:', error.stack);
        
        // Fallback về dữ liệu tĩnh nếu API lỗi
        console.log('Using static fallback products');
        setProducts(bestProduct.slice(0, 9));
        
      } finally {
        setLoading(false);
      }
    };

    fetchTodayRecommendations();
  }, []);

  // Loading state
  if (loading) {
    return (
      <section className="min-h-screen px-4 pb-16 lg:px-32 md:px-10 bg-surface-light text-content-primary">
        <Search />
        <h2 className="flex items-center gap-2 mb-6 text-3xl font-bold">
          🔥 Gợi ý hôm nay
        </h2>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
            <p className="text-content-secondary">Đang tải sản phẩm gợi ý...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen px-4 pb-16 lg:px-32 md:px-10 bg-surface-light text-content-primary">
      {/* Thanh tìm kiếm bằng AI */}
      <Search />

      <h2 className="flex items-center gap-2 mb-6 text-3xl font-bold">
        🔥 Gợi ý hôm nay
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {products.map((product) => {
          // Xác định level dựa trên thuộc tính sản phẩm hoặc fallback
          const productLevel = product.level || determineProductLevel(product);
          
          // Lấy URL ảnh an toàn
          const imageUrl = getSafeImageUrl(
            product.imageReview || product.images?.[0] || product.image,
            getImageFromAssets("img1_.jpg", "home/carousel") // fallback image
          );

          return (
            <div
              key={product.id}
              className={productCard({ level: productLevel })}
            >
              <img
                src={imageUrl}
                alt={product.name || product.productName}
                className={cardImage()}
                onError={(e) => {
                  // Fallback nếu ảnh bị lỗi
                  e.target.src = getImageFromAssets("img1_.jpg", "home/carousel");
                }}
              />
              <div className="p-4 space-y-2">
                <h3 className="text-lg font-semibold text-content-primary">
                  {product.name || product.productName}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(product.tags || generateProductTags(product)).map((tag, index) => (
                    <span
                      key={index}
                      className={productTag()}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-xl font-bold text-secondary">
                  {formatPrice(product.price)}
                </p>
                <button className="w-full py-2 mt-2 text-sm font-semibold text-white transition rounded-md bg-primary hover:bg-primary-dark duration-fast">
                  Xem chi tiết
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default BestProduct;
