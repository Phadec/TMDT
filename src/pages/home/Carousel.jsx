import * as THREE from "three";
import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import {
  Image,
  Environment,
  useTexture,
} from "@react-three/drei";
import { easing } from "maath";
import { useNavigate } from "react-router-dom";
import { PUBLIC_URL } from "~/path";

import { getImageFromAssets, getSafeImageUrl, getDemoImageUrl } from "~/utils/imageUtils";
import { apiServices } from "~/api";
import { getTopRecentlyViewed, addToRecentlyViewed, recentlyViewedIdsToString } from "~/utils/recentlyViewedUtils";
import { useProxyImageWithFallback } from "~/hooks/useImageWithFallback";

class BentPlaneGeometry extends THREE.PlaneGeometry {
  constructor(radius, ...args) {
    super(...args);
    let p = this.parameters;
    let hw = p.width * 0.5;
    let a = new THREE.Vector2(-hw, 0);
    let b = new THREE.Vector2(0, radius);
    let c = new THREE.Vector2(hw, 0);
    let ab = new THREE.Vector2().subVectors(a, b);
    let bc = new THREE.Vector2().subVectors(b, c);
    let ac = new THREE.Vector2().subVectors(a, c);
    let r =
      (ab.length() * bc.length() * ac.length()) / (2 * Math.abs(ab.cross(ac)));
    let center = new THREE.Vector2(0, radius - r);
    let baseV = new THREE.Vector2().subVectors(a, center);
    let baseAngle = baseV.angle() - Math.PI * 0.5;
    let arc = baseAngle * 2;
    let uv = this.attributes.uv;
    let pos = this.attributes.position;
    let mainV = new THREE.Vector2();
    for (let i = 0; i < uv.count; i++) {
      let uvRatio = 1 - uv.getX(i);
      let y = pos.getY(i);
      mainV.copy(c).rotateAround(center, arc * uvRatio);
      pos.setXYZ(i, mainV.x, y, -mainV.y);
    }
    pos.needsUpdate = true;
  }
}

class MeshSineMaterial extends THREE.MeshBasicMaterial {
  constructor(parameters = {}) {
    super(parameters);
    this.setValues(parameters);
    this.time = { value: 0 };
  }
  onBeforeCompile(shader) {
    shader.uniforms.time = this.time;
    shader.vertexShader = `
        uniform float time;
        ${shader.vertexShader}
      `;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `vec3 transformed = vec3(position.x, position.y + sin(time + uv.x * PI * 4.0) / 4.0, position.z);`
    );
  }
}

extend({ MeshSineMaterial, BentPlaneGeometry });

