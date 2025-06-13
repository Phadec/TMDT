import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProductImages from "./ProductImages";
import ProductArticle from "./ProductArticle";
import ProductVote from "./ProductVote";
import FastButton from "./FastButton";
import SuggestProducts from "./SuggestProducts";
import { apiServices } from "~/api";

function ProductDetail() {
  const { id } = useParams(); // Lấy id sản phẩm từ URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Hàm lấy thông tin sản phẩm
    const fetchProductDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await apiServices.products.getProductById(id);
        console.log("Product data:", data);
        setProduct(data);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin sản phẩm:", err);
        setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [id]);

  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Hiển thị thông báo lỗi
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-500">
          <p className="text-xl font-semibold">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 mt-4 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-44">
      {/* Nút nhanh */}
      <FastButton />

      {/* Hiển thị các hình ảnh về sản phẩm */}
      <div className="mt-5 h-[300px] rounded-md mx-5 shadow-[40px_0_30px_-10px_rgba(0,0,0,0.8),-40px_0_30px_-10px_rgba(0,0,0,0.8)]">
        <ProductImages />
      </div>

      {/* Hiển thị chi tiết về sản phẩm và cơ bản về người bán */}
      <div className="px-2 mt-5 lg:px-20">
        <ProductArticle productData={product} />
      </div>

      {/* Đánh giá của khách hàng về hàng hóa hoặc đánh giá về người bán */}
      <div className="px-3 mt-5 lg:px-20 md:px-2">
        <ProductVote />
      </div>

      {/* Các sản phẩm liên quan */}
      <div className="lg:mx-20">
        <SuggestProducts categoryId={product?.productCategory?.id} />
      </div>
    </div>
  );
}

export default ProductDetail;
