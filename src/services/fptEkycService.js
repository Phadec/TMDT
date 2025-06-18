/**
 * FPT eKYC Service
 * Service xử lý các chức năng xác thực khuôn mặt sử dụng FPT AI
 */

class FPTEkycService {
  constructor() {
    this.apiUrl = 'https://api.fpt.ai/dmp/checkface/v1';
    this.apiKey = 'BBNqSMt3Qs9v33RGS7UAXVKN53qaxHUp';
  }

  /**
   * So sánh hai ảnh khuôn mặt
   * @param {File} file1 - File ảnh thứ nhất
   * @param {File} file2 - File ảnh thứ hai
   * @returns {Promise<Object>} Kết quả so sánh khuôn mặt
   */
  async comparefaces(file1, file2) {
    try {
      const formData = new FormData();
      formData.append('file[]', file1);
      formData.append('file[]', file2);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'api_key': this.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.code !== '200') {
        throw new Error(result.message || 'Lỗi từ FPT eKYC API');
      }

      return result.data;
    } catch (error) {
      console.error('Lỗi khi gọi FPT eKYC API:', error);
      throw new Error(`Không thể xác thực khuôn mặt: ${error.message}`);
    }
  }

  /**
   * Xác thực độ tin cậy của việc so sánh khuôn mặt
   * @param {Object} comparisonResult - Kết quả từ API comparefaces
   * @returns {Object} Kết quả xác thực với thông tin chi tiết
   */
  validateFaceComparison(comparisonResult) {
    const { isMatch, similarity, isBothImgIDCard } = comparisonResult;
    
    // Ngưỡng tin cậy tối thiểu (có thể điều chỉnh)
    const MIN_SIMILARITY_THRESHOLD = 80;
    const RECOMMENDED_SIMILARITY_THRESHOLD = 85;

    return {
      isValid: isMatch && similarity >= MIN_SIMILARITY_THRESHOLD,
      isHighConfidence: isMatch && similarity >= RECOMMENDED_SIMILARITY_THRESHOLD,
      similarity: similarity,
      isMatch: isMatch,
      isBothImgIDCard: isBothImgIDCard,
      confidence: this.getConfidenceLevel(similarity),
      message: this.getValidationMessage(isMatch, similarity, isBothImgIDCard)
    };
  }

  /**
   * Lấy mức độ tin cậy dựa trên độ tương đồng
   * @param {number} similarity - Độ tương đồng (0-100)
   * @returns {string} Mức độ tin cậy
   */
  getConfidenceLevel(similarity) {
    if (similarity >= 95) return 'Rất cao';
    if (similarity >= 85) return 'Cao';
    if (similarity >= 75) return 'Trung bình';
    if (similarity >= 60) return 'Thấp';
    return 'Rất thấp';
  }

  /**
   * Lấy thông điệp xác thực
   * @param {boolean} isMatch - Có khớp không
   * @param {number} similarity - Độ tương đồng
   * @param {boolean} isBothImgIDCard - Có phải cả 2 đều là ảnh CMND/CCCD
   * @returns {string} Thông điệp
   */
  getValidationMessage(isMatch, similarity, isBothImgIDCard) {
    if (!isMatch) {
      return 'Hai ảnh không khớp với cùng một người. Vui lòng thử lại với ảnh chính xác.';
    }

    if (similarity < 80) {
      return 'Độ tương đồng quá thấp. Vui lòng chụp ảnh rõ nét hơn và thử lại.';
    }

    if (similarity >= 95) {
      return 'Xác thực hoàn hảo! Khuôn mặt khớp với độ tin cậy rất cao.';
    }

    if (similarity >= 85) {
      return 'Xác thực thành công! Khuôn mặt khớp với độ tin cậy cao.';
    }

    return 'Xác thực thành công! Khuôn mặt khớp nhưng nên chụp ảnh rõ nét hơn lần sau.';
  }

  /**
   * Xác thực định dạng file ảnh
   * @param {File} file - File cần xác thực
   * @returns {Object} Kết quả xác thực file
   */
  validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!file) {
      return { isValid: false, message: 'Vui lòng chọn file ảnh' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { 
        isValid: false, 
        message: 'Định dạng file không được hỗ trợ. Vui lòng chọn file JPG, JPEG hoặc PNG' 
      };
    }

    if (file.size > maxSize) {
      return { 
        isValid: false, 
        message: 'File ảnh quá lớn. Vui lòng chọn file nhỏ hơn 5MB' 
      };
    }

    return { isValid: true, message: 'File ảnh hợp lệ' };
  }
}

// Singleton instance
const fptEkycService = new FPTEkycService();

export default fptEkycService;