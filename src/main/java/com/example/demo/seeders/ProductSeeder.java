package com.example.demo.seeders;

import com.example.demo.models.Product;
import com.example.demo.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProductSeeder {
    @Autowired
    ProductRepository productRepository;

    public void seed() {
        if (productRepository.count() == 0) {
            Product p1 = createProduct("Product 1", "Description 1", 100.0, "Category 1", "New", List.of("image1.jpg", "image2.jpg"), "user1", "ACTIVE");
            Product p2 = createProduct("Product 2", "Description 2", 200.0, "Category 2", "Used", List.of("image3.jpg", "image4.jpg"), "user2", "INACTIVE");
        }
    }

    public Product createProduct(String title, String description, double price, String categoryId, String condition, List<String> images, String sellerUsername, String status) {
        Product product = new Product();
        product.setTitle(title);
        product.setDescription(description);
        product.setPrice(price);
        product.setCategoryId(categoryId);
        product.setCondition(condition);
        product.setImages(images);
        product.setSellerUsername(sellerUsername);
        productRepository.save(product);
        return product;
    }
}
