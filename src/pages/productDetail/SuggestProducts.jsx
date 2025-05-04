import React from "react";

// Dữ liệu sản phẩm giả lập
const products = [
  {
    id: 1,
    name: "Product 1",
    description: "This is the description for product 1.",
    price: "$10.00",
    image: "https://placehold.co/150",
  },
  {
    id: 2,
    name: "Product 2",
    description: "This is the description for product 2.",
    price: "$15.00",
    image: "https://placehold.co/150",
  },
  {
    id: 3,
    name: "Product 3",
    description: "This is the description for product 3.",
    price: "$20.00",
    image: "https://placehold.co/150",
  },
  {
    id: 4,
    name: "Product 1",
    description: "This is the description for product 1.",
    price: "$10.00",
    image: "https://placehold.co/150",
  },
  {
    id: 5,
    name: "Product 2",
    description: "This is the description for product 2.",
    price: "$15.00",
    image: "https://placehold.co/150",
  },
  {
    id: 6,
    name: "Product 3",
    description: "This is the description for product 3.",
    price: "$20.00",
    image: "https://placehold.co/150",
  },
];

function SuggestProducts() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Sản phẩm liên quan</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover rounded-md"
            />
            <div className="mt-4">
              <h3 className="text-xl font-semibold">{product.name}</h3>
              <p className="text-gray-600 mt-2">{product.description}</p>
              <p className="text-lg font-bold mt-3">{product.price}</p>
              <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all">
                Thêm vào giỏ
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SuggestProducts;