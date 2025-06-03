package com.example.choviet.service;

import com.example.choviet.dto.Event;
import com.example.choviet.dto.OrderRequest;
import com.example.choviet.entity.Order;
import com.example.choviet.repository.OrderRepository;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static com.example.choviet.config.ConfigTopicOrder.ORDER_EXCHANGE;
import static com.example.choviet.config.ConfigTopicOrder.ORDER_QUEUE;
import static com.example.choviet.config.Constants.*;
import static com.example.choviet.config.envent.EventNameConfig.*;
@FieldDefaults(level = AccessLevel.PRIVATE)
@Service
public class OrderService {
    @Autowired
    OrderRepository orderRepository;
    @Autowired
    RabbitMQService eventPublisher;
    @Autowired
    SimpMessagingTemplate messagingTemplate;
    @Autowired
    PagingService pagingService;

    // tạo đơn hàng
    @Async
    public void createOrder(Order order) {
        Event<Order> event = new Event<Order>();
        event.setData(order);
        event.setAction(ORDER_CREATE);
        event.setCreatedAt(LocalDateTime.now());
        eventPublisher.pushToQueue(event, ORDER_EXCHANGE, ORDER_QUEUE);
    }

    // xem tất cả đơn hàng theo trang
    public Page<Order> getOrderPaging(int page, int size) {
        Pageable pageable = pagingService.createPageable(page, size);
        Page<Order> result = orderRepository.findAll(pageable);

        // Nếu page vượt quá totalPages và có dữ liệu, redirect về trang cuối
        if (page >= result.getTotalPages() && result.getTotalPages() > 0) {
            pageable = pagingService.createPageable(result.getTotalPages() - 1, size);
            result = orderRepository.findAll(pageable);
        }

        return result;
    }

    // xem đơn hàng theo trạng thái và khách hàng
    public Page<Order> getOrderByCustomerIdAndStatus(OrderRequest request, int page, int size) {
        String customerId = request.getCustomerId();
        String status = request.getStatus();

        if (customerId == null || customerId.trim().isEmpty()) {
            throw new IllegalArgumentException("Customer ID không được để trống");
        }
        if (status == null) {
            throw new IllegalArgumentException("Status không được để trống");
        }

        try {
            Order.Status newStatus = Order.Status.valueOf(status.toUpperCase());
            Pageable pageable = pagingService.createPageableWithSort(page, size, Sort.by("createdDate").descending());
            Page<Order> result = orderRepository.findAllByCustomerIdAndStatus(customerId, newStatus, pageable);

            // Nếu page vượt quá totalPages và có dữ liệu, redirect về trang cuối
            if (page >= result.getTotalPages() && result.getTotalPages() > 0) {
                pageable = pagingService.createPageableWithSort(result.getTotalPages() - 1, size, Sort.by("createdDate").descending());
                result = orderRepository.findAllByCustomerIdAndStatus(customerId, newStatus, pageable);
            }

            return result;
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Status không hợp lệ: " + status);
        }
    }

    // xem tất cả đơn hàng theo trạng thái
    public Page<Order> getOrderByStatus(OrderRequest request, int page, int size) {
        String status = request.getStatus();

        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("Status không được để trống");
        }

        try {
            Order.Status newStatus = Order.Status.valueOf(status.toUpperCase());
            Pageable pageable = pagingService.createPageableWithSort(page, size, Sort.by("createdDate").descending());
            Page<Order> result = orderRepository.findAllByStatus(newStatus, pageable);

            // Nếu page vượt quá totalPages và có dữ liệu, redirect về trang cuối
            if (page >= result.getTotalPages() && result.getTotalPages() > 0) {
                pageable = pagingService.createPageableWithSort(result.getTotalPages() - 1, size, Sort.by("createdDate").descending());
                result = orderRepository.findAllByStatus(newStatus, pageable);
            }

            return result;
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Status không hợp lệ: " + status);
        }
    }


    // xem đơn hàng qua id khách hàng
    public Page<Order> getOrdersByCustomerId(OrderRequest request, int page, int size) {
        String customerId = request.getCustomerId();

        if (customerId == null || customerId.trim().isEmpty()) {
            throw new IllegalArgumentException("Customer ID không được để trống");
        }

        Pageable pageable = pagingService.createPageableWithSort(page, size, Sort.by("createdDate").descending());
        Page<Order> result = orderRepository.findAllByCustomerId(customerId, pageable);

        // Nếu page vượt quá totalPages và có dữ liệu, redirect về trang cuối
        if (page >= result.getTotalPages() && result.getTotalPages() > 0) {
            pageable = pagingService.createPageableWithSort(result.getTotalPages() - 1, size, Sort.by("createdDate").descending());
            result = orderRepository.findAllByCustomerId(customerId, pageable);
        }

        return result;
    }

    // cập nhập trạng thái đơn hàng
    public Order updateStatus(OrderRequest request) {
        String id = request.getId();
        String status = request.getStatus();

        Optional<Order> optionalOrder = orderRepository.findById(id);
        Order order = optionalOrder.orElse(null);

        try {
            Order.Status newStatus = Order.Status.valueOf(status.toUpperCase());
            List<Order.Status> allowed = VALID_TRANSITIONS.getOrDefault(order.getStatus(), List.of());
            if (!allowed.contains(newStatus))
                throw new IllegalArgumentException("Trạng thái không hợp lệ và phải nằm trong [READY_TO_PICK, PICKING, PICKED, STORING, TRANSPORTING, DELIVERING, DELIVERED, DELIVERY_FAIL, WAITING_TO_RETURN, RETURN, RETURN_TRANSPORTING, RETURNING, RETURNED, RETURN_FAIL, CANCEL]");

            order.setStatus(newStatus);
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);
            messagingTemplate.convertAndSend("/topic/status-updated", order);
            return order;

        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ và phải nằm trong [READY_TO_PICK, PICKING, PICKED, STORING, TRANSPORTING, DELIVERING, DELIVERED, DELIVERY_FAIL, WAITING_TO_RETURN, RETURN, RETURN_TRANSPORTING, RETURNING, RETURNED, RETURN_FAIL, CANCEL]");
        }
    }

    // lấy chi tiết đơn hàng
    public Order details(OrderRequest request) {
        Optional<Order> optionalOrder = orderRepository.findById(request.getId());
        return optionalOrder.orElse(null);
    }
}
