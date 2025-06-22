const handleContent = (content) => {
  return `
    Dưới đây là nội dung của một bài viết quảng cáo. Hãy kiểm tra và đánh giá tính hiệu quả, mức độ hấp dẫn và tính thuyết phục của nội dung này. Nếu có thể, hãy đề xuất một phiên bản cải thiện tốt hơn, không vượt quá 1000 ký tự. Phản hồi một cách chuyên nghiệp, súc tích và mang tính marketing cao.
    Đây là nội dung:
    ${content}
`;
};

export { handleContent };
