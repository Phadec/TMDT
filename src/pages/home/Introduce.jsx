import { cva } from "class-variance-authority";

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
    <div className="min-h-screen bg-surface-light py-16 px-6 font-sans">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Nội dung giới thiệu */}
        <div>
          <h1 className="text-5xl font-bold mb-6 text-content-primary leading-tight">
            Chợ Việt – <span className="text-primary">Mọi thứ bạn cần</span>, ở
            mọi nơi bạn muốn
          </h1>
          <p className="text-lg text-content-secondary mb-8">
            Chợ Việt là nền tảng rao vặt toàn diện, giúp người bán và người mua
            kết nối nhanh chóng, dễ dàng và an toàn. Với giao diện thân thiện và
            tính năng thông minh, bạn có thể mua bán mọi lúc, mọi nơi.
          </p>
          <div className="flex gap-4">
            <button className="bg-primary text-white px-6 py-3 rounded-full font-semibold shadow transition duration-fast hover:bg-primary-dark">
              Bắt đầu ngay
            </button>
            <button className="border border-primary text-primary px-6 py-3 rounded-full font-semibold transition duration-fast hover:bg-primary-light hover:text-white">
              Khám phá thêm
            </button>
          </div>
        </div>

        {/* Thẻ thông tin tính năng */}
        <div className="grid gap-6">
          <div className={sectionCard({ theme: "primary" })}>
            <h2 className="text-2xl font-semibold mb-2">Đăng tin miễn phí</h2>
            <p className="text-white/90">
              Rao bán sản phẩm dễ dàng chỉ với vài bước đơn giản, không tốn phí.
            </p>
          </div>
          <div className={sectionCard({ theme: "secondary" })}>
            <h2 className="text-2xl font-semibold mb-2">Tìm kiếm thông minh</h2>
            <p className="text-content-secondary">
              Gợi ý sản phẩm phù hợp dựa trên vị trí và sở thích của bạn.
            </p>
          </div>
          <div className={sectionCard({ theme: "secondary" })}>
            <h2 className="text-2xl font-semibold mb-2">Giao dịch an toàn</h2>
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
