package com.example.choviet.transformer;

import com.example.choviet.entity.Product;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Lớp ProductTransformer biến đổi sản phẩm thành vector nhúng
 * và tìm các sản phẩm tương tự
 */
@Component
public class ProductTransformer {
    private static final int EMBEDDING_DIMENSIONS = 100;
    
    private final TextEmbedding textEmbedding;
    private final SelfAttention selfAttention;
    private final Map<String, double[]> productEmbeddingCache;
    
    /**
     * Khởi tạo transformer với các thành phần cần thiết
     */
    public ProductTransformer() {
        this.textEmbedding = new TextEmbedding(EMBEDDING_DIMENSIONS);
        this.selfAttention = new SelfAttention(EMBEDDING_DIMENSIONS);
        this.productEmbeddingCache = new ConcurrentHashMap<>();
    }
    
    /**
     * Chuyển đổi sản phẩm thành vector nhúng
     * @param product Sản phẩm cần chuyển đổi
     * @return Vector nhúng đã được tăng cường
     */
    public double[] transformProduct(Product product) {
        // Kiểm tra cache
        if (productEmbeddingCache.containsKey(product.getId())) {
            return productEmbeddingCache.get(product.getId());
        }
        
        // Kết hợp tên và mô tả sản phẩm
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
        
        String combinedText = textBuilder.toString();
        
        // Tạo vector nhúng
        double[] embedding = textEmbedding.getEmbedding(combinedText);
        
        // Áp dụng cơ chế tự chú ý
        double[] enhancedEmbedding = selfAttention.applyAttention(embedding);
        
        // Lưu vào cache
        productEmbeddingCache.put(product.getId(), enhancedEmbedding);
        
        return enhancedEmbedding;
    }
    
    /**
     * Tìm các sản phẩm tương tự dựa trên độ tương đồng cosine
     * @param product Sản phẩm cần tìm tương tự
     * @param candidates Danh sách sản phẩm ứng viên
     * @param limit Số lượng sản phẩm tương tự cần trả về
     * @return Danh sách sản phẩm tương tự
     */
    public List<Product> findSimilarProducts(Product product, List<Product> candidates, int limit) {
        if (product == null || candidates == null || candidates.isEmpty()) {
            return Collections.emptyList();
        }
        
        // Lấy vector nhúng của sản phẩm cần so sánh
        double[] productEmbedding = transformProduct(product);
        
        // Tính độ tương đồng với các sản phẩm ứng viên
        Map<Product, Double> similarityScores = new HashMap<>();
        
        for (Product candidate : candidates) {
            // Bỏ qua sản phẩm trùng với sản phẩm cần so sánh
            if (candidate.getId().equals(product.getId())) {
                continue;
            }
            
            // Lấy vector nhúng của sản phẩm ứng viên
            double[] candidateEmbedding = transformProduct(candidate);
            
            // Tính độ tương đồng cosine
            double similarity = TextEmbedding.cosineSimilarity(productEmbedding, candidateEmbedding);
            
            similarityScores.put(candidate, similarity);
        }
        
        // Sắp xếp theo độ tương đồng giảm dần và lấy top N
        return similarityScores.entrySet().stream()
                .sorted(Map.Entry.<Product, Double>comparingByValue().reversed())
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }
    
    /**
     * Xóa cache cho một sản phẩm
     * @param productId ID của sản phẩm cần xóa cache
     */
    public void invalidateCache(String productId) {
        productEmbeddingCache.remove(productId);
    }
    
    /**
     * Xóa toàn bộ cache
     */
    public void clearCache() {
        productEmbeddingCache.clear();
    }
}