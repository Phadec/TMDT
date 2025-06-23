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
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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
    @Autowired
    CloudinaryService cloudinaryService;

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
        }        // Lấy thông tin customer cho từng sản phẩm
        Map<String, Customer> productCustomerMap = new HashMap<>();
        for (String productId : productIds) {
            productCustomerRepository.findByProductId(productId)
                    .ifPresent(productCustomer -> {
                        String customerId = productCustomer.getCustomerId();
                        if (customerId != null) {
                            customerRepository.findById(customerId)
                                    .ifPresent(customer -> {
                                        productCustomerMap.put(productId, customer);
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
                    
                    // Thêm thông tin customer (seller)
                    Customer customer = productCustomerMap.get(product.getId());
                    if (customer != null) {
                        product.setCustomer(customer);
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
        }        Pageable pageable = pagingService.createPageable(page, size);
        Page<Product> result = productRepository.findByProductCategoryId(categoryId, pageable);

        // Nếu page vượt quá totalPages và có dữ liệu, redirect về trang cuối
        if (page >= result.getTotalPages() && result.getTotalPages() > 0) {
            pageable = pagingService.createPageable(result.getTotalPages() - 1, size);
            result = productRepository.findByProductCategoryId(categoryId, pageable);
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
        }        // Lấy thông tin customer cho từng sản phẩm
        Map<String, Customer> productCustomerMap = new HashMap<>();
        for (String productId : productIds) {
            productCustomerRepository.findByProductId(productId)
                    .ifPresent(productCustomer -> {
                        String customerId = productCustomer.getCustomerId();
                        if (customerId != null) {
                            customerRepository.findById(customerId)
                                    .ifPresent(customer -> {
                                        productCustomerMap.put(productId, customer);
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
                    
                    // Thêm thông tin customer (seller)
                    Customer customer = productCustomerMap.get(product.getId());
                    if (customer != null) {
                        product.setCustomer(customer);
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
                                    sellerInfo.setPhone(seller.getPhone());
                                    sellerInfo.setAddresses(seller.getAddresses());
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
    }    /**
     * Lấy tất cả sản phẩm với phân trang (cho admin)
     */
    public Page<Product> getAllProductsPaging(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> result = productRepository.findAll(pageable);

        // Lấy danh sách ID sản phẩm
        List<String> productIds = result.getContent().stream()
                .map(Product::getId)
                .collect(Collectors.toList());

        // Lấy thông tin category
        Set<String> categoryIds = result.getContent().stream()
                .map(Product::getCategoryId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<String, ProductCategory> categoryMap = categoryRepository.findAllById(categoryIds).stream()
                .collect(Collectors.toMap(ProductCategory::getId, Function.identity()));

        // Tạo map lưu trữ ảnh đầu tiên của mỗi sản phẩm
        Map<String, String> productImageMap = new HashMap<>();
        Map<String, List<String>> productAllImagesMap = new HashMap<>();

        // Tìm ảnh cho mỗi sản phẩm
        for (String productId : productIds) {
            List<ProductImage> productImages = productImageRepository.findByProductId(productId);
            List<String> imageUrls = new ArrayList<>();
            
            for (ProductImage productImage : productImages) {
                String imageId = productImage.getImageId();
                if (imageId != null) {
                    imageRepository.findById(imageId)
                            .ifPresent(image -> {
                                imageUrls.add(image.getImage());
                                // Lưu ảnh đầu tiên làm ảnh review
                                if (productImageMap.get(productId) == null) {
                                    productImageMap.put(productId, image.getImage());
                                }
                            });
                }
            }
            
            if (!imageUrls.isEmpty()) {
                productAllImagesMap.put(productId, imageUrls);
            }
        }

        // Lấy thông tin customer cho từng sản phẩm
        Map<String, Customer> productCustomerMap = new HashMap<>();
        for (String productId : productIds) {
            productCustomerRepository.findByProductId(productId)
                    .ifPresent(productCustomer -> {
                        String customerId = productCustomer.getCustomerId();
                        if (customerId != null) {
                            customerRepository.findById(customerId)
                                    .ifPresent(customer -> {
                                        productCustomerMap.put(productId, customer);
                                    });
                        }
                    });
        }

        // Enrich mỗi product với thông tin đầy đủ
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

                    // Thêm ảnh review (ảnh đầu tiên)
                    String imagePath = productImageMap.get(product.getId());
                    if (imagePath != null) {
                        product.setImageReview(imagePath);
                    }

                    // Thêm tất cả ảnh
                    List<String> allImages = productAllImagesMap.get(product.getId());
                    if (allImages != null && !allImages.isEmpty()) {
                        product.setImages(allImages);
                    }
                    
                    // Thêm thông tin customer (seller)
                    Customer customer = productCustomerMap.get(product.getId());
                    if (customer != null) {
                        product.setCustomer(customer);
                    }
                })
                .toList();

        return new PageImpl<>(enriched, pageable, result.getTotalElements());
    }/**
     * Lấy sản phẩm theo ID
     */
    public Product getProductById(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    /**
     * Cập nhật sản phẩm
     */
    public Product updateProduct(String id, Product product) {
        Product existingProduct = getProductById(id);
        
        // Update fields as needed
        if (product.getName() != null) {
            existingProduct.setName(product.getName());
        }
        if (product.getDescription() != null) {
            existingProduct.setDescription(product.getDescription());
        }
        if (product.getPrice() != null) {
            existingProduct.setPrice(product.getPrice());
        }
        if (product.getStatus() != null) {
            existingProduct.setStatus(product.getStatus());
        }
        if (product.getProductCategory() != null) {
            existingProduct.setProductCategory(product.getProductCategory());
        }
        
        return productRepository.save(existingProduct);
    }    /**
     * Xóa sản phẩm
     */
    public void deleteProduct(String id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }

    public String uploadProduct(
        String name,
        Double price,
        String description,
        List<String> tags,
        String address,
        String idCategory,
        List<MultipartFile> images
    ) {
        // Xử lý upload ảnh trước
        List<String> imageUrls = new ArrayList<>();
        if (images != null && !images.isEmpty()) {
            for (MultipartFile image : images) {
                try {
                    String url = cloudinaryService.uploadImage(image);
                    imageUrls.add(url);
                } catch (Exception e) {
                    // Có thể log lỗi hoặc throw exception tùy yêu cầu
                    throw new RuntimeException("Lỗi upload ảnh: " + e.getMessage());
                }
            }
        }

        String des01 = String.join("\n", tags);
        String des02 = description;

        Product product = Product.builder()
                .name(name)
                .price(price + "")
                .shortDes(des01)
                .description(des02)
                .images(imageUrls)
                .address(address)
                .categoryId(idCategory)
                .build();

        productRepository.save(product);

        return "Sản phẩm tạo thành công với ID: " + product.getId();
    }
}
