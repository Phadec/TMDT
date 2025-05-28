package com.example.choviet.service;

import com.example.choviet.dto.ProductEvent;
import com.example.choviet.entity.Product;
import com.example.choviet.entity.ProductCategory;
import com.example.choviet.repository.ProductRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static com.example.choviet.config.ConfigTopicProduct.*;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private RabbitTemplate rabbitTemplate;

    // Lấy tất cả sản phẩm
    public List<Product> findAll() {
        return productRepository.findAll();
    }

    // Lấy sản phẩm theo loại
    public List<Product> findAllByCategory(String categoryId) {
        ProductCategory category = new ProductCategory();
        category.setId(categoryId);
        return productRepository.findAllByProductCategory(category);
    }

    // Xem chi tiết sản phẩm
    public Product detail(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy sản phẩm với ID: " + id));
    }

    // Cập nhật trạng thái sản phẩm (ACTIVE hoặc INACTIVE)
    public Product updateStatus(String id, String status) {
        Product.Type enumStatus;
        try {
            enumStatus = Product.Type.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ: " + status);
        }

        Product product = productRepository.findById(id).orElseThrow(null);

        product.setStatus(enumStatus);
        productRepository.save(product);

        return product;
    }

    // Thêm một sản phẩm
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    // Thêm nhiều sản phẩm và gửi vào hàng đợi
    @Async
    public void createProducts(List<Product> products) {
        ProductEvent event = new ProductEvent();
        event.setProducts(products);
        pushToQueue(event, ADD_PRODUCTS_QUEUE);
    }

    // Gửi sự kiện đến hàng đợi RabbitMQ
    private void pushToQueue(ProductEvent event, String queue) {
        rabbitTemplate.convertAndSend(PRODUCT_EXCHANGE, queue, event);
    }
}
