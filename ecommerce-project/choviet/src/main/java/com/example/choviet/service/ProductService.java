package com.example.choviet.service;

import com.example.choviet.dto.Event;
import com.example.choviet.entity.Product;
import com.example.choviet.entity.ProductCategory;
import com.example.choviet.repository.ProductCategoryRepository;
import com.example.choviet.repository.ProductRepository;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.util.function.Function;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static com.example.choviet.config.ConfigTopicProduct.ADD_PRODUCTS_QUEUE;
import static com.example.choviet.config.ConfigTopicProduct.PRODUCT_EXCHANGE;
import static com.example.choviet.config.envent.EventNameConfig.PRODUCT_CREATE_BATCH;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Service
public class ProductService {
    @Autowired
    ProductRepository productRepository;
    @Autowired
    RabbitMQService eventPublisher;
    @Autowired
    PagingService pagingService;
    @Autowired
    ProductCategoryRepository categoryRepository;

    // Lấy tất cả sản phẩm theo trang
    public Page<Product> getProductsPaging(int page, int size) {
        Pageable pageable = pagingService.createPageable(page, size);
        Page<Product> result = productRepository.findAll(pageable);

        if (page >= result.getTotalPages() && result.getTotalPages() > 0) {
            pageable = pagingService.createPageable(result.getTotalPages() - 1, size);
            result = productRepository.findAll(pageable);
        }

        Set<String> categoryIds = result.getContent().stream()
                .map(Product::getCategoryId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<String, ProductCategory> categoryMap = categoryRepository.findAllById(categoryIds).stream()
                .collect(Collectors.toMap(ProductCategory::getId, Function.identity()));

        List<Product> enriched = result.getContent().stream()
                .peek(product -> {
                    ProductCategory category = categoryMap.get(product.getCategoryId());
                    if (category != null) {
                        product.setProductCategory(
                                ProductCategory.builder()
                                        .id(category.getId())
                                        .name(category.getName())
                                        .build()
                        );
                    }
                })
                .toList();


        return new PageImpl<>(enriched, pageable, result.getTotalElements());
    }

    // Lấy sản phẩm theo loại
    public Page<Product> getProductsByCategory(String categoryId, int page, int size) {
        // Validate categoryId
        if (categoryId == null || categoryId.trim().isEmpty()) {
            throw new IllegalArgumentException("Category ID không được để trống");
        }

        Pageable pageable = pagingService.createPageable(page, size);
        Page<Product> result = productRepository.findAllByProductCategoryId(categoryId, pageable);

        // Nếu page vượt quá totalPages và có dữ liệu, redirect về trang cuối
        if (page >= result.getTotalPages() && result.getTotalPages() > 0) {
            pageable = pagingService.createPageable(result.getTotalPages() - 1, size);
            result = productRepository.findAllByProductCategoryId(categoryId, pageable);
        }

        // ✨ Enrich mỗi product với category object
        List<Product> enriched = result.getContent().stream()
                .map(product -> {
                    if (product.getCategoryId() != null) {
                        categoryRepository.findById(product.getCategoryId())
                                .ifPresent(category -> {
                                    product.setProductCategory(
                                            ProductCategory.builder()
                                                    .id(category.getId())
                                                    .name(category.getName())
                                                    .build()
                                    );
                                });
                    }
                    return product;
                })
                .toList();

        return new PageImpl<>(enriched, pageable, result.getTotalElements());
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
        Event<Product> event = new Event<Product>();
        event.setDataList(products);
        event.setAction(PRODUCT_CREATE_BATCH);
        event.setCreatedAt(LocalDateTime.now());
        eventPublisher.pushToQueue(event, PRODUCT_EXCHANGE, ADD_PRODUCTS_QUEUE);
    }
}
