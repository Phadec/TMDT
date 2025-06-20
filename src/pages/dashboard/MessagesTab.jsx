// Message Item Component
export const MessageItem = ({ item }) => {
  return (
    <div
      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
          <div className="font-medium">Người dùng #{item}</div>
        </div>
        <div className="text-xs text-gray-500">
          {item} giờ trước
        </div>
      </div>
      <p className="text-gray-600 text-sm">
        Xin chào, tôi có thắc mắc về sản phẩm của bạn. Bạn có thể
        giúp tôi không?
      </p>
    </div>
  );
};

// Messages Tab Component
const MessagesTab = () => {
  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Tin nhắn</h2>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((item) => (
          <MessageItem key={item} item={item} />
        ))}
      </div>
    </div>
  );
};

export default MessagesTab;