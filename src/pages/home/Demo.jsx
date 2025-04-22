import { getImageFromAssets } from "~/utils/imageUtils";

const products = [
  {
    name: "Gian hàng thông minh",
    description: "Tối ưu hóa trải nghiệm mua bán bằng AI.",
    image: "market.jpg",
  },
  {
    name: "Đa dạng các loại sản phẩm",
    description: "Đáp ứng mọi nhu cầu của bạn.",
    image:  "demo.jpg",
  },
  {
    name: "Chợ livestream",
    description: "Bán hàng trực tuyến theo phong cách mới.",
    image:  "livestream.jpg",
  },
  {
    name: "Hỗ trợ 24/7",
    description: "Sử dụng chatbot AI để hỗ trợ khách hàng.",
    image:  "service.jpg",
  },
  {
    name: "Đối tác vận chuyển",
    description: "Nhanh chóng, an toàn và giá cả hợp lý.",
    image:  "delivery.jpg",
  },
  {
    name: "Nhiều chính sách ưu đãi",
    description: "Giảm giá, khuyến mãi và nhiều ưu đãi hấp dẫn.",
    image:  "sale.jpg",
  },
];

function Demo() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16 px-6 font-sans flex flex-col">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center mb-12">
        <div className="flex flex-col gap-4">
          <h1 className="text-5xl font-bold mb-6 text-gray-800 leading-tight">
            Một số sản phẩm và dịch vụ phổ biến của chúng tôi
          </h1>
          <p className="text-lg text-gray-500 mb-8">
            Khám phá những sản phẩm chất lượng và ưu đãi hấp dẫn từ Chợ Việt.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {products.map((product, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl overflow-hidden shadow-xl transform transition-all duration-500 hover:-translate-y-2 hover:scale-[1.03] hover:rotate-1"
          >
            <img
              src={getImageFromAssets(product.image, "home/demo")}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {product.name}
              </h3>
              <p className="text-gray-500">{product.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Demo;
