import BestProduct from "./BestProducts";
import Carousel from "./Carousel";
import Demo from "./Demo";
import Introduce from "./Introduce";

function Home() {
  return (
    <div>
      {/* Carousel */}
      <Carousel />

      {/* Giới thiệu */}
      <Introduce />

      {/* Sản phẩm nổi bật */}
      <BestProduct />
      
      {/* Quảng bá */}
      <Demo />

    </div>
  );
}

export default Home;
