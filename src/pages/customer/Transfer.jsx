import { cva } from 'class-variance-authority';

const badgeVariants = cva(
    'py-1 px-3 rounded-full text-xs',
    {
      variants: {
        status: {
          inDelivery: 'bg-blue-200 text-blue-600',
          completed: 'bg-green-200 text-green-600',
        },
      },
      defaultVariants: {
        status: 'inDelivery',
      },
    }

);
const tableCellVariants   = cva('py-3 px-6', {
  variants: {
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: {
    align: 'left',
  },
});

function Transfer() {
  return (
    <div>
      <h2 className="section-title">Lịch sử giao dịch</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
              <th className={tableCellVariants({ align: 'left' })}>Mã đơn hàng</th>
              <th className={tableCellVariants({ align: 'left' })}>Ngày</th>
              <th className={tableCellVariants({ align: 'left' })}>Sản phẩm</th>
              <th className={tableCellVariants({ align: 'right' })}>Tổng tiền</th>
              <th className={tableCellVariants({ align: 'center' })}>Trạng thái</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className={tableCellVariants({ align: 'left' })}>#ORD-001</td>
              <td className={tableCellVariants({ align: 'left' })}>15/10/2023</td>
              <td className={tableCellVariants({ align: 'left' })}>Laptop Dell XPS 13</td>
              <td className={tableCellVariants({ align: 'right' })}>25.000.000 đ</td>
              <td className={tableCellVariants({ align: 'center' })}>
                <span className={badgeVariants({ status: 'completed' })}>
                  Hoàn thành
                </span>
              </td>
            </tr>
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className={tableCellVariants({ align: 'left' })}>#ORD-002</td>
              <td className={tableCellVariants({ align: 'left' })}>10/09/2023</td>
              <td className={tableCellVariants({ align: 'left' })}>Điện thoại iPhone 15</td>
              <td className={tableCellVariants({ align: 'right' })}>22.000.000 đ</td>
              <td className={tableCellVariants({ align: 'center' })}>
                <span className={badgeVariants({ status: 'completed' })}>
                  Hoàn thành
                </span>
              </td>
            </tr>
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className={tableCellVariants({ align: 'left' })}>#ORD-003</td>
              <td className={tableCellVariants({ align: 'left' })}>05/08/2023</td>
              <td className={tableCellVariants({ align: 'left' })}>Tai nghe Sony WH-1000XM5</td>
              <td className={tableCellVariants({ align: 'right' })}>8.500.000 đ</td>
              <td className={tableCellVariants({ align: 'center' })}>
                <span className={badgeVariants({ status: 'inDelivery' })}>
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
