import { useState } from "react";

function Category() {
  const [expandedCategories, setExpandedCategories] = useState([]);

  const toggleCategory = (categoryId) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  // Dữ liệu danh mục mẫu
  const categories = [
    {
      id: 1,
      name: "Điện tử & Công nghệ",
      icon: "💻",
      subcategories: [
        { id: 101, name: "Điện thoại & Phụ kiện" },
        { id: 102, name: "Máy tính & Laptop" },
        { id: 103, name: "Thiết bị âm thanh" },
        { id: 104, name: "Máy ảnh & Quay phim" }
      ]
    },
    {
      id: 2,
      name: "Thời trang",
      icon: "👕",
      subcategories: [
        { id: 201, name: "Thời trang nam" },
        { id: 202, name: "Thời trang nữ" },
        { id: 203, name: "Đồng hồ & Trang sức" },
        { id: 204, name: "Giày dép" }
      ]
    },
    {
      id: 3,
      name: "Nhà cửa & Đời sống",
      icon: "🏠",
      subcategories: [
        { id: 301, name: "Đồ nội thất" },
        { id: 302, name: "Đồ gia dụng" },
        { id: 303, name: "Trang trí nhà cửa" },
        { id: 304, name: "Dụng cụ nhà bếp" }
      ]
    },
    {
      id: 4,
      name: "Sức khỏe & Làm đẹp",
      icon: "💄",
      subcategories: [
        { id: 401, name: "Mỹ phẩm" },
        { id: 402, name: "Chăm sóc da" },
        { id: 403, name: "Chăm sóc tóc" },
        { id: 404, name: "Thực phẩm chức năng" }
      ]
    },
    {
      id: 5,
      name: "Thể thao & Du lịch",
      icon: "🏀",
      subcategories: [
        { id: 501, name: "Dụng cụ thể thao" },
        { id: 502, name: "Quần áo thể thao" },
        { id: 503, name: "Đồ dùng du lịch" },
        { id: 504, name: "Thiết bị dã ngoại" }
      ]
    }
  ];

  return (
    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
      {categories.map((category) => (
        <div key={category.id} className="mb-2">
          <div 
            className="flex items-center justify-between p-2 bg-white rounded-md hover:bg-indigo-50 cursor-pointer transition-colors duration-200"
            onClick={() => toggleCategory(category.id)}
          >
            <div className="flex items-center">
              <span className="mr-2 text-lg">{category.icon}</span>
              <span className="font-medium text-gray-800">{category.name}</span>
            </div>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${expandedCategories.includes(category.id) ? 'transform rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {expandedCategories.includes(category.id) && (
            <div className="ml-8 mt-1 space-y-1">
              {category.subcategories.map((subcategory) => (
                <div 
                  key={subcategory.id}
                  className="p-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-md cursor-pointer transition-colors duration-200"
                >
                  {subcategory.name}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Category;