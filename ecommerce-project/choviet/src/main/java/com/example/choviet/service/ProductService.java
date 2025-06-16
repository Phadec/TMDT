package com.example.choviet.service;

import com.example.choviet.dto.Event;
import com.example.choviet.entity.Customer;
import com.example.choviet.entity.Images;
import com.example.choviet.entity.Product;
import com.example.choviet.entity.ProductCategory;
import com.example.choviet.entity.ProductCustomer;
import com.example.choviet.entity.ProductImage;
import com.example.choviet.repository.CustomerRepository;
import com.example.choviet.repository.ImageRepository;
import com.example.choviet.repository.ProductCategoryRepository;
import com.example.choviet.repository.ProductCustomerRepository;
import com.example.choviet.repository.ProductImageRepository;
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
    @Autowired
    ProductImageRepository productImageRepository;
    @Autowired
    ImageRepository imageRepository;
    @Autowired
    ProductCustomerRepository productCustomerRepository;
    @Autowired
    CustomerRepository customerRepository;

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

        // Lấy danh sách ID sản phẩm để tìm ảnh
        List<String> productIds = result.getContent().stream()
                .map(Product::getId)
                .collect(Collectors.toList());

        // Tạo map lưu trữ ảnh đầu tiên của mỗi sản phẩm
        Map<String, String> productImageMap = new HashMap<>();

        // Tìm ảnh đầu tiên cho mỗi sản phẩm
        for (String productId : productIds) {
            productImageRepository.findFirstByProductId(productId)
                    .ifPresent(productImage -> {
                        String imageId = productImage.getImageId();
                        if (imageId != null) {
                            imageRepository.findById(imageId)
                                    .ifPresent(image -> {
                                        productImageMap.put(productId, image.getImage());
                                    });
                        }
                    });
        }

        List<Product> enriched = result.getContent().stream()
                .peek(product -> {
                    // Thêm thông tin category
                    ProductCategory category = categoryMap.get(product.getCategoryId());
                    if (category != null) {
                        product.setProductCategory(
                                ProductCategory.builder()
                                        .id(category.getId())
                                        .name(category.getName())
                                        .build()
                        );
                    }

                    // Thêm đường dẫn ảnh
                    String imagePath = productImageMap.get(product.getId());
                    if (imagePath != null) {
                        product.setImageReview(imagePath);
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

        // Lấy danh sách ID sản phẩm để tìm ảnh
        List<String> productIds = result.getContent().stream()
                .map(Product::getId)
                .collect(Collectors.toList());

        // Tạo map lưu trữ ảnh đầu tiên của mỗi sản phẩm
        Map<String, String> productImageMap = new HashMap<>();

        // Tìm ảnh đầu tiên cho mỗi sản phẩm
        for (String productId : productIds) {
            productImageRepository.findFirstByProductId(productId)
                    .ifPresent(productImage -> {
                        String imageId = productImage.getImageId();
                        if (imageId != null) {
                            imageRepository.findById(imageId)
                                    .ifPresent(image -> {
                                        productImageMap.put(productId, image.getImage());
                                    });
                        }
                    });
        }

        // ✨ Enrich mỗi product với category object và ảnh
        List<Product> enriched = result.getContent().stream()
                .map(product -> {
                    // Thêm thông tin category
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

                    // Thêm đường dẫn ảnh
                    String imagePath = productImageMap.get(product.getId());
                    if (imagePath != null) {
                        product.setImageReview(imagePath);
                    }

                    return product;
                })
                .toList();

        return new PageImpl<>(enriched, pageable, result.getTotalElements());
    }

    // Xem chi tiết sản phẩm
    public Product detail(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy sản phẩm với ID: " + id));

        // Thêm thông tin category nếu có
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

        // Thêm thông tin ảnh
        List<ProductImage> productImages = productImageRepository.findByProductId(id);
        if (!productImages.isEmpty()) {
            for (ProductImage productImage : productImages) {
                String imageId = productImage.getImageId();
                if (imageId != null) {
                    imageRepository.findById(imageId)
                            .ifPresent(image -> {
                                product.addImage(image.getImage());
                            });
                }
            }
        }
        
        // Thêm thông tin người bán (customer) với chỉ họ tên và email thông qua bảng ProductCustomer
        productCustomerRepository.findByProductId(id)
                .ifPresent(productCustomer -> {
                    String customerId = productCustomer.getCustomerId();
                    if (customerId != null) {
                        customerRepository.findById(customerId)
                                .ifPresent(seller -> {
                                    Customer sellerInfo = new Customer();
                                    sellerInfo.setId(seller.getId());
                                    sellerInfo.setFullName(seller.getFullName());
                                    sellerInfo.setEmail(seller.getEmail());
                                    product.setCustomer(sellerInfo);
                                });
                    }
                });

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
