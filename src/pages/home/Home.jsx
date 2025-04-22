import Carousel from "./Carousel";
import DemoProducts from "./DemoProducts";
import Introduce from "./Introduce";
import Service from "./Service";

function Home() {
  return (
    <div>
      {/* Carousel */}
      <Carousel />

      {/* Giới thiệu */}
      <Introduce />

      {/* Sản phẩm */}
      <DemoProducts />

      {/* Tin tức */}

      {/* Dịch vụ */}
      <Service />

      {/* Đối tác */}
      <div>Đối tác</div>

      {/* Liên hệ */}
      <div>Liên hệ</div>
    </div>
  );
}

export default Home;
