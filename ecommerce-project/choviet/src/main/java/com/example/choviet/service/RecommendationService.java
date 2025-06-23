package com.example.choviet.service;

import com.example.choviet.entity.Product;
import com.example.choviet.repository.ProductRepository;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service xử lý gợi ý sản phẩm sử dụng transformer, KNN và fallback
 */
@FieldDefaults(level = AccessLevel.PRIVATE)
@Service
public class RecommendationService {

    @Autowired
    ProductRepository productRepository;

    @Autowired
    SimilarProductService similarProductService;

    @Autowired
    ProductService productService;

    @Autowired
    KNNService knnService;

    private static final int DEFAULT_RECOMMENDATION_COUNT = 8;
    private static final int FALLBACK_CANDIDATE_COUNT = 50;

    /**
     * Lấy 8 sản phẩm gợi ý dựa trên transformer và KNN,
     * nếu không đủ thì lấy sản phẩm mới nhất
     * 
     * @param recentlyViewedProductIds Danh sách ID sản phẩm xem gần đây
     * @return Danh sách sản phẩm gợi ý
     */
    public List<Product> getRecommendedProducts(List<String> recentlyViewedProductIds) {
        Set<String> recommendedProductIds = new HashSet<>();
        List<Product> recommendedProducts = new ArrayList<>();
        
        try {
            // Bước 1: Lấy sản phẩm ứng viên
            List<Product> candidates = getCandidateProducts();
            
            // Bước 2: Áp dụng cả Transformer và KNN nếu có sản phẩm đã xem
            if (recentlyViewedProductIds != null && !recentlyViewedProductIds.isEmpty()) {
                // Lấy thông tin chi tiết các sản phẩm đã xem
                List<Product> recentlyViewedProducts = getProductsByIds(recentlyViewedProductIds);
                
                if (!recentlyViewedProducts.isEmpty()) {
                    // Phương pháp 1: Transformer-based recommendations
                    List<Product> transformerRecommendations = getTransformerRecommendations(
                            recentlyViewedProducts, candidates, 4);
                    
                    // Phương pháp 2: KNN-based recommendations
                    List<Product> knnRecommendations = getKNNRecommendations(
                            recentlyViewedProducts, candidates, 4);
                    
                    // Kết hợp kết quả từ cả hai phương pháp
                    addUniqueProducts(recommendedProducts, recommendedProductIds, 
                                    transformerRecommendations, recentlyViewedProductIds);
                    addUniqueProducts(recommendedProducts, recommendedProductIds, 
                                    knnRecommendations, recentlyViewedProductIds);
                }
            }
            
            // Bước 3: Nếu chưa đủ 8 sản phẩm, lấy thêm sản phẩm mới nhất
            if (recommendedProducts.size() < DEFAULT_RECOMMENDATION_COUNT) {
                int remaining = DEFAULT_RECOMMENDATION_COUNT - recommendedProducts.size();
                List<Product> newProducts = getLatestProducts(remaining, recommendedProductIds, recentlyViewedProductIds);
                recommendedProducts.addAll(newProducts);
            }
            
            // Bước 4: Làm phong phú thông tin cho các sản phẩm
            return enrichProductDetails(recommendedProducts);
            
        } catch (Exception e) {
            // Nếu có lỗi với transformer/KNN, fallback về sản phẩm mới nhất
            return getLatestProductsAsFallback(recentlyViewedProductIds);
        }
    }

    /**
     * Lấy sản phẩm mới nhất làm fallback
     */
    private List<Product> getLatestProductsAsFallback(List<String> excludeIds) {
        try {
            List<Product> latestProducts = productRepository.findByStatus(
                Product.Type.ACTIVE,
                PageRequest.of(0, FALLBACK_CANDIDATE_COUNT, Sort.by(Sort.Direction.DESC, "createdAt"))
            ).getContent();
            
            List<String> excludeList = excludeIds != null ? excludeIds : new ArrayList<>();
            
            List<Product> filtered = latestProducts.stream()
                    .filter(product -> !excludeList.contains(product.getId()))
                    .limit(DEFAULT_RECOMMENDATION_COUNT)
                    .collect(Collectors.toList());
            
            return enrichProductDetails(filtered);
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    /**
     * Lấy sản phẩm ứng viên để gợi ý
     */
    private List<Product> getCandidateProducts() {
        return productRepository.findByStatus(
            Product.Type.ACTIVE,
            PageRequest.of(0, FALLBACK_CANDIDATE_COUNT, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent();
    }

    /**
     * Lấy thông tin chi tiết các sản phẩm theo danh sách ID
     */
    private List<Product> getProductsByIds(List<String> productIds) {
        return productIds.stream()
                .map(id -> {
                    try {
                        return productService.detail(id);
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(product -> product != null && Product.Type.ACTIVE.equals(product.getStatus()))
                .collect(Collectors.toList());
    }

    /**
     * Lấy gợi ý bằng Transformer
     */
    private List<Product> getTransformerRecommendations(List<Product> recentlyViewedProducts, 
                                                       List<Product> candidates, int count) {
        List<Product> recommendations = new ArrayList<>();
        
        for (Product viewedProduct : recentlyViewedProducts) {
            if (recommendations.size() >= count) break;
            
            List<Product> similar = similarProductService.findSimilarProducts(
                    viewedProduct.getId(), count - recommendations.size());
            
            for (Product product : similar) {
                if (recommendations.size() >= count) break;
                if (recommendations.stream().noneMatch(p -> p.getId().equals(product.getId()))) {
                    recommendations.add(product);
                }
            }
        }
        
        return recommendations;
    }

    /**
     * Lấy gợi ý bằng KNN
     */
    private List<Product> getKNNRecommendations(List<Product> recentlyViewedProducts, 
                                              List<Product> candidates, int count) {
        // Tạo embeddings cho các sản phẩm đã xem
        Map<String, double[]> targetEmbeddings = new HashMap<>();
        for (Product product : recentlyViewedProducts) {
            try {
                double[] embedding = createSimpleEmbedding(product);
                targetEmbeddings.put(product.getId(), embedding);
            } catch (Exception e) {
                // Bỏ qua nếu không thể tạo embedding
            }
        }
        
        if (targetEmbeddings.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Sử dụng ensemble KNN để kết hợp kết quả từ nhiều sản phẩm đã xem
        return knnService.findEnsembleKNearestProducts(
                recentlyViewedProducts, candidates, targetEmbeddings, count);
    }

    /**
     * Tạo embedding đơn giản cho sản phẩm
     */
    private double[] createSimpleEmbedding(Product product) {
        StringBuilder textBuilder = new StringBuilder();
        if (product.getName() != null) {
            textBuilder.append(product.getName()).append(" ");
        }
        if (product.getShortDes() != null) {
            textBuilder.append(product.getShortDes()).append(" ");
        }
        if (product.getDescription() != null) {
            textBuilder.append(product.getDescription());
        }
        
        // Tạo vector đơn giản dựa trên hash và length
        String text = textBuilder.toString().toLowerCase();
        double[] embedding = new double[10]; // Vector 10 chiều đơn giản
        
        if (!text.isEmpty()) {
            int hash = Math.abs(text.hashCode());
            for (int i = 0; i < embedding.length; i++) {
                embedding[i] = (hash % (i + 1)) / 1000.0;
            }
            embedding[0] = text.length() / 100.0; // Chiều đầu tiên dựa trên độ dài text
        }
        
        return embedding;
    }

    /**
     * Thêm các sản phẩm duy nhất vào danh sách gợi ý
     */
    private void addUniqueProducts(List<Product> recommendations, Set<String> recommendedIds,
                                  List<Product> newProducts, List<String> excludeIds) {
        Set<String> excludeSet = new HashSet<>();
        if (excludeIds != null) {
            excludeSet.addAll(excludeIds);
        }
        
        for (Product product : newProducts) {
            if (recommendations.size() >= DEFAULT_RECOMMENDATION_COUNT) break;
            
            if (!recommendedIds.contains(product.getId()) && 
                !excludeSet.contains(product.getId()) &&
                Product.Type.ACTIVE.equals(product.getStatus())) {
                
                recommendations.add(product);
                recommendedIds.add(product.getId());
            }
        }
    }

    /**
     * Lấy sản phẩm mới nhất để bổ sung
     */
    private List<Product> getLatestProducts(int count, Set<String> excludeIds, List<String> recentlyViewedIds) {
        Set<String> allExcludeIds = new HashSet<>();
        if (excludeIds != null) {
            allExcludeIds.addAll(excludeIds);
        }
        if (recentlyViewedIds != null) {
            allExcludeIds.addAll(recentlyViewedIds);
        }
        
        List<Product> latestProducts = productRepository.findByStatus(
            Product.Type.ACTIVE,
            PageRequest.of(0, count * 3, Sort.by(Sort.Direction.DESC, "createdAt")) 
        ).getContent();
        
        return latestProducts.stream()
                .filter(product -> !allExcludeIds.contains(product.getId()))
                .limit(count)
                .collect(Collectors.toList());
    }

    /**
     * Làm phong phú thông tin chi tiết cho các sản phẩm
     */
    private List<Product> enrichProductDetails(List<Product> products) {
        return products.stream()
                .map(product -> {
                    try {
                        return productService.detail(product.getId());
                    } catch (Exception e) {
                        // Nếu không thể lấy chi tiết, trả về sản phẩm gốc
                        return product;
                    }
                })
                .collect(Collectors.toList());
    }

    /**
     * Lấy sản phẩm gợi ý với danh sách ID sản phẩm xem gần đây dạng chuỗi
     */
    public List<Product> getRecommendedProducts(String recentlyViewedIds) {
        List<String> productIds = new ArrayList<>();
        
        if (recentlyViewedIds != null && !recentlyViewedIds.trim().isEmpty()) {
            String[] ids = recentlyViewedIds.split(",");
            for (String id : ids) {
                String trimmedId = id.trim();
                if (!trimmedId.isEmpty()) {
                    productIds.add(trimmedId);
                }
            }
        }

        // Xử lý ảnh qua proxy
        
        return getRecommendedProducts(productIds);
    }

    /**
     * Lấy sản phẩm gợi ý mặc định (không cần sản phẩm xem gần đây)
     */
    public List<Product> getDefaultRecommendedProducts() {
        return getRecommendedProducts((List<String>) null);
    }
}