import React, { useState } from 'react';

function Classifieds() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    images: [],
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(file => URL.createObjectURL(file));
    setForm(prev => ({ ...prev, images: files }));
    setPreviewImages(previews);
  };

  const handlePreview = (e) => {
    e.preventDefault();
    setShowPreview(true);
  };

  const handleSubmit = () => {
    // Xử lý đăng bài ở đây (ví dụ: gửi dữ liệu về backend)
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setForm({ title: '', description: '', category: '', images: [] });
      setPreviewImages([]);
      setShowPreview(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center justify-center">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-8 space-y-6">
        <h2 className="text-3xl font-semibold text-gray-800 flex items-center gap-2">
          📢 Đăng bài rao vặt
        </h2>

        <form className="space-y-4" onSubmit={handlePreview}>
          <div>
            <label className="block text-sm font-medium text-gray-600">Tiêu đề</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="VD: Bán iPhone 13 Pro Max mới 99%"
              className="w-full p-3 border border-gray-300 rounded-xl mt-1 focus:ring-2 focus:ring-blue-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Mô tả</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Mô tả chi tiết sản phẩm..."
              className="w-full p-3 border border-gray-300 rounded-xl mt-1 focus:ring-2 focus:ring-blue-300"
              rows={4}
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Danh mục</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-xl mt-1 focus:ring-2 focus:ring-blue-300"
              required
            >
              <option value="">-- Chọn danh mục --</option>
              <option value="dien-thoai">📱 Điện thoại</option>
              <option value="do-dien-tu">💻 Đồ điện tử</option>
              <option value="thoi-trang">👗 Thời trang</option>
              <option value="khac">📦 Khác</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Hình ảnh</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="mt-1 w-full text-sm"
            />
            {previewImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {previewImages.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt="preview"
                    className="w-full h-24 object-cover rounded-xl border"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow hover:opacity-90 transition"
            >
              Xem trước bài viết
            </button>
          </div>
        </form>

        {showPreview && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-xl p-6 space-y-4 relative animate-fade-in">
              <button
                onClick={() => setShowPreview(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
              >
                ✖
              </button>
              <h3 className="text-xl font-bold text-gray-700">📋 Xem trước bài đăng</h3>
              <p className="text-lg font-semibold">{form.title}</p>
              <p className="text-gray-600 whitespace-pre-line">{form.description}</p>
              <p className="text-sm italic text-gray-500">Danh mục: {form.category}</p>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {previewImages.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt="preview"
                    className="w-full h-24 object-cover rounded-xl border"
                  />
                ))}
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
                >
                  ✅ Đăng ngay
                </button>
              </div>
            </div>
          </div>
        )}

        {showSuccess && (
          <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-fade-in-up">
            🎉 Bài đăng đã được gửi thành công!
          </div>
        )}
      </div>
    </div>
  );
}

export default Classifieds;