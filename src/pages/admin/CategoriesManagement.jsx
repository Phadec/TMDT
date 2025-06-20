import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Edit, Trash2, Save, X, ChevronRight, ChevronDown } from "lucide-react";
import { adminServices } from "../../api";

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
  const [error, setError] = useState("");

  // Lấy dữ liệu từ API
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminServices.categories.getAll();
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setError("Không thể tải danh sách danh mục. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };
  // Tìm kiếm danh mục
  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      loadCategories();
      return;
    }

    try {
      setLoading(true);
      const data = await adminServices.categories.search(searchTerm);
      setCategories(data || []);
    } catch (error) {
      console.error('Error searching categories:', error);
      setError("Không thể tìm kiếm danh mục. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);
  // Theo dõi thay đổi của searchTerm để tự động tìm kiếm
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        handleSearch();
      } else {
        loadCategories();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, handleSearch]);

  // Lấy danh mục cha
  const getParentCategories = () => {
    return categories.filter(category => category.parentId === null);
  };

  // Lấy danh mục con
  const getChildCategories = (parentId) => {
    return categories.filter(category => category.parentId === parentId);
  };

  // Xử lý thêm danh mục mới
  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      alert("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      setLoading(true);
      const savedCategory = await adminServices.categories.create(newCategory);
      setCategories([...categories, savedCategory]);
      setNewCategory({
        name: "",
        description: "",
        parentId: null,
        icon: "",
        isActive: true
      });
      setShowAddForm(false);
      setError("");
    } catch (error) {
      console.error('Error creating category:', error);
      setError("Không thể tạo danh mục. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý chỉnh sửa danh mục
  const handleEditCategory = (category) => {
    setEditingCategory({...category});
  };

  // Xử lý lưu danh mục đã chỉnh sửa
  const handleSaveCategory = async () => {
    if (!editingCategory.name.trim()) {
      alert("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      setLoading(true);
      const updatedCategory = await adminServices.categories.update(editingCategory.id, editingCategory);
      setCategories(categories.map(category => 
        category.id === editingCategory.id ? updatedCategory : category
      ));
      setEditingCategory(null);
      setError("");
    } catch (error) {
      console.error('Error updating category:', error);
      setError("Không thể cập nhật danh mục. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xóa danh mục
  const handleDeleteCategory = async (id) => {
    // Kiểm tra xem danh mục có danh mục con không
    const hasChildren = categories.some(category => category.parentId === id);
    
    if (hasChildren) {
      alert("Không thể xóa danh mục này vì có danh mục con. Vui lòng xóa danh mục con trước.");
      return;
    }
    
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        setLoading(true);
        await adminServices.categories.delete(id);
        setCategories(categories.filter(category => category.id !== id));
        setError("");
      } catch (error) {
        console.error('Error deleting category:', error);
        setError("Không thể xóa danh mục. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Xử lý mở rộng/thu gọn danh mục
  const toggleExpand = (id) => {
    setExpandedCategories({
      ...expandedCategories,
      [id]: !expandedCategories[id]
    });
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
          disabled={loading}
        >
          <Plus size={18} className="mr-1" />
          Thêm danh mục
        </button>
      </div>

      {/* Hiển thị lỗi */}
      {error && (
        <div className="p-4 mb-6 text-red-700 bg-red-100 border border-red-400 rounded-lg">
          {error}
          <button 
            onClick={() => setError("")}
            className="ml-2 text-red-900 hover:text-red-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Danh sách danh mục */}
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h3 className="mb-4 text-lg font-medium">Quản lý danh mục</h3>
        
        {loading ? (
          <div className="py-8 text-center text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : categories.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            {searchTerm ? "Không tìm thấy danh mục nào phù hợp" : "Chưa có danh mục nào"}
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
                  onChange={(e) => setNewCategory({...newCategory, parentId: e.target.value || null})}
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
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  className="mr-2"
                  checked={newCategory.isActive}
                  onChange={(e) => setNewCategory({...newCategory, isActive: e.target.checked})}
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Kích hoạt</label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? "Đang thêm..." : "Thêm danh mục"}
              </button>
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
                  onChange={(e) => setEditingCategory({...editingCategory, parentId: e.target.value || null})}
                >
                  <option value="">Không có (Danh mục gốc)</option>
                  {getParentCategories()
                    .filter(category => category.id !== editingCategory.id)
                    .map(category => (
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
                  value={editingCategory.icon}
                  onChange={(e) => setEditingCategory({...editingCategory, icon: e.target.value})}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editIsActive"
                  className="mr-2"
                  checked={editingCategory.isActive}
                  onChange={(e) => setEditingCategory({...editingCategory, isActive: e.target.checked})}
                />
                <label htmlFor="editIsActive" className="text-sm font-medium text-gray-700">Kích hoạt</label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveCategory}
                className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoriesManagement;