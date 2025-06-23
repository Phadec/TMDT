import { cva } from "class-variance-authority";
import { PUBLIC_URL } from "~/path";
import { Link } from "react-router-dom";

const sectionCard = cva("rounded-[8px] p-6 shadow-md transition-transform", {
  variants: {
    theme: {
      primary: "bg-primary text-white",
      secondary: "bg-surface-white text-content-primary border border-border",
    },
    hoverable: {
      true: "hover:scale-[1.03] hover:shadow-md",
    },
  },
  defaultVariants: {
    theme: "primary",
    hoverable: true,
  },
});

const Introduce = () => {
  return (
    <div className="min-h-screen px-6 py-16 font-sans bg-surface-light">
      <div className="grid items-center max-w-6xl gap-12 mx-auto md:grid-cols-2">
        {/* Nội dung giới thiệu */}
        <div>
          <h1 className="mb-6 text-5xl font-bold leading-tight text-content-primary">
            Chợ Việt – <span className="text-primary">Mọi thứ bạn cần</span>, ở
            mọi nơi bạn muốn
          </h1>
          <p className="mb-8 text-lg text-content-secondary">
            Chợ Việt là nền tảng rao vặt toàn diện, giúp người bán và người mua
            kết nối nhanh chóng, dễ dàng và an toàn. Với giao diện thân thiện và
            tính năng thông minh, bạn có thể mua bán mọi lúc, mọi nơi.
          </p>
          <div className="flex gap-4">
            <Link
              to={PUBLIC_URL.LOGIN}
              className="px-6 py-3 font-semibold text-white transition rounded-full shadow bg-primary duration-fast hover:bg-primary-dark"
            >
              Bắt đầu ngay
            </Link>
            <Link to={PUBLIC_URL.PRODUCTS} className="px-6 py-3 font-semibold transition border rounded-full border-primary text-primary duration-fast hover:bg-primary-light hover:text-white">
              Khám phá thêm
            </Link>
          </div>
        </div>

        {/* Thẻ thông tin tính năng */}
        <div className="grid gap-6">
          <div className={sectionCard({ theme: "primary" })}>
            <h2 className="mb-2 text-2xl font-semibold">Đăng tin miễn phí</h2>
            <p className="text-white/90">
              Rao bán sản phẩm dễ dàng chỉ với vài bước đơn giản, không tốn phí.
            </p>
          </div>
          <div className={sectionCard({ theme: "secondary" })}>
            <h2 className="mb-2 text-2xl font-semibold">Tìm kiếm thông minh</h2>
            <p className="text-content-secondary">
              Gợi ý sản phẩm phù hợp dựa trên vị trí và sở thích của bạn.
            </p>
          </div>
          <div className={sectionCard({ theme: "secondary" })}>
            <h2 className="mb-2 text-2xl font-semibold">Giao dịch an toàn</h2>
            <p className="text-content-secondary">
              Hệ thống đánh giá người bán, bảo vệ quyền lợi và tạo lòng tin cho
              người mua.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Introduce;
