package com.example.choviet.service;

import com.example.choviet.entity.Customer;
import com.example.choviet.entity.Order;
import com.example.choviet.entity.Product;
import com.example.choviet.repository.CustomerRepository;
import com.example.choviet.repository.OrderRepository;
import com.example.choviet.repository.ProductRepository;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Service
public class SellerService {

    @Autowired
    ProductRepository productRepository;

    @Autowired
    OrderRepository orderRepository;

    @Autowired
    CustomerRepository customerRepository;

    /**
     * Lấy thống kê tổng quan cho seller dashboard
     */
    public Map<String, Object> getSellerOverview(String sellerId) {
        Map<String, Object> overview = new HashMap<>();

        try {
            // Kiểm tra seller có tồn tại không
            Customer seller = customerRepository.findById(sellerId).orElse(null);
            if (seller == null || !seller.isSeller()) {
                throw new RuntimeException("Seller không tồn tại hoặc không phải là seller");
            }

            // Đếm số sản phẩm active của seller
            long totalProducts = productRepository.countByCustomer_IdAndStatus(sellerId, Product.Type.ACTIVE);

            // Lấy danh sách sản phẩm của seller để tính toán
            List<Product> products = productRepository.findByCustomer_IdAndStatus(sellerId, Product.Type.ACTIVE);
            
            // Tính tổng doanh thu ước tính (giá sản phẩm * số lượng giả định)
            double totalRevenue = products.stream()
                    .mapToDouble(product -> {
                        try {
                            return Double.parseDouble(product.getPrice()) * Math.random() * 10; // Giả định bán được 0-10 sản phẩm
                        } catch (NumberFormatException e) {
                            return 0.0;
                        }
                    })
                    .sum();

            // Đếm số đơn hàng (giả định dựa trên sản phẩm)
            long totalOrders = Math.round(totalProducts * (Math.random() * 5 + 1)); // 1-6 đơn hàng mỗi sản phẩm

            // Số khách hàng mới (giả định)
            long newCustomers = Math.round(totalOrders * 0.3); // 30% đơn hàng từ khách mới

            // Tỉ lệ chuyển đổi (giả định)
            double conversionRate = Math.random() * 5 + 1; // 1-6%

            // Tạo dữ liệu thống kê
            overview.put("totalRevenue", String.format("₫%.1fM", totalRevenue / 1000000));
            overview.put("totalOrders", totalOrders);
            overview.put("newCustomers", newCustomers);
            overview.put("conversionRate", String.format("%.1f%%", conversionRate));
            overview.put("totalProducts", totalProducts);

            // Thêm phần trăm thay đổi (giả định)
            overview.put("revenueChange", "+15% so với tháng trước");
            overview.put("ordersChange", "+8% so với tháng trước");
            overview.put("customersChange", "+12% so với tháng trước");
            overview.put("conversionChange", "+0.5% so với tháng trước");

            // Thêm thông tin seller
            overview.put("sellerInfo", Map.of(
                "id", seller.getId(),
                "name", seller.getFullName(),
                "email", seller.getEmail(),
                "phone", seller.getPhone() != null ? seller.getPhone() : "Chưa có"
            ));

        } catch (Exception e) {
            // Nếu có lỗi, trả về dữ liệu mặc định
            overview.put("totalRevenue", "₫0M");
            overview.put("totalOrders", 0);
            overview.put("newCustomers", 0);
            overview.put("conversionRate", "0%");
            overview.put("totalProducts", 0);
            overview.put("revenueChange", "+0% so với tháng trước");
            overview.put("ordersChange", "+0% so với tháng trước");
            overview.put("customersChange", "+0% so với tháng trước");
            overview.put("conversionChange", "+0% so với tháng trước");
            overview.put("error", e.getMessage());
        }

        return overview;
    }

