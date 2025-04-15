package com.example.demo.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import org.springframework.scheduling.annotation.Async;
import java.util.concurrent.CompletableFuture;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class PriceComparisonService {
    private static final Logger logger = LoggerFactory.getLogger(PriceComparisonService.class);
    
    @Value("${gemini.api.key}")
    private String apiKey;
    
    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent}")
    private String apiUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    /**
     * Get price comparison information for a product
     * @param productName The product name to search for
     * @param description Additional product description 
     * @return Map containing price comparison data
     */
    public Map<String, Object> getProductPriceComparison(String productName, String description) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Call Gemini API to get price comparison from web search
            String comparisonData = queryProductPrices(productName, description);
            
            // Simulate processing the response to return structured data
            Map<String, Object> parsedData = parseComparisonResponse(comparisonData);
            
            result.put("success", true);
            result.put("priceData", parsedData);
            return result;
        } catch (Exception e) {
            logger.error("Error in price comparison service: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("error", e.getMessage());
            return result;
        }
    }

    /**
     * Asynchronously fetch price comparison data
     */
    @Async
    public CompletableFuture<Map<String, Object>> getProductPriceComparisonAsync(String productName, String description) {
        return CompletableFuture.completedFuture(getProductPriceComparison(productName, description));
    }
    
    /**
     * Use Gemini API to get price comparison data by simulating a web search
     */
    private String queryProductPrices(String productName, String description) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> textPart = new HashMap<>();
        
        // Create prompt to simulate web search for price comparison
        String prompt = String.format(
            "Tôi cần thông tin giá của sản phẩm \"%s\" (%s) từ nhiều nguồn khác nhau trên thị trường Việt Nam. " +
            "Hãy cung cấp giá niêm yết từ ít nhất 3 trang mua sắm trực tuyến uy tín như Shopee, Lazada, Tiki, " +
            "Phong Vũ, FPT Shop, Thế Giới Di Động, v.v. Cho tôi biết giá thấp nhất, trung bình và cao nhất. " +
            "Hãy định dạng kết quả rõ ràng với tên trang web, giá, có ghi chú về các khuyến mãi nếu có. " +
            "Hãy đưa ra lời khuyên về giá có hợp lý không và liệu có nên mua tại thời điểm này hay không. " +
            "Tạo câu trả lời dưới định dạng mà tôi có thể dễ dàng sử dụng để tư vấn khách hàng.",
            productName, 
            description
        );
        
        textPart.put("text", prompt);
        parts.add(textPart);
        
        content.put("parts", parts);
        contents.add(content);
        requestBody.put("contents", contents);
        
        // Configure the AI to give structured results
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.2);
        generationConfig.put("maxOutputTokens", 1000);
        generationConfig.put("topP", 0.8);
        generationConfig.put("topK", 40);
        requestBody.put("generationConfig", generationConfig);
        
        // Create full URL with API key
        String fullUrl = String.format("%s?key=%s", apiUrl, apiKey);
        
        logger.debug("Calling Gemini API for price comparison");
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(fullUrl, entity, Map.class);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = responseEntity.getBody();
            
            if (response != null && response.containsKey("candidates")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    @SuppressWarnings("unchecked")
                    Map<String, Object> responseContent = (Map<String, Object>) candidate.get("content");
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> responseParts = (List<Map<String, Object>>) responseContent.get("parts");
                    if (!responseParts.isEmpty()) {
                        String responseText = (String) responseParts.get(0).get("text");
                        logger.debug("Successfully received price comparison data from Gemini API");
                        return responseText;
                    }
                }
            }
            
            return "Không thể lấy thông tin so sánh giá lúc này.";
        } catch (Exception e) {
            logger.error("Error querying product prices: {}", e.getMessage(), e);
            return "Lỗi khi truy vấn giá sản phẩm: " + e.getMessage();
        }
    }
    
    /**
     * Parse the comparison response into structured data
     * This is a simple implementation that would be enhanced with proper parsing logic
     */
    private Map<String, Object> parseComparisonResponse(String comparisonText) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> sources = new ArrayList<>();
        
        // Basic extraction of price sources (in a real implementation this would use NLP or regex patterns)
        if (comparisonText.contains("Shopee")) {
            Map<String, Object> source = new HashMap<>();
            source.put("name", "Shopee");
            source.put("price", extractApproximatePrice(comparisonText, "Shopee"));
            source.put("url", "https://shopee.vn");
            sources.add(source);
        }
        
        if (comparisonText.contains("Lazada")) {
            Map<String, Object> source = new HashMap<>();
            source.put("name", "Lazada");
            source.put("price", extractApproximatePrice(comparisonText, "Lazada"));
            source.put("url", "https://www.lazada.vn");
            sources.add(source);
        }
        
        if (comparisonText.contains("Tiki")) {
            Map<String, Object> source = new HashMap<>();
            source.put("name", "Tiki");
            source.put("price", extractApproximatePrice(comparisonText, "Tiki"));
            source.put("url", "https://tiki.vn");
            sources.add(source);
        }
        
        // Add a couple more potential sources
        for (String store : Arrays.asList("FPT Shop", "Thế Giới Di Động", "Phong Vũ", "CellphoneS")) {
            if (comparisonText.contains(store)) {
                Map<String, Object> source = new HashMap<>();
                source.put("name", store);
                source.put("price", extractApproximatePrice(comparisonText, store));
                source.put("url", getStoreUrl(store));
                sources.add(source);
            }
        }
        
        // If no sources were found, add the raw text instead
        if (sources.isEmpty()) {
            result.put("rawData", comparisonText);
        } else {
            result.put("sources", sources);
            
            // Try to extract price ranges
            result.put("lowestPrice", extractPriceMetric(comparisonText, "thấp nhất", "giá thấp nhất"));
            result.put("averagePrice", extractPriceMetric(comparisonText, "trung bình", "giá trung bình"));
            result.put("highestPrice", extractPriceMetric(comparisonText, "cao nhất", "giá cao nhất"));
            
            // Extract recommendation
            result.put("recommendation", extractRecommendation(comparisonText));
        }
        
        return result;
    }
    
    /**
     * Extract approximate price from text for a specific store
     * This is a very simple implementation and would need to be improved with better parsing
     */
    private String extractApproximatePrice(String text, String store) {
        try {
            // Try to find the store name followed by a price within 100 characters
            int storeIndex = text.indexOf(store);
            if (storeIndex >= 0) {
                String subText = text.substring(storeIndex, Math.min(storeIndex + 150, text.length()));
                for (String pattern : Arrays.asList("\\d+[\\.,]\\d+[\\.,]\\d+\\s*(?:VND|đ|Đ|₫|vnđ)",
                                                  "\\d+[\\.,]\\d+\\s*(?:VND|đ|Đ|₫|vnđ)",
                                                  "\\d+\\s*(?:VND|đ|Đ|₫|vnđ)",
                                                  "\\d+[\\.,]\\d+[\\.,]\\d+")) {
                    java.util.regex.Pattern pricePattern = java.util.regex.Pattern.compile(pattern, java.util.regex.Pattern.CASE_INSENSITIVE);
                    java.util.regex.Matcher matcher = pricePattern.matcher(subText);
                    if (matcher.find()) {
                        return matcher.group(0);
                    }
                }
            }
        } catch (Exception e) {
            logger.warn("Error extracting price for {}: {}", store, e.getMessage());
        }
        return "Không xác định";
    }
    
    /**
     * Extract price metrics (lowest, average, highest)
     */
    private String extractPriceMetric(String text, String... keywords) {
        try {
            for (String keyword : keywords) {
                int index = text.toLowerCase().indexOf(keyword.toLowerCase());
                if (index >= 0) {
                    String subText = text.substring(index, Math.min(index + 100, text.length()));
                    for (String pattern : Arrays.asList("\\d+[\\.,]\\d+[\\.,]\\d+\\s*(?:VND|đ|Đ|₫|vnđ)",
                                                      "\\d+[\\.,]\\d+\\s*(?:VND|đ|Đ|₫|vnđ)",
                                                      "\\d+\\s*(?:VND|đ|Đ|₫|vnđ)",
                                                      "\\d+[\\.,]\\d+[\\.,]\\d+")) {
                        java.util.regex.Pattern pricePattern = java.util.regex.Pattern.compile(pattern, java.util.regex.Pattern.CASE_INSENSITIVE);
                        java.util.regex.Matcher matcher = pricePattern.matcher(subText);
                        if (matcher.find()) {
                            return matcher.group(0);
                        }
                    }
                }
            }
        } catch (Exception e) {
            logger.warn("Error extracting price metric: {}", e.getMessage());
        }
        return "Không xác định";
    }
    
    /**
     * Extract recommendation part from the text
     */
    private String extractRecommendation(String text) {
        try {
            for (String keyword : Arrays.asList("khuyên", "nên", "lời khuyên", "tư vấn", "recommendation")) {
                int index = text.toLowerCase().indexOf(keyword.toLowerCase());
                if (index >= 0) {
                    // Extract a reasonable paragraph after the keyword
                    String subText = text.substring(index);
                    int endIndex = subText.indexOf("\n\n");
                    if (endIndex > 0) {
                        return subText.substring(0, endIndex).trim();
                    } else {
                        // If no double newline, take a reasonable amount of text
                        return subText.substring(0, Math.min(300, subText.length())).trim();
                    }
                }
            }
        } catch (Exception e) {
            logger.warn("Error extracting recommendation: {}", e.getMessage());
        }
        return "Không có khuyến nghị cụ thể.";
    }
    
    /**
     * Get URL for a store
     */
    private String getStoreUrl(String store) {
        Map<String, String> storeUrls = Map.of(
            "FPT Shop", "https://fptshop.com.vn",
            "Thế Giới Di Động", "https://www.thegioididong.com",
            "Phong Vũ", "https://phongvu.vn",
            "CellphoneS", "https://cellphones.com.vn"
        );
        return storeUrls.getOrDefault(store, "#");
    }
}
