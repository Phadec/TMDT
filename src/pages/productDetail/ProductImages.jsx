// ⚙️ IMPORT
import * as THREE from "three"; // Thư viện 3D để xử lý các đối tượng hình học và vật liệu
import { useRef, useState, useMemo, useEffect } from "react"; // React hooks để quản lý state và tham chiếu
import { Canvas, useFrame, useThree } from "@react-three/fiber"; // Các hook và component từ react-three/fiber để vẽ đồ họa 3D trong React
import { Image, ScrollControls, Scroll, useScroll, Html } from "@react-three/drei"; // Các component hỗ trợ từ Drei cho Scroll và Image
import { proxy, useSnapshot } from "valtio"; // Quản lý state toàn cục với valtio
import { easing } from "maath"; // Các hàm hỗ trợ easing chuyển động
import { Suspense } from "react"; // Để lazy load các component trong React

import { getImageFromAssets } from "~/utils/imageUtils"; // Hàm tiện ích để lấy ảnh từ thư mục assets

// 📦 GLOBAL STATE
// Khai báo một state toàn cục với valtio để theo dõi trạng thái như ảnh được chọn, các url ảnh, và vị trí cuộn
const state = proxy({
  clicked: null, // Trạng thái của ảnh được chọn
  urls: [], // Mảng chứa các URL ảnh
});

// 🔳 LINE MATERIAL FOR MINIMAP
// Khởi tạo vật liệu và hình học cho minimap (một dạng chỉ dẫn cuộn ảnh)
const material = new THREE.LineBasicMaterial({ color: "white" });
const geometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(0, -0.5, 0),
  new THREE.Vector3(0, 0.5, 0),
]);

// 🖼️ MAIN COMPONENT
// Thành phần chính của ứng dụng, nơi hiển thị Canvas với các ảnh 3D
function ProductImages() {
  const urls = useMemo(
    () =>
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
        (u) => getImageFromAssets(`${u}.jpg`, "productDetail") // Lấy các ảnh sản phẩm từ assets
      ),
    []
  );

  useEffect(() => {
    state.urls = urls; // Cập nhật danh sách ảnh vào state toàn cục
  }, [urls]);

  return (
    <Canvas
      className="rounded-md lg:ml-8"
      gl={{ antialias: false }}
      dpr={[1, 1.5]} // Thiết lập độ phân giải canvas
      onPointerMissed={() => (state.clicked = null)} // Reset khi nhấp ngoài ảnh
    >
      <Suspense fallback={null}>
        <MainContent /> {/* Hiển thị nội dung chính (slider hoặc fullscreen) */}
      </Suspense>
    </Canvas>
  );
}

// 🧠 MAIN DECIDER
// Quyết định hiển thị chế độ fullscreen hay slider
function MainContent() {
  const { clicked } = useSnapshot(state); // Lấy trạng thái clicked từ global state
  return clicked !== null ? <ImageFullscreen /> : <ImageSlider />; // Nếu có ảnh được chọn, hiển thị fullscreen
}

// 🎞️ IMAGE SLIDER COMPONENT
// Thành phần cho slider ảnh với cuộn ngang
function ImageSlider() {
  const scrollRef = useRef(); // Tham chiếu cho ScrollControls
  const { urls } = useSnapshot(state); // Lấy các ảnh và vị trí cuộn từ state toàn cục
  const { width } = useThree((s) => s.viewport); // Lấy kích thước của canvas
  const w = 8,
    h = 8,
    gap = 0.5;
  const xW = w + gap;

  // Tính toán số lượng trang trong slider dựa trên số ảnh và kích thước canvas
  const pages = Math.ceil((urls.length * xW) / width) + 0.5;

  return (
    <ScrollControls
      horizontal
      damping={0.1}
      pages={pages} // Số trang trong slider
      distance={1} // Khoảng cách khi cuộn
    >
      <Minimap /> {/* Hiển thị minimap */}
      <Scroll>
        {urls.map((url, i) => (
          <Item
            key={i}
            index={i}
            position={[i * xW - width / 2 + w / 2, 0, 0]} // Vị trí của ảnh trong slider
            scale={[w, h, 1]} // Kích thước ảnh
            url={url}
          />
        ))}
      </Scroll>
    </ScrollControls>
  );
}

