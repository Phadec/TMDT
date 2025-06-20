function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all hover:scale-105 duration-300">
        <div className="relative">
          <div className="relative z-10 bg-white p-8 pt-12">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg transform rotate-12 hover:rotate-0 transition-all duration-300">
                <span className="text-5xl">🔍</span>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
              404
            </h1>
            <h2 className="text-xl font-semibold text-center text-gray-700 mb-6">
              Trang không tồn tại
            </h2>

            <p className="text-gray-600 text-center mb-8">
              Có vẻ như bạn đã đi lạc rồi. Trang bạn đang tìm kiếm không tồn tại
              hoặc bị admin đem đi đâu rồi.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
              >
                Quay lại
              </button>
              <a
                href="/"
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md text-center"
              >
                Về trang chủ
              </a>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 border-t border-gray-100">
          <p className="text-gray-500 text-sm text-center">
            Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ với chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
