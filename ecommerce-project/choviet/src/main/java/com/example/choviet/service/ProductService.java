package com.example.choviet.service;

import com.example.choviet.dto.Event;
import com.example.choviet.entity.Product;
import com.example.choviet.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.NoSuchElementException;
import static com.example.choviet.config.ConfigTopicProduct.*;
import static com.example.choviet.config.Constants.*;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private EventPublisher eventPublisher;
    @Autowired
    private PagingService pagingService;

    // Lấy tất cả sản phẩm theo trang
    public Page<Product> getProductsPaging(int page, int size) {
        // Tạo Pageable và lấy dữ liệu
        Pageable pageable = pagingService.createPageable(page, size);
        Page<Product> result = productRepository.findAll(pageable);

        // Nếu page vượt quá totalPages và có dữ liệu, redirect về trang cuối
        if (page >= result.getTotalPages() && result.getTotalPages() > 0) {
            pageable = pagingService.createPageable(result.getTotalPages() - 1, size);
            result = productRepository.findAll(pageable);
        }

        return result;
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
            pageable = pagingService.createPageable(result.getTotalPages() -1, size);
            result = productRepository.findAllByProductCategoryId(categoryId, pageable);
        }

        return result;
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
        eventPublisher.pushToQueue(event, PRODUCT_EXCHANGE, ADD_PRODUCTS_QUEUE);
    }
}