function Carousel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu sản phẩm từ API getBanner
  useEffect(() => {
    const fetchCarouselData = async () => {
      try {
        setLoading(true);
        
        // Lấy recently viewed từ localStorage và chuyển thành string
        const recentlyViewedIds = getTopRecentlyViewed(8);
        const recentlyViewedString = recentlyViewedIdsToString(recentlyViewedIds);
        
        // Gọi API getBanner
        const bannerProducts = await apiServices.products.getBannerProducts(recentlyViewedString);
        
        setProducts(bannerProducts);
      } catch (error) {
        console.error('Error loading carousel data:', error);
        setProducts([]); // Fallback về empty array
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselData();
  }, []);

  if (loading) {
    return (
      <div style={{ height: "100vh", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh" }}>
      <Canvas camera={{ position: [0, 0, 100], fov: 15 }}>
        <fog attach="fog" args={["#a79", 8.5, 12]} />
          <Rig rotation={[0, 0, 0.15]}>
            <Cards products={products} />
          </Rig>
          <Banner position={[0, -0.15, 0]} />
        <Environment preset="dawn" background blur={0.5} />
      </Canvas>
      
      {/* CSS cho loading spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function Rig(props) {
  const ref = useRef();
  const speed = 0.2; // Tốc độ quay

  useFrame((state, delta) => {
    // Quay tự động quanh trục Y
    ref.current.rotation.y += delta * speed;

    // Camera vẫn theo chuột
    easing.damp3(
      state.camera.position,
      [-state.pointer.x * 2, state.pointer.y + 1.5, 10],
      0.3,
      delta
    );
    state.camera.lookAt(0, 0, 0);
  });

  return <group ref={ref} {...props} />;
}


/**
 * Cards component renders a circular arrangement of product cards
 * Each card is clickable and navigates to its respective product detail page
 * The productId parameter is passed to each Card to determine which product page to navigate to
 */
function Cards({ products = [], radius = 1.4, count = 8 }) {
  // Nếu có dữ liệu từ API, sử dụng products
  if (products.length > 0) {
    return products.map((product, i) => {
      // Sử dụng getSafeImageUrl để proxy ảnh từ external URLs
      const originalImageUrl = product.imageReview || product.images?.[0];
      const imageUrl = getSafeImageUrl(
        originalImageUrl,
        getDemoImageUrl() // Sử dụng demo.jpg làm fallback chính
      );
      
      // Debug logging (có thể bỏ comment khi cần debug)
      // console.log(`Product ${product.id}: Original URL: ${originalImageUrl} -> Proxied URL: ${imageUrl}`);
      
      return (
        <Card
          key={product.id || i}
          url={imageUrl}
          productId={product.id}
          productName={product.name || product.productName}
          productPrice={product.price}
          position={[
            Math.sin((i / products.length) * Math.PI * 2) * radius,
            0,
            Math.cos((i / products.length) * Math.PI * 2) * radius,
          ]}
          rotation={[0, Math.PI + (i / products.length) * Math.PI * 2, 0]}
        />
      );
    });
  }
  
  // Fallback về static images nếu không có products
  return Array.from({ length: count }, (_, i) => {
    const fallbackImageUrl = getImageFromAssets(`img${Math.floor(i % 10) + 1}_.jpg`, "home/carousel");
    
    return (
      <Card
        key={i}
        url={fallbackImageUrl}
        productId={i + 1}
        position={[
          Math.sin((i / count) * Math.PI * 2) * radius,
          0,
          Math.cos((i / count) * Math.PI * 2) * radius,
        ]}
        rotation={[0, Math.PI + (i / count) * Math.PI * 2, 0]}
      />
    );
  });
}

function Card({ url, productId = 1, productName, productPrice, ...props }) {
  const navigate = useNavigate();
  const ref = useRef();
  const [hovered, hover] = useState(false);
  
  // Sử dụng custom hook để tự động fallback về demo.jpg khi ImageProxy lỗi
  const { src: displayUrl, isLoading, hasError, isUsingFallback } = useProxyImageWithFallback(url);
  
  const pointerOver = (e) => (e.stopPropagation(), hover(true));
  const pointerOut = () => hover(false);
  const handleClick = (e) => {
    e.stopPropagation();
    
    // Thêm vào recently viewed khi click
    addToRecentlyViewed(productId);
    
    // Navigate to product detail page with the product ID
    const productDetailPath = PUBLIC_URL.PRODUCT_DETIAL.replace(':id', productId);
    navigate(productDetailPath);
  };
  
  useFrame((state, delta) => {
    // Enhanced hover effect to indicate clickability
    easing.damp3(ref.current.scale, hovered ? 1.25 : 1, 0.1, delta);
    easing.damp(
      ref.current.material,
      "radius",
      hovered ? 0.35 : 0.1,
      0.2,
      delta
    );
    easing.damp(ref.current.material, "zoom", hovered ? 1 : 1.5, 0.2, delta);
    
    // Add a subtle pulsing effect when hovered to indicate clickability
    if (hovered) {
      const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.03;
      ref.current.scale.x = 1.25 + pulse;
      ref.current.scale.y = 1.25 + pulse;
      ref.current.scale.z = 1.25 + pulse;
    }
  });
  
  return (
    <group>
      <Image
        ref={ref}
        url={displayUrl}
        transparent
        side={THREE.DoubleSide}
        onPointerOver={pointerOver}
        onPointerOut={pointerOut}
        onClick={handleClick}
        {...props}
        // Change cursor to pointer when hovering to indicate clickability
        onPointerEnter={(e) => {
          document.body.style.cursor = 'pointer';
          pointerOver(e);
        }}
        onPointerLeave={(e) => {
          document.body.style.cursor = 'auto';
          pointerOut(e);
        }}
      >
        <bentPlaneGeometry args={[0.1, 1, 1, 20, 20]} />
      </Image>
      
      {/* Debug indicator - có thể bỏ comment khi cần debug */}
      {/* {isUsingFallback && (
        <Html position={[0, -0.7, 0]}>
          <div style={{ 
            color: 'red', 
            fontSize: '10px', 
            background: 'white', 
            padding: '2px', 
            borderRadius: '2px' 
          }}>
            Using Demo
          </div>
        </Html>
      )} */}
    </group>
  );
}

function Banner(props) {
  const ref = useRef();
  const texture = useTexture("/assets/work_.png");
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return (
    <mesh ref={ref} {...props}>
      <cylinderGeometry args={[1.6, 1.6, 0.14, 128, 16, true]} />
      <meshSineMaterial
        map={texture}
        map-anisotropy={16}
        map-repeat={[30, 1]}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

export default Carousel;
