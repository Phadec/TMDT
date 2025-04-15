package com.example.demo.controllers;

import com.example.demo.dtos.ChatbotRequest;
import com.example.demo.dtos.ChatbotResponse;
import com.example.demo.services.ProductChatbotService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/chatbot")
public class ProductChatbotController {

    private static final Logger logger = LoggerFactory.getLogger(ProductChatbotController.class);

    @Autowired
    private ProductChatbotService chatbotService;
    
    @PostMapping("/query")
    public ResponseEntity<ChatbotResponse> getRecommendation(@RequestBody ChatbotRequest request) {
        logger.info("Received general chatbot query: {}", request.getUserQuery());
        
        try {
            ChatbotResponse response = chatbotService.getProductRecommendation(request);
            logger.info("Chatbot query processed, success: {}", response.isSuccess());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error processing chatbot query", e);
            ChatbotResponse errorResponse = new ChatbotResponse(
                "Xin lỗi, hệ thống đang gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.", 
                false
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @PostMapping("/query/product/{productId}")
    public ResponseEntity<ChatbotResponse> getProductRecommendation(
            @RequestBody ChatbotRequest request,
            @PathVariable String productId) {
        logger.info("Received product-specific chatbot query for product {}: {}", 
                productId, request.getUserQuery());
        
        try {
            ChatbotResponse response = chatbotService.getProductContextRecommendation(request, productId);
            logger.info("Product-specific chatbot query processed, success: {}", response.isSuccess());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error processing product-specific chatbot query: {}", e.getMessage(), e);
            ChatbotResponse errorResponse = new ChatbotResponse(
                "Xin lỗi, hệ thống đang gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.", 
                false
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/query/reviews/{productId}")
    public ResponseEntity<ChatbotResponse> getProductReviewsInfo(
            @RequestBody ChatbotRequest request,
            @PathVariable String productId) {
        logger.info("Received review-specific chatbot query for product {}: {}", 
                productId, request.getUserQuery());
        
        try {
            // This uses the same context recommendation service but can be specialized in the future
            ChatbotResponse response = chatbotService.getProductContextRecommendation(request, productId);
            logger.info("Review-specific chatbot query processed, success: {}", response.isSuccess());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error processing review-specific chatbot query: {}", e.getMessage(), e);
            ChatbotResponse errorResponse = new ChatbotResponse(
                "Xin lỗi, hệ thống đang gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.", 
                false
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/query/price-comparison/{productId}")
    public ResponseEntity<ChatbotResponse> getPriceComparisonForProduct(
            @RequestBody ChatbotRequest request,
            @PathVariable String productId) {
        logger.info("Received price comparison query for product {}: {}", 
                productId, request.getUserQuery());
        
        try {
            // Modify the request to explicitly ask for price comparison
            ChatbotRequest enhancedRequest = new ChatbotRequest();
            enhancedRequest.setUserQuery("Tôi muốn so sánh giá sản phẩm này với các nơi khác. " + request.getUserQuery());
            
            ChatbotResponse response = chatbotService.getProductContextRecommendation(enhancedRequest, productId);
            logger.info("Price comparison query processed, success: {}", response.isSuccess());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error processing price comparison query", e);
            ChatbotResponse errorResponse = new ChatbotResponse(
                "Xin lỗi, hệ thống đang gặp sự cố khi xử lý yêu cầu so sánh giá của bạn. Vui lòng thử lại sau.", 
                false
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
