// ⚙️ IMPORT
import * as THREE from "three"; // Thư viện 3D để xử lý các đối tượng hình học và vật liệu
import React, { useRef, useState, useMemo, useEffect } from "react"; // React hooks để quản lý state và tham chiếu
import { Canvas, useFrame, useThree } from "@react-three/fiber"; // Các hook và component từ react-three/fiber để vẽ đồ họa 3D trong React
import { Image, ScrollControls, Scroll, useScroll, Html } from "@react-three/drei"; // Các component hỗ trợ từ Drei cho Scroll và Image
import { proxy, useSnapshot } from "valtio"; // Quản lý state toàn cục với valtio
import { easing } from "maath"; // Các hàm hỗ trợ easing chuyển động
import { Suspense } from "react"; // Để lazy load các component trong React
import PropTypes from "prop-types";

import { getImageFromAssets, getProxiedImageUrl } from "~/utils/imageUtils"; // Hàm tiện ích để lấy ảnh từ thư mục assets

// 📦 GLOBAL STATE
// Khai báo một state toàn cục với valtio để theo dõi trạng thái như ảnh được chọn, các url ảnh, và vị trí cuộn
const state = proxy({
  clicked: null, // Trạng thái của ảnh được chọn
  urls: [], // Mảng chứa các URL ảnh
  fallbackUrls: [], // Mảng chứa các URL ảnh fallback khi proxy fail
  validProxyUrls: [], // Mảng chứa các URL proxy hợp lệ
  isCheckingProxy: true, // Flag để kiểm tra xem có đang check proxy không
  hasValidProxy: false, // Flag để biết có proxy hợp lệ không
  isDragging: false, // Flag để theo dõi trạng thái kéo
  dragStartX: 0, // Vị trí X khi bắt đầu kéo
  dragCurrentX: 0, // Vị trí X hiện tại khi kéo
  scrollOffset: 0, // Offset cuộn hiện tại
  targetScrollOffset: 0, // Target offset cuộn
});

// 🔳 LINE MATERIAL FOR MINIMAP
// Khởi tạo vật liệu và hình học cho minimap (một dạng chỉ dẫn cuộn ảnh)
const material = new THREE.LineBasicMaterial({ color: "white" });
const geometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(0, -0.5, 0),
  new THREE.Vector3(0, 0.5, 0),
]);

// 🔍 FUNCTION TO CHECK PROXY VALIDITY
// Hàm kiểm tra tính hợp lệ của các URL proxy
const checkProxyUrls = async (proxyUrls) => {
  const validUrls = [];
  const checkPromises = proxyUrls.map(async (url, index) => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      
      const timeout = setTimeout(() => {
        resolve({ url, index, isValid: false });
      }, 2000);
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve({ url, index, isValid: true });
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        resolve({ url, index, isValid: false });
      };
      
      img.src = url;
    });
  });

  const results = await Promise.all(checkPromises);
  results.forEach(result => {
    if (result.isValid) {
      validUrls.push(result.url);
    }
  });

  return validUrls;
};

