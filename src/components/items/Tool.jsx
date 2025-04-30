import { Category } from "./index";

function Tool() {
  return (
    <div
      className="fixed left-0 top-0 w-full z-50 px-0 mx-0 h-10 flex justify-between items-center 
                bg-gray-800 shadow-md rounded-b-md text-white"
    >
      {/* Hiển thị danh mục */}
      <Category />

      {/* Nhà bán tiêu biểu */}

      {/* Các tính năng khác */}
    </div>
  );
}

export default Tool;