    /**
     * Lấy danh sách sản phẩm của seller
     */
    public Map<String, Object> getSellerProducts(String sellerId, int page, int size) {
        Map<String, Object> result = new HashMap<>();

        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<Product> productsPage = productRepository.findByCustomer_Id(sellerId, pageable);

            result.put("products", productsPage.getContent());
            result.put("totalElements", productsPage.getTotalElements());
            result.put("totalPages", productsPage.getTotalPages());
            result.put("currentPage", page);
            result.put("size", size);

        } catch (Exception e) {
            result.put("products", Collections.emptyList());
            result.put("totalElements", 0);
            result.put("totalPages", 0);
            result.put("currentPage", page);
            result.put("size", size);
            result.put("error", e.getMessage());
        }

        return result;
    }

    /**
     * Lấy danh sách đơn hàng của seller (giả định)
     */
    public Map<String, Object> getSellerOrders(String sellerId, int page, int size) {
        Map<String, Object> result = new HashMap<>();

        try {
            // Vì chưa có relationship giữa Order và Product của seller,
            // tạm thời trả về dữ liệu giả định
            List<Map<String, Object>> mockOrders = new ArrayList<>();
            
            for (int i = 1; i <= Math.min(size, 10); i++) {
                Map<String, Object> order = new HashMap<>();
                order.put("id", "ORDER_" + sellerId + "_" + (page * size + i));
                order.put("customerName", "Khách hàng " + i);
                order.put("total", String.format("₫%,d", (int)(Math.random() * 1000000 + 100000)));
                order.put("status", Math.random() > 0.5 ? "COMPLETED" : "PENDING");
                order.put("createdAt", LocalDateTime.now().minusDays((long)(Math.random() * 30))
                        .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
                mockOrders.add(order);
            }

            result.put("orders", mockOrders);
            result.put("totalElements", 50); // Giả định có 50 đơn hàng
            result.put("totalPages", (50 + size - 1) / size);
            result.put("currentPage", page);
            result.put("size", size);

        } catch (Exception e) {
            result.put("orders", Collections.emptyList());
            result.put("totalElements", 0);
            result.put("totalPages", 0);
            result.put("currentPage", page);
            result.put("size", size);
            result.put("error", e.getMessage());
        }

        return result;
    }

    /**
     * Lấy hoạt động gần đây của seller
     */
    public Map<String, Object> getSellerActivities(String sellerId, int limit) {
        Map<String, Object> result = new HashMap<>();

        try {
            List<Map<String, Object>> activities = new ArrayList<>();

            // Lấy sản phẩm mới nhất của seller
            List<Product> recentProducts = productRepository.findByCustomer_IdOrderByCreatedAtDesc(sellerId)
                    .stream()
                    .limit(limit / 2)
                    .collect(Collectors.toList());

            for (Product product : recentProducts) {
                Map<String, Object> activity = new HashMap<>();
                activity.put("type", "PRODUCT_CREATED");
                activity.put("title", "Sản phẩm mới: " + product.getName());
                activity.put("description", "Đã đăng sản phẩm mới");
                activity.put("createdAt", product.getCreatedAt() != null ? 
                    product.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : 
                    "Chưa có thời gian");
                activity.put("icon", "📦");
                activities.add(activity);
            }

            // Thêm các hoạt động giả định khác
            for (int i = activities.size(); i < limit; i++) {
                Map<String, Object> activity = new HashMap<>();
                activity.put("type", "ORDER_RECEIVED");
                activity.put("title", "Đơn hàng mới #" + (1000 + i));
                activity.put("description", "Nhận được đơn hàng mới");
                activity.put("createdAt", LocalDateTime.now().minusHours(i * 2)
                        .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
                activity.put("icon", "🛒");
                activity.put("amount", String.format("₫%,d", (int)(Math.random() * 500000 + 50000)));
                activities.add(activity);
            }

            result.put("activities", activities);
            result.put("total", activities.size());

        } catch (Exception e) {
            result.put("activities", Collections.emptyList());
            result.put("total", 0);
            result.put("error", e.getMessage());
        }

        return result;
    }
}