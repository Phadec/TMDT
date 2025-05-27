import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Save, X, ChevronRight, ChevronDown } from "lucide-react";

function CategoriesManagement() {
  // State cho danh sách danh mục
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    parentId: null,
    icon: "",
    isActive: true
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

  // Giả lập việc lấy dữ liệu từ API
  useEffect(() => {
    // Trong thực tế, đây sẽ là một API call
    setTimeout(() => {
      const dummyCategories = [
        {
          id: 1,
          name: "Điện tử",
          description: "Các sản phẩm điện tử, công nghệ",
          parentId: null,
          icon: "laptop",
          isActive: true,
          postCount: 120,
          createdAt: "2023-01-15T08:30:00.000Z",
          updatedAt: "2023-05-20T10:15:00.000Z"
        },
        {
          id: 2,
          name: "Điện thoại",
          description: "Điện thoại di động các loại",
          parentId: 1,
          icon: "smartphone",
          isActive: true,
          postCount: 85,
          createdAt: "2023-01-16T09:45:00.000Z",
          updatedAt: "2023-05-21T11:30:00.000Z"
        },
        {
          id: 3,
          name: "Máy tính",
          description: "Máy tính, laptop các loại",
          parentId: 1,
          icon: "monitor",
          isActive: true,
          postCount: 65,
          createdAt: "2023-01-17T10:20:00.000Z",
          updatedAt: "2023-05-22T14:10:00.000Z"
        },
        {
          id: 4,
          name: "Thời trang",
          description: "Quần áo, phụ kiện thời trang",
          parentId: null,
          icon: "shopping-bag",
          isActive: true,
          postCount: 150,
          createdAt: "2023-01-18T11:15:00.000Z",
          updatedAt: "2023-05-23T15:45:00.000Z"
        },
        {
          id: 5,
          name: "Thời trang nam",
          description: "Thời trang dành cho nam giới",
          parentId: 4,
          icon: "user",
          isActive: true,
          postCount: 75,
          createdAt: "2023-01-19T12:30:00.000Z",
          updatedAt: "2023-05-24T16:20:00.000Z"
        },
        {
          id: 6,
          name: "Thời trang nữ",
          description: "Thời trang dành cho nữ giới",
          parentId: 4,
          icon: "user",
          isActive: true,
          postCount: 95,
          createdAt: "2023-01-20T13:45:00.000Z",
          updatedAt: "2023-05-25T17:30:00.000Z"
        },
        {
          id: 7,
          name: "Bất động sản",
          description: "Mua bán, cho thuê bất động sản",
          parentId: null,
          icon: "home",
          isActive: true,
          postCount: 200,
          createdAt: "2023-01-21T14:10:00.000Z",
          updatedAt: "2023-05-26T09:15:00.000Z"
        },
        {
          id: 8,
          name: "Nhà đất bán",
          description: "Nhà đất cần bán",
          parentId: 7,
          icon: "key",
          isActive: true,
          postCount: 120,
          createdAt: "2023-01-22T15:30:00.000Z",
          updatedAt: "2023-05-27T10:45:00.000Z"
        },
        {
          id: 9,
          name: "Nhà đất cho thuê",
          description: "Nhà đất cho thuê",
          parentId: 7,
          icon: "key",
          isActive: true,
          postCount: 80,
          createdAt: "2023-01-23T16:45:00.000Z",
          updatedAt: "2023-05-28T11:20:00.000Z"
        },
        {
          id: 10,
          name: "Xe cộ",
          description: "Mua bán, trao đổi xe cộ",
          parentId: null,
          icon: "truck",
          isActive: true,
          postCount: 180,
          createdAt: "2023-01-24T17:15:00.000Z",
          updatedAt: "2023-05-29T12:30:00.000Z"
        },
        {
          id: 11,
          name: "Ô tô",
          description: "Mua bán ô tô",
          parentId: 10,
          icon: "car",
          isActive: true,
          postCount: 100,
          createdAt: "2023-01-25T09:30:00.000Z",
          updatedAt: "2023-05-30T13:45:00.000Z"
        },
        {
          id: 12,
          name: "Xe máy",
          description: "Mua bán xe máy",
          parentId: 10,
          icon: "activity",
          isActive: true,
          postCount: 80,
          createdAt: "2023-01-26T10:45:00.000Z",
          updatedAt: "2023-05-31T14:10:00.000Z"
        },
        {
          id: 13,
          name: "Việc làm",
          description: "Thông tin tuyển dụng, tìm việc",
          parentId: null,
          icon: "briefcase",
          isActive: true,
          postCount: 90,
          createdAt: "2023-01-27T11:15:00.000Z",
          updatedAt: "2023-06-01T15:30:00.000Z"
        },
        {
          id: 14,
          name: "Tìm việc",
          description: "Người tìm việc",
          parentId: 13,
          icon: "user",
          isActive: true,
          postCount: 40,
          createdAt: "2023-01-28T12:30:00.000Z",
          updatedAt: "2023-06-02T16:45:00.000Z"
        },
        {
          id: 15,
          name: "Tuyển dụng",
          description: "Nhà tuyển dụng",
          parentId: 13,
          icon: "users",
          isActive: true,
          postCount: 50,
          createdAt: "2023-01-29T13:45:00.000Z",
          updatedAt: "2023-06-03T17:15:00.000Z"
        }
      ];
      setCategories(dummyCategories);
      setLoading(false);
    }, 1000);
  }, []);

  // Lọc danh mục theo từ khóa tìm kiếm
  const filteredCategories = categories.filter(category => {
    if (!searchTerm) return true;
    return category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           category.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Lấy danh mục cha
  const getParentCategories = () => {
    return categories.filter(category => category.parentId === null);
  };

  // Lấy danh mục con
  const getChildCategories = (parentId) => {
    return categories.filter(category => category.parentId === parentId);
  };

  // Xử lý thêm danh mục mới
  const handleAddCategory = () => {
    if (!newCategory.name) {
      alert("Vui lòng nhập tên danh mục");
      return;
    }
    
    const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
    const category = {
      id: newId,
      ...newCategory,
      postCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setCategories([...categories, category]);
    setNewCategory({
      name: "",
      description: "",
      parentId: null,
      icon: "",
      isActive: true
    });
    setShowAddForm(false);
  };

  // Xử lý chỉnh sửa danh mục
  const handleEditCategory = (category) => {
    setEditingCategory({...category});
  };

  // Xử lý lưu danh mục đã chỉnh sửa
  const handleSaveCategory = () => {
    if (!editingCategory.name) {
      alert("Vui lòng nhập tên danh mục");
      return;
    }
    
    setCategories(categories.map(category => 
      category.id === editingCategory.id ? {...editingCategory, updatedAt: new Date().toISOString()} : category
    ));
    setEditingCategory(null);
  };

  // Xử lý xóa danh mục
  const handleDeleteCategory = (id) => {
    // Kiểm tra xem danh mục có danh mục con không
    const hasChildren = categories.some(category => category.parentId === id);
    
    if (hasChildren) {
      alert("Không thể xóa danh mục này vì có danh mục con. Vui lòng xóa danh mục con trước.");
      return;
    }
    
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      setCategories(categories.filter(category => category.id !== id));
    }
  };

  // Xử lý mở rộng/thu gọn danh mục
  const toggleExpand = (id) => {
    setExpandedCategories({
      ...expandedCategories,
      [id]: !expandedCategories[id]
    });
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    }).format(date);
  };

  // Render danh mục theo cấu trúc cây
  const renderCategoryTree = () => {
    const parentCategories = getParentCategories();
    
    return (
      <div className="space-y-2">
        {parentCategories.map(category => (
          <div key={category.id} className="border border-gray-200 rounded-lg">
            <div className={`flex items-center justify-between p-4 ${expandedCategories[category.id] ? 'border-b border-gray-200' : ''}`}>
              <div className="flex items-center">
                <button
                  onClick={() => toggleExpand(category.id)}
                  className="p-1 mr-2 text-gray-500 hover:text-gray-700"
                >
                  {expandedCategories[category.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                <div>
                  <div className="text-lg font-medium">{category.name}</div>
                  <div className="text-sm text-gray-500">{category.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs text-white bg-blue-500 rounded-full">{category.postCount} bài đăng</span>
                <button
                  onClick={() => handleEditCategory(category)}
                  className="p-1 text-blue-600 hover:text-blue-900"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-1 text-red-600 hover:text-red-900"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            {expandedCategories[category.id] && (
              <div className="p-4 pl-10 bg-gray-50">
                {getChildCategories(category.id).length > 0 ? (
                  <div className="space-y-2">
                    {getChildCategories(category.id).map(childCategory => (
                      <div key={childCategory.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <div>
                          <div className="font-medium">{childCategory.name}</div>
                          <div className="text-sm text-gray-500">{childCategory.description}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs text-white bg-blue-500 rounded-full">{childCategory.postCount} bài đăng</span>
                          <button
                            onClick={() => handleEditCategory(childCategory)}
                            className="p-1 text-blue-600 hover:text-blue-900"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(childCategory.id)}
                            className="p-1 text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">Không có danh mục con</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Thanh công cụ */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          <Plus size={18} className="mr-1" />
          Thêm danh mục
        </button>
      </div>

      {/* Danh sách danh mục */}
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h3 className="mb-4 text-lg font-medium">Quản lý danh mục</h3>
        
        {loading ? (
          <div className="py-8 text-center text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            Không tìm thấy danh mục nào
          </div>
        ) : (
          renderCategoryTree()
        )}
      </div>

      {/* Form thêm danh mục mới */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Thêm danh mục mới</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Tên danh mục</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập tên danh mục"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Mô tả</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập mô tả danh mục"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                ></textarea>
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Danh mục cha</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newCategory.parentId || ""}
                  onChange={(e) => setNewCategory({...newCategory, parentId: e.target.value ? parseInt(e.target.value) : null})}
                >
                  <option value="">Không có (Danh mục gốc)</option>
                  {getParentCategories().map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Icon</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập tên icon (ví dụ: home, car, ...)"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
                />
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={newCategory.isActive}
                    onChange={(e) => setNewCategory({...newCategory, isActive: e.target.checked})}
                  />
                  <span className="ml-2 text-sm text-gray-700">Kích hoạt</span>
                </label>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Thêm danh mục
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form chỉnh sửa danh mục */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Chỉnh sửa danh mục</h2>
              <button
                onClick={() => setEditingCategory(null)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Tên danh mục</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập tên danh mục"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Mô tả</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập mô tả danh mục"
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                ></textarea>
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Danh mục cha</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={editingCategory.parentId || ""}
                  onChange={(e) => setEditingCategory({...editingCategory, parentId: e.target.value ? parseInt(e.target.value) : null})}
                >
                  <option value="">Không có (Danh mục gốc)</option>
                  {getParentCategories()
                    .filter(category => category.id !== editingCategory.id) // Không cho phép chọn chính nó làm cha
                    .map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))
                  }
                </select>
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Icon</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập tên icon (ví dụ: home, car, ...)"
                  value={editingCategory.icon}
                  onChange={(e) => setEditingCategory({...editingCategory, icon: e.target.value})}
                />
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={editingCategory.isActive}
                    onChange={(e) => setEditingCategory({...editingCategory, isActive: e.target.checked})}
                  />
                  <span className="ml-2 text-sm text-gray-700">Kích hoạt</span>
                </label>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveCategory}
                  className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  <Save size={18} className="mr-1" />
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoriesManagement;