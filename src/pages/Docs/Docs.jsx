import { useState } from "react";
import { Search, ChatWithAI, Tool, NotiSale } from "~/components/items";

const ComponentCard = ({ title, description, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg shadow-md mb-6 overflow-hidden transition-all duration-300">
      <div 
        className="p-4 cursor-pointer bg-white hover:bg-gray-50 flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-gray-600 text-sm mt-1">{description}</p>
        </div>
        <div className="text-blue-500">
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
      {isOpen && (
        <div className="p-6 border-t bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );
};

const Docs = () => {
  return (
    <div className="px-20">
      <div className="py-6">
        <h1 className="text-3xl font-bold mb-4">Component Documentation</h1>
        <p className="text-gray-600 mb-8">
          This page showcases the various components used in the application.
          Click on a card to view the component.
        </p>

        <div className="grid grid-cols-1 gap-6">
          <ComponentCard
            title="Search Component"
            description="Component tìm kiếm với AI, được sử dụng trong header của trang web."
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg">
              <Search />
            </div>
          </ComponentCard>

          <ComponentCard
            title="NotiSale Component"
            description="Component hiển thị thông báo khuyến mãi với hiệu ứng chuyển động."
          >
            <div className="p-4 bg-white rounded-lg shadow-md">
              <NotiSale />
            </div>
          </ComponentCard>

          <ComponentCard
            title="Tool Component"
            description="Component hiển thị các công cụ bên phải màn hình, bao gồm danh mục sản phẩm, nhà bán tiêu biểu và các tính năng khác."
          >
            <div className="p-4 bg-white rounded-lg shadow-md relative h-[400px]">
              <p className="text-center text-gray-500 mb-4">
                Tool component is displayed on the right side of the screen
              </p>
              <div className="absolute right-0 top-0">
                <Tool />
              </div>
            </div>
          </ComponentCard>

          <ComponentCard
            title="ChatWithAI Component"
            description="Component hiển thị giao diện chat với trợ lý AI, hỗ trợ người dùng tương tác và nhận câu trả lời."
          >
            <div className="p-4 bg-white rounded-lg shadow-md">
              <p className="text-center text-gray-500 mb-4">
                ChatWithAI component is displayed as a chat interface
              </p>
              <div style={{ height: "400px" }}>
                <ChatWithAI title="Trò chuyện với trợ lý" />
              </div>
            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
};

export default Docs;