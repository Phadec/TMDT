import ProductImages from "./ProductImages";
import ProductArticle from "./ProductArticle";
import ProductVote from "./ProductVote";
import FastButton from "./FastButton";

function ProductDetail() {
  return (
    <div className="mb-44">
      {/* Nút nhanh */}
      <FastButton />

      {/* Hiển thị các hình ảnh về sản phẩm */}
      <div className="mt-5 h-[300px] rounded-md mx-5 shadow-[40px_0_30px_-10px_rgba(0,0,0,0.8),-40px_0_30px_-10px_rgba(0,0,0,0.8)]">
        <ProductImages />
      </div>

      {/* Hiển thị chi tiết về sản phẩm và cơ bản về người bán */}
      <div className="lg:px-20 px-2 mt-5">
        <ProductArticle />
      </div>

      {/* Đánh giá của khách hàng về hàng hóa hoặc đánh giá về người bán */}
      <div className="px-3 lg:px-20 md:px-2 mt-5">
        <ProductVote />
      </div>


      {/* Các sản phẩm liên quan */}
    </div>
  );
}

export default ProductDetail;
