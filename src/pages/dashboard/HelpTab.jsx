// Help Item Component
export const HelpItem = ({ question }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button className="w-full flex items-center justify-between p-4 text-left font-medium">
        <span>{question}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>
  );
};

// Help Tab Component
const HelpTab = () => {
  const helpQuestions = [
    "Làm thế nào để thêm sản phẩm mới?",
    "Làm thế nào để xử lý đơn hàng?",
    "Làm thế nào để cài đặt phương thức thanh toán?"
  ];
  
  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Trợ giúp</h2>
      <div className="space-y-4">
        {helpQuestions.map((question, index) => (
          <HelpItem key={index} question={question} />
        ))}
      </div>
    </div>
  );
};

export default HelpTab;