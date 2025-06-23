package com.example.choviet.controller.common;

import static com.example.choviet.config.api.Prefix.*;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import static com.example.choviet.config.api.suffix.Home.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.choviet.dto.ApiResponse;
import com.example.choviet.entity.Product;
import com.example.choviet.service.RecommendationService;
import com.example.choviet.repository.ProductRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.ArrayList;


@Controller
@RequestMapping(COMMON + HOME)
public class HomeController {
    
    @Autowired
    private RecommendationService recommendationService;
    
    @Autowired
    private ProductRepository productRepository;
    
    /**
     * Lấy danh sách sản phẩm gợi ý cho banner trang chủ
     * Sử dụng transformer và KNN, fallback về sản phẩm mới nhất
     * 
     * @param recentlyViewedIds Danh sách ID sản phẩm xem gần đây (cách nhau bởi dấu phẩy)
     * @return ResponseEntity chứa danh sách 8 sản phẩm gợi ý
     */
    @GetMapping(BANNER)
    public ResponseEntity<ApiResponse<List<Product>>> getBanner(
            @RequestParam(value = "recentlyViewed", required = false) String recentlyViewedIds) {
        
        try {
            List<Product> recommendedProducts;
            
            if (recentlyViewedIds != null && !recentlyViewedIds.trim().isEmpty()) {
                // Lấy sản phẩm gợi ý dựa trên lịch sử xem
                recommendedProducts = recommendationService.getRecommendedProducts(recentlyViewedIds);
            } else {
                // Lấy sản phẩm gợi ý mặc định (sản phẩm mới nhất)
                recommendedProducts = recommendationService.getDefaultRecommendedProducts();
            }
            
            // Đảm bảo chỉ trả về tối đa 8 sản phẩm
            if (recommendedProducts.size() > 8) {
                recommendedProducts = recommendedProducts.subList(0, 8);
            }
            
            ApiResponse<List<Product>> response = ApiResponse.<List<Product>>builder()
                    .code(200)
                    .message("Lấy danh sách sản phẩm gợi ý thành công")
                    .data(recommendedProducts)
                    .build();
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            // Log lỗi để debug
            System.err.println("Lỗi trong getBanner: " + e.getMessage());
            e.printStackTrace();
            
            ApiResponse<List<Product>> errorResponse = ApiResponse.<List<Product>>builder()
                    .code(500)
                    .message("Lỗi khi lấy danh sách sản phẩm gợi ý: " + e.getMessage())
                    .data(null)
                    .build();
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Lấy danh sách sản phẩm gợi ý hôm nay
     * Sử dụng transformer và KNN, fallback về sản phẩm mới nhất
     * 
     * @param recentlyViewedIds Danh sách ID sản phẩm xem gần đây (cách nhau bởi dấu phẩy)
     * @return ResponseEntity chứa danh sách 9 sản phẩm gợi ý hôm nay
     */
    @GetMapping(TODAY_RECOMMENDATIONS)
    public ResponseEntity<ApiResponse<List<Product>>> getTodayRecommendations(
            @RequestParam(value = "recentlyViewed", required = false) String recentlyViewedIds) {
        
        try {
            List<Product> recommendedProducts = new ArrayList<>();
            
            // Try to get intelligent recommendations first
            try {
                if (recentlyViewedIds != null && !recentlyViewedIds.trim().isEmpty()) {
                    // Lấy sản phẩm gợi ý dựa trên lịch sử xem
                    recommendedProducts = recommendationService.getRecommendedProducts(recentlyViewedIds);
                } else {
                    // Lấy sản phẩm gợi ý mặc định (sản phẩm mới nhất)
                    recommendedProducts = recommendationService.getDefaultRecommendedProducts();
                }
            } catch (Exception recommendationError) {
                // Log the recommendation error but continue with fallback
                System.err.println("Lỗi recommendation service: " + recommendationError.getMessage());
                recommendationError.printStackTrace();
                
                // Fallback to simple latest products
                recommendedProducts = getSimpleFallbackProducts();
            }
            
            // Ensure we have some products and limit to 9
            if (recommendedProducts == null) {
                recommendedProducts = new ArrayList<>();
            }
            
            if (recommendedProducts.isEmpty()) {
                // Final fallback to basic product query
                recommendedProducts = getSimpleFallbackProducts();
            }
            
            // Đảm bảo chỉ trả về tối đa 9 sản phẩm
            if (recommendedProducts.size() > 9) {
                recommendedProducts = recommendedProducts.subList(0, 9);
            }
            
            ApiResponse<List<Product>> response = ApiResponse.<List<Product>>builder()
                    .code(200)
                    .message("Lấy danh sách sản phẩm gợi ý hôm nay thành công")
                    .data(recommendedProducts)
                    .build();
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            // Log lỗi để debug
            System.err.println("Lỗi nghiêm trọng trong getTodayRecommendations: " + e.getMessage());
            e.printStackTrace();
            
            // Try one more time with basic fallback
            try {
                List<Product> fallbackProducts = getSimpleFallbackProducts();
                
                ApiResponse<List<Product>> response = ApiResponse.<List<Product>>builder()
                        .code(200)
                        .message("Lấy danh sách sản phẩm thay thế thành công")
                        .data(fallbackProducts)
                        .build();
                
                return ResponseEntity.ok(response);
                
            } catch (Exception fallbackError) {
                System.err.println("Lỗi cả fallback: " + fallbackError.getMessage());
                
                ApiResponse<List<Product>> errorResponse = ApiResponse.<List<Product>>builder()
                        .code(500)
                        .message("Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.")
                        .data(new ArrayList<>())
                        .build();
                
                return ResponseEntity.status(500).body(errorResponse);
            }
        }
    }
    
    /**
     * Simple fallback method to get basic products when recommendation service fails
     */
    private List<Product> getSimpleFallbackProducts() {
        try {
            // Use basic product repository query instead of complex recommendation
            return productRepository.findByStatus(
                Product.Type.ACTIVE,
                PageRequest.of(0, 9, Sort.by(Sort.Direction.DESC, "createdAt"))
            ).getContent();
        } catch (Exception e) {
            System.err.println("Lỗi trong getSimpleFallbackProducts: " + e.getMessage());
            return new ArrayList<>();
        }
    }
    
}
