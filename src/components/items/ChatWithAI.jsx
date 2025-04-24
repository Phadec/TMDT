import { useState, useRef, useEffect } from "react";
import { cva } from "class-variance-authority";

// Định nghĩa các biến thể cho tin nhắn sử dụng CVA
const messageVariants = cva(
  // Base styles cho tất cả tin nhắn
  "flex flex-col max-w-[70%] mb-4 transform transition-all duration-300 ease-out",
  {
    variants: {
      sender: {
        user: "self-end hover:-translate-y-1 hover:scale-[1.02]",
        ai: "self-start hover:-translate-y-1 hover:scale-[1.02]",
      },
    },
    defaultVariants: {
      sender: "ai",
    },
  }
);

// Biến thể cho bong bóng tin nhắn
const bubbleVariants = cva(
  "px-4 py-3 rounded-2xl break-words leading-relaxed transition-all duration-300 transform",
  {
    variants: {
      sender: {
        user: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-tr-sm shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_25px_rgba(59,130,246,0.4)]",
        ai: "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 rounded-tl-sm shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_25px_rgba(0,0,0,0.15)]",
      },
    },
    defaultVariants: {
      sender: "ai",
    },
  }
);

// Biến thể cho nút
const buttonVariants = cva(
  "flex items-center justify-center rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-tr from-blue-500 to-blue-600 text-white hover:brightness-110 focus:ring-blue-400",
        disabled: "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none",
      },
      size: {
        default: "w-11 h-11",
        sm: "w-9 h-9",
        lg: "w-12 h-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

function ChatWithAI({ title = "Trò chuyện với trợ lý" }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! Tôi là trợ lý AI. Tôi có thể giúp gì cho bạn?",
      sender: "ai",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const prevMessagesLengthRef = useRef(messages.length);

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Xử lý việc giật khi gửi tin nhắn bằng cách giữ chiều cao cố định
  useEffect(() => {
    if (messagesContainerRef.current && messages.length > prevMessagesLengthRef.current) {
      const container = messagesContainerRef.current;
      const scrollHeight = container.scrollHeight;
      
      // Lưu chiều cao hiện tại
      container.style.minHeight = `${scrollHeight}px`;
      
      // Sau khi tin nhắn được thêm vào, cập nhật lại chiều cao
      setTimeout(() => {
        container.style.minHeight = 'auto';
      }, 50);
    }
    
    prevMessagesLengthRef.current = messages.length;
    scrollToBottom();
  }, [messages]);
  
  // Xử lý responsive cho popup
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        // Đóng popup khi chuyển sang chế độ mobile nếu đang mở
        if (isOpen) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = 'auto';
        }
      } else {
        document.body.style.overflow = 'auto';
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Xử lý khi người dùng gửi tin nhắn
  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;

    // Thêm tin nhắn của người dùng vào danh sách
    const newUserMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
    };

    setMessages([...messages, newUserMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Giả lập phản hồi từ AI sau một khoảng thời gian
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        text: getAIResponse(inputMessage),
        sender: "ai",
      };
      setMessages((prevMessages) => [...prevMessages, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  // Xử lý khi người dùng nhấn Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Hàm giả lập phản hồi từ AI (trong thực tế sẽ gọi API)
  const getAIResponse = (message) => {
    const responses = [
      "Tôi hiểu điều bạn đang nói. Có thể giải thích rõ hơn được không?",
      "Đây là một câu hỏi thú vị. Tôi nghĩ rằng...",
      "Tôi có thể giúp bạn với vấn đề này. Đầu tiên, bạn nên...",
      "Cảm ơn bạn đã chia sẻ. Tôi đề xuất bạn thử...",
      "Tôi đang tìm kiếm thông tin về vấn đề này. Một giải pháp có thể là...",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <>
      {/* Nút mở chat trên màn hình nhỏ */}
      <div className="fixed sm:bottom-14 bottom-20 left-3 md:hidden z-10">
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg flex items-center justify-center transform hover:scale-110 transition-all duration-300"
          aria-label="Mở chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      </div>

      {/* Container chính - hiển thị dạng popup trên mobile */}
      <div 
        className={`
          fixed inset-0 md:static md:inset-auto z-20 md:z-auto
          transition-all duration-300 ease-in-out transform
          ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full md:translate-y-0 opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto'}
          md:flex md:flex-col md:h-[80vh] md:max-w-3xl md:mx-auto md:rounded-xl md:shadow-2xl md:bg-white/80 md:backdrop-blur-md md:overflow-hidden md:border md:border-gray-200
          bg-white h-full w-full
        `}
      >
        {/* Header với nút đóng trên mobile */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-md flex items-center justify-between">
          <h2 className="text-xl font-semibold text-center flex-1">{title}</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-500 transition-colors"
            aria-label="Đóng chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Messages Area với hiệu ứng 3D và đối xứng */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4 perspective-[1000px]"
          style={{ perspective: '1000px' }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={messageVariants({ sender: message.sender })}
              style={{ 
                transformStyle: 'preserve-3d',
                transform: `rotateY(${message.sender === 'user' ? '5deg' : '-5deg'})`,
              }}
            >
              <div 
                className={bubbleVariants({ sender: message.sender })}
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: `translateZ(10px)`,
                }}
              >
                {message.text}
              </div>
              <div className="text-xs text-gray-500 mt-1 px-1">
                {message.sender === "user" ? "Bạn" : "AI"} •{" "}
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}

          {isTyping && (
            <div 
              className={messageVariants({ sender: "ai" })}
              style={{ 
                transformStyle: 'preserve-3d',
                transform: 'rotateY(-5deg)',
              }}
            >
              <div 
                className={bubbleVariants({ sender: "ai" })}
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: 'translateZ(10px)',
                }}
              >
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "600ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200 flex items-center">
          <input
            type="text"
            placeholder="Nhập tin nhắn của bạn..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={inputMessage.trim() === ""}
            className={buttonVariants({
              variant: inputMessage.trim() === "" ? "disabled" : "primary",
              size: "default",
            })}
            aria-label="Gửi tin nhắn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

export default ChatWithAI;
