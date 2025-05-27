import { useState, useEffect } from "react";
import { Search, Filter, Eye, CheckCircle, XCircle, AlertTriangle, MessageSquare } from "lucide-react";

function ReportsManagement() {
  // State cho danh sách báo cáo
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportDetail, setShowReportDetail] = useState(false);

  // Giả lập việc lấy dữ liệu từ API
  useEffect(() => {
    // Trong thực tế, đây sẽ là một API call
    setTimeout(() => {
      const dummyReports = Array(15).fill().map((_, index) => ({
        id: index + 1,
        postId: Math.floor(Math.random() * 1000) + 1,
        postTitle: `Bài đăng ${Math.floor(Math.random() * 1000) + 1}`,
        reporterId: Math.floor(Math.random() * 1000) + 1,
        reporterName: `Người dùng ${Math.floor(Math.random() * 100) + 1}`,
        reason: ["spam", "inappropriate", "fake", "scam", "other"][Math.floor(Math.random() * 5)],
        description: `Mô tả chi tiết về lý do báo cáo bài đăng này. Người dùng cho rằng nội dung này vi phạm quy định của hệ thống.`,
        status: ["pending", "resolved", "rejected"][Math.floor(Math.random() * 3)],
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: null,
        resolvedBy: null,
        adminNote: ""
      }));
      
      // Thêm thông tin resolvedAt và resolvedBy cho các báo cáo đã xử lý
      dummyReports.forEach(report => {
        if (report.status !== "pending") {
          report.resolvedAt = new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString();
          report.resolvedBy = "Admin";
          report.adminNote = "Đã xử lý báo cáo này theo quy định.";
        }
      });
      
      setReports(dummyReports);
      setLoading(false);
    }, 1000);
  }, []);

  // Lọc báo cáo theo trạng thái
  const filteredReports = reports.filter(report => {
    if (currentFilter === "all") return true;
    return report.status === currentFilter;
  }).filter(report => {
    if (!searchTerm) return true;
    return report.postTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
           report.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           report.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Xử lý xem chi tiết báo cáo
  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowReportDetail(true);
  };

  // Xử lý chấp nhận báo cáo
  const handleResolveReport = (id) => {
    setReports(reports.map(report => 
      report.id === id ? { 
        ...report, 
        status: "resolved", 
        resolvedAt: new Date().toISOString(),
        resolvedBy: "Admin",
        adminNote: "Đã xử lý báo cáo này theo quy định."
      } : report
    ));
  };

  // Xử lý từ chối báo cáo
  const handleRejectReport = (id) => {
    setReports(reports.map(report => 
      report.id === id ? { 
        ...report, 
        status: "rejected", 
        resolvedAt: new Date().toISOString(),
        resolvedBy: "Admin",
        adminNote: "Báo cáo này không vi phạm quy định."
      } : report
    ));
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xử lý";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Hiển thị lý do báo cáo
  const renderReportReason = (reason) => {
    switch (reason) {
      case "spam":
        return "Spam";
      case "inappropriate":
        return "Nội dung không phù hợp";
      case "fake":
        return "Thông tin giả mạo";
      case "scam":
        return "Lừa đảo";
      case "other":
        return "Lý do khác";
      default:
        return reason;
    }
  };

  // Hiển thị trạng thái báo cáo
  const renderReportStatus = (status) => {
    switch (status) {
      case "pending":
        return <span className="px-2 py-1 text-xs text-white bg-yellow-500 rounded-full">Chờ xử lý</span>;
      case "resolved":
        return <span className="px-2 py-1 text-xs text-white bg-green-500 rounded-full">Đã xử lý</span>;
      case "rejected":
        return <span className="px-2 py-1 text-xs text-white bg-red-500 rounded-full">Từ chối</span>;
      default:
        return null;
    }
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
            placeholder="Tìm kiếm báo cáo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />
          <select
            className="px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={currentFilter}
            onChange={(e) => setCurrentFilter(e.target.value)}
          >
            <option value="all">Tất cả báo cáo</option>
            <option value="pending">Chờ xử lý</option>
            <option value="resolved">Đã xử lý</option>
            <option value="rejected">Đã từ chối</option>
          </select>
        </div>
      </div>

      {/* Bảng danh sách báo cáo */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Bài đăng</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Người báo cáo</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Lý do</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Ngày báo cáo</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredReports.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  Không tìm thấy báo cáo nào
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr key={report.id} className={report.status === "pending" ? "bg-yellow-50" : ""}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <AlertTriangle size={18} className="mr-2 text-red-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{report.postTitle}</div>
                        <div className="text-sm text-gray-500">ID: {report.postId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{report.reporterName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{renderReportReason(report.reason)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(report.createdAt)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {renderReportStatus(report.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewReport(report)}
                        className="p-1 text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                      
                      {report.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleResolveReport(report.id)}
                            className="p-1 text-green-600 hover:text-green-900"
                            title="Chấp nhận báo cáo"
                          >
                            <CheckCircle size={18} />
                          </button>
                          
                          <button
                            onClick={() => handleRejectReport(report.id)}
                            className="p-1 text-red-600 hover:text-red-900"
                            title="Từ chối báo cáo"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal xem chi tiết báo cáo */}
      {showReportDetail && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-3xl p-6 mx-4 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Chi tiết báo cáo</h2>
              <button
                onClick={() => setShowReportDetail(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <div className="p-4 mb-4 bg-red-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertTriangle size={20} className="mr-2 text-red-500" />
                    <h3 className="text-lg font-medium text-red-700">Thông tin báo cáo</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Trạng thái</p>
                      <div>{renderReportStatus(selectedReport.status)}</div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Người báo cáo</p>
                      <p>{selectedReport.reporterName} (ID: {selectedReport.reporterId})</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Thời gian báo cáo</p>
                      <p>{formatDate(selectedReport.createdAt)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Lý do báo cáo</p>
                      <p>{renderReportReason(selectedReport.reason)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Mô tả chi tiết</p>
                      <p className="p-2 bg-white rounded">{selectedReport.description}</p>
                    </div>
                  </div>
                </div>
                
                {selectedReport.status !== "pending" && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="mb-2 text-lg font-medium">Thông tin xử lý</h3>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Người xử lý</p>
                        <p>{selectedReport.resolvedBy}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Thời gian xử lý</p>
                        <p>{formatDate(selectedReport.resolvedAt)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Ghi chú</p>
                        <p className="p-2 bg-white rounded">{selectedReport.adminNote}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <div className="p-4 mb-4 bg-gray-50 rounded-lg">
                  <h3 className="mb-2 text-lg font-medium">Thông tin bài đăng</h3>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tiêu đề</p>
                      <p>{selectedReport.postTitle}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">ID bài đăng</p>
                      <p>{selectedReport.postId}</p>
                    </div>
                    
                    <div className="flex justify-center p-2 mt-4 bg-white rounded">
                      <button className="flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
                        <Eye size={18} className="mr-1" />
                        Xem bài đăng
                      </button>
                    </div>
                  </div>
                </div>
                
                {selectedReport.status === "pending" && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="mb-2 text-lg font-medium">Xử lý báo cáo</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Ghi chú</label>
                        <textarea
                          className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Nhập ghi chú xử lý..."
                        ></textarea>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            handleResolveReport(selectedReport.id);
                            setShowReportDetail(false);
                          }}
                          className="flex items-center flex-1 justify-center px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
                        >
                          <CheckCircle size={18} className="mr-1" />
                          Chấp nhận báo cáo
                        </button>
                        
                        <button
                          onClick={() => {
                            handleRejectReport(selectedReport.id);
                            setShowReportDetail(false);
                          }}
                          className="flex items-center flex-1 justify-center px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
                        >
                          <XCircle size={18} className="mr-1" />
                          Từ chối báo cáo
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="p-4 mt-4 bg-gray-50 rounded-lg">
                  <h3 className="mb-2 text-lg font-medium">Phản hồi cho người báo cáo</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <textarea
                        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Nhập nội dung phản hồi..."
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-end">
                      <button className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                        <MessageSquare size={18} className="mr-1" />
                        Gửi phản hồi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsManagement;