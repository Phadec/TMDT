package com.example.choviet.service;

import com.example.choviet.dto.OrderEvent;
import com.example.choviet.entity.Customer;
import com.example.choviet.entity.Order;
import com.example.choviet.entity.Product;
import com.example.choviet.repository.OrderRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.example.choviet.config.ConfigTopicOrder.*;
import static com.example.choviet.config.Constants.*;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private RabbitTemplate rabbitTemplate;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;


    // tạo đơn hàng
    @Async
    public void createOrder(Order order){
        OrderEvent event = new OrderEvent();
        event.setOrder(order);
        pushToQueue(event, ORDER_QUEUE);
    }

    // xem tất cả đơn hàng
    public List<Order> findAll(){
        return orderRepository.findAll();
    }

    // lấy chi tiết đơn hàng
    public Order details(String id){
        return orderRepository.findById(id).orElseThrow(null);
    }

    // xem đơn hàng qua id khách hàng
    public List<Order> findAllByCustomerId(String id){
        return orderRepository.findAllByCustomerId(id);
    }



    // cập nhập trạng thái đơn hàng
    public Order updateStatus(String id, String status){
        Optional<Order> optionalOrder = orderRepository.findById(id);
        if (optionalOrder.isEmpty()) return null;
        Order order = optionalOrder.get();

        try {
            Order.Status newStatus = Order.Status.valueOf(status.toUpperCase());
            List<Order.Status> allowed = VALID_TRANSITIONS.getOrDefault(order.getStatus(), List.of());
            if (!allowed.contains(newStatus)) throw new IllegalArgumentException("Trạng thái không hợp lệ và phải nằm trong [READY_TO_PICK, PICKING, PICKED, STORING, TRANSPORTING, DELIVERING, DELIVERED, DELIVERY_FAIL, WAITING_TO_RETURN, RETURN, RETURN_TRANSPORTING, RETURNING, RETURNED, RETURN_FAIL, CANCEL]");

            order.setStatus(newStatus);
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);
            messagingTemplate.convertAndSend("/topic/status-updated", order);
            return order;

        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ và phải nằm trong [READY_TO_PICK, PICKING, PICKED, STORING, TRANSPORTING, DELIVERING, DELIVERED, DELIVERY_FAIL, WAITING_TO_RETURN, RETURN, RETURN_TRANSPORTING, RETURNING, RETURNED, RETURN_FAIL, CANCEL]");
        }
    }


    // Gửi sự kiện đến hàng đợi RabbitMQ
    private void pushToQueue(OrderEvent event, String queue) {
        rabbitTemplate.convertAndSend(ORDER_EXCHANGE, queue, event);
    }
}
