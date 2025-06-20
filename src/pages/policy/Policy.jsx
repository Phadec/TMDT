import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { cva } from 'class-variance-authority';

const sidebarButtonStyles = cva(
    'w-full text-left px-3 py-2 rounded-md flex items-center transition-colors',
    {
      variants: {
        state: {
          active: 'bg-indigo-50 text-indigo-700 font-medium',
          inactive: 'text-gray-700 hover:bg-gray-50',
        },
      },
      defaultVariants: {
        state: 'inactive',
      },
    }
);

// Biến thể cho action buttons
const actionButtonStyles = cva(
    'inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
    {
      variants: {
        type: {
          download: 'border-transparent text-white bg-indigo-600 hover:bg-indigo-700',
          email: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
        },
      },
      defaultVariants: {
        type: 'download',
      },
    }
);
// Biến thể cho liên kết trong footer
const linkStyles = cva(
    'text-gray-500 hover:text-indigo-600',
    {
      variants: {},
      defaultVariants: {},
    }
);
function Policy() {
  const [activeSection, setActiveSection] = useState("intro");
  const [policyData, setPolicyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const sectionRefs = useRef({});

  // Danh sách các phần trong chính sách
  const sections = [
    { id: "intro", title: "Giới thiệu", icon: "📝" },
    { id: "general", title: "Quy định chung", icon: "📋" },
    { id: "posting", title: "Quy định đăng tin", icon: "📢" },
    { id: "transaction", title: "Quy định giao dịch", icon: "🤝" },
    { id: "privacy", title: "Chính sách bảo mật", icon: "🔒" },
    { id: "violation", title: "Xử lý vi phạm", icon: "⚠️" },
    { id: "liability", title: "Trách nhiệm pháp lý", icon: "⚖️" },
    { id: "changes", title: "Thay đổi chính sách", icon: "🔄" },
    { id: "contact", title: "Liên hệ hỗ trợ", icon: "📞" }
  ];

  useEffect(() => {
    // Tạo refs cho từng section
    sections.forEach(section => {
      sectionRefs.current[section.id] = sectionRefs.current[section.id] || React.createRef();
    });

    // Fetch dữ liệu chính sách
    fetch("/policy/Policy.md")
      .then((res) => res.text())
      .then((text) => {
        setPolicyData(parseMarkdownToSections(text));
        setLoading(false);
      })
      .catch(error => {
        console.error("Error loading policy data:", error);
        setLoading(false);
      });
  }, []);

  // Hàm phân tích Markdown thành các phần
  const parseMarkdownToSections = (markdown) => {
    const lines = markdown.split('\n');
    const result = {
      title: "",
      intro: "",
      sections: {}
    };

    let currentSection = "intro";
    let sectionContent = [];

    lines.forEach(line => {
      if (line.startsWith('# ')) {
        // Tiêu đề chính
        result.title = line.replace('# ', '');
      } else if (line.startsWith('## ')) {
        // Lưu section trước đó nếu có
        if (sectionContent.length > 0) {
          result.sections[currentSection] = sectionContent.join('\n');
          sectionContent = [];
        }

        // Bắt đầu section mới
        const sectionTitle = line.replace('## ', '');
        if (sectionTitle.includes('1.')) currentSection = "general";
        else if (sectionTitle.includes('2.')) currentSection = "posting";
        else if (sectionTitle.includes('3.')) currentSection = "transaction";
        else if (sectionTitle.includes('4.')) currentSection = "privacy";
        else if (sectionTitle.includes('5.')) currentSection = "violation";
        else if (sectionTitle.includes('6.')) currentSection = "liability";
        else if (sectionTitle.includes('7.')) currentSection = "changes";
        else if (sectionTitle.includes('Liên hệ')) currentSection = "contact";
      } else if (line.startsWith('---')) {
        // Bỏ qua dòng phân cách
      } else {
        // Thêm dòng vào section hiện tại
        if (currentSection === "intro" && !result.intro && line.trim()) {
          result.intro = line;
        } else {
          sectionContent.push(line);
        }
      }
    });

    // Lưu section cuối cùng
    if (sectionContent.length > 0) {
      result.sections[currentSection] = sectionContent.join('\n');
    }

    return result;
  };

  // Hàm xử lý khi click vào menu
  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    
    // Scroll đến section tương ứng
    if (sectionRefs.current[sectionId] && sectionRefs.current[sectionId].current) {
      sectionRefs.current[sectionId].current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Hàm render nội dung section
  const renderSectionContent = (sectionId) => {
    if (!policyData || !policyData.sections) return null;

    if (sectionId === "intro") {
      return (
        <div>
          <p className="text-lg text-gray-700 mb-4">{policyData.intro}</p>
          <p className="text-gray-600 italic">Vui lòng đọc kỹ các điều khoản dưới đây trước khi sử dụng dịch vụ của chúng tôi.</p>
        </div>
      );
    }

    const content = policyData.sections[sectionId] || "";
    
    // Xử lý nội dung để hiển thị đúng định dạng
    return (
      <div className="policy-content">
        {content.split('\n').map((line, index) => {
          if (line.trim() === "") return <br key={index} />;
          
          if (line.startsWith('- ')) {
            return (
              <div key={index} className="flex items-start mb-3">
                <div className="text-indigo-500 mr-2 mt-1">•</div>
                <p className="text-gray-700">{line.replace('- ', '')}</p>
              </div>
            );
          }
          
          if (line.includes('**')) {
            return (
              <p key={index} className="mb-3 text-gray-700" 
                dangerouslySetInnerHTML={{ 
                  __html: line.replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-indigo-700">$1</span>') 
                }} 
              />
            );
          }
          
          return <p key={index} className="mb-3 text-gray-700">{line}</p>;
        })}
      </div>
    );
  };

  // Hiển thị loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-indigo-600 font-medium">Đang tải chính sách...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Chính sách & Điều khoản sử dụng</h1>
          <p className="mt-2 text-gray-600">Cập nhật lần cuối: 15/08/2023</p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <nav className="sticky top-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Mục lục</h2>
                <ul className="space-y-2">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <button
                        onClick={() => handleSectionClick(section.id)}
                        className={sidebarButtonStyles({ state: activeSection === section.id ? 'active' : 'inactive' })}
                      >
                        <span className="mr-2">{section.icon}</span>
                        <span>{section.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick contact */}
              <div className="mt-6 bg-indigo-50 rounded-lg p-6 border border-indigo-100">
                <h3 className="text-indigo-800 font-medium mb-3">Cần hỗ trợ?</h3>
                <p className="text-sm text-indigo-700 mb-4">
                  Nếu bạn có thắc mắc về chính sách của chúng tôi, vui lòng liên hệ:
                </p>
                <div className="flex items-center text-indigo-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">hotro@choviet.vn</span>
                </div>
              </div>
            </nav>
          </div>

          {/* Content */}
          <main className="lg:col-span-9">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              {/* Mobile menu */}
              <div className="lg:hidden p-4 border-b border-gray-100">
                <select 
                  className="w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  value={activeSection}
                  onChange={(e) => handleSectionClick(e.target.value)}
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.icon} {section.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Policy content */}
              <div className="p-6 md:p-8">
                {/* Intro section */}
                <div ref={sectionRefs.current.intro} id="intro" className={`policy-section ${activeSection === "intro" ? "active" : ""}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                        <span className="text-xl">📝</span>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Giới thiệu</h2>
                    </div>
                    {renderSectionContent("intro")}
                  </motion.div>
                </div>

                {/* Other sections */}
                {sections.slice(1).map((section) => (
                  <div 
                    key={section.id}
                    ref={sectionRefs.current[section.id]} 
                    id={section.id}
                    className={`policy-section mt-12 pt-8 border-t border-gray-100 ${activeSection === section.id ? "active" : ""}`}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                          <span className="text-xl">{section.icon}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                      </div>
                      {renderSectionContent(section.id)}
                    </motion.div>
                  </div>
                ))}

                {/* Last updated */}
                <div className="mt-12 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500 italic">
                    Chính sách này có hiệu lực từ ngày 15/08/2023. Chúng tôi có quyền thay đổi chính sách này mà không cần thông báo trước.
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex flex-col sm:flex-row sm:justify-between">
              <button className={actionButtonStyles({type: 'download'})}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Tải xuống PDF
              </button>
              <button className={actionButtonStyles({type: 'email'})}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Gửi qua email
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white mt-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2023 Chợ Việt. Tất cả các quyền được bảo lưu.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className={linkStyles()}>
                Điều khoản sử dụng
              </a>
              <a href="#" className={linkStyles()}>
                Chính sách bảo mật
              </a>
              <a href="#" className={linkStyles()}>
                Trợ giúp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Policy;
