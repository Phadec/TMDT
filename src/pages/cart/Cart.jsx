import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Cart() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white text-gray-800 mx-20 my-10">
      {/* Thanh thông báo */}
      <div className="bg-indigo-100 text-indigo-800 py-2 px-4 text-center text-sm font-medium rounded-lg">
        🔥 Giảm giá 10% cho đơn hàng trên 500K! Mua ngay!
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
        {/* Bộ lọc */}
        <div className="flex items-center justify-between bg-white shadow-md rounded-2xl p-4">
          <div className="space-x-4">
            <button className="bg-indigo-200 text-indigo-900 rounded-full px-4 py-1 text-sm">
              Tất cả
            </button>
            <button className="hover:bg-indigo-100 px-4 py-1 rounded-full text-sm">
              Đã lưu
            </button>
          </div>
          <div>
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              className="border border-gray-300 rounded-xl px-3 py-1 text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Tính năng nhanh */}
        <div className="flex justify-between items-center px-2">
          <div className="text-sm">
            <input type="checkbox" className="mr-2" /> Chọn tất cả
          </div>
          <button className="text-red-500 text-sm">Xóa sản phẩm đã chọn</button>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(
            (item) => (
              <div
                key={item}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
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
                  <p className="text-sm text-gray-500">
                    Mô tả ngắn gọn sản phẩm.
                  </p>
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
      </div>
    </div>
  );
}

export default Cart;
