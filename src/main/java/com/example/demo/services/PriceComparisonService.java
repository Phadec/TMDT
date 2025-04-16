package com.example.demo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;

@Service
public class PriceComparisonService {
    private static final Logger logger = LoggerFactory.getLogger(PriceComparisonService.class);
    
    @Value("${gemini.api.key}")
    private String apiKey;
    
    @Value("${gemini.api.url}")
    private String apiUrl;
    
    @Autowired
    private RestTemplate restTemplate;

    /**
     * Get price comparison data for a product from various online sources
     * @param productName Name of the product
     * @param productDescription Description of the product
     * @return Map containing price comparison data
     */
    public Map<String, Object> getProductPriceComparison(String productName, String productDescription) {
        Map<String, Object> result = new HashMap<>();
        try {
            logger.debug("Getting price comparison for product: {}", productName);
            
            // Construct and send a request to Gemini API to search the web for price information
            String priceData = searchForPriceInformation(productName, productDescription);
            
            // Parse the response into structured data
            Map<String, Object> parsedData = parsePriceComparisonData(priceData, productName);
            
            if (parsedData != null && !parsedData.isEmpty()) {
                result.putAll(parsedData);
                result.put("success", true);
                result.put("rawData", priceData); // Include raw data for debugging
            } else {
                result.put("success", false);
                result.put("message", "Không tìm thấy thông tin so sánh giá cho sản phẩm này");
            }
            
        } catch (Exception e) {
            logger.error("Error in price comparison service: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Lỗi khi tìm kiếm thông tin so sánh giá: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * Search for price information on the web using Gemini API
     */
    private String searchForPriceInformation(String productName, String productDescription) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // Create the prompt for searching price information
            String prompt = createPriceSearchPrompt(productName, productDescription);
            
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
            generationConfig.put("temperature", 0.2); // Lower temperature for more factual responses
            generationConfig.put("maxOutputTokens", 1000);
            generationConfig.put("topP", 0.95);
            generationConfig.put("topK", 40);
            requestBody.put("generationConfig", generationConfig);
            
            String fullUrl = String.format("%s?key=%s", apiUrl, apiKey);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(fullUrl, entity, Map.class);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = responseEntity.getBody();
            
            if (response == null) {
                logger.error("Null response received from Gemini API during price search");
                return "Không tìm thấy thông tin giá cho sản phẩm này.";
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
                                logger.debug("Price information fetched successfully");
                                return responseText;
                            }
                        }
                    }
                }
            }
            
            logger.error("Failed to extract text from Gemini API response during price search");
            return "Không tìm thấy thông tin giá cho sản phẩm này.";
            
        } catch (Exception e) {
            logger.error("Error searching for price information: {}", e.getMessage(), e);
            return "Không thể tìm kiếm thông tin giá do lỗi hệ thống: " + e.getMessage();
        }
    }
    
    /**
     * Create a prompt for the Gemini API to search for price information
     */
    private String createPriceSearchPrompt(String productName, String productDescription) {
        return String.format(
            "Hãy tìm kiếm thông tin giá cho sản phẩm sau đây trên các trang thương mại điện tử (Tiki, Shopee, Lazada, " +
            "Phong Vũ, Thế Giới Di Động, FPT Shop, v.v.) và cung cấp kết quả dưới dạng phân tích so sánh giá.\n\n" +
            "Sản phẩm: %s\n" +
            "Mô tả: %s\n\n" +
            "Hãy trả về thông tin theo định dạng sau:\n" +
            "1. Tên sản phẩm: [Tên sản phẩm]\n" +
            "2. Khoảng giá thị trường:\n" +
            "   - Giá thấp nhất: [số tiền] VND tại [tên cửa hàng]\n" +
            "   - Giá trung bình: [số tiền] VND\n" +
            "   - Giá cao nhất: [số tiền] VND tại [tên cửa hàng]\n" +
            "3. Chi tiết giá niêm yết:\n" +
            "   - [Tên cửa hàng 1]: [Giá] VND\n" +
            "   - [Tên cửa hàng 2]: [Giá] VND\n" +
            "   - [Tên cửa hàng 3]: [Giá] VND\n" +
            "4. Đánh giá mức giá: [Nhận xét về mức giá hiện tại của sản phẩm so với thị trường]\n" +
            "5. Khuyến nghị: [Ghi chú nếu giá hiện tại hợp lý, quá cao, hoặc quá thấp so với thị trường]\n\n" +
            "Hãy đảm bảo rằng thông tin bạn cung cấp chính xác, đầy đủ và có tính so sánh. " +
            "Nếu không tìm thấy đủ thông tin, hãy nêu rõ những thông tin bạn đã tìm được và đề xuất lý do.",
            productName, productDescription
        );
    }
    
    /**
     * Parse the price comparison data from Gemini's response into a structured format
     */
    private Map<String, Object> parsePriceComparisonData(String priceData, String productName) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Validate that we have meaningful data
            if (priceData == null || priceData.trim().isEmpty() || 
                priceData.contains("Không tìm thấy") || 
                priceData.contains("không có thông tin")) {
                logger.warn("No meaningful price data found for {}", productName);
                return null;
            }
            
            // Extract price ranges using regex patterns
            // Extract lowest price
            String lowestPrice = extractPrice(priceData, "Giá thấp nhất:?\\s*([\\d.,]+)\\s*VND");
            if (lowestPrice != null) {
                result.put("lowestPrice", lowestPrice);
            }
            
            // Extract average price
            String averagePrice = extractPrice(priceData, "Giá trung bình:?\\s*([\\d.,]+)\\s*VND");
            if (averagePrice != null) {
                result.put("averagePrice", averagePrice);
            }
            
            // Extract highest price
            String highestPrice = extractPrice(priceData, "Giá cao nhất:?\\s*([\\d.,]+)\\s*VND");
            if (highestPrice != null) {
                result.put("highestPrice", highestPrice);
            }
            
            // Extract recommendation
            String recommendation = extractRecommendation(priceData);
            if (recommendation != null) {
                result.put("recommendation", recommendation);
            }
            
            // Extract price sources
            List<Map<String, Object>> sources = extractPriceSources(priceData);
            if (!sources.isEmpty()) {
                result.put("sources", sources);
            }
            
            // If we couldn't extract structured data, at least include the raw text
            if (result.isEmpty()) {
                result.put("rawAnalysis", priceData);
            }
            
            return result;
        } catch (Exception e) {
            logger.error("Error parsing price comparison data: {}", e.getMessage(), e);
            result.put("rawAnalysis", priceData);
            result.put("parsingError", e.getMessage());
            return result;
        }
    }
    
    /**
     * Extract price using regex pattern
     */
    private String extractPrice(String text, String pattern) {
        java.util.regex.Pattern p = java.util.regex.Pattern.compile(pattern);
        java.util.regex.Matcher m = p.matcher(text);
        if (m.find()) {
            return m.group(1);
        }
        return null;
    }
    
    /**
     * Extract recommendation section
     */
    private String extractRecommendation(String text) {
        int recommendationIndex = text.indexOf("Khuyến nghị:");
        if (recommendationIndex != -1) {
            String recommendationSection = text.substring(recommendationIndex + "Khuyến nghị:".length()).trim();
            int nextSectionIndex = recommendationSection.indexOf("\n\n");
            if (nextSectionIndex != -1) {
                return recommendationSection.substring(0, nextSectionIndex).trim();
            } else {
                return recommendationSection;
            }
        }
        
        // Try alternative section name
        recommendationIndex = text.indexOf("Đánh giá mức giá:");
        if (recommendationIndex != -1) {
            String recommendationSection = text.substring(recommendationIndex + "Đánh giá mức giá:".length()).trim();
            int nextSectionIndex = recommendationSection.indexOf("\n\n");
            if (nextSectionIndex != -1) {
                return recommendationSection.substring(0, nextSectionIndex).trim();
            } else {
                return recommendationSection;
            }
        }
        
        return null;
    }
    
    /**
     * Extract price sources from detailed listings
     */
    private List<Map<String, Object>> extractPriceSources(String text) {
        List<Map<String, Object>> sources = new ArrayList<>();
        
        // Look for the "Chi tiết giá niêm yết:" section or similar
        int detailsIndex = text.indexOf("Chi tiết giá niêm yết:");
        if (detailsIndex == -1) {
            // Try alternative section names
            detailsIndex = text.indexOf("Chi tiết giá bán:");
        }
        
        if (detailsIndex != -1) {
            // Get the section text
            String detailsSection = text.substring(detailsIndex);
            int nextSectionIndex = detailsSection.indexOf("\n\n");
            if (nextSectionIndex != -1) {
                detailsSection = detailsSection.substring(0, nextSectionIndex);
            }
            
            // Extract store and price pairs using regex
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("[-•]\\s*([^:]+):\\s*([\\d.,]+)\\s*VND");
            java.util.regex.Matcher matcher = pattern.matcher(detailsSection);
            
            while (matcher.find()) {
                String store = matcher.group(1).trim();
                String price = matcher.group(2).trim();
                
                Map<String, Object> source = new HashMap<>();
                source.put("name", store);
                source.put("price", price + " VND");
                sources.add(source);
            }
        }
        
        return sources;
    }
}
