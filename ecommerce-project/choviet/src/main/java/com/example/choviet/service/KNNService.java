package com.example.choviet.service;

import com.example.choviet.entity.Product;
import com.example.choviet.transformer.TextEmbedding;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service thực hiện thuật toán K-Nearest Neighbors (KNN) 
 * để tìm các sản phẩm tương tự nhất
 */
@FieldDefaults(level = AccessLevel.PRIVATE)
@Service
public class KNNService {
    
    private static final int DEFAULT_K = 5;
    
    /**
     * Tìm K sản phẩm gần nhất với sản phẩm đích sử dụng thuật toán KNN
     * 
     * @param targetProduct Sản phẩm đích
     * @param candidates Danh sách sản phẩm ứng viên
     * @param targetEmbedding Vector embedding của sản phẩm đích
     * @param k Số lượng sản phẩm gần nhất cần tìm
     * @return Danh sách K sản phẩm gần nhất
     */
    public List<Product> findKNearestProducts(Product targetProduct, List<Product> candidates, 
                                            double[] targetEmbedding, int k) {
        if (candidates == null || candidates.isEmpty() || targetEmbedding == null) {
            return Collections.emptyList();
        }
        
        // Tính khoảng cách từ sản phẩm đích đến tất cả các ứng viên
        List<ProductDistance> distances = new ArrayList<>();
        
        for (Product candidate : candidates) {
            // Bỏ qua sản phẩm trùng với sản phẩm đích
            if (candidate.getId().equals(targetProduct.getId())) {
                continue;
            }
            
            // Tạo embedding cho sản phẩm ứng viên
            double[] candidateEmbedding = createProductEmbedding(candidate);
            
            // Tính khoảng cách Euclidean
            double distance = calculateEuclideanDistance(targetEmbedding, candidateEmbedding);
            
            distances.add(new ProductDistance(candidate, distance));
        }
        
        // Sắp xếp theo khoảng cách tăng dần và lấy K sản phẩm gần nhất
        return distances.stream()
                .filter(pd -> pd.distance < Double.MAX_VALUE) // Loại bỏ khoảng cách không hợp lệ
                .sorted(Comparator.comparingDouble(pd -> pd.distance))
                .limit(Math.max(k, DEFAULT_K))
                .map(pd -> pd.product)
                .collect(Collectors.toList());
    }
    
    /**
     * Tìm K sản phẩm gần nhất với số K mặc định
     */
    public List<Product> findKNearestProducts(Product targetProduct, List<Product> candidates, 
                                            double[] targetEmbedding) {
        return findKNearestProducts(targetProduct, candidates, targetEmbedding, DEFAULT_K);
    }
    
    /**
     * Kết hợp kết quả từ nhiều sản phẩm đích (ensemble KNN)
     * 
     * @param targetProducts Danh sách sản phẩm đích
     * @param candidates Danh sách sản phẩm ứng viên
     * @param targetEmbeddings Map chứa embedding của các sản phẩm đích
     * @param k Số lượng sản phẩm cần lấy
     * @return Danh sách sản phẩm được gợi ý
     */
    public List<Product> findEnsembleKNearestProducts(List<Product> targetProducts, List<Product> candidates,
                                                     Map<String, double[]> targetEmbeddings, int k) {
        Map<String, Double> productScores = new HashMap<>();
        
        // Tính điểm cho mỗi sản phẩm ứng viên từ tất cả các sản phẩm đích
        for (Product targetProduct : targetProducts) {
            double[] targetEmbedding = targetEmbeddings.get(targetProduct.getId());
            if (targetEmbedding == null) continue;
            
            List<Product> nearestProducts = findKNearestProducts(targetProduct, candidates, 
                                                               targetEmbedding, k * 2);
            
            // Gán điểm dựa trên thứ hạng (sản phẩm gần nhất có điểm cao nhất)
            for (int i = 0; i < nearestProducts.size(); i++) {
                Product product = nearestProducts.get(i);
                double score = (double) (nearestProducts.size() - i) / nearestProducts.size();
                
                productScores.merge(product.getId(), score, Double::sum);
            }
        }
        
        // Sắp xếp theo điểm và lấy top k
        return productScores.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(k)
                .map(entry -> candidates.stream()
                        .filter(p -> p.getId().equals(entry.getKey()))
                        .findFirst()
                        .orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
    
    /**
     * Tạo vector embedding đơn giản cho sản phẩm
     * (Sử dụng TextEmbedding đã có)
     */
    private double[] createProductEmbedding(Product product) {
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
        TextEmbedding textEmbedding = new TextEmbedding(100); // 100 dimensions
        
        return textEmbedding.getEmbedding(combinedText);
    }
    
    /**
     * Tính khoảng cách Euclidean giữa hai vector
     */
    private double calculateEuclideanDistance(double[] vector1, double[] vector2) {
        if (vector1.length != vector2.length) {
            return Double.MAX_VALUE; // Trả về khoảng cách lớn nhất nếu chiều không khớp
        }
        
        double sum = 0.0;
        for (int i = 0; i < vector1.length; i++) {
            double diff = vector1[i] - vector2[i];
            sum += diff * diff;
        }
        
        return Math.sqrt(sum);
    }
    
    /**
     * Class helper để lưu trữ sản phẩm và khoảng cách
     */
    private static class ProductDistance {
        final Product product;
        final double distance;
        
        ProductDistance(Product product, double distance) {
            this.product = product;
            this.distance = distance;
        }
    }
}