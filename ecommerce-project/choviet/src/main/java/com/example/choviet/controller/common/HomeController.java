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
import com.example.choviet.service.RedisService;
import com.example.choviet.repository.ProductRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.ArrayList;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.CompletableFuture;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.context.request.async.DeferredResult;


@Controller
@RequestMapping(COMMON + HOME)
public class HomeController {
    
    @Autowired
    private RecommendationService recommendationService;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private RedisService redisService;
    
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
     * Có cache Redis với thời gian tồn tại 1 ngày
     * Được tối ưu để tránh lỗi client disconnect
     * 
     * @param recentlyViewedIds Danh sách ID sản phẩm xem gần đây (cách nhau bởi dấu phẩy)
     * @return ResponseEntity chứa danh sách 9 sản phẩm gợi ý hôm nay
     */
    @GetMapping(TODAY_RECOMMENDATIONS)
    public ResponseEntity<ApiResponse<List<Product>>> getTodayRecommendations(
            @RequestParam(value = "recentlyViewed", required = false) String recentlyViewedIds) {
        
        try {
            // Tạo cache key dựa trên recentlyViewedIds
            String cacheKey = generateTodayRecommendationsCacheKey(recentlyViewedIds);
            
            // Kiểm tra cache trước - ưu tiên cache để giảm thời gian phản hồi
            List<Product> cachedProducts = getCachedRecommendations(cacheKey);
            if (cachedProducts != null && !cachedProducts.isEmpty()) {
                System.out.println("Trả về dữ liệu từ cache: " + cacheKey);
                
                // Tạo response nhanh từ cache
                ApiResponse<List<Product>> response = ApiResponse.<List<Product>>builder()
                        .code(200)
                        .message("Lấy danh sách sản phẩm gợi ý hôm nay thành công (từ cache)")
                        .data(cachedProducts)
                        .build();
                
                return ResponseEntity.ok(response);
            }
            
            List<Product> recommendedProducts = new ArrayList<>();
            
            // Ưu tiên lấy fallback products trước để đảm bảo có dữ liệu nhanh
            List<Product> fallbackProducts = getSimpleFallbackProducts();
            
            // Try to get intelligent recommendations với timeout ngắn
            try {
                if (recentlyViewedIds != null && !recentlyViewedIds.trim().isEmpty()) {
                    // Lấy sản phẩm gợi ý dựa trên lịch sử xem
                    recommendedProducts = recommendationService.getRecommendedProducts(recentlyViewedIds);
                } else {
                    // Lấy sản phẩm gợi ý mặc định (sản phẩm mới nhất)
                    recommendedProducts = recommendationService.getDefaultRecommendedProducts();
                }
                
                // Kiểm tra nếu không có kết quả từ recommendation service
                if (recommendedProducts == null || recommendedProducts.isEmpty()) {
                    recommendedProducts = fallbackProducts;
                }
                
            } catch (Exception recommendationError) {
                // Log the recommendation error but continue with fallback
                System.err.println("Lỗi recommendation service: " + recommendationError.getMessage());
                
                // Sử dụng fallback products đã chuẩn bị sẵn
                recommendedProducts = fallbackProducts;
            }
            
            // Đảm bảo chỉ trả về tối đa 9 sản phẩm
            if (recommendedProducts != null && recommendedProducts.size() > 9) {
                recommendedProducts = recommendedProducts.subList(0, 9);
            }
            
            // Đảm bảo không trả về null
            if (recommendedProducts == null) {
                recommendedProducts = new ArrayList<>();
            }
            
            // Tạo response trước để giảm thời gian phản hồi
            ApiResponse<List<Product>> response = ApiResponse.<List<Product>>builder()
                    .code(200)
                    .message("Lấy danh sách sản phẩm gợi ý hôm nay thành công")
                    .data(recommendedProducts)
                    .build();
            
            // Lưu vào cache sau khi tạo response (non-blocking cache)
            if (!recommendedProducts.isEmpty()) {
                try {
                    cacheRecommendations(cacheKey, recommendedProducts);
                    System.out.println("Đã lưu dữ liệu vào cache: " + cacheKey);
                } catch (Exception cacheError) {
                    // Log lỗi cache nhưng không ảnh hưởng response
                    System.err.println("Lỗi khi lưu cache (không ảnh hưởng response): " + cacheError.getMessage());
                }
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            // Log lỗi để debug
            System.err.println("Lỗi nghiêm trọng trong getTodayRecommendations: " + e.getMessage());
            
            // Kiểm tra nếu là lỗi client disconnect thì không cần xử lý thêm
            if (e.getMessage() != null && 
                (e.getMessage().contains("ClientAbortException") || 
                 e.getMessage().contains("connection was aborted") ||
                 e.getCause() instanceof java.io.IOException)) {
                System.err.println("Client disconnect - không cần xử lý thêm");
                return null; // Spring sẽ xử lý trường hợp này
            }
            
            // Try fallback nhanh cho các lỗi khác
            try {
                List<Product> fallbackProducts = getSimpleFallbackProducts();
                
                ApiResponse<List<Product>> response = ApiResponse.<List<Product>>builder()
                        .code(200)
                        .message("Lấy danh sách sản phẩm thay thế thành công")
                        .data(fallbackProducts.isEmpty() ? new ArrayList<>() : 
                               fallbackProducts.size() > 9 ? fallbackProducts.subList(0, 9) : fallbackProducts)
                        .build();
                
                return ResponseEntity.ok(response);
                
            } catch (Exception fallbackError) {
                System.err.println("Lỗi cả fallback: " + fallbackError.getMessage());
                
                // Trả về response rỗng thay vì lỗi 500
                ApiResponse<List<Product>> errorResponse = ApiResponse.<List<Product>>builder()
                        .code(200)
                        .message("Hiện tại không có sản phẩm gợi ý. Vui lòng thử lại sau.")
                        .data(new ArrayList<>())
                        .build();
                
                return ResponseEntity.ok(errorResponse);
            }
        }
    }
    
    /**
     * Async version of today recommendations endpoint
     * Uses DeferredResult to handle long-running operations without blocking threads
     * 
     * @param recentlyViewedIds Danh sách ID sản phẩm xem gần đây
     * @return DeferredResult for async response
     */
    @GetMapping(TODAY_RECOMMENDATIONS + "/async")
    public DeferredResult<ResponseEntity<ApiResponse<List<Product>>>> getTodayRecommendationsAsync(
            @RequestParam(value = "recentlyViewed", required = false) String recentlyViewedIds) {
        
        // Set timeout cho DeferredResult (15 giây)
        DeferredResult<ResponseEntity<ApiResponse<List<Product>>>> deferredResult = 
            new DeferredResult<>(15000L);
        
        // Fallback nếu timeout
        deferredResult.onTimeout(() -> {
            try {
                List<Product> fallbackProducts = getSimpleFallbackProducts();
                ApiResponse<List<Product>> response = ApiResponse.<List<Product>>builder()
                        .code(200)
                        .message("Lấy danh sách sản phẩm thay thế thành công (timeout)")
                        .data(fallbackProducts.isEmpty() ? new ArrayList<>() : 
                               fallbackProducts.size() > 9 ? fallbackProducts.subList(0, 9) : fallbackProducts)
                        .build();
                deferredResult.setResult(ResponseEntity.ok(response));
            } catch (Exception e) {
                ApiResponse<List<Product>> errorResponse = ApiResponse.<List<Product>>builder()
                        .code(200)
                        .message("Timeout - trả về danh sách trống")
                        .data(new ArrayList<>())
                        .build();
                deferredResult.setResult(ResponseEntity.ok(errorResponse));
            }
        });
        
        // Error handler
        deferredResult.onError(throwable -> {
            System.err.println("Async error: " + throwable.getMessage());
            ApiResponse<List<Product>> errorResponse = ApiResponse.<List<Product>>builder()
                    .code(200)
                    .message("Lỗi xử lý - trả về danh sách trống")
                    .data(new ArrayList<>())
                    .build();
            deferredResult.setResult(ResponseEntity.ok(errorResponse));
        });
        
        // Xử lý async
        CompletableFuture.supplyAsync(() -> {
            try {
                // Tạo cache key
                String cacheKey = generateTodayRecommendationsCacheKey(recentlyViewedIds);
                
                // Kiểm tra cache trước
                List<Product> cachedProducts = getCachedRecommendations(cacheKey);
                if (cachedProducts != null && !cachedProducts.isEmpty()) {
                    return ResponseEntity.ok(ApiResponse.<List<Product>>builder()
                            .code(200)
                            .message("Lấy danh sách sản phẩm gợi ý hôm nay thành công (từ cache)")
                            .data(cachedProducts)
                            .build());
                }
                
                // Lấy fallback products trước
                List<Product> fallbackProducts = getSimpleFallbackProducts();
                List<Product> recommendedProducts;
                
                try {
                    if (recentlyViewedIds != null && !recentlyViewedIds.trim().isEmpty()) {
                        recommendedProducts = recommendationService.getRecommendedProducts(recentlyViewedIds);
                    } else {
                        recommendedProducts = recommendationService.getDefaultRecommendedProducts();
                    }
                    
                    if (recommendedProducts == null || recommendedProducts.isEmpty()) {
                        recommendedProducts = fallbackProducts;
                    }
                } catch (Exception e) {
                    recommendedProducts = fallbackProducts;
                }
                
                // Limit to 9 products
                if (recommendedProducts != null && recommendedProducts.size() > 9) {
                    recommendedProducts = recommendedProducts.subList(0, 9);
                }
                
                if (recommendedProducts == null) {
                    recommendedProducts = new ArrayList<>();
                }
                
                // Cache async - create final copy for lambda
                final List<Product> finalRecommendedProducts = recommendedProducts;
                if (!finalRecommendedProducts.isEmpty()) {
                    CompletableFuture.runAsync(() -> {
                        try {
                            cacheRecommendations(cacheKey, finalRecommendedProducts);
                        } catch (Exception e) {
                            System.err.println("Async cache error: " + e.getMessage());
                        }
                    });
                }
                
                ApiResponse<List<Product>> response = ApiResponse.<List<Product>>builder()
                        .code(200)
                        .message("Lấy danh sách sản phẩm gợi ý hôm nay thành công")
                        .data(recommendedProducts)
                        .build();
                
                return ResponseEntity.ok(response);
                
            } catch (Exception e) {
                System.err.println("Async processing error: " + e.getMessage());
                List<Product> fallbackProducts = getSimpleFallbackProducts();
                ApiResponse<List<Product>> response = ApiResponse.<List<Product>>builder()
                        .code(200)
                        .message("Lấy danh sách sản phẩm thay thế thành công")
                        .data(fallbackProducts.isEmpty() ? new ArrayList<>() : 
                               fallbackProducts.size() > 9 ? fallbackProducts.subList(0, 9) : fallbackProducts)
                        .build();
                return ResponseEntity.ok(response);
            }
        }).whenComplete((result, throwable) -> {
            if (throwable != null) {
                deferredResult.setErrorResult(throwable);
            } else {
                deferredResult.setResult(result);
            }
        });
        
        return deferredResult;
    }
    
    /**
     * Tạo cache key cho today recommendations
     * 
     * @param recentlyViewedIds Danh sách ID sản phẩm xem gần đây
     * @return Cache key
     */
    private String generateTodayRecommendationsCacheKey(String recentlyViewedIds) {
        String keyBase = "today_recommendations";
        if (recentlyViewedIds == null || recentlyViewedIds.trim().isEmpty()) {
            return keyBase + ":default";
        }
        // Sử dụng hash của recentlyViewedIds để tránh key quá dài
        return keyBase + ":" + Math.abs(recentlyViewedIds.hashCode());
    }
    
    /**
     * Lấy recommendations từ cache
     * 
     * @param cacheKey Cache key
     * @return Danh sách sản phẩm từ cache hoặc null nếu không có
     */
    @SuppressWarnings("unchecked")
    private List<Product> getCachedRecommendations(String cacheKey) {
        try {
            if (redisService.isKeyExists(cacheKey)) {
                Object cachedData = redisService.get(cacheKey);
                if (cachedData instanceof List) {
                    return (List<Product>) cachedData;
                }
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi lấy cache: " + e.getMessage());
            // Không throw exception, chỉ log và trả về null
        }
        return null;
    }
    
    /**
     * Lưu recommendations vào cache với TTL 1 ngày
     * 
     * @param cacheKey Cache key
     * @param products Danh sách sản phẩm cần cache
     */
    private void cacheRecommendations(String cacheKey, List<Product> products) {
        try {
            // Lưu cache với TTL 1 ngày (24 giờ)
            redisService.set(cacheKey, products, 1L, TimeUnit.DAYS);
        } catch (Exception e) {
            System.err.println("Lỗi khi lưu cache: " + e.getMessage());
            // Không throw exception, chỉ log lỗi
        }
    }
    
    /**
     * Xóa cache recommendations (có thể dùng khi cần refresh data)
     * 
     * @param recentlyViewedIds Danh sách ID sản phẩm xem gần đây
     */
    private void clearTodayRecommendationsCache(String recentlyViewedIds) {
        try {
            String cacheKey = generateTodayRecommendationsCacheKey(recentlyViewedIds);
            redisService.delete(cacheKey);
            System.out.println("Đã xóa cache: " + cacheKey);
        } catch (Exception e) {
            System.err.println("Lỗi khi xóa cache: " + e.getMessage());
        }
    }
    
    /**
     * Simple fallback method to get basic products when recommendation service fails
     * Optimized for fast response to prevent client disconnects
     */
    private List<Product> getSimpleFallbackProducts() {
        try {
            // Sử dụng query đơn giản và nhanh nhất
            Page<Product> productPage = productRepository.findByStatus(
                Product.Type.ACTIVE,
                PageRequest.of(0, 9, Sort.by(Sort.Direction.DESC, "createdAt"))
            );
            
            List<Product> products = productPage.getContent();
            
            // Log để debug
            System.out.println("Fallback products retrieved: " + products.size());
            
            return products != null ? products : new ArrayList<>();
            
        } catch (Exception e) {
            System.err.println("Lỗi trong getSimpleFallbackProducts: " + e.getMessage());
            
            // Try một query còn đơn giản hơn nếu cần
            try {
                // Fallback của fallback - chỉ lấy vài sản phẩm đầu tiên
                List<Product> products = productRepository.findAll(
                    PageRequest.of(0, 5)
                ).getContent();
                
                return products != null ? products : new ArrayList<>();
                
            } catch (Exception finalError) {
                System.err.println("Lỗi final fallback: " + finalError.getMessage());
                return new ArrayList<>();
            }
        }
    }
    
}
