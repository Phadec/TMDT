package com.example.choviet;

import com.example.choviet.entity.Product;
import com.example.choviet.service.RecommendationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Arrays;
import java.util.List;

@SpringBootTest
public class RecommendationTest {

    @Autowired
    private RecommendationService recommendationService;

    @Test
    public void testGetDefaultRecommendedProducts() {
        try {
            List<Product> products = recommendationService.getDefaultRecommendedProducts();
            System.out.println("Số lượng sản phẩm gợi ý: " + products.size());
            
            for (Product product : products) {
                System.out.println("- " + product.getName() + " (ID: " + product.getId() + ")");
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi test recommendation: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Test
    public void testGetRecommendedProductsWithHistory() {
        try {
            // Giả lập một số ID sản phẩm đã xem
            String recentlyViewedIds = "product1,product2,product3";
            
            List<Product> products = recommendationService.getRecommendedProducts(recentlyViewedIds);
            System.out.println("Số lượng sản phẩm gợi ý với lịch sử: " + products.size());
            
            for (Product product : products) {
                System.out.println("- " + product.getName() + " (ID: " + product.getId() + ")");
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi test recommendation với lịch sử: " + e.getMessage());
            e.printStackTrace();
        }
    }
}