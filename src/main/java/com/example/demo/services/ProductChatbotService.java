package com.example.demo.services;

import com.example.demo.models.Product;
import com.example.demo.models.Category;
import com.example.demo.models.Review;
import com.example.demo.repositories.ProductRepository;
import com.example.demo.dtos.ChatbotRequest;
import com.example.demo.dtos.ChatbotResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ProductChatbotService {

    private static final Logger logger = LoggerFactory.getLogger(ProductChatbotService.class);

    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CategoryService categoryService;

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private PriceComparisonService priceComparisonService;
    
    @Value("${gemini.api.key}")
    private String apiKey;
    
    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent}")
    private String apiUrl;
    
    @Value("${gemini.api.model:gemini-2.0-flash}")
    private String apiModel;
    
    public ChatbotResponse getProductRecommendation(ChatbotRequest request) {
        try {
            logger.debug("Processing general product recommendation request: {}", request.getUserQuery());
            
            // Get relevant products to provide context to Gemini API
            List<Product> relevantProducts = getRelevantProducts();
            logger.debug("Found {} relevant products for context", relevantProducts.size());
            
            // Format product information for the prompt
            String productContext = formatProductContext(relevantProducts);
            
            // Create the prompt for Gemini
            String prompt = createPrompt(request.getUserQuery(), productContext, null);
            logger.debug("Created prompt for Gemini API");
            
            // Call Gemini API
            String response = callGeminiApi(prompt);
            logger.debug("Received response from Gemini API");
            
            return new ChatbotResponse(response, true);
        } catch (Exception e) {
            logger.error("Error in getProductRecommendation: {}", e.getMessage(), e);
            return new ChatbotResponse("Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. " +
                    "Lỗi: " + e.getMessage(), false);
        }
    }

    public ChatbotResponse getProductContextRecommendation(ChatbotRequest request, String productId) {
        try {
            logger.debug("Processing product context recommendation request for productId: {}", productId);
            
            // Get current product
            Product currentProduct = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
            
            // Check if the request is about price comparison
            boolean isPriceComparisonQuery = isPriceComparisonQuery(request.getUserQuery());
            
            // If price comparison is requested, fetch external price data
            Map<String, Object> priceComparisonData = null;
            if (isPriceComparisonQuery) {
                priceComparisonData = priceComparisonService.getProductPriceComparison(
                    currentProduct.getTitle(), 
                    currentProduct.getDescription()
                );
                logger.debug("Price comparison data retrieved: {}", priceComparisonData);
            }
            
            // Get similar products in the same category
            List<Product> similarProducts = productRepository.findByCategoryId(currentProduct.getCategoryId(), null)
                .getContent().stream()
                .filter(p -> !p.getId().equals(productId) && !"SOLD".equals(p.getStatus()) && !"DELETED".equals(p.getStatus()))
                .limit(5)
                .collect(Collectors.toList());
            
            logger.debug("Found {} similar products for productId: {}", similarProducts.size(), productId);
            
            // Combine the current product with similar products
            List<Product> relatedProducts = new ArrayList<>();
            relatedProducts.add(currentProduct);
            relatedProducts.addAll(similarProducts);
            
            // Format product information for the prompt
            String productContext = formatProductContext(relatedProducts);
            
            // Format current product information
            String currentProductInfo = formatCurrentProductInfo(currentProduct);
            
            // Add price comparison information if available
            if (priceComparisonData != null && (boolean)priceComparisonData.getOrDefault("success", false)) {
                currentProductInfo += "\n\n" + formatPriceComparisonData(priceComparisonData);
            }
            
            // Create the prompt for Gemini with current product focus
            String prompt = createPrompt(request.getUserQuery(), productContext, currentProductInfo);
            logger.debug("Created prompt for Gemini API with product context");
            
            // Call Gemini API
            String response = callGeminiApi(prompt);
            logger.debug("Received response from Gemini API");
            
            return new ChatbotResponse(response, true);
        } catch (Exception e) {
            logger.error("Error in getProductContextRecommendation: {}", e.getMessage(), e);
            return new ChatbotResponse("Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. " +
                    "Lỗi: " + e.getMessage(), false);
        }
    }
    
    private List<Product> getRelevantProducts() {
        // Retrieve active products (not sold or deleted)
        return productRepository.findByStatusNotIn(List.of("SOLD", "DELETED"), null).getContent();
    }
    
    private String formatProductContext(List<Product> products) {
        // Limit to a reasonable number of products to avoid token limits
        List<Product> limitedProducts = products.stream().limit(20).collect(Collectors.toList());
        
        StringBuilder context = new StringBuilder("Thông tin sản phẩm hiện có:\n\n");
        
        for (int i = 0; i < limitedProducts.size(); i++) {
            Product product = limitedProducts.get(i);
            
            String productName = product.getTitle();
            String description = product.getDescription();
            
            // Get category name if available
            String categoryName = "không xác định";
            try {
                Category category = categoryService.getCategoryById(product.getCategoryId());
                if (category != null) {
                    categoryName = category.getName();
                }
            } catch (Exception e) {
                logger.warn("Could not fetch category for product context: {}", e.getMessage());
            }
            
            boolean inStock = product.getQuantity() > 0;
            
            context.append(i + 1)
                  .append(". Tên: ").append(productName)
                  .append("\n   Danh mục: ").append(categoryName)
                  .append("\n   Mô tả: ").append(description)
                  .append("\n   Giá: ").append(formatPrice(product.getPrice())).append(" VND")
                  .append("\n   Tình trạng: ").append(translateCondition(product.getCondition()))
                  .append("\n   Trạng thái: ").append(inStock ? "Còn hàng" : "Hết hàng")
                  .append("\n   Số lượng còn lại: ").append(product.getQuantity())
                  .append("\n\n");
        }
        
        return context.toString();
    }
    
    private String formatCurrentProductInfo(Product product) {
        try {
            // Get the category information for better context
            Category category = null;
            try {
                category = categoryService.getCategoryById(product.getCategoryId());
            } catch (Exception e) {
                logger.warn("Could not fetch category for product {}: {}", product.getId(), e.getMessage());
            }
            
            // Get review information
            Map<String, Object> reviewSummary = reviewService.getReviewSummary(product.getId());
            double averageRating = (Double) reviewSummary.getOrDefault("averageRating", 0.0);
            int totalReviews = (Integer) reviewSummary.getOrDefault("totalReviews", 0);
            
            StringBuilder info = new StringBuilder("SẢN PHẨM ĐANG XEM:\n\n");
            info.append("Tên: ").append(product.getTitle())
                .append("\nMô tả: ").append(product.getDescription())
                .append("\nGiá: ").append(formatPrice(product.getPrice())).append(" VND")
                .append("\nTình trạng: ").append(translateCondition(product.getCondition()))
                .append("\nSố lượng còn lại: ").append(product.getQuantity());
            
            // Add category information if available
            if (category != null) {
                info.append("\nDanh mục: ").append(category.getName());
            }
            
            // Add seller information if available
            if (product.getSellerUsername() != null) {
                info.append("\nNgười bán: ").append(product.getSellerUsername());
            }
            
            // Add location information if available
            if (product.getLocation() != null && !product.getLocation().isEmpty()) {
                info.append("\nĐịa điểm: ").append(product.getLocation());
            }
            
            // Add negotiable information
            info.append("\nThương lượng giá: ").append(product.isNegotiable() ? "Có" : "Không");
            
            // Add date information for context
            if (product.getCreatedAt() != null) {
                info.append("\nNgày đăng: ").append(formatDate(product.getCreatedAt()));
            }
            
            // Add views and favorites for popularity context
            info.append("\nLượt xem: ").append(product.getViews());
            info.append("\nLượt yêu thích: ").append(product.getFavorites());
            
            // Add review information
            info.append("\n\nĐÁNH GIÁ SẢN PHẨM:");
            if (totalReviews > 0) {
                info.append("\nXếp hạng trung bình: ").append(String.format("%.1f", averageRating)).append("/5 sao");
                info.append("\nSố lượng đánh giá: ").append(totalReviews);
                
                // Add distribution of ratings
                int fiveStarCount = (Integer) reviewSummary.getOrDefault("fiveStarCount", 0);
                int fourStarCount = (Integer) reviewSummary.getOrDefault("fourStarCount", 0);
                int threeStarCount = (Integer) reviewSummary.getOrDefault("threeStarCount", 0);
                int twoStarCount = (Integer) reviewSummary.getOrDefault("twoStarCount", 0);
                int oneStarCount = (Integer) reviewSummary.getOrDefault("oneStarCount", 0);
                
                info.append("\nPhân bố đánh giá:");
                info.append("\n- 5 sao: ").append(fiveStarCount).append(" đánh giá");
                info.append("\n- 4 sao: ").append(fourStarCount).append(" đánh giá");
                info.append("\n- 3 sao: ").append(threeStarCount).append(" đánh giá");
                info.append("\n- 2 sao: ").append(twoStarCount).append(" đánh giá");
                info.append("\n- 1 sao: ").append(oneStarCount).append(" đánh giá");
                
                // Get some recent reviews (limit to 3)
                List<Review> recentReviews = reviewService.getProductReviews(product.getId());
                if (!recentReviews.isEmpty()) {
                    info.append("\n\nMỘT SỐ ĐÁNH GIÁ GẦN ĐÂY:");
                    
                    int reviewCount = Math.min(recentReviews.size(), 3);
                    for (int i = 0; i < reviewCount; i++) {
                        Review review = recentReviews.get(i);
                        info.append("\n\n").append(i + 1).append(". ");
                        info.append(review.getUserFullName());
                        info.append(" (").append(review.getRating()).append(" sao): ");
                        info.append(review.getComment() != null ? truncateText(review.getComment(), 150) : "Không có bình luận");
                        
                        // Add seller reply if available
                        if (review.getSellerReply() != null && !review.getSellerReply().isEmpty()) {
                            info.append("\n   Phản hồi từ người bán: ").append(truncateText(review.getSellerReply(), 150));
                        }
                    }
                }
            } else {
                info.append("\nChưa có đánh giá nào cho sản phẩm này.");
            }
            
            // Check for potential issues with the product information
            StringBuilder problems = new StringBuilder();
            
            // Check if product is in stock and add a note
            if (product.getQuantity() <= 0) {
                problems.append("\n• Sản phẩm này hiện đang HẾT HÀNG.");
            }
            
            // Check if description is inadequate and add a note
            String description = product.getDescription() != null ? product.getDescription() : "";
            if (description.length() < 50 || 
                isNumericString(description) || 
                containsLongNumberSequence(description) ||
                isRandomString(description)) {
                problems.append("\n• Thông tin mô tả sản phẩm còn thiếu hoặc không rõ ràng.");
            }
            
            // Check if price seems suspicious
            if (product.getPrice() < 1000 && category != null && 
                !category.getName().toLowerCase().contains("mẫu") && 
                !category.getName().toLowerCase().contains("test")) {
                problems.append("\n• Giá sản phẩm có vẻ thấp bất thường.");
            }
            
            // Add problems if any were found
            if (problems.length() > 0) {
                info.append("\n\nLƯU Ý:").append(problems);
                info.append("\n\nĐể tư vấn chính xác hơn, cần yêu cầu khách hàng cung cấp thêm thông tin.");
            }
            
            return info.toString();
        } catch (Exception e) {
            logger.error("Error formatting product info: {}", e.getMessage());
            // Return basic info in case of error
            return "SẢN PHẨM ĐANG XEM:\n\n" +
                   "Tên: " + product.getTitle() + "\n" +
                   "Giá: " + formatPrice(product.getPrice()) + " VND\n" +
                   "Tình trạng: " + translateCondition(product.getCondition()) + "\n" +
                   "Số lượng còn lại: " + product.getQuantity();
        }
    }
    
    private String truncateText(String text, int maxLength) {
        if (text == null || text.length() <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + "...";
    }
    
    private boolean isNumericString(String str) {
        return str.matches("^\\d+$") || str.matches("^[\\d\\s]+$");
    }
    
    private boolean containsLongNumberSequence(String str) {
        return str.matches(".*\\d{8,}.*");
    }
    
    private boolean isRandomString(String str) {
        // Check for nonsensical keyboard mashing or random characters
        return str.matches(".*[a-zA-Z0-9]{15,}.*") || // Long alphanumeric without spaces
               str.matches(".*([qwerty]{4,}|[asdfgh]{4,}|[zxcvbn]{4,}).*") || // Keyboard rows
               str.matches(".*([1234567890]{4,}).*"); // Sequential numbers
    }
    
    private String formatDate(Date date) {
        if (date == null) return "không xác định";
        return new java.text.SimpleDateFormat("dd/MM/yyyy").format(date);
    }
    
    private String translateCondition(String condition) {
        if (condition == null) return "Không xác định";
        
        switch (condition) {
            case "NEW": return "Mới";
            case "LIKE_NEW": return "Như mới";
            case "GOOD": return "Tốt";
            case "FAIR": return "Khá";
            case "POOR": return "Kém";
            default: return "Không xác định";
        }
    }
    
    private String formatPrice(double price) {
        return String.format("%,.0f", price);
    }
    
    private String createPrompt(String userQuery, String productContext, String currentProductInfo) {
        if (currentProductInfo != null) {
            // Check if the current product has inadequate description
            boolean isOutOfStock = currentProductInfo.contains("HẾT HÀNG");
            boolean hasSuspiciousPrice = currentProductInfo.contains("Giá sản phẩm có vẻ thấp bất thường");
            boolean hasReviews = currentProductInfo.contains("ĐÁNH GIÁ SẢN PHẨM") && 
                                !currentProductInfo.contains("Chưa có đánh giá nào");
            
            // Create specific instructions based on the identified issues
            StringBuilder specificInstructions = new StringBuilder();
            
            if (currentProductInfo.contains("Thông tin mô tả sản phẩm còn thiếu")) {
                specificInstructions.append(
                    "Sản phẩm này có thông tin mô tả không đầy đủ hoặc không rõ ràng. " +
                    "Hãy chủ động hỏi khách hàng thêm các thông tin cần thiết như: \n" +
                    "- Sản phẩm thuộc danh mục nào cụ thể?\n" +
                    "- Công dụng chính của sản phẩm là gì?\n" +
                    "- Khách hàng quan tâm đến điều gì nhất ở sản phẩm này? (Ví dụ: hiệu năng, thiết kế, thương hiệu,...)\n" +
                    "- Khách hàng có ngân sách cụ thể không?\n" +
                    "- Khách hàng định sử dụng sản phẩm này cho mục đích gì?\n"
                );
            }
            
            if (isOutOfStock) {
                specificInstructions.append(
                    "Sản phẩm này hiện đang hết hàng. " +
                    "Ngoài việc tư vấn về thông tin sản phẩm, hãy gợi ý khách hàng xem xét các sản phẩm tương tự " +
                    "có sẵn trong danh sách sản phẩm liên quan, chỉ rõ những lựa chọn nào còn hàng. "
                );
            }
            
            if (hasSuspiciousPrice) {
                specificInstructions.append(
                    "Giá của sản phẩm này có vẻ thấp bất thường. " +
                    "Hãy nhẹ nhàng đề cập với khách hàng và gợi ý kiểm tra kỹ thông tin sản phẩm " +
                    "hoặc liên hệ trực tiếp với người bán để xác nhận trước khi đưa ra quyết định. "
                );
            }
            
            if (hasReviews) {
                specificInstructions.append(
                    "Sản phẩm này có đánh giá từ người dùng trước đó. " +
                    "Hãy sử dụng thông tin đánh giá để cung cấp cái nhìn tổng quan về chất lượng sản phẩm, " +
                    "đề cập đến xếp hạng trung bình và một số đánh giá cụ thể nếu khách hàng hỏi. "
                );
            }
            
            return String.format(
                "Bạn là trợ lý mua sắm ảo thông minh, chuyên tư vấn và giới thiệu sản phẩm bằng tiếng Việt. " + 
                "Khách hàng đang xem sản phẩm dưới đây và đang cần tư vấn về nó. " +
                "%s" +
                "Hãy trả lời với thái độ thân thiện, lịch sự và chuyên nghiệp. " +
                "Khi thông tin sản phẩm không đầy đủ, hãy chủ động hỏi thêm thông tin từ khách hàng " +
                "để có thể tư vấn chính xác nhất. Luôn sử dụng tiếng Việt có dấu.\n\n" +
                "ĐỊNH DẠNG TIN NHẮN CỦA BẠN:\n" +
                "1. Khi cần nhấn mạnh từ hoặc cụm từ, hãy sử dụng cú pháp thẻ HTML (<b>text</b>) thay vì dấu sao kép (**text**).\n" +
                "2. Khi cần liệt kê các điểm, hãy sử dụng '• ' (dấu chấm cộng khoảng trắng) thay vì '* ' (dấu sao khoảng trắng).\n" +
                "   Ví dụ: • Điểm 1\n          • Điểm 2\n" +
                "3. Câu trả lời của bạn nên được định dạng rõ ràng, có cấu trúc và dễ đọc.\n\n" +
                "%s\n\n" +
                "Các sản phẩm tương tự hoặc liên quan:\n\n" +
                "%s\n\n" +
                "Câu hỏi của khách hàng: %s", 
                specificInstructions.toString(),
                currentProductInfo,
                productContext, 
                userQuery
            );
        } else {
            return String.format(
                "Bạn là trợ lý mua sắm ảo thông minh, chuyên tư vấn và giới thiệu sản phẩm bằng tiếng Việt. " + 
                "Hãy sử dụng thông tin sản phẩm dưới đây để tư vấn cho khách hàng một cách hữu ích, thân thiện và chính xác. " +
                "Khi khách hàng yêu cầu, bạn có thể đề xuất các sản phẩm phù hợp với nhu cầu của họ, " +
                "so sánh các sản phẩm tương tự, hoặc giải thích các đặc điểm và tính năng.\n\n" +
                "ĐỊNH DẠNG TIN NHẮN CỦA BẠN:\n" +
                "1. Khi cần nhấn mạnh từ hoặc cụm từ, hãy sử dụng cú pháp thẻ HTML (<b>text</b>) thay vì dấu sao kép (**text**).\n" +
                "2. Khi cần liệt kê các điểm, hãy sử dụng '• ' (dấu chấm cộng khoảng trắng) thay vì '* ' (dấu sao khoảng trắng).\n" +
                "   Ví dụ: • Điểm 1\n          • Điểm 2\n" +
                "3. Câu trả lời của bạn nên được định dạng rõ ràng, có cấu trúc và dễ đọc.\n\n" +
                "Luôn trả lời bằng tiếng Việt có dấu, lịch sự và tập trung vào nhu cầu của khách hàng.\n\n" +
                "%s\n\n" +
                "Câu hỏi của khách hàng: %s", 
                productContext, 
                userQuery
            );
        }
    }

    /**
     * Process the formatted text to ensure markdown is rendered properly
     */
    private String processFormattedText(String text) {
        if (text == null) return "";
        
        // Replace any escaped HTML tags with actual HTML tags
        String processed = text
            .replace("&lt;b&gt;", "<b>")
            .replace("&lt;/b&gt;", "</b>")
            .replace("\\<b\\>", "<b>")
            .replace("\\</b\\>", "</b>");
        
        // Convert markdown bold syntax to HTML (with word boundaries)
        processed = processed.replaceAll("\\*\\*(.*?)\\*\\*", "<b>$1</b>");
        
        // Handle asterisks at the beginning of lines/paragraphs that should be displayed as list items
        processed = processed.replaceAll("(?m)^\\s*\\*\\s+(.*?)$", "<span class=\"bullet-point\">• $1</span>");
        
        return processed;
    }
    
    private String callGeminiApi(String prompt) {
        logger.debug("Calling Gemini API with prompt length: {}", prompt.length());
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = new HashMap<>();
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> content = new HashMap<>();
            
            List<Map<String, Object>> parts = new ArrayList<>();
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);
            parts.add(textPart);
            
            content.put("parts", parts);
            contents.add(content);
            requestBody.put("contents", contents);
            
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.7);
            generationConfig.put("maxOutputTokens", 800);
            generationConfig.put("topP", 0.95);
            generationConfig.put("topK", 40);
            requestBody.put("generationConfig", generationConfig);
            
            String fullUrl = String.format("%s?key=%s", apiUrl, apiKey);
            
            logger.debug("Full Gemini API URL: {}", fullUrl);
            logger.debug("Request payload format matches curl example");
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            RestTemplate customRestTemplate = new RestTemplate();
            customRestTemplate.setRequestFactory(new SimpleClientHttpRequestFactory());
            ((SimpleClientHttpRequestFactory) customRestTemplate.getRequestFactory()).setConnectTimeout(15000);
            ((SimpleClientHttpRequestFactory) customRestTemplate.getRequestFactory()).setReadTimeout(15000);
            
            ResponseEntity<Map> responseEntity = customRestTemplate.postForEntity(fullUrl, entity, Map.class);
            
            logger.debug("Gemini API response status: {}", responseEntity.getStatusCode());
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = responseEntity.getBody();
            
            if (response == null) {
                logger.error("Null response received from Gemini API");
                return "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. Vui lòng thử lại sau.";
            }
            
            logger.debug("Full Gemini API response: {}", response);
            
            if (response.containsKey("error")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> error = (Map<String, Object>) response.get("error");
                logger.error("Gemini API returned error: {}", error);
                return "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. Vui lòng thử lại sau.";
            }
            
            if (response.containsKey("candidates")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    
                    if (candidate.containsKey("content")) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> responseContent = (Map<String, Object>) candidate.get("content");
                        
                        if (responseContent.containsKey("parts")) {
                            @SuppressWarnings("unchecked")
                            List<Map<String, Object>> responseParts = (List<Map<String, Object>>) responseContent.get("parts");
                            
                            if (!responseParts.isEmpty() && responseParts.get(0).containsKey("text")) {
                                String responseText = (String) responseParts.get(0).get("text");
                                
                                responseText = processFormattedText(responseText);
                                
                                logger.debug("Successfully extracted response text from Gemini API");
                                return responseText;
                            }
                        }
                    }
                }
            }
            
            logger.error("Failed to extract text from Gemini API response: {}", response);
            return "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. Vui lòng thử lại sau.";
        } catch (Exception e) {
            logger.error("Exception when calling Gemini API: {}", e.getMessage(), e);
            return "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. Vui lòng thử lại sau.";
        }
    }

    /**
     * Check if the user query is about price comparison
     */
    private boolean isPriceComparisonQuery(String query) {
        String lowerQuery = query.toLowerCase();
        return lowerQuery.contains("so sánh giá") || 
               lowerQuery.contains("giá bên ngoài") ||
               lowerQuery.contains("giá trên mạng") ||
               lowerQuery.contains("giá ở đâu rẻ hơn") ||
               lowerQuery.contains("so sánh với") ||
               lowerQuery.contains("nên mua ở đâu") ||
               lowerQuery.contains("chỗ nào rẻ hơn") ||
               lowerQuery.contains("giá tốt hơn");
    }

    /**
     * Format price comparison data for inclusion in the prompt
     */
    private String formatPriceComparisonData(Map<String, Object> priceData) {
        StringBuilder result = new StringBuilder("THÔNG TIN SO SÁNH GIÁ:\n\n");
        
        if (priceData.containsKey("rawData")) {
            // If we only have raw data, include it directly
            return result.append(priceData.get("rawData")).toString();
        }
        
        // Format sources info
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> sources = (List<Map<String, Object>>) priceData.get("sources");
        if (sources != null && !sources.isEmpty()) {
            result.append("Giá niêm yết từ các nguồn khác:\n");
            for (Map<String, Object> source : sources) {
                result.append("• ").append(source.get("name")).append(": ")
                      .append(source.get("price")).append("\n");
            }
            result.append("\n");
        }
        
        // Format price ranges
        result.append("Khoảng giá trên thị trường:\n");
        result.append("• Giá thấp nhất: ").append(priceData.getOrDefault("lowestPrice", "Không xác định")).append("\n");
        result.append("• Giá trung bình: ").append(priceData.getOrDefault("averagePrice", "Không xác định")).append("\n");
        result.append("• Giá cao nhất: ").append(priceData.getOrDefault("highestPrice", "Không xác định")).append("\n\n");
        
        // Include recommendation
        String recommendation = (String) priceData.getOrDefault("recommendation", "");
        if (!recommendation.isEmpty()) {
            result.append("Khuyến nghị: ").append(recommendation).append("\n");
        }
        
        return result.toString();
    }
}
