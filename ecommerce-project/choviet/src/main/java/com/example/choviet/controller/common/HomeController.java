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

import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;


@Controller
@RequestMapping(COMMON + HOME)
public class HomeController {
    
    @Autowired
    private RecommendationService recommendationService;
    
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
    
}
