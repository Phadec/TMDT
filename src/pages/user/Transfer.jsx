function Transfer() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Lịch sử giao dịch</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Mã đơn hàng</th>
              <th className="py-3 px-6 text-left">Ngày</th>
              <th className="py-3 px-6 text-left">Sản phẩm</th>
              <th className="py-3 px-6 text-right">Tổng tiền</th>
              <th className="py-3 px-6 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-6 text-left">#ORD-001</td>
              <td className="py-3 px-6 text-left">15/10/2023</td>
              <td className="py-3 px-6 text-left">Laptop Dell XPS 13</td>
              <td className="py-3 px-6 text-right">25.000.000 đ</td>
              <td className="py-3 px-6 text-center">
                <span className="bg-green-200 text-green-600 py-1 px-3 rounded-full text-xs">
                  Hoàn thành
                </span>
              </td>
            </tr>
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-6 text-left">#ORD-002</td>
              <td className="py-3 px-6 text-left">10/09/2023</td>
              <td className="py-3 px-6 text-left">Điện thoại iPhone 15</td>
              <td className="py-3 px-6 text-right">22.000.000 đ</td>
              <td className="py-3 px-6 text-center">
                <span className="bg-green-200 text-green-600 py-1 px-3 rounded-full text-xs">
                  Hoàn thành
                </span>
              </td>
            </tr>
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-6 text-left">#ORD-003</td>
              <td className="py-3 px-6 text-left">05/08/2023</td>
              <td className="py-3 px-6 text-left">Tai nghe Sony WH-1000XM5</td>
              <td className="py-3 px-6 text-right">8.500.000 đ</td>
              <td className="py-3 px-6 text-center">
                <span className="bg-blue-200 text-blue-600 py-1 px-3 rounded-full text-xs">
                  Đang giao
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Transfer;
