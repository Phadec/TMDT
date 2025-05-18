import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function CardGridProduct({ icon }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(
        (item) => (
          <div
            key={item}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow relative"
          >
            {/* Icon góc phải trên - chỉ hiển thị khi có icon */}
            {icon && (
              <div className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-lg z-10">
                {icon}
              </div>
            )}

            <div className="relative h-40">
              <Canvas camera={{ position: [0, 0, 3] }}>
                <OrbitControls enableZoom={false} />
                <ambientLight intensity={0.5} />
                <mesh>
                  <boxGeometry args={[1, 1, 1]} />
                  <meshStandardMaterial color={"#6366F1"} />
                </mesh>
              </Canvas>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-lg">Sản phẩm #{item}</h3>
              <p className="text-sm text-gray-500">Mô tả ngắn gọn sản phẩm.</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-indigo-600 font-bold">250.000₫</span>
                <button className="bg-indigo-500 text-white px-3 py-1 rounded-lg text-sm">
                  Mua
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default CardGridProduct;