// 🧭 MINIMAP
// Hiển thị minimap giúp người dùng theo dõi vị trí cuộn
function Minimap() {
  const ref = useRef(); // Tham chiếu cho group chứa minimap
  const scroll = useScroll(); // Dùng hook useScroll để lấy thông tin cuộn
  const { urls } = useSnapshot(state); // Lấy các ảnh từ state toàn cục
  const { height } = useThree((state) => state.viewport); // Lấy chiều cao của canvas

  useFrame((_, delta) => {
    // Cập nhật các chỉ báo trong minimap theo trạng thái cuộn
    ref.current.children.forEach((child, index) => {
      const y = scroll.curve(
        index / urls.length - 1.5 / urls.length,
        4 / urls.length
      );
      easing.damp(child.scale, "y", 0.15 + y / 6, 0.15, delta); // Chuyển động mượt mà cho scale
    });
  });

  return (
    <group ref={ref} renderOrder={1}>
      {/* Đảm bảo Minimap render trước */}
      {urls.map((_, i) => (
        <line
          key={i}
          geometry={geometry}
          material={material}
          position={[i * 0.06 - urls.length * 0.03, -height / 2 + 0.6, 0]} // Tạo các line chỉ dẫn trong minimap
          renderOrder={1} // Đảm bảo line chỉ dẫn của Minimap luôn được render trước
        />
      ))}
    </group>
  );
}

// 🧱 INDIVIDUAL IMAGE ITEM
// Thành phần đại diện cho một ảnh trong slider
function Item({ index, position, scale, url }) {
  const ref = useRef(); // Tham chiếu cho Image
  const scroll = useScroll(); // Dùng hook useScroll để lấy thông tin cuộn
  const { clicked, urls } = useSnapshot(state); // Lấy các ảnh và trạng thái clicked từ state
  const [hovered, hover] = useState(false); // Trạng thái hover khi di chuột vào ảnh
  const { width } = useThree((s) => s.viewport); // Lấy kích thước của canvas

  const click = () => {
    // Lưu vị trí cuộn khi người dùng nhấp vào ảnh
    state.lastScrollPosition = scroll.offset;
    state.clicked = index; // Đánh dấu ảnh được chọn
    state.clickedPosition = position; // Lưu vị trí của ảnh được chọn
  };

  useFrame((_, delta) => {
    // Cập nhật chuyển động của ảnh theo cuộn
    const y = scroll.curve(
      index / urls.length - 1.5 / urls.length,
      4 / urls.length
    );
    const scrollOffsetX = scroll.offset * width;

    easing.damp(
      ref.current.position,
      "x",
      position[0] + scrollOffsetX,
      0.15,
      delta
    );
    easing.damp(ref.current.position, "y", position[1], 0.15, delta);

    const offsetY = y * 0.1;
    easing.damp3(ref.current.scale, [scale[0], 8 + offsetY, 1], 0.15, delta);

    // Điều chỉnh grayscale và màu sắc của ảnh khi hover
    easing.damp(
      ref.current.material,
      "grayscale",
      hovered ? 0 : Math.max(0, 1 - y),
      0.15,
      delta
    );
    easing.dampC(
      ref.current.material.color,
      hovered ? "white" : "#aaa",
      hovered ? 0.3 : 0.15,
      delta
    );
  });

  return (
    <Image
      ref={ref}
      position={position}
      scale={scale}
      url={url}
      onClick={click} // Sự kiện click vào ảnh
      onPointerOver={() => hover(true)} // Khi chuột hover vào ảnh
      onPointerOut={() => hover(false)} // Khi chuột rời khỏi ảnh
    />
  );
}

// 🖼️ IMAGE FULLSCREEN VIEWER
// Thành phần chế độ fullscreen để xem ảnh
function ImageFullscreen() {
  const { clicked, urls } = useSnapshot(state); // Lấy trạng thái clicked và urls từ state
  const ref = useRef(); // Tham chiếu cho Image
  const { width, height } = useThree((s) => s.viewport); // Lấy kích thước của canvas

  const handleClose = () => {
    state.clicked = null; // Đóng chế độ fullscreen khi click vào ảnh
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Đóng fullscreen khi click ngoài ảnh
      if (
        clicked !== null &&
        ref.current &&
        !event.target.closest(".fullscreenImage")
      ) {
        state.clicked = null;
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [clicked]);

  useFrame((_, delta) => {
    // Cập nhật vị trí và scale của ảnh trong chế độ fullscreen
    const center = [0, 0, 0];
    easing.damp3(ref.current.position, center, 0.15, delta);

    const aspectRatio = width / height;
    const targetScale =
      aspectRatio > 1
        ? Math.min(width * 0.6, height * 0.8)
        : Math.min(width * 0.8, height * 0.6);

    const minScale = Math.max(targetScale, 4);
    easing.damp3(ref.current.scale, [minScale, minScale, 1], 0.15, delta);
  });

  const position = state.clickedPosition || [0, 0, 0]; // Sử dụng vị trí đã lưu khi click vào ảnh

  return (
    <Image
      ref={ref}
      url={urls[clicked]} // Hiển thị ảnh được chọn
      position={position} // Vị trí của ảnh trong chế độ fullscreen
      scale={[5, 5, 1]} // Kích thước của ảnh
      className="fullscreenImage"
      onClick={handleClose} // Sự kiện click để thoát fullscreen
    />
  );
}

export default ProductImages;