// 🖼️ MAIN COMPONENT
// Thành phần chính của ứng dụng, nơi hiển thị Canvas với các ảnh 3D
function ProductImages({imageUrls}) {
  // Tạo fallback URLs trước
  const fallbackUrls = useMemo(
    () => {
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
        (u) => getImageFromAssets(`${u}.jpg`, "productDetail")
      );
    },
    []
  );

  const proxyUrls = useMemo(
    () => {
      // Nếu có imageUrls được truyền vào, tạo proxy URLs
      if (imageUrls && imageUrls.length > 0) {
        return imageUrls.map(url => getProxiedImageUrl(url));
      }
      return [];
    },
    [imageUrls]
  );

  useEffect(() => {
    const initializeImages = async () => {
      state.fallbackUrls = fallbackUrls;
      
      // Khởi tạo scroll state
      state.scrollOffset = 0;
      state.targetScrollOffset = 0;
      state.isDragging = false;
      
      if (proxyUrls.length > 0) {
        state.isCheckingProxy = true;
        
        // Kiểm tra các proxy URLs
        const validProxyUrls = await checkProxyUrls(proxyUrls);
        
        state.validProxyUrls = validProxyUrls;
        state.hasValidProxy = validProxyUrls.length > 0;
        
        // Quyết định sử dụng proxy hợp lệ hoặc fallback
        if (validProxyUrls.length > 0) {
          state.urls = validProxyUrls;
        } else {
          state.urls = fallbackUrls;
        }
        
        state.isCheckingProxy = false;
      } else {
        // Không có proxy URLs, sử dụng fallback
        state.urls = fallbackUrls;
        state.hasValidProxy = false;
        state.isCheckingProxy = false;
      }
    };

    initializeImages();
  }, [proxyUrls, fallbackUrls]);

  const { isCheckingProxy } = useSnapshot(state);

  if (isCheckingProxy) {
    return (
      <div className="rounded-md lg:ml-8 h-96 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra ảnh...</p>
        </div>
      </div>
    );
  }

  return (
    <Canvas
      className="rounded-md lg:ml-8"
      gl={{ antialias: false }}
      dpr={[1, 1.5]} // Thiết lập độ phân giải canvas
      onPointerMissed={() => (state.clicked = null)} // Reset khi nhấp ngoài ảnh
      onPointerUp={() => (state.isDragging = false)} // Dừng kéo khi thả chuột
      onPointerLeave={() => (state.isDragging = false)} // Dừng kéo khi chuột rời khỏi canvas
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
// Thành phần cho slider ảnh với cuộn ngang và hỗ trợ drag-to-scroll
function ImageSlider() {
  const { urls, scrollOffset, targetScrollOffset } = useSnapshot(state); // Lấy các ảnh và vị trí cuộn từ state toàn cục
  const { width } = useThree((s) => s.viewport); // Lấy kích thước của canvas
  const w = 8,
    h = 8,
    gap = 0.5;
  const xW = w + gap;

  // Tính toán giới hạn cuộn
  const maxScroll = Math.max(0, (urls.length * xW) - width);

  useFrame((_, delta) => {
    // Smooth scroll animation
    easing.damp(state, "scrollOffset", state.targetScrollOffset, 0.15, delta);
  });

  return (
    <group>
      <DragHandler maxScroll={maxScroll} width={width} />
      <Minimap /> {/* Hiển thị minimap */}
      {urls.map((url, i) => (
        <Item
          key={i}
          index={i}
          position={[i * xW - width / 2 + w / 2, 0, 0]} // Vị trí của ảnh trong slider
          scale={[w, h, 1]} // Kích thước ảnh
          url={url}
        />
      ))}
    </group>
  );
}

// 🖱️ DRAG HANDLER COMPONENT
// Component xử lý việc kéo để cuộn ảnh
function DragHandler({ maxScroll, width }) {
  const { viewport } = useThree();
  const dragStartOffset = useRef(0);
  
  const handlePointerDown = (event) => {
    state.isDragging = true;
    state.dragStartX = event.point.x;
    dragStartOffset.current = state.scrollOffset;
    event.stopPropagation();
  };

  const handlePointerMove = (event) => {
    if (!state.isDragging) return;
    
    const dragDistance = state.dragStartX - event.point.x;
    const scrollSensitivity = 3; // Độ nhạy của cuộn
    
    // Tính toán offset mới dựa trên vị trí bắt đầu kéo
    const newOffset = Math.max(0, Math.min(maxScroll, dragStartOffset.current + dragDistance * scrollSensitivity));
    state.targetScrollOffset = newOffset;
    
    event.stopPropagation();
  };

  const handlePointerUp = (event) => {
    state.isDragging = false;
    event.stopPropagation();
  };

  return (
    <mesh
      position={[0, 0, -1]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <planeGeometry args={[viewport.width, viewport.height]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

// 🧭 MINIMAP
// Hiển thị minimap giúp người dùng theo dõi vị trí cuộn
function Minimap() {
  const ref = useRef(); // Tham chiếu cho group chứa minimap
  const { urls, scrollOffset } = useSnapshot(state); // Lấy các ảnh từ state toàn cục
  const { height, width } = useThree((state) => state.viewport); // Lấy kích thước của canvas

  useFrame((_, delta) => {
    if (!ref.current) return;
    
    // Tính toán progress dựa trên scrollOffset
    const w = 8, gap = 0.5;
    const xW = w + gap;
    const maxScroll = Math.max(0, (urls.length * xW) - width);
    const progress = maxScroll > 0 ? scrollOffset / maxScroll : 0;
    
    // Cập nhật các chỉ báo trong minimap
    ref.current.children.forEach((child, index) => {
      const normalizedIndex = index / (urls.length - 1);
      const distance = Math.abs(normalizedIndex - progress);
      const scale = Math.max(0.15, 0.8 - distance * 2);
      easing.damp(child.scale, "y", scale, 0.15, delta);
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

// 🖼️ SIMPLE IMAGE COMPONENT
// Component Image đơn giản vì logic đã được xử lý ở level cao hơn
const SimpleImage = React.forwardRef(({ url, ...props }, ref) => {
  return (
    <Image
      ref={ref}
      {...props}
      url={url}
    />
  );
});

SimpleImage.displayName = 'SimpleImage';

// 🧱 INDIVIDUAL IMAGE ITEM
// Thành phần đại diện cho một ảnh trong slider
function Item({ index, position, scale, url }) {
  const ref = useRef(); // Tham chiếu cho Image
  const { clicked, urls, scrollOffset, isDragging } = useSnapshot(state); // Lấy các ảnh và trạng thái từ state
  const [hovered, hover] = useState(false); // Trạng thái hover khi di chuột vào ảnh
  const { width } = useThree((s) => s.viewport); // Lấy kích thước của canvas

  const click = (event) => {
    // Chỉ cho phép click khi không đang kéo
    if (state.isDragging) {
      event.stopPropagation();
      return;
    }
    
    // Lưu vị trí cuộn khi người dùng nhấp vào ảnh
    state.lastScrollPosition = scrollOffset;
    state.clicked = index; // Đánh dấu ảnh được chọn
    state.clickedPosition = position; // Lưu vị trí của ảnh được chọn
  };

  useFrame((_, delta) => {
    if (!ref.current) return;
    
    // Tính toán vị trí dựa trên scrollOffset
    const w = 8, gap = 0.5;
    const xW = w + gap;
    const maxScroll = Math.max(0, (urls.length * xW) - width);
    const progress = maxScroll > 0 ? scrollOffset / maxScroll : 0;
    
    // Tính toán hiệu ứng curve cho ảnh
    const normalizedIndex = index / (urls.length - 1);
    const distance = Math.abs(normalizedIndex - progress);
    const y = Math.max(0, 1 - distance * 2);

    // Cập nhật vị trí X dựa trên scrollOffset
    easing.damp(
      ref.current.position,
      "x",
      position[0] - scrollOffset,
      0.15,
      delta
    );
    easing.damp(ref.current.position, "y", position[1], 0.15, delta);

    // Hiệu ứng scale và offset Y
    const offsetY = y * 0.1;
    easing.damp3(ref.current.scale, [scale[0], 8 + offsetY, 1], 0.15, delta);

    // Điều chỉnh grayscale và màu sắc của ảnh
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
    <SimpleImage
      ref={ref}
      position={position}
      scale={scale}
      url={url}
      onClick={click} // Sự kiện click vào ảnh
      onPointerOver={() => !isDragging && hover(true)} // Khi chuột hover vào ảnh
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
    <SimpleImage
      ref={ref}
      url={urls[clicked]} // Hiển thị ảnh được chọn
      position={position} // Vị trí của ảnh trong chế độ fullscreen
      scale={[5, 5, 1]} // Kích thước của ảnh
      className="fullscreenImage"
      onClick={handleClose} // Sự kiện click để thoát fullscreen
    />
  );
}

ProductImages.propTypes = {
  imageUrls: PropTypes.arrayOf(PropTypes.string),
};

export default ProductImages;
