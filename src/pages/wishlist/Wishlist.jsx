import { HeartIcon } from "@heroicons/react/24/solid";

import { NotiSale, CardGridProduct } from "~/components/items";

function Wishlist() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white text-gray-800 mx-20 my-10">
      {/* Thanh thông báo */}
      <NotiSale />

      <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
        {/* Danh sách sản phẩm */}
        <CardGridProduct icon={<HeartIcon className="h-6 w-6 text-red-500" />} />
      </div>
    </div>
  );
}

export default Wishlist;
